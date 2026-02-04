# E-Commerce Backend Testing

This directory contains a comprehensive test suite for the e-commerce backend application organized into three levels: Unit, Integration, and System tests.

## Test Structure

```
tests/
├── setup.js              # Global test setup and database initialization
├── unit/                  # Unit tests (isolated component testing)
│   ├── database.test.js   # Database module unit tests
│   └── products.test.js   # Product routes unit tests
├── integration/           # Integration tests (component interaction testing)
│   ├── products.test.js   # Product API integration tests
│   └── orders.test.js     # Order API integration tests
└── system/               # System tests (end-to-end workflow testing)
    └── ecommerce.test.js  # Complete system workflow tests
```

## Test Types

### Unit Tests (`tests/unit/`)
- Test individual components in isolation
- Use mocking to avoid external dependencies
- Fast execution
- Focus on logic and edge cases

### Integration Tests (`tests/integration/`)
- Test interaction between components
- Use real test database
- Test API endpoints with actual database operations
- Verify data persistence and consistency

### System Tests (`tests/system/`)
- Test complete business workflows
- End-to-end scenarios
- Performance and load testing
- Error handling and edge cases

## Running Tests

### All Tests
```bash
npm test                    # Run all tests
npm run test:coverage       # Run all tests with coverage report
npm run test:ci            # Run tests in CI mode
```

### By Test Type
```bash
npm run test:unit          # Run only unit tests
npm run test:integration   # Run only integration tests
npm run test:system        # Run only system tests
```

### Development
```bash
npm run test:watch         # Run tests in watch mode
npm run test:verbose       # Run tests with verbose output
npm run test:debug         # Run tests in debug mode
```

## Test Database

- Tests use a separate SQLite database (`test_ecommerce.db`)
- Database is recreated before each test run
- Test data is seeded automatically
- Database is cleaned up after tests complete

## Coverage Reports

Coverage reports are generated in the `coverage/` directory:
- `coverage/lcov-report/index.html` - HTML coverage report
- `coverage/test-report.html` - Jest test results report

## Configuration

Test configuration is managed in `jest.config.js`:
- Coverage thresholds: 70% minimum
- Test timeout: 30 seconds
- Automatic cleanup and mocking

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Database is reset before each test
3. **Real Data**: Integration and system tests use actual database
4. **Descriptive Names**: Test names clearly describe what is being tested
5. **Edge Cases**: Tests cover both success and failure scenarios

## Environment Variables

- `NODE_ENV=test` - Set automatically during test execution
- `TEST_TYPE` - Used to filter test types (unit/integration/system)
- `TEST_DB_PATH` - Path to test database file

## Continuous Integration

For CI/CD pipelines, use:
```bash
npm run test:ci
```

This command:
- Runs all tests without watch mode
- Generates coverage reports
- Exits with appropriate status codes
- Optimized for CI environments