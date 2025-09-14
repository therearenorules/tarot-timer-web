// StorageService.ts - Service layer to manage storage adapters
// This provides a unified interface for the app to use storage without knowing the implementation

import { DailyTarotSave, SavedSpread } from '../utils/tarotData';
import { StorageInterface, CloudStorageAdapter, createStorageAdapter } from './CloudStorageAdapter';

export interface AuthState {
  isAuthenticated: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    subscriptionStatus: string;
    isTrialActive: boolean;
  };
}

export class StorageService {
  private currentAdapter: StorageInterface | null = null;
  private cloudAdapter: CloudStorageAdapter | null = null;
  private localAdapter: StorageInterface | null = null;
  private authState: AuthState = { isAuthenticated: false };

  constructor(
    private config: {
      apiBaseUrl: string;
      localStorageAdapter?: StorageInterface;
    }
  ) {
    this.localAdapter = config.localStorageAdapter || null;
  }

  // Initialize the service with authentication state
  async initialize(authState?: AuthState): Promise<void> {
    if (authState) {
      this.authState = authState;
    }

    // If user is authenticated, set up cloud adapter
    if (this.authState.isAuthenticated && this.authState.token) {
      try {
        this.cloudAdapter = new CloudStorageAdapter({
          apiBaseUrl: this.config.apiBaseUrl,
          timeout: 10000,
          retryAttempts: 3
        });

        this.cloudAdapter.setAuthToken(this.authState.token);
        this.currentAdapter = this.cloudAdapter;

        // Test the connection
        await this.testConnection();

      } catch (error) {
        console.warn('Failed to initialize cloud adapter, falling back to local:', error);
        this.currentAdapter = this.localAdapter;
      }
    } else {
      // Use local storage for unauthenticated users
      this.currentAdapter = this.localAdapter;
    }
  }

  private async testConnection(): Promise<void> {
    if (this.cloudAdapter) {
      // Try to make a simple request to test connectivity
      try {
        await this.cloudAdapter.getDailyTarotSave('2024-01-01'); // Test with a dummy date
      } catch (error) {
        // Connection test failed, but this is expected for non-existent data
        // If it's a 404, that's actually good (server is responding)
        if (error instanceof Error && error.message.includes('404')) {
          return; // Connection is working
        }
        throw error; // Re-throw other errors
      }
    }
  }

  // Update authentication state
  async updateAuthState(authState: AuthState): Promise<void> {
    const wasAuthenticated = this.authState.isAuthenticated;
    this.authState = authState;

    // If user just authenticated, switch to cloud and migrate data
    if (!wasAuthenticated && authState.isAuthenticated && authState.token) {
      await this.switchToCloud(authState.token);
    }

    // If user logged out, switch back to local
    if (wasAuthenticated && !authState.isAuthenticated) {
      await this.switchToLocal();
    }
  }

  private async switchToCloud(token: string): Promise<void> {
    try {
      // Initialize cloud adapter
      this.cloudAdapter = new CloudStorageAdapter({
        apiBaseUrl: this.config.apiBaseUrl,
        timeout: 10000,
        retryAttempts: 3
      });

      this.cloudAdapter.setAuthToken(token);

      // Test connection
      await this.testConnection();

      // Migrate local data to cloud if we have local data
      if (this.localAdapter) {
        await this.migrateToCloud();
      }

      // Switch to cloud adapter
      this.currentAdapter = this.cloudAdapter;

    } catch (error) {
      console.error('Failed to switch to cloud storage:', error);
      // Keep using local adapter
    }
  }

  private async switchToLocal(): Promise<void> {
    if (this.cloudAdapter) {
      this.cloudAdapter.clearAuthToken();
    }
    this.currentAdapter = this.localAdapter;
  }

