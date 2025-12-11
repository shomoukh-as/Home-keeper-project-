# HomeKeeper Testing Suite

## Overview

This comprehensive testing suite covers all aspects of the HomeKeeper application across four test levels:

1. **Unit Tests** - Test individual functions and modules in isolation
2. **Feature Tests** - Test complete user workflows within features
3. **System Tests** - Test the entire application end-to-end
4. **Release Tests** - Validate production readiness

## Technology Stack

- **Jest** - JavaScript testing framework
- **jsdom** - DOM implementation for Node.js (for unit/feature tests)
- **Puppeteer** - Browser automation (for system/release tests)

## Test Structure

```
tests/
├── setup.js                          # Global test configuration
├── helpers/
│   ├── fixtures.js                   # Test data
│   ├── mocks.js                      # Mock implementations
│   └── dom-helpers.js                # DOM testing utilities
├── unit/                             # Unit Tests
│   ├── utils.test.js                 # Utils module tests
│   ├── auth.test.js                  # Auth module tests
│   ├── appliances.test.js            # Appliances tests
│   ├── invoices.test.js              # Invoices tests
│   └── warranty.test.js              # Warranty tests
├── feature/                          # Feature Tests
│   ├── authentication.test.js        # Auth workflows
│   ├── appliance-management.test.js  # Appliance CRUD workflows
│   ├── invoice-management.test.js    # Invoice CRUD workflows
│   └── warranty-tracking.test.js     # Warranty tracking workflows
├── system/                           # System Tests
│   ├── e2e.test.js                   # End-to-end user journeys
│   ├── browser-compatibility.test.js # Cross-browser testing
│   └── performance.test.js           # Performance testing
└── release/                          # Release Tests
    ├── smoke.test.js                 # Smoke tests
    ├── regression.test.js            # Regression tests
    └── acceptance.test.js            # User acceptance tests
```

## Running Tests

### Prerequisites

Install dependencies first:

```bash
npm install
```

### Run All Tests

```bash
npm test
```

### Run Specific Test Levels

**Unit Tests Only:**
```bash
npm run test:unit
```

**Feature Tests Only:**
```bash
npm run test:feature
```

**System Tests Only:**
```bash
npm run test:system
```

**Release Tests Only:**
```bash
npm run test:release
```

### Watch Mode

Run tests in watch mode for development:

```bash
npm run test:watch
```

### Coverage Report

Generate test coverage report:

```bash
npm run test:coverage
```

Coverage reports will be generated in the `coverage/` directory.

## Test Levels Explained

### 1. Unit Tests

Test individual functions and modules in isolation. These tests are fast and focused on specific functionality.

**What's Tested:**
- localStorage helpers (get/set users, current user, user arrays)
- Date helpers (daysBetween, fmt)
- API request helpers
- Token management
- Authentication functions
- Data validation
- Data transformation

**Example:**
```javascript
test('getAllUsers returns empty array when no users exist', () => {
  expect(getAllUsers()).toEqual([]);
});
```

### 2. Feature Tests

Test complete user workflows within individual features. These verify that features work correctly from start to finish.

**What's Tested:**
- Complete registration → login → logout workflow
- Appliance CRUD operations (Create, Read, Update, Delete)
- Invoice management workflows
- Warranty tracking workflows
- Search and filter functionality
- Multi-user support

**Example:**
```javascript
test('user can register and then login', async () => {
  // Register user
  const registerResult = await registerUser('newuser', 'password123');
  expect(registerResult.success).toBe(true);
  
  // Login with same credentials
  const loginResult = await loginUser('newuser', 'password123');
  expect(loginResult.success).toBe(true);
});
```

### 3. System Tests

Test the entire application using browser automation. These tests verify the application works in a real browser environment.

**What's Tested:**
- End-to-end user journeys
- Page navigation
- UI interactions (modals, forms, buttons)
- Cross-module data consistency
- Browser compatibility (localStorage, DOM rendering)
- Performance with large datasets
- Responsive design

**Example:**
```javascript
test('all main pages load without errors', async () => {
  const pages = ['index.html', 'dashboard.html', 'appliances.html'];
  for (const page of pages) {
    await browser.goto(page);
    const body = await browser.$('body');
    expect(body).toBeTruthy();
  }
});
```

### 4. Release Tests

Validate that the application is production-ready. These are the final gate before deployment.

**What's Tested:**
- **Smoke Tests**: Quick verification that critical paths work
- **Regression Tests**: Ensure existing functionality hasn't broken
- **Acceptance Tests**: Complete user workflows meet requirements

**Example:**
```javascript
test('index.html loads successfully', async () => {
  await page.goto('index.html');
  const title = await page.title();
  expect(title).toContain('Home Keeper');
});
```

## Writing New Tests

### Unit Test Template

```javascript
describe('Module Name', () => {
  beforeEach(() => {
    // Setup
    localStorage.clear();
  });

  test('specific functionality', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = functionToTest(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### Feature Test Template

```javascript
describe('Feature: Feature Name', () => {
  beforeEach(() => {
    localStorage.clear();
    fetch.mockClear();
  });

  test('complete workflow', async () => {
    // Setup mocks
    fetch.mockResolvedValueOnce(mockApiSuccess(data));
    
    // Execute workflow
    const result = await workflowFunction();
    
    // Verify
    expect(result.success).toBe(true);
  });
});
```

## Test Coverage Goals

- **Unit Tests**: 90%+ code coverage
- **Feature Tests**: Cover all major user workflows
- **System Tests**: Verify all pages and critical UI interactions
- **Release Tests**: Validate production readiness

##Current Test Statistics

- **Total Test Files**: 15
- **Unit Test Files**: 5 (utils, auth, appliances, invoices, warranty)
- **Feature Test Files**: 4 (authentication, appliance-mgmt, invoice-mgmt, warranty-tracking)
- **System Test Files**: 3 (e2e, browser-compatibility, performance)
- **Release Test Files**: 3 (smoke, regression, acceptance)

## Continuous Integration

These tests are designed to run in CI/CD pipelines. For CI environments:

```bash
# Run all tests with coverage
npm run test:coverage

# CI-specific command (no watch mode)
CI=true npm test
```

## Troubleshooting

### Tests Fail with "localStorage is not defined"

This is expected for tests that rely on the browser environment. The test setup includes a mock localStorage implementation.

### Puppeteer Tests Hang

Ensure you're using the correct Puppeteer configuration:
```javascript
browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
```

### API Mock Errors

Verify that fetch is properly mocked in your test:
```javascript
fetch.mockResolvedValueOnce(mockApiSuccess(data));
```

## Best Practices

1. **Keep tests isolated** - Each test should be independent
2. **Clear state** - Use `beforeEach` to reset state
3. **Test behavior, not implementation** - Focus on what, not how
4. **Use descriptive test names** - Test names should describe what's being tested
5. **Keep tests simple** - One assertion per test when possible
6. **Mock external dependencies** - Don't rely on actual API calls

## Contributing

When adding new features:

1. Write unit tests for new functions
2. Add feature tests for new workflows
3. Update system tests if UI changes
4. Run all tests before committing

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Puppeteer Documentation](https://pptr.dev/)
- [Testing Best Practices](https://testingjavascript.com/)
