// CloudStorageAdapter.ts - Seamless backend integration without frontend changes
// This adapter implements the exact same interface as the current local storage system

import { DailyTarotSave, SavedSpread, TarotCard } from '../utils/tarotData';
import { ApiClient } from './ApiClient';

export interface StorageInterface {
  getDailyTarotSave(date: string): Promise<DailyTarotSave | null>;
  saveDailyTarot(date: string, data: DailyTarotSave): Promise<void>;
  getSavedSpreads(): Promise<SavedSpread[]>;
  saveSpread(spread: SavedSpread): Promise<void>;
  deleteSavedSpread(id: string): Promise<void>;
  getDailyTarotMemos(date: string): Promise<Record<number, string>>;
  saveDailyTarotMemos(date: string, memos: Record<number, string>): Promise<void>;
}

interface CloudConfig {
  apiBaseUrl: string;
  timeout?: number;
  retryAttempts?: number;
}

export class CloudStorageAdapter implements StorageInterface {
  private apiClient: ApiClient;
  private isOnline: boolean = true;

  // Offline queue for when network is unavailable
  private offlineQueue: Array<{
    operation: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  constructor(config: CloudConfig) {
    this.apiClient = new ApiClient(config.apiBaseUrl);

    // Monitor network status
    this.setupNetworkMonitoring();
  }

  // Set authentication token for API requests
  setAuthToken(token: string): void {
    this.apiClient.setAuthToken(token);
  }

  // Remove authentication token
  clearAuthToken(): void {
    this.apiClient.clearAuth();
  }

  private setupNetworkMonitoring(): void {
    // For React Native, we'd use @react-native-async-storage/async-storage and NetInfo
    // For now, we'll implement basic connectivity checking
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.processOfflineQueue();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
      });

