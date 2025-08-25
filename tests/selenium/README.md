# Selenium Test Suite for TodoApp Forgot Password Flow

This directory contains comprehensive Selenium WebDriver tests for the TodoApp's forgot password functionality. The tests are written in TypeScript and use Jest as the test framework.

## 🧪 Test Overview

The Selenium test suite provides end-to-end testing of the forgot password flow with the following test categories:

### 📋 Test Categories

1. **Navigation and UI Tests**
   - Navigation between login and forgot password pages
   - UI element visibility and proper display
   - Back navigation functionality

2. **Form Validation Tests**
   - Empty email validation
   - Invalid email format validation
   - Email without @ symbol validation

3. **Successful Password Reset Flow Tests**
   - Email sending for valid emails
   - Handling non-existent emails gracefully
   - Complete password reset flow
   - Login with new password after reset

4. **Reset Password Page Validation Tests**
   - Weak password validation
   - Password mismatch validation
   - Empty password field validation

5. **Token Validation Tests**
   - Invalid token handling
   - Missing token handling
   - Expired token handling

6. **Accessibility and UX Tests**
   - Form labels and accessibility attributes
   - Keyboard navigation
   - Loading states during form submission

7. **Error Handling Tests**
   - Network error handling
   - Server error handling

8. **Security Feature Tests**
   - Email existence privacy (same message for all emails)
   - Email field clearing after submission

9. **Cross-browser Compatibility Tests**
   - Different screen sizes and viewports
   - Responsive design validation

10. **Performance and Reliability Tests**
    - Rapid form submissions
    - Page refresh handling

## 🚀 Running the Tests

### Prerequisites

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Install ChromeDriver**
   ```bash
   npm install -g chromedriver
   # Or use the local version: npx chromedriver
   ```

3. **Start the Application**
   ```bash
   npm run dev
   # Ensure the app is running on http://localhost:3003
   ```

### Test Commands

```bash
# Run all Selenium tests
npm run test:selenium

# Run specific test with headed browser
npm run test:selenium:headed

# Run tests with custom test runner
npm run test:selenium:runner

# Run tests in debug mode
npm run test:selenium:debug

# Run specific test file
cd tests/selenium && npx jest forgot-password.spec.ts

# Run tests matching a pattern
cd tests/selenium && npx jest --testNamePattern="should complete full password reset flow"
```

### Test Configuration

The tests are configured in `jest.config.js`:
- **Timeout**: 60 seconds per test
- **Environment**: Node.js
- **Framework**: Jest with TypeScript support
- **Browser**: Chrome (configurable for headless mode)

## 📁 File Structure

```
tests/selenium/
├── README.md                    # This file
├── forgot-password.spec.ts      # Main test file
├── run-tests.ts                 # Custom test runner
├── jest.config.js              # Jest configuration
├── jest.setup.js               # Jest setup file
├── utils/
│   └── selenium-utils.ts       # Selenium utilities and helpers
└── screenshots/                # Screenshots on test failures
```

## 🔧 SeleniumUtils Class

The `SeleniumUtils` class provides comprehensive utilities for Selenium testing:

### Driver Management
```typescript
// Create driver instance
const driver = await SeleniumUtils.createDriver(false); // false = headed mode
const seleniumUtils = new SeleniumUtils(driver);

// Clean up
await seleniumUtils.quit();
```

### Navigation Helpers
```typescript
await seleniumUtils.gotoLogin();
await seleniumUtils.gotoForgotPassword();
await seleniumUtils.gotoResetPassword(token);
```

### Form Interaction Helpers
```typescript
await seleniumUtils.fillLoginForm(email, password);
await seleniumUtils.submitLoginForm();
await seleniumUtils.fillForgotPasswordForm(email);
await seleniumUtils.submitForgotPasswordForm();
await seleniumUtils.fillResetPasswordForm(password, confirmPassword);
await seleniumUtils.submitResetPasswordForm();
```

### Element Interaction Helpers
```typescript
await seleniumUtils.fillElement(selector, value);
await seleniumUtils.clickElement(selector);
await seleniumUtils.getElementText(selector);
await seleniumUtils.getElementValue(selector);
await seleniumUtils.isElementVisible(selector);
await seleniumUtils.isElementEnabled(selector);
```

