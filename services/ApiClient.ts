// ApiClient.ts - Centralized API communication for Tarot Timer Backend
// Handles authentication, request/response formatting, and error handling

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  language: string;
  timezone: string;
  subscriptionStatus: string;
  trialEndDate: string;
}

export class ApiClient {
  private apiBaseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing: boolean = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.loadTokensFromStorage();
  }

  // Token Management
  private loadTokensFromStorage(): void {
    if (typeof localStorage !== 'undefined') {
      this.accessToken = localStorage.getItem('tarot_access_token');
      this.refreshToken = localStorage.getItem('tarot_refresh_token');
    }
  }

  private saveTokensToStorage(tokens: AuthTokens): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('tarot_access_token', tokens.accessToken);
      localStorage.setItem('tarot_refresh_token', tokens.refreshToken);
    }
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
  }

  private clearTokensFromStorage(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('tarot_access_token');
      localStorage.removeItem('tarot_refresh_token');
    }
    this.accessToken = null;
    this.refreshToken = null;
  }

  // Authentication Methods
  async register(email: string, password: string, name: string): Promise<{ user: UserInfo; tokens: AuthTokens }> {
    const response = await this.request('POST', '/api/auth/register', {
      email,
      password,
      name
    });

    if (response.tokens) {
      this.saveTokensToStorage(response.tokens);
    }

    return response;
  }

  async login(email: string, password: string): Promise<{ user: UserInfo; tokens: AuthTokens }> {
    const response = await this.request('POST', '/api/auth/login', {
      email,
      password
    });

    if (response.tokens) {
      this.saveTokensToStorage(response.tokens);
    }

    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request('POST', '/api/auth/logout');
    } finally {
      this.clearTokensFromStorage();
    }
  }

  async getCurrentUser(): Promise<UserInfo> {
    return this.request('GET', '/api/auth/me');
  }

  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const response = await this.request('POST', '/api/auth/refresh', {
        refreshToken: this.refreshToken
      });

      if (response.tokens) {
        this.saveTokensToStorage(response.tokens);
        return true;
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      this.clearTokensFromStorage();
    }

    return false;
  }

  // Daily Session Methods
  async getDailySession(date: string): Promise<any> {
    return this.request('GET', `/api/daily-sessions/${date}`);
  }

  async saveDailySession(sessionData: any): Promise<any> {
    return this.request('POST', '/api/daily-sessions', sessionData);
  }

  async updateDailySession(sessionData: any): Promise<any> {
    return this.request('PUT', '/api/daily-sessions', sessionData);
  }

  async deleteDailySession(date: string): Promise<any> {
    return this.request('DELETE', `/api/daily-sessions/${date}`);
  }

  async getDailySessions(params?: { startDate?: string; endDate?: string; limit?: number }): Promise<any> {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    const endpoint = queryString ? `/api/daily-sessions?${queryString}` : '/api/daily-sessions';
    return this.request('GET', endpoint);
  }

  // Spread Reading Methods
  async getSpreads(params?: { limit?: number; offset?: number; spreadType?: string }): Promise<any> {
    const queryString = params ? new URLSearchParams(params as any).toString() : '';
    const endpoint = queryString ? `/api/spreads?${queryString}` : '/api/spreads';
    return this.request('GET', endpoint);
  }

  async getSpread(id: string): Promise<any> {
    return this.request('GET', `/api/spreads/${id}`);
  }

  async saveSpread(spreadData: any): Promise<any> {
    return this.request('POST', '/api/spreads', spreadData);
  }

  async updateSpread(id: string, spreadData: any): Promise<any> {
    return this.request('PUT', `/api/spreads/${id}`, spreadData);
  }

  async deleteSpread(id: string): Promise<any> {
    return this.request('DELETE', `/api/spreads/${id}`);
  }

  // Data Synchronization Methods
  async getSyncStatus(): Promise<any> {
    return this.request('GET', '/api/sync/status');
  }

  async exportUserData(): Promise<any> {
    return this.request('GET', '/api/sync/export');
  }

  async importUserData(data: any): Promise<any> {
    return this.request('POST', '/api/sync/import', data);
  }

  async clearUserData(): Promise<any> {
    return this.request('DELETE', '/api/sync/clear');
  }

  // Core Request Method with Retry Logic and Token Refresh
  private async request<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any
  ): Promise<T> {
    const url = `${this.apiBaseUrl}${endpoint}`;

    const makeRequest = async (token?: string): Promise<T> => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token || this.accessToken) {
        headers['Authorization'] = `Bearer ${token || this.accessToken}`;
      }

      const requestConfig: RequestInit = {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      };

      const response = await fetch(url, requestConfig);

      if (!response.ok) {
        if (response.status === 401 && !endpoint.includes('/auth/')) {
          throw new Error('UNAUTHORIZED');
        }

        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If we can't parse JSON, use the default error message
        }

        throw new Error(errorMessage);
      }

      return response.json();
    };

    try {
      return await makeRequest();
    } catch (error) {
      if (error instanceof Error && error.message === 'UNAUTHORIZED' && !this.isRefreshing) {
        return this.handleTokenRefresh(() => makeRequest());
      }
      throw error;
    }
  }

  private async handleTokenRefresh<T>(retryRequest: () => Promise<T>): Promise<T> {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    this.isRefreshing = true;

    try {
      const success = await this.refreshAccessToken();

      if (success) {
        this.processQueue(null, this.accessToken);
        return await retryRequest();
      } else {
        this.processQueue(new Error('Token refresh failed'), null);
        throw new Error('Authentication required');
      }
    } catch (error) {
      this.processQueue(error, null);
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  private processQueue(error: any, token: string | null): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  // Utility Methods
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  setAuthToken(token: string): void {
    this.accessToken = token;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('tarot_access_token', token);
    }
  }

  clearAuth(): void {
    this.clearTokensFromStorage();
  }

  // Health Check
  async healthCheck(): Promise<any> {
    return this.request('GET', '/health');
  }
}

// Singleton instance for the app
export const apiClient = new ApiClient(
  process.env.REACT_APP_API_URL || 'http://localhost:3000'
);

// Hook for React components to access API client
export function useApiClient() {
  return apiClient;
}