// Test setup file - runs before each test suite

import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Suppress non-critical console output during tests
  console.error = jest.fn((message) => {
    // Only log actual errors, not expected test errors
    if (typeof message === 'string' && message.includes('Test error')) {
      return;
    }
    originalConsoleError(message);
  });

  console.warn = jest.fn((message) => {
    // Suppress warnings during tests
    if (typeof message === 'string' && message.includes('Database error, falling back')) {
      return;
    }
    originalConsoleWarn(message);
  });
});

afterAll(() => {
  // Restore console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test timeout
jest.setTimeout(30000);