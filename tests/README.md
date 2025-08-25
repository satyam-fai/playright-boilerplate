# Playwright Test Suite for TodoApp

This directory contains comprehensive end-to-end tests for the TodoApp, specifically focusing on the **Forgot Password** flow.

## 🧪 Test Overview

The test suite covers the complete forgot password functionality with the following test categories:

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

## 🚀 Running the Tests

### Prerequisites

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Install Playwright Browsers**
   ```bash
   npx playwright install
   ```

### Test Commands

```bash
# Run all tests
npm test

# Run only forgot password tests
npm run test:forgot-password

# Run tests with UI (interactive mode)
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests in debug mode
npm run test:debug

# View test report
npm run test:report
```

### Test Configuration

The tests are configured to:
- Run on `http://localhost:3003`
- Use Chromium browser by default
- Capture screenshots and videos on failure
- Generate HTML, JSON, and JUnit reports

## 📁 File Structure

```
tests/
├── README.md                    # This file
├── forgot-password.spec.ts      # Main test file
├── utils/
│   ├── test-utils.ts           # Test utilities and helpers
│   └── email-mock.ts           # Email mocking functionality
└── playwright.config.ts        # Test-specific configuration
```

## 🔧 Test Utilities

### TestUtils Class

The `TestUtils` class provides reusable methods for:

- **Navigation**: `gotoLogin()`, `gotoForgotPassword()`, `gotoResetPassword()`
- **Form Interactions**: `fillLoginForm()`, `fillForgotPasswordForm()`, `submitResetPasswordForm()`
- **Assertions**: `expectToBeOnLoginPage()`, `expectSuccessMessage()`, `expectErrorMessage()`
- **Email Mocking**: `setupEmailMock()`, `extractResetTokenFromEmail()`

### EmailMock Class

The `EmailMock` class provides sophisticated email mocking:

- Captures emails instead of sending them
- Extracts reset tokens from mock emails
- Simulates email failures and timeouts
- Stores email history for testing

## 🎯 Test Data

### Test Users

The tests use the following test data:

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
}
```

## 🧪 Test Flow Example

Here's an example of a complete test flow:

```typescript
test('should complete full password reset flow', async ({ page }) => {
  // Step 1: Request password reset
  await testUtils.gotoForgotPassword();
  await testUtils.fillForgotPasswordForm(TEST_DATA.VALID_EMAIL);
  await testUtils.submitForgotPasswordForm();
  
  // Step 2: Extract reset token from email
  const resetToken = await testUtils.extractResetTokenFromEmail();
  expect(resetToken).toBeTruthy();
  
  // Step 3: Navigate to reset password page
  await testUtils.gotoResetPassword(resetToken!);
  
  // Step 4: Fill and submit new password
  await testUtils.fillResetPasswordForm(TEST_DATA.VALID_PASSWORD, TEST_DATA.VALID_PASSWORD);
  await testUtils.submitResetPasswordForm();
  
  // Step 5: Verify success and redirect
  await testUtils.expectSuccessMessage('Password has been reset successfully');
  await page.waitForTimeout(3500);
  await testUtils.expectToBeOnLoginPage();
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

1. **Port Conflicts**: Ensure port 3003 is available
2. **Browser Issues**: Run `npx playwright install` to install browsers
3. **Test Timeouts**: Increase timeout in `playwright.config.ts`

### Debug Commands

```bash
# Run specific test with debug
npm run test:debug -- --grep "should complete full password reset flow"

# Run with headed browser
npm run test:headed -- --grep "should complete full password reset flow"

# Run with UI for step-by-step debugging
npm run test:ui
```

## 📊 Test Reports

After running tests, view reports:

```bash
# View HTML report
npm run test:report

# Reports are saved in:
# - test-results/html/ (HTML report)
# - test-results/results.json (JSON report)
# - test-results/results.xml (JUnit report)
```

## 🚀 CI/CD Integration

The tests are configured for CI/CD with:

- **Retries**: 2 retries on CI for flaky tests
- **Parallel Execution**: Tests run in parallel when possible
- **Artifact Collection**: Screenshots and videos on failure
- **Multiple Browsers**: Chrome, Firefox, Safari, and mobile browsers

## 📝 Adding New Tests

To add new tests:

1. **Create test file**: `tests/new-feature.spec.ts`
2. **Use TestUtils**: Leverage existing utilities
3. **Follow naming**: Use descriptive test names
4. **Add to scripts**: Update package.json if needed

Example:
```typescript
test('should handle new feature', async ({ page }) => {
  const testUtils = new TestUtils(page);
  await testUtils.setupEmailMock();
  
  // Your test logic here
  await testUtils.gotoLogin();
  // ... more test steps
});
```

## 🤝 Contributing

When contributing to tests:

1. **Follow existing patterns**: Use TestUtils and consistent selectors
2. **Add comprehensive coverage**: Test happy path, error cases, and edge cases
3. **Use descriptive names**: Test names should clearly describe what they test
4. **Add comments**: Explain complex test logic
5. **Update documentation**: Keep this README updated

## 📞 Support

For issues with tests:

1. Check the [Playwright documentation](https://playwright.dev/)
2. Review test logs and screenshots in `test-results/`
3. Run tests in debug mode to step through issues
4. Check browser console for JavaScript errors