  private async migrateToCloud(): Promise<void> {
    if (!this.localAdapter || !this.cloudAdapter) {
      return;
    }

    try {
      console.log('Starting data migration to cloud...');

      // Get all local data
      const localSpreads = await this.localAdapter.getSavedSpreads();

      // For daily sessions, we'd need to implement a method to get all sessions
      // For now, we'll focus on spreads

      // Migrate spreads
      for (const spread of localSpreads) {
        try {
          await this.cloudAdapter.saveSpread(spread);
          console.log(`Migrated spread: ${spread.title}`);
        } catch (error) {
          console.error(`Failed to migrate spread ${spread.title}:`, error);
        }
      }

      console.log(`Migration completed. Migrated ${localSpreads.length} spreads.`);

    } catch (error) {
      console.error('Data migration failed:', error);
    }
  }

  // Unified storage interface methods

  async getDailyTarotSave(date: string): Promise<DailyTarotSave | null> {
    if (!this.currentAdapter) {
      throw new Error('Storage adapter not initialized');
    }
    return this.currentAdapter.getDailyTarotSave(date);
  }

  async saveDailyTarot(date: string, data: DailyTarotSave): Promise<void> {
    if (!this.currentAdapter) {
      throw new Error('Storage adapter not initialized');
    }
    return this.currentAdapter.saveDailyTarot(date, data);
  }

  async getSavedSpreads(): Promise<SavedSpread[]> {
    if (!this.currentAdapter) {
      throw new Error('Storage adapter not initialized');
    }
    return this.currentAdapter.getSavedSpreads();
  }

  async saveSpread(spread: SavedSpread): Promise<void> {
    if (!this.currentAdapter) {
      throw new Error('Storage adapter not initialized');
    }
    return this.currentAdapter.saveSpread(spread);
  }

  async deleteSavedSpread(id: string): Promise<void> {
    if (!this.currentAdapter) {
      throw new Error('Storage adapter not initialized');
    }
    return this.currentAdapter.deleteSavedSpread(id);
  }

  async getDailyTarotMemos(date: string): Promise<Record<number, string>> {
    if (!this.currentAdapter) {
      throw new Error('Storage adapter not initialized');
    }
    return this.currentAdapter.getDailyTarotMemos(date);
  }

  async saveDailyTarotMemos(date: string, memos: Record<number, string>): Promise<void> {
    if (!this.currentAdapter) {
      throw new Error('Storage adapter not initialized');
    }
    return this.currentAdapter.saveDailyTarotMemos(date, memos);
  }

  // Service status methods

  isUsingCloud(): boolean {
    return this.currentAdapter === this.cloudAdapter;
  }

  isOnline(): boolean {
    if (this.cloudAdapter) {
      return this.cloudAdapter.getConnectionStatus();
    }
    return false;
  }

  getQueueSize(): number {
    if (this.cloudAdapter) {
      return this.cloudAdapter.getQueueSize();
    }
    return 0;
  }

  async syncOfflineData(): Promise<void> {
    if (this.cloudAdapter) {
      await this.cloudAdapter.syncOfflineData();
    }
  }

  // Get service status for debugging
  getStatus(): {
    currentAdapter: 'cloud' | 'local' | 'none';
    isAuthenticated: boolean;
    isOnline: boolean;
    queueSize: number;
    hasLocalAdapter: boolean;
    hasCloudAdapter: boolean;
  } {
    return {
      currentAdapter: this.currentAdapter === this.cloudAdapter
        ? 'cloud'
        : this.currentAdapter === this.localAdapter
        ? 'local'
        : 'none',
      isAuthenticated: this.authState.isAuthenticated,
      isOnline: this.isOnline(),
      queueSize: this.getQueueSize(),
      hasLocalAdapter: !!this.localAdapter,
      hasCloudAdapter: !!this.cloudAdapter
    };
  }
}

// Singleton instance
let storageServiceInstance: StorageService | null = null;

export function initializeStorageService(config: {
  apiBaseUrl: string;
  localStorageAdapter?: StorageInterface;
}): StorageService {
  if (!storageServiceInstance) {
    storageServiceInstance = new StorageService(config);
  }
  return storageServiceInstance;
}

export function getStorageService(): StorageService {
  if (!storageServiceInstance) {
    throw new Error('StorageService not initialized. Call initializeStorageService() first.');
  }
  return storageServiceInstance;
}