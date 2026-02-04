module.exports = {
  // Unit test specific configuration
  displayName: 'Unit Tests',
  testMatch: ['<rootDir>/tests/unit/**/*.test.js'],
  
  // Prevent any database setup
  setupFilesAfterEnv: [],
  
  // Clear mocks after each test
  clearMocks: true,
  
  // Don't collect coverage from mocked files
  collectCoverageFrom: [
    'routes/**/*.js',
    '!routes/**/*.test.js',
    '!tests/**'
  ],
  
  // Mock environment
  testEnvironment: 'node',
  
  // Verbose output to see what's being tested
  verbose: true
};