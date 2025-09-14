// IntegrationTest.ts - Test frontend-backend integration
// This tests the CloudStorageAdapter with the actual backend API

import { CloudStorageAdapter } from '../services/CloudStorageAdapter';
import { ApiClient } from '../services/ApiClient';
import { DailyTarotSave, SavedSpread } from '../utils/tarotData';

interface TestResult {
  testName: string;
  passed: boolean;
  error?: string;
  duration: number;
}

export class IntegrationTest {
  private adapter: CloudStorageAdapter;
  private apiClient: ApiClient;
  private testResults: TestResult[] = [];

  constructor(apiBaseUrl: string = 'http://localhost:3000') {
    this.adapter = new CloudStorageAdapter({
      apiBaseUrl,
      timeout: 10000,
      retryAttempts: 2
    });

    this.apiClient = new ApiClient(apiBaseUrl);
  }

  async runAllTests(): Promise<{
    totalTests: number;
    passedTests: number;
    failedTests: number;
    results: TestResult[];
  }> {
    console.log('🧪 Starting Frontend-Backend Integration Tests...\n');

    // Clear previous results
    this.testResults = [];

    // Run authentication tests
    await this.testAuthentication();

    // Run storage interface tests (if authenticated)
    if (this.apiClient.isAuthenticated()) {
      await this.testDailySessionsInterface();
      await this.testSpreadsInterface();
      await this.testSyncInterface();
      await this.testOfflineCapability();
    }

    // Calculate results
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = this.testResults.length - passedTests;

    console.log('\n📊 Integration Test Results:');
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📊 Total: ${this.testResults.length}\n`);

    // Print detailed results
    this.testResults.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      const errorMsg = result.error ? ` - ${result.error}` : '';
      console.log(`${status} ${result.testName} (${result.duration}ms)${errorMsg}`);
    });

    return {
      totalTests: this.testResults.length,
      passedTests,
      failedTests,
      results: this.testResults
    };
  }

  private async runTest(testName: string, testFn: () => Promise<void>): Promise<void> {
    const startTime = Date.now();

    try {
      console.log(`🧪 Running: ${testName}`);
      await testFn();

      const duration = Date.now() - startTime;
      this.testResults.push({
        testName,
        passed: true,
        duration
      });

      console.log(`✅ ${testName} - PASSED (${duration}ms)`);

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.testResults.push({
        testName,
        passed: false,
        error: errorMessage,
        duration
      });

      console.log(`❌ ${testName} - FAILED (${duration}ms): ${errorMessage}`);
    }
  }

  // Authentication Tests
  private async testAuthentication(): Promise<void> {
    await this.runTest('API Health Check', async () => {
      const health = await this.apiClient.healthCheck();
      if (!health.status) {
        throw new Error('Health check failed');
      }
    });

    await this.runTest('User Registration/Login', async () => {
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = 'password123';
      const testName = 'Integration Test User';

      try {
        // Try to register
        const registerResponse = await this.apiClient.register(testEmail, testPassword, testName);

        if (!registerResponse.user || !registerResponse.tokens) {
          throw new Error('Registration failed - missing user or tokens');
        }

        // Set auth token for subsequent tests
        this.adapter.setAuthToken(registerResponse.tokens.accessToken);

      } catch (error) {
        // If registration fails (user exists), try login
        if (error instanceof Error && error.message.includes('already been registered')) {
          const loginResponse = await this.apiClient.login(testEmail, testPassword);

          if (!loginResponse.user || !loginResponse.tokens) {
            throw new Error('Login failed - missing user or tokens');
          }

          // Set auth token for subsequent tests
          this.adapter.setAuthToken(loginResponse.tokens.accessToken);
        } else {
          throw error;
        }
      }
    });
  }

  // Daily Sessions Interface Tests
  private async testDailySessionsInterface(): Promise<void> {
    const testDate = '2025-09-14';

    await this.runTest('Get Daily Session (Empty)', async () => {
      const session = await this.adapter.getDailyTarotSave(testDate);
      // Should return null if no session exists (or the existing session)
      // This is expected to pass either way
    });

    await this.runTest('Save Daily Session', async () => {
      const testSession: DailyTarotSave = {
        id: 'test-session-1',
        date: testDate,
        hourlyCards: new Array(24).fill(null).map((_, i) => ({
          id: i,
          name: `Test Card ${i}`,
          nameKr: `테스트 카드 ${i}`,
          meaning: 'Test meaning',
          meaningKr: '테스트 의미',
          keywords: ['test'],
          keywordsKr: ['테스트'],
          imageUrl: '',
          element: 'test',
          suit: 'test',
          type: 'Major Arcana' as const
        })),
        memos: { 0: 'Test memo', 12: 'Another test memo' },
        insights: 'Test insights for integration',
        savedAt: new Date().toISOString()
      };

      await this.adapter.saveDailyTarot(testDate, testSession);
    });

    await this.runTest('Get Daily Session (With Data)', async () => {
      const session = await this.adapter.getDailyTarotSave(testDate);

      if (!session) {
        throw new Error('Session should exist after saving');
      }

      if (session.date !== testDate) {
        throw new Error(`Date mismatch: expected ${testDate}, got ${session.date}`);
      }

      if (!session.hourlyCards || session.hourlyCards.length === 0) {
        throw new Error('Hourly cards should be present');
      }
    });

    await this.runTest('Save Daily Memos', async () => {
      const testMemos = {
        8: 'Morning memo test',
        15: 'Afternoon memo test',
        20: 'Evening memo test'
      };

      await this.adapter.saveDailyTarotMemos(testDate, testMemos);
    });

    await this.runTest('Get Daily Memos', async () => {
      const memos = await this.adapter.getDailyTarotMemos(testDate);

      if (!memos || typeof memos !== 'object') {
        throw new Error('Memos should be returned as an object');
      }
    });
  }

  // Spreads Interface Tests
  private async testSpreadsInterface(): Promise<void> {
    let testSpreadId: string;

    await this.runTest('Get Spreads (Initial)', async () => {
      const spreads = await this.adapter.getSavedSpreads();

      if (!Array.isArray(spreads)) {
        throw new Error('Spreads should be returned as an array');
      }
    });

    await this.runTest('Save New Spread', async () => {
      const testSpread: SavedSpread = {
        id: 'test-spread-1',
        title: 'Integration Test Spread',
        spreadType: 'test',
        spreadName: '테스트 스프레드',
        spreadNameEn: 'Test Spread',
        positions: [
          {
            id: 1,
            name: '과거',
            nameEn: 'Past',
            description: 'Test position',
            card: {
              id: 0,
              name: 'The Fool',
              nameKr: '바보',
              meaning: 'New beginnings',
              meaningKr: '새로운 시작',
              keywords: ['beginning'],
              keywordsKr: ['시작'],
              imageUrl: '',
              element: 'Air',
              suit: 'Major Arcana',
              type: 'Major Arcana'
            },
            x: 100,
            y: 100
          }
        ],
        insights: 'Test spread insights for integration testing',
        createdAt: new Date().toISOString(),
        tags: ['integration', 'test']
      };

      await this.adapter.saveSpread(testSpread);
      testSpreadId = testSpread.id;
    });

    await this.runTest('Get Spreads (After Save)', async () => {
      const spreads = await this.adapter.getSavedSpreads();

      if (!Array.isArray(spreads)) {
        throw new Error('Spreads should be returned as an array');
      }

      const testSpread = spreads.find(s => s.title === 'Integration Test Spread');
      if (!testSpread) {
        throw new Error('Test spread should be found in saved spreads');
      }

      if (!testSpread.positions || testSpread.positions.length === 0) {
        throw new Error('Spread positions should be preserved');
      }
    });

    // Note: Delete test commented out to preserve test data
    // await this.runTest('Delete Spread', async () => {
    //   if (testSpreadId) {
    //     await this.adapter.deleteSavedSpread(testSpreadId);
    //   }
    // });
  }

  // Sync Interface Tests
  private async testSyncInterface(): Promise<void> {
    await this.runTest('Get Sync Status', async () => {
      const status = await this.adapter.getSyncStatus();

      if (!status || typeof status !== 'object') {
        throw new Error('Sync status should return an object');
      }

      if (!status.hasOwnProperty('userId')) {
        throw new Error('Sync status should include userId');
      }
    });

    await this.runTest('Export User Data', async () => {
      const exportData = await this.adapter.getFullSyncData();

      if (!exportData || typeof exportData !== 'object') {
        throw new Error('Export data should return an object');
      }

      if (!exportData.hasOwnProperty('user')) {
        throw new Error('Export data should include user information');
      }

      if (!exportData.hasOwnProperty('metadata')) {
        throw new Error('Export data should include metadata');
      }
    });
  }

  // Offline Capability Tests
  private async testOfflineCapability(): Promise<void> {
    await this.runTest('Offline Queue Management', async () => {
      const initialQueueSize = this.adapter.getQueueSize();

      if (typeof initialQueueSize !== 'number') {
        throw new Error('Queue size should return a number');
      }

      const connectionStatus = this.adapter.getConnectionStatus();
      if (typeof connectionStatus !== 'boolean') {
        throw new Error('Connection status should return a boolean');
      }
    });

    await this.runTest('Sync Offline Data', async () => {
      // This test ensures the sync method exists and can be called
      await this.adapter.syncOfflineData();
      // If it doesn't throw, it passes
    });
  }

  // Utility method to run a quick test
  static async quickTest(apiBaseUrl: string = 'http://localhost:3000'): Promise<boolean> {
    console.log('🚀 Running Quick Integration Test...\n');

    const test = new IntegrationTest(apiBaseUrl);
    const results = await test.runAllTests();

    const success = results.failedTests === 0;
    console.log(`\n${success ? '🎉' : '💥'} Quick Test ${success ? 'PASSED' : 'FAILED'}`);

    return success;
  }
}

// Export for use in browser console or test runner
if (typeof window !== 'undefined') {
  (window as any).IntegrationTest = IntegrationTest;
}

export default IntegrationTest;