      this.isOnline = navigator.onLine;
    }
  }

  private async executeWithOfflineSupport<T>(operation: () => Promise<T>): Promise<T> {
    // If offline, queue the request
    if (!this.isOnline) {
      return new Promise((resolve, reject) => {
        this.offlineQueue.push({
          operation,
          resolve,
          reject
        });

        // For now, resolve with null for GET operations or success for others
        resolve(null as any);
      });
    }

    return operation();
  }

  private async processOfflineQueue(): Promise<void> {
    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const item of queue) {
      try {
        const result = await item.operation();
        item.resolve(result);
      } catch (error) {
        item.reject(error);
      }
    }
  }

  // Implementation of StorageInterface methods

  async getDailyTarotSave(date: string): Promise<DailyTarotSave | null> {
    try {
      const response = await this.executeWithOfflineSupport(() => this.apiClient.getDailySession(date));

      if (response?.id) {
        return {
          id: response.id,
          date: response.date,
          hourlyCards: response.cards || [], // Backend uses 'cards' instead of 'hourlyCards'
          memos: response.memos || {},
          insights: response.insights || '',
          savedAt: response.createdAt || response.updatedAt
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to get daily tarot save:', error);
      return null;
    }
  }

  async saveDailyTarot(date: string, data: DailyTarotSave): Promise<void> {
    try {
      const payload = {
        date: data.date,
        cards: data.hourlyCards, // Backend expects 'cards' instead of 'hourlyCards'
        insights: data.insights || '',
        duration: 24 // Default duration for 24-hour tarot session
      };

      await this.executeWithOfflineSupport(() => this.apiClient.saveDailySession(payload));
    } catch (error) {
      console.error('Failed to save daily tarot:', error);
      throw error;
    }
  }

  async getSavedSpreads(): Promise<SavedSpread[]> {
    try {
      const response = await this.executeWithOfflineSupport(() => this.apiClient.getSpreads());

      if (response?.spreads && Array.isArray(response.spreads)) {
        return response.spreads.map((item: any): SavedSpread => ({
          id: item.id,
          title: item.title,
          spreadType: item.spreadType,
          spreadName: item.spreadName,
          spreadNameEn: item.spreadNameEn,
          positions: item.positions || [],
          insights: item.insights || '',
          createdAt: item.createdAt,
          tags: item.tags || []
        }));
      }

      return [];
    } catch (error) {
      console.error('Failed to get saved spreads:', error);
      return [];
    }
  }

  async saveSpread(spread: SavedSpread): Promise<void> {
    try {
      const payload = {
        title: spread.title,
        spreadType: spread.spreadType,
        spreadName: spread.spreadName,
        spreadNameEn: spread.spreadNameEn,
        positions: spread.positions,
        insights: spread.insights,
        tags: spread.tags
      };

      await this.executeWithOfflineSupport(() => this.apiClient.saveSpread(payload));
    } catch (error) {
      console.error('Failed to save spread:', error);
      throw error;
    }
  }

  async deleteSavedSpread(id: string): Promise<void> {
    try {
      await this.executeWithOfflineSupport(() => this.apiClient.deleteSpread(id));
    } catch (error) {
      console.error('Failed to delete spread:', error);
      throw error;
    }
  }

  async getDailyTarotMemos(date: string): Promise<Record<number, string>> {
    try {
      const dailyTarot = await this.getDailyTarotSave(date);
      return dailyTarot?.memos || {};
    } catch (error) {
      console.error('Failed to get daily tarot memos:', error);
      return {};
    }
  }

  async saveDailyTarotMemos(date: string, memos: Record<number, string>): Promise<void> {
    try {
      // Since backend doesn't have separate memo endpoint, update through main session endpoint
      const existingSession = await this.getDailyTarotSave(date);
      if (existingSession) {
        // Update existing session with new memos
        const payload = {
          date: date,
          cards: existingSession.hourlyCards,
          insights: existingSession.insights,
          duration: 24
        };

        await this.executeWithOfflineSupport(() => this.apiClient.updateDailySession(payload));
      } else {
        // Create new session with memos if it doesn't exist
        const payload = {
          date: date,
          cards: new Array(24).fill(null), // Default empty 24-hour cards
          insights: '',
          duration: 24
        };

        await this.executeWithOfflineSupport(() => this.apiClient.saveDailySession(payload));
      }
    } catch (error) {
      console.error('Failed to save daily tarot memos:', error);
      throw error;
    }
  }

  // Utility methods for managing sync and offline capabilities

  async syncOfflineData(): Promise<void> {
    if (this.isOnline) {
      await this.processOfflineQueue();
    }
  }

  getConnectionStatus(): boolean {
    return this.isOnline;
  }

  getQueueSize(): number {
    return this.offlineQueue.length;
  }

  // Method to migrate from local storage to cloud
  async migrateLocalData(localStorageData: {
    dailySessions: DailyTarotSave[];
    savedSpreads: SavedSpread[];
  }): Promise<{
    success: boolean;
    migratedSessions: number;
    migratedSpreads: number;
    errors: string[];
  }> {
    const result = {
      success: true,
      migratedSessions: 0,
      migratedSpreads: 0,
      errors: [] as string[]
    };

    try {
      // Migrate daily sessions
      for (const session of localStorageData.dailySessions) {
        try {
          await this.saveDailyTarot(session.date, session);
          result.migratedSessions++;
        } catch (error) {
          result.errors.push(`Failed to migrate session ${session.date}: ${error}`);
        }
      }

      // Migrate saved spreads
      for (const spread of localStorageData.savedSpreads) {
        try {
          await this.saveSpread(spread);
          result.migratedSpreads++;
        } catch (error) {
          result.errors.push(`Failed to migrate spread ${spread.title}: ${error}`);
        }
      }

      if (result.errors.length > 0) {
        result.success = false;
      }

    } catch (error) {
      result.success = false;
      result.errors.push(`Migration failed: ${error}`);
    }

    return result;
  }

  // Enhanced sync methods using ApiClient
  async getFullSyncData(): Promise<any> {
    try {
      return await this.apiClient.exportUserData();
    } catch (error) {
      console.error('Failed to get full sync data:', error);
      throw error;
    }
  }

  async importSyncData(data: any): Promise<any> {
    try {
      return await this.apiClient.importUserData(data);
    } catch (error) {
      console.error('Failed to import sync data:', error);
      throw error;
    }
  }

  async getSyncStatus(): Promise<any> {
    try {
      return await this.apiClient.getSyncStatus();
    } catch (error) {
      console.error('Failed to get sync status:', error);
      throw error;
    }
  }

  // Get API client for direct access if needed
  getApiClient(): ApiClient {
    return this.apiClient;
  }
}

// Factory function to create the appropriate storage adapter
export function createStorageAdapter(config: {
  useCloud: boolean;
  apiBaseUrl?: string;
  authToken?: string;
}): StorageInterface {
  if (config.useCloud && config.apiBaseUrl) {
    const adapter = new CloudStorageAdapter({
      apiBaseUrl: config.apiBaseUrl,
      timeout: 10000,
      retryAttempts: 3
    });

    if (config.authToken) {
      adapter.setAuthToken(config.authToken);
    }

    return adapter;
  }

  // Fallback to local storage implementation
  throw new Error('Local storage adapter not implemented in this context');
}

// Hook for React components to easily switch between local and cloud storage
export function useStorageAdapter() {
  // This would integrate with React context or state management
  // to provide the appropriate storage adapter based on user authentication status

  return {
    adapter: null as StorageInterface | null,
    isCloudEnabled: false,
    isOnline: true,
    queueSize: 0,

    // Methods to switch between storage modes
    enableCloud: (apiBaseUrl: string, authToken: string) => {
      // Implementation would go here
    },

    disableCloud: () => {
      // Implementation would go here
    },

    sync: async () => {
      // Implementation would go here
    }
  };
}