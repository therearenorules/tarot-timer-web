// simple-integration.js - Basic Node.js test for backend integration
// This tests the API endpoints directly without frontend dependencies

const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000';

class SimpleIntegrationTest {
  constructor() {
    this.authToken = null;
  }

  async run() {
    console.log('🚀 Starting Simple Integration Test...\n');

    try {
      // Test 1: Health Check
      await this.testHealthCheck();

      // Test 2: Authentication
      await this.testAuthentication();

      // Test 3: API Endpoints (if authenticated)
      if (this.authToken) {
        await this.testSpreadAPI();
        await this.testSyncAPI();
      }

      console.log('\n✅ All integration tests passed!');
      return true;

    } catch (error) {
      console.error('\n❌ Integration test failed:', error.message);
      return false;
    }
  }

  async testHealthCheck() {
    console.log('🧪 Testing API availability...');
    const response = await fetch(`${API_BASE_URL}/api`);

    if (!response.ok) {
      throw new Error(`API check failed: ${response.status}`);
    }

    const apiInfo = await response.json();
    console.log('✅ API check passed:', apiInfo.status);
  }

  async testAuthentication() {
    console.log('🧪 Testing authentication...');

    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'password123';
    const testName = 'Integration Test User';

    // Try registration first
    try {
      const registerResponse = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          name: testName
        })
      });

      if (registerResponse.ok) {
        const data = await registerResponse.json();
        this.authToken = data.tokens.accessToken;
        console.log('✅ Registration successful');
      } else {
        const errorData = await registerResponse.json();
        if (errorData.error && errorData.error.includes('already been registered')) {
          // Try login instead
          const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: testEmail,
              password: testPassword
            })
          });

          if (loginResponse.ok) {
            const data = await loginResponse.json();
            this.authToken = data.tokens.accessToken;
            console.log('✅ Login successful');
          } else {
            throw new Error('Both registration and login failed');
          }
        } else {
          throw new Error(`Registration failed: ${errorData.error}`);
        }
      }
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  async testSpreadAPI() {
    console.log('🧪 Testing Spread API...');

    // Test POST - Create spread
    const testSpread = {
      title: 'Node.js Integration Test Spread',
      spreadType: 'test',
      spreadName: '통합 테스트',
      spreadNameEn: 'Integration Test',
      positions: [
        {
          name: 'Test Position',
          card: {
            id: 1,
            name: 'The Magician',
            nameKr: '마법사'
          }
        }
      ],
      insights: 'This is a test spread created by Node.js integration test',
      tags: ['integration', 'test', 'nodejs']
    };

    const createResponse = await fetch(`${API_BASE_URL}/api/spreads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      },
      body: JSON.stringify(testSpread)
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      throw new Error(`Failed to create spread: ${errorData.error}`);
    }

    const createdSpread = await createResponse.json();
    console.log('✅ Spread created successfully:', createdSpread.spread?.id);

    // Test GET - Retrieve spreads
    const getResponse = await fetch(`${API_BASE_URL}/api/spreads`, {
      headers: {
        'Authorization': `Bearer ${this.authToken}`
      }
    });

    if (!getResponse.ok) {
      throw new Error(`Failed to get spreads: ${getResponse.status}`);
    }

    const spreadsData = await getResponse.json();
    console.log('✅ Spreads retrieved successfully. Count:', spreadsData.spreads?.length || 0);

    // Verify our test spread exists
    const testSpreadExists = spreadsData.spreads?.some(s => s.title === testSpread.title);
    if (!testSpreadExists) {
      throw new Error('Test spread not found in retrieved spreads');
    }

    console.log('✅ Test spread found in results');
  }

  async testSyncAPI() {
    console.log('🧪 Testing Sync API...');

    // Test sync status
    const statusResponse = await fetch(`${API_BASE_URL}/api/sync/status`, {
      headers: {
        'Authorization': `Bearer ${this.authToken}`
      }
    });

    if (!statusResponse.ok) {
      throw new Error(`Failed to get sync status: ${statusResponse.status}`);
    }

    const statusData = await statusResponse.json();
    console.log('✅ Sync status retrieved:', statusData.userId ? 'User ID present' : 'No user ID');

    // Test data export
    const exportResponse = await fetch(`${API_BASE_URL}/api/sync/export`, {
      headers: {
        'Authorization': `Bearer ${this.authToken}`
      }
    });

    if (!exportResponse.ok) {
      throw new Error(`Failed to export data: ${exportResponse.status}`);
    }

    const exportData = await exportResponse.json();
    console.log('✅ Data export successful. Spreads:', exportData.spreadReadings?.length || 0);
  }
}

// Run the test
async function runTest() {
  const test = new SimpleIntegrationTest();
  const success = await test.run();

  if (success) {
    console.log('\n🎉 Integration test completed successfully!');
    process.exit(0);
  } else {
    console.log('\n💥 Integration test failed!');
    process.exit(1);
  }
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('💥 Unhandled error:', error.message);
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  runTest();
}

module.exports = SimpleIntegrationTest;