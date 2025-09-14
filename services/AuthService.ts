// AuthService.ts - Authentication service for seamless cloud integration
// This service handles user authentication and integrates with the storage service

import { getStorageService, AuthState } from './StorageService';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  language?: string;
  timezone?: string;
}

export interface User {
  id: string;
  email: string;
  language: string;
  timezone: string;
  subscriptionStatus: string;
  trialEndDate: string;
  activeCardThemeId?: string;
  hasActiveSubscription: boolean;
  isTrialActive: boolean;
  trialDaysRemaining: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  tokens?: AuthTokens;
  message?: string;
  error?: string;
  code?: string;
}

export class AuthService {
  private apiBaseUrl: string;
  private currentUser: User | null = null;
  private tokens: AuthTokens | null = null;
  private refreshTokenTimer: NodeJS.Timeout | null = null;

  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  private async makeRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: any,
    includeAuth: boolean = false
  ): Promise<any> {
    const url = `${this.apiBaseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.tokens?.accessToken) {
      headers['Authorization'] = `Bearer ${this.tokens.accessToken}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return result;
  }

  // Register a new user
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await this.makeRequest('POST', '/auth/register', {
        email: credentials.email,
        password: credentials.password,
        language: credentials.language || 'ko',
        timezone: credentials.timezone || 'Asia/Seoul'
      });

      if (response.user && response.tokens) {
        this.currentUser = response.user;
        this.tokens = response.tokens;

        // Start token refresh timer
        this.startTokenRefreshTimer();

        // Update storage service with auth state
        await this.updateStorageAuthState();

        return {
          success: true,
          user: this.currentUser,
          tokens: this.tokens,
          message: response.message
        };
      }

      return {
        success: false,
        error: response.error || 'Registration failed',
        code: response.code
      };

    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
        code: 'REGISTRATION_ERROR'
      };
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.makeRequest('POST', '/auth/login', {
        email: credentials.email,
        password: credentials.password
      });

      if (response.user && response.tokens) {
        this.currentUser = response.user;
        this.tokens = response.tokens;

        // Start token refresh timer
        this.startTokenRefreshTimer();

        // Update storage service with auth state
        await this.updateStorageAuthState();

        return {
          success: true,
          user: this.currentUser,
          tokens: this.tokens,
          message: response.message
        };
      }

      return {
        success: false,
        error: response.error || 'Login failed',
        code: response.code
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
        code: 'LOGIN_ERROR'
      };
    }
  }

  // Refresh access token
  async refreshToken(): Promise<boolean> {
    if (!this.tokens?.refreshToken) {
      return false;
    }

    try {
      const response = await this.makeRequest('POST', '/auth/refresh-token', {
        refreshToken: this.tokens.refreshToken
      });

      if (response.tokens) {
        this.tokens = response.tokens;
        await this.updateStorageAuthState();
        return true;
      }

      return false;

    } catch (error) {
      console.error('Token refresh error:', error);

      // If refresh fails, logout user
      await this.logout();
      return false;
    }
  }

  // Get current user info
  async getCurrentUser(): Promise<User | null> {
    if (!this.tokens?.accessToken) {
      return null;
    }

    try {
      const response = await this.makeRequest('GET', '/auth/me', undefined, true);

      if (response.user) {
        this.currentUser = response.user;
        return this.currentUser;
      }

      return null;

    } catch (error) {
      console.error('Get current user error:', error);

      // If getting user fails with auth error, try to refresh token
      if (error instanceof Error && error.message.includes('401')) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Try again after refresh
          return this.getCurrentUser();
        }
      }

      return null;
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      // Call logout endpoint if we have a token
      if (this.tokens?.accessToken) {
        await this.makeRequest('POST', '/auth/logout', undefined, true);
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear local state
      this.currentUser = null;
      this.tokens = null;

      // Stop token refresh timer
      if (this.refreshTokenTimer) {
        clearTimeout(this.refreshTokenTimer);
        this.refreshTokenTimer = null;
      }

      // Update storage service to switch back to local
      await this.updateStorageAuthState();
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!(this.currentUser && this.tokens?.accessToken);
  }

  // Get current user
  getUser(): User | null {
    return this.currentUser;
  }

  // Get access token
  getAccessToken(): string | null {
    return this.tokens?.accessToken || null;
  }

  // Start automatic token refresh
  private startTokenRefreshTimer(): void {
    if (this.refreshTokenTimer) {
      clearTimeout(this.refreshTokenTimer);
    }

    // Refresh token 5 minutes before expiry (assuming 1 hour expiry)
    const refreshInterval = 55 * 60 * 1000; // 55 minutes in ms

    this.refreshTokenTimer = setTimeout(async () => {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        this.startTokenRefreshTimer(); // Schedule next refresh
      }
    }, refreshInterval);
  }

  // Update storage service with current auth state
  private async updateStorageAuthState(): Promise<void> {
    try {
      const storageService = getStorageService();

      const authState: AuthState = {
        isAuthenticated: this.isAuthenticated(),
        token: this.tokens?.accessToken,
        user: this.currentUser ? {
          id: this.currentUser.id,
          email: this.currentUser.email,
          subscriptionStatus: this.currentUser.subscriptionStatus,
          isTrialActive: this.currentUser.isTrialActive
        } : undefined
      };

      await storageService.updateAuthState(authState);
    } catch (error) {
      console.error('Failed to update storage auth state:', error);
    }
  }

  // Initialize auth service (check for existing tokens, etc.)
  async initialize(): Promise<void> {
    // In a real implementation, you'd load tokens from secure storage
    // and validate them with the server

    // For now, we'll just ensure storage service is updated
    await this.updateStorageAuthState();
  }

  // Check subscription status
  hasActiveSubscription(): boolean {
    return this.currentUser?.hasActiveSubscription || false;
  }

  // Check trial status
  isTrialActive(): boolean {
    return this.currentUser?.isTrialActive || false;
  }

  // Get trial days remaining
  getTrialDaysRemaining(): number {
    return this.currentUser?.trialDaysRemaining || 0;
  }

  // Check if user can access premium features
  canAccessPremiumFeatures(): boolean {
    return this.hasActiveSubscription() || this.isTrialActive();
  }
}

// Singleton instance
let authServiceInstance: AuthService | null = null;

export function initializeAuthService(apiBaseUrl: string): AuthService {
  if (!authServiceInstance) {
    authServiceInstance = new AuthService(apiBaseUrl);
  }
  return authServiceInstance;
}

export function getAuthService(): AuthService {
  if (!authServiceInstance) {
    throw new Error('AuthService not initialized. Call initializeAuthService() first.');
  }
  return authServiceInstance;
}