### Assertion Helpers
```typescript
await seleniumUtils.expectToBeOnLoginPage();
await seleniumUtils.expectToBeOnForgotPasswordPage();
await seleniumUtils.expectToBeOnResetPasswordPage();
await seleniumUtils.expectToBeOnDashboard();
await seleniumUtils.expectSuccessMessage(expectedMessage);
await seleniumUtils.expectErrorMessage(expectedMessage);
await seleniumUtils.expectLoadingState();
await seleniumUtils.expectNotLoadingState();
```

### Email Mocking
```typescript
await seleniumUtils.setupEmailMock();
const lastEmail = await seleniumUtils.getLastEmail();
const resetToken = await seleniumUtils.extractResetTokenFromEmail();
const resetUrl = await seleniumUtils.getResetUrlFromEmail();
```

### Utility Methods
```typescript
await seleniumUtils.waitForPageLoad();
await seleniumUtils.waitForElement(selector, timeout);
await seleniumUtils.waitForElementVisible(selector, timeout);
await seleniumUtils.waitForText(selector, text, timeout);
await seleniumUtils.waitForUrl(url, timeout);
await seleniumUtils.waitForTimeout(ms);
await seleniumUtils.takeScreenshot(filename);
```

## 🎯 Test Data

### Test Users
```typescript
TEST_DATA = {
  VALID_EMAIL: 'test@example.com',           // Existing user
  INVALID_EMAIL: 'invalid-email',            // Invalid format
  EMPTY_EMAIL: '',                           // Empty email
  WEAK_PASSWORD: '123',                      // Too short
  VALID_PASSWORD: 'newPassword123',          // Valid password
  MISMATCH_PASSWORD: 'differentPassword123', // Mismatch password
}
```

### Test User Credentials
- **Email**: `test@example.com`
- **Original Password**: `password123` (hashed in database)
- **New Password**: `newPassword123` (set during tests)

## 🔍 Selectors

The tests use consistent selectors defined in `SELECTORS`:

```typescript
SELECTORS = {
  // Login page
  LOGIN_EMAIL_INPUT: '#email-address',
  LOGIN_PASSWORD_INPUT: '#password',
  LOGIN_SUBMIT_BUTTON: 'button[type="submit"]',
  FORGOT_PASSWORD_LINK: 'a[href="/forgot-password"]',
  
  // Forgot password page
  FORGOT_EMAIL_INPUT: '#email',
  FORGOT_SUBMIT_BUTTON: 'button[type="submit"]',
  FORGOT_SUCCESS_MESSAGE: '.text-green-700, .text-green-300',
  FORGOT_ERROR_MESSAGE: '.text-red-700, .text-red-300',
  
  // Reset password page
  RESET_PASSWORD_INPUT: '#password',
  RESET_CONFIRM_PASSWORD_INPUT: '#confirmPassword',
  RESET_SUCCESS_MESSAGE: '.text-green-700, .text-green-300',
  RESET_ERROR_MESSAGE: '.text-red-700, .text-red-300',
  
  // Common
  LOADING_SPINNER: '.animate-spin, [class*="animate-spin"]',
  BACK_TO_LOGIN_LINK: 'a[href="/login"]',
}
```

## 🧪 Test Flow Example

Here's an example of a complete test flow:

```typescript
test('should complete full password reset flow', async () => {
  // Step 1: Request password reset
  await seleniumUtils.gotoForgotPassword();
  await seleniumUtils.fillForgotPasswordForm(TEST_DATA.VALID_EMAIL);
  await seleniumUtils.submitForgotPasswordForm();
  
  // Step 2: Extract reset token from email
  const resetToken = await seleniumUtils.extractResetTokenFromEmail();
  expect(resetToken).toBeTruthy();
  
  // Step 3: Navigate to reset password page
  await seleniumUtils.gotoResetPassword(resetToken!);
  await seleniumUtils.expectToBeOnResetPasswordPage();
  
  // Step 4: Fill and submit new password
  await seleniumUtils.fillResetPasswordForm(TEST_DATA.VALID_PASSWORD, TEST_DATA.VALID_PASSWORD);
  await seleniumUtils.submitResetPasswordForm();
  
  // Step 5: Verify success and redirect
  await seleniumUtils.expectSuccessMessage('Password has been reset successfully');
  await seleniumUtils.waitForTimeout(3500);
  await seleniumUtils.expectToBeOnLoginPage();
});
```

## 🔒 Security Testing

The tests verify important security features:

1. **Email Privacy**: Same success message for all emails (existing or not)
2. **Field Clearing**: Email field is cleared after submission
3. **Token Validation**: Invalid/expired tokens are properly rejected
4. **Password Requirements**: Minimum 6 characters enforced
5. **Token Expiry**: Tokens expire after 1 hour

## 🐛 Debugging Tests

### Common Issues

1. **ChromeDriver Issues**: Ensure ChromeDriver is installed and matches Chrome version
2. **Port Conflicts**: Ensure port 3003 is available and app is running
3. **Element Not Found**: Check if selectors match the current UI
4. **Timeout Issues**: Increase timeout in `jest.config.js`

### Debug Commands

```bash
# Run with headed browser to see what's happening
npm run test:selenium:headed

# Run specific test with verbose output
cd tests/selenium && npx jest --verbose --testNamePattern="should complete full password reset flow"

# Run with debug mode
npm run test:selenium:debug

# Run custom test runner
npm run test:selenium:runner
```

### Taking Screenshots

Screenshots are automatically taken on test failures:

```typescript
// Manual screenshot
await seleniumUtils.takeScreenshot('test-step');

// Screenshots are saved in tests/selenium/screenshots/
```

## 📊 Test Reports

Jest provides detailed test reports:

```bash
# Run with coverage
cd tests/selenium && npx jest --coverage

# Generate HTML report
cd tests/selenium && npx jest --coverage --coverageReporters=html
```

## 🚀 CI/CD Integration

The tests are configured for CI/CD with:

- **Headless Mode**: Set `createDriver(true)` for CI environments
- **Screenshot Capture**: Automatic screenshots on failures
- **Timeout Configuration**: 60-second timeout per test
- **Exit Codes**: Proper exit codes for CI integration

### CI Configuration Example

```yaml
# GitHub Actions example
- name: Run Selenium Tests
  run: |
    npm run dev &
    sleep 10
    npm run test:selenium
  env:
    CI: true
```

## 🔄 Email Mocking

The tests use sophisticated email mocking:

```typescript
// Setup email mock
await seleniumUtils.setupEmailMock();

// Submit form (triggers mock)
await seleniumUtils.fillForgotPasswordForm('test@example.com');
await seleniumUtils.submitForgotPasswordForm();

// Extract token from mock email
const resetToken = await seleniumUtils.extractResetTokenFromEmail();
```

The email mock:
- Intercepts API calls to `/api/auth/forgot-password`
- Generates mock reset tokens
- Stores email data for testing
- Provides realistic email simulation

## 📝 Adding New Tests

To add new tests:

1. **Create test file**: `tests/selenium/new-feature.spec.ts`
2. **Use SeleniumUtils**: Leverage existing utilities
3. **Follow naming**: Use descriptive test names
4. **Add to scripts**: Update package.json if needed

Example:
```typescript
import { SeleniumUtils, TEST_DATA, SELECTORS } from './utils/selenium-utils';

describe('New Feature Tests', () => {
  let seleniumUtils: SeleniumUtils;
  let driver: any;

  beforeAll(async () => {
    driver = await SeleniumUtils.createDriver(false);
    seleniumUtils = new SeleniumUtils(driver);
  });

  afterAll(async () => {
    await seleniumUtils.quit();
  });

  test('should handle new feature', async () => {
    await seleniumUtils.setupEmailMock();
    
    // Your test logic here
    await seleniumUtils.gotoLogin();
    // ... more test steps
  });
});
```

## 🤝 Contributing

When contributing to Selenium tests:

1. **Follow existing patterns**: Use SeleniumUtils and consistent selectors
2. **Add comprehensive coverage**: Test happy path, error cases, and edge cases
3. **Use descriptive names**: Test names should clearly describe what they test
4. **Add comments**: Explain complex test logic
5. **Update documentation**: Keep this README updated
6. **Handle cleanup**: Always clean up resources in `afterAll`

## 📞 Support

For issues with Selenium tests:

1. Check the [Selenium WebDriver documentation](https://selenium.dev/documentation/webdriver/)
2. Review test logs and screenshots
3. Run tests in headed mode to see what's happening
4. Check browser console for JavaScript errors
5. Verify ChromeDriver version matches Chrome version

## 🔗 Related Documentation

- [Selenium WebDriver](https://selenium.dev/documentation/webdriver/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [ChromeDriver](https://chromedriver.chromium.org/)
