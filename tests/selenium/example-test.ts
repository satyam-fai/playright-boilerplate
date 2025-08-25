import { SeleniumUtils, TEST_DATA, SELECTORS } from './utils/selenium-utils';

/**
 * Example Selenium Test
 * 
 * This is a simple example showing how to use the SeleniumUtils class
 * to test the forgot password functionality.
 */

describe('Example Forgot Password Test', () => {
  let seleniumUtils: SeleniumUtils;
  let driver: any;

  beforeAll(async () => {
    console.log('🚀 Starting Example Selenium Test');
    
    // Create driver instance (set to true for headless mode)
    driver = await SeleniumUtils.createDriver(false);
    seleniumUtils = new SeleniumUtils(driver);
    
    console.log('✅ Browser initialized successfully');
  });

  afterAll(async () => {
    console.log('🧹 Cleaning up...');
    await seleniumUtils.quit();
    console.log('✅ Cleanup completed');
  });

  beforeEach(async () => {
    // Setup email mock for each test
    await seleniumUtils.setupEmailMock();
  });

  test('should demonstrate basic forgot password flow', async () => {
    console.log('📝 Running basic forgot password flow test');
    
    // Step 1: Navigate to forgot password page
    console.log('  → Navigating to forgot password page');
    await seleniumUtils.gotoForgotPassword();
    await seleniumUtils.expectToBeOnForgotPasswordPage();
    
    // Step 2: Fill and submit the form
    console.log('  → Filling email form');
    await seleniumUtils.fillForgotPasswordForm(TEST_DATA.VALID_EMAIL);
    await seleniumUtils.submitForgotPasswordForm();
    
    // Step 3: Verify success message
    console.log('  → Verifying success message');
    await seleniumUtils.waitForTimeout(2000);
    await seleniumUtils.expectSuccessMessage('If an account with that email exists, a password reset link has been sent');
    
    // Step 4: Extract reset token from email
    console.log('  → Extracting reset token from email');
    const resetToken = await seleniumUtils.extractResetTokenFromEmail();
    if (!resetToken) {
      throw new Error('Failed to extract reset token from email');
    }
    
    // Step 5: Navigate to reset password page
    console.log('  → Navigating to reset password page');
    await seleniumUtils.gotoResetPassword(resetToken);
    await seleniumUtils.expectToBeOnResetPasswordPage();
    
    // Step 6: Fill and submit new password
    console.log('  → Setting new password');
    await seleniumUtils.fillResetPasswordForm(TEST_DATA.VALID_PASSWORD, TEST_DATA.VALID_PASSWORD);
    await seleniumUtils.submitResetPasswordForm();
    
    // Step 7: Verify success and redirect
    console.log('  → Verifying password reset success');
    await seleniumUtils.waitForTimeout(2000);
    await seleniumUtils.expectSuccessMessage('Password has been reset successfully');
    
    // Step 8: Wait for redirect to login
    console.log('  → Waiting for redirect to login page');
    await seleniumUtils.waitForTimeout(3500);
    await seleniumUtils.expectToBeOnLoginPage();
    
    console.log('✅ Basic forgot password flow test completed successfully');
  });

  test('should demonstrate form validation', async () => {
    console.log('📝 Running form validation test');
    
    // Navigate to forgot password page
    await seleniumUtils.gotoForgotPassword();
    
    // Test empty email validation
    console.log('  → Testing empty email validation');
    await seleniumUtils.submitForgotPasswordForm();
    await seleniumUtils.expectErrorMessage('Please enter a valid email address');
    
    // Test invalid email format
    console.log('  → Testing invalid email format');
    await seleniumUtils.fillForgotPasswordForm(TEST_DATA.INVALID_EMAIL);
    await seleniumUtils.submitForgotPasswordForm();
    await seleniumUtils.expectErrorMessage('Please enter a valid email address');
    
    console.log('✅ Form validation test completed successfully');
  });

  test('should demonstrate error handling', async () => {
    console.log('📝 Running error handling test');
    
    // Mock network failure
    await driver.executeScript(`
      const originalFetch = window.fetch;
      window.fetch = function(url, options) {
        if (url.includes('/api/auth/forgot-password')) {
          return Promise.reject(new Error('Network error'));
        }
        return originalFetch.apply(this, arguments);
      };
    `);
    
    // Navigate and submit form
    await seleniumUtils.gotoForgotPassword();
    await seleniumUtils.fillForgotPasswordForm(TEST_DATA.VALID_EMAIL);
    await seleniumUtils.submitForgotPasswordForm();
    
    // Verify error message
    await seleniumUtils.expectErrorMessage('An error occurred. Please try again.');
    
    console.log('✅ Error handling test completed successfully');
  });
});

/**
 * How to run this example:
 * 
 * 1. Start the application:
 *    npm run dev
 * 
 * 2. Run the example test:
 *    cd tests/selenium && npx jest example-test.ts
 * 
 * 3. Or run with headed browser:
 *    cd tests/selenium && npx jest example-test.ts --verbose
 * 
 * 4. Or run the custom test runner:
 *    npm run test:selenium:runner
 */
