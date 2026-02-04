/**
 * Jest Configuration for E-Commerce Backend Tests
 */

module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Test file patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ],

  // Test directory structure
  testPathIgnorePatterns: [
    '/node_modules/'
  ],

  // Test execution
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,

  // Reporter configuration
  reporters: [
    'default'
  ],

  // Global test timeout (30 seconds)
  testTimeout: 30000,

  // Mock configuration
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Module resolution
  moduleDirectories: ['node_modules', '<rootDir>'],

  // Transform configuration (if using ES modules in the future)
  transform: {},

  // Global variables available in all tests
  globals: {
    'TEST_DB_PATH': '<rootDir>/test_ecommerce.db'
  }
};