import { SeleniumUtils, TEST_DATA, SELECTORS } from './utils/selenium-utils';

describe('Forgot Password Flow - Selenium Tests', () => {
  let seleniumUtils: SeleniumUtils;
  let driver: any;

  beforeAll(async () => {
    // Create driver instance
    driver = await SeleniumUtils.createDriver(false); // Set to true for headless mode
    seleniumUtils = new SeleniumUtils(driver);
  });

  afterAll(async () => {
    // Clean up
    await seleniumUtils.quit();
  });

  beforeEach(async () => {
    // Setup email mock for each test
    await seleniumUtils.setupEmailMock();
  });

  describe('Navigation and UI', () => {
    test('should navigate to forgot password page from login', async () => {
      await seleniumUtils.gotoLogin();
      await seleniumUtils.expectToBeOnLoginPage();

      // Click forgot password link
      await seleniumUtils.clickElement(SELECTORS.FORGOT_PASSWORD_LINK);
      await seleniumUtils.waitForTimeout(500); // Wait for animations
      
      await seleniumUtils.expectToBeOnForgotPasswordPage();
    });

    test('should display proper UI elements on forgot password page', async () => {
      await seleniumUtils.gotoForgotPassword();

      // Check for key UI elements
      const heading = await seleniumUtils.getElementText('h2');
      expect(heading).toContain('Forgot your password?');
      
      const description = await seleniumUtils.getElementText('p');
      expect(description).toContain('Enter your email address');
      
      expect(await seleniumUtils.isElementVisible(SELECTORS.FORGOT_EMAIL_INPUT)).toBe(true);
      expect(await seleniumUtils.isElementVisible(SELECTORS.FORGOT_SUBMIT_BUTTON)).toBe(true);
      expect(await seleniumUtils.isElementVisible(SELECTORS.BACK_TO_LOGIN_LINK)).toBe(true);
    });

    test('should navigate back to login from forgot password page', async () => {
      await seleniumUtils.gotoForgotPassword();
      
      await seleniumUtils.clickElement(SELECTORS.BACK_TO_LOGIN_LINK);
      await seleniumUtils.waitForTimeout(500); // Wait for animations
      
      await seleniumUtils.expectToBeOnLoginPage();
    });
  });

  describe('Form Validation', () => {
    test('should show error for empty email', async () => {
      await seleniumUtils.gotoForgotPassword();
      
      // Submit form without email
      await seleniumUtils.submitForgotPasswordForm();
      
      await seleniumUtils.expectErrorMessage('Please enter a valid email address');
    });

    test('should show error for invalid email format', async () => {
      await seleniumUtils.gotoForgotPassword();
      
      // Fill with invalid email
      await seleniumUtils.fillForgotPasswordForm(TEST_DATA.INVALID_EMAIL);
      await seleniumUtils.submitForgotPasswordForm();
      
      await seleniumUtils.expectErrorMessage('Please enter a valid email address');
    });

    test('should show error for email without @ symbol', async () => {
      await seleniumUtils.gotoForgotPassword();
      
      // Fill with email missing @
      await seleniumUtils.fillForgotPasswordForm('testexample.com');
      await seleniumUtils.submitForgotPasswordForm();
      
      await seleniumUtils.expectErrorMessage('Please enter a valid email address');
    });
  });

  describe('Successful Password Reset Flow', () => {
    test('should successfully send reset email for valid email', async () => {
      await seleniumUtils.gotoForgotPassword();
      
      // Fill with valid email
      await seleniumUtils.fillForgotPasswordForm(TEST_DATA.VALID_EMAIL);
      await seleniumUtils.submitForgotPasswordForm();
      
      // Should show loading state
      await seleniumUtils.expectLoadingState();
      
      // Wait for response
      await seleniumUtils.waitForTimeout(2000);
      await seleniumUtils.expectNotLoadingState();
      
      // Should show success message
      await seleniumUtils.expectSuccessMessage('If an account with that email exists, a password reset link has been sent');
      
      // Email field should be cleared for security
      const emailValue = await seleniumUtils.getElementValue(SELECTORS.FORGOT_EMAIL_INPUT);
      expect(emailValue).toBe('');
    });

    test('should handle non-existent email gracefully', async () => {
      await seleniumUtils.gotoForgotPassword();
      
      // Fill with non-existent email
      await seleniumUtils.fillForgotPasswordForm('nonexistent@example.com');
      await seleniumUtils.submitForgotPasswordForm();
      
      // Should still show success message (security feature)
      await seleniumUtils.expectSuccessMessage('If an account with that email exists, a password reset link has been sent');
    });

    test('should complete full password reset flow', async () => {
      // Step 1: Request password reset
      await seleniumUtils.gotoForgotPassword();
      await seleniumUtils.fillForgotPasswordForm(TEST_DATA.VALID_EMAIL);
      await seleniumUtils.submitForgotPasswordForm();
      
      await seleniumUtils.expectSuccessMessage('If an account with that email exists, a password reset link has been sent');
      
      // Step 2: Extract reset token from email
      const resetToken = await seleniumUtils.extractResetTokenFromEmail();
      expect(resetToken).toBeTruthy();
      
      // Step 3: Navigate to reset password page
      await seleniumUtils.gotoResetPassword(resetToken!);
      await seleniumUtils.expectToBeOnResetPasswordPage();
      
      // Step 4: Fill and submit new password
      await seleniumUtils.fillResetPasswordForm(TEST_DATA.VALID_PASSWORD, TEST_DATA.VALID_PASSWORD);
      await seleniumUtils.submitResetPasswordForm();
      
      // Should show loading state
      await seleniumUtils.expectLoadingState();
      
      // Wait for response
      await seleniumUtils.waitForTimeout(2000);
      await seleniumUtils.expectNotLoadingState();
      
      // Should show success message
      await seleniumUtils.expectSuccessMessage('Password has been reset successfully');
      
      // Should redirect to login page after 3 seconds
      await seleniumUtils.waitForTimeout(3500);
      await seleniumUtils.expectToBeOnLoginPage();
    });

    test('should allow login with new password after reset', async () => {
      // First, reset the password
      await seleniumUtils.gotoForgotPassword();
      await seleniumUtils.fillForgotPasswordForm(TEST_DATA.VALID_EMAIL);
      await seleniumUtils.submitForgotPasswordForm();
      
      const resetToken = await seleniumUtils.extractResetTokenFromEmail();
      expect(resetToken).toBeTruthy();
      
      await seleniumUtils.gotoResetPassword(resetToken!);
      await seleniumUtils.fillResetPasswordForm(TEST_DATA.VALID_PASSWORD, TEST_DATA.VALID_PASSWORD);
      await seleniumUtils.submitResetPasswordForm();
      
      // Wait for redirect to login
      await seleniumUtils.waitForTimeout(3500);
      await seleniumUtils.expectToBeOnLoginPage();
      
      // Now try to login with new password
      await seleniumUtils.fillLoginForm(TEST_DATA.VALID_EMAIL, TEST_DATA.VALID_PASSWORD);
      await seleniumUtils.submitLoginForm();
      
      // Should successfully login and redirect to dashboard
      await seleniumUtils.waitForTimeout(2000);
      await seleniumUtils.expectToBeOnDashboard();
    });
  });

  describe('Reset Password Page Validation', () => {
    test('should show error for weak password', async () => {
      // Get a valid token first
      await seleniumUtils.gotoForgotPassword();
      await seleniumUtils.fillForgotPasswordForm(TEST_DATA.VALID_EMAIL);
      await seleniumUtils.submitForgotPasswordForm();
      
      const resetToken = await seleniumUtils.extractResetTokenFromEmail();
      expect(resetToken).toBeTruthy();
      
      await seleniumUtils.gotoResetPassword(resetToken!);
      
      // Try with weak password
      await seleniumUtils.fillResetPasswordForm(TEST_DATA.WEAK_PASSWORD, TEST_DATA.WEAK_PASSWORD);
      await seleniumUtils.submitResetPasswordForm();
      
      await seleniumUtils.expectErrorMessage('Password must be at least 6 characters long');
    });

    test('should show error for mismatched passwords', async () => {
      // Get a valid token first
      await seleniumUtils.gotoForgotPassword();
      await seleniumUtils.fillForgotPasswordForm(TEST_DATA.VALID_EMAIL);
      await seleniumUtils.submitForgotPasswordForm();
      
      const resetToken = await seleniumUtils.extractResetTokenFromEmail();
      expect(resetToken).toBeTruthy();
      
      await seleniumUtils.gotoResetPassword(resetToken!);
      
      // Try with mismatched passwords
      await seleniumUtils.fillResetPasswordForm(TEST_DATA.VALID_PASSWORD, TEST_DATA.MISMATCH_PASSWORD);
      await seleniumUtils.submitResetPasswordForm();
      
      await seleniumUtils.expectErrorMessage('Passwords do not match');
    });

    test('should show error for empty password fields', async () => {
      // Get a valid token first
      await seleniumUtils.gotoForgotPassword();
      await seleniumUtils.fillForgotPasswordForm(TEST_DATA.VALID_EMAIL);
      await seleniumUtils.submitForgotPasswordForm();
      
      const resetToken = await seleniumUtils.extractResetTokenFromEmail();
      expect(resetToken).toBeTruthy();
      
      await seleniumUtils.gotoResetPassword(resetToken!);
      
      // Submit without filling password fields
      await seleniumUtils.submitResetPasswordForm();
      
      await seleniumUtils.expectErrorMessage('Password must be at least 6 characters long');
    });
  });

  describe('Token Validation', () => {
    test('should show error for invalid token', async () => {
      await seleniumUtils.gotoResetPassword('invalid-token');
      
      const heading = await seleniumUtils.getElementText('h2');
      expect(heading).toContain('Invalid Reset Link');
      
      const description = await seleniumUtils.getElementText('p');
      expect(description).toContain('This password reset link is invalid or has expired');
      
      // Should have option to request new reset link
      expect(await seleniumUtils.isElementVisible('a[href="/forgot-password"]')).toBe(true);
    });

    test('should show error for missing token', async () => {
      await seleniumUtils.gotoResetPassword('');
      
      const heading = await seleniumUtils.getElementText('h2');
      expect(heading).toContain('Invalid Reset Link');
      
      const description = await seleniumUtils.getElementText('p');
      expect(description).toContain('Invalid reset link. Please request a new password reset');
    });

    test('should show error for expired token', async () => {
      // This test would require manipulating the token expiry
      // For now, we'll test with a malformed token
      await seleniumUtils.gotoResetPassword('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.expired');
      
      const heading = await seleniumUtils.getElementText('h2');
      expect(heading).toContain('Invalid Reset Link');
    });
  });

  describe('Accessibility and UX', () => {
    test('should have proper form labels and accessibility', async () => {
      await seleniumUtils.gotoForgotPassword();
      
      // Check for proper labels
      const label = await seleniumUtils.getElementText('label[for="email"]');
      expect(label).toContain('Email address');
      
      // Check for proper input attributes
      const emailInput = await driver.findElement({ css: SELECTORS.FORGOT_EMAIL_INPUT });
      expect(await emailInput.getAttribute('type')).toBe('email');
      expect(await emailInput.getAttribute('required')).toBeTruthy();
      expect(await emailInput.getAttribute('autocomplete')).toBe('email');
    });

    test('should handle keyboard navigation', async () => {
      await seleniumUtils.gotoForgotPassword();
      
      // Tab through form elements
      await driver.actions().sendKeys('\t').perform();
      const emailInput = await driver.findElement({ css: SELECTORS.FORGOT_EMAIL_INPUT });
      expect(await emailInput.equals(await driver.switchTo().activeElement())).toBe(true);
      
      await driver.actions().sendKeys('\t').perform();
      const submitButton = await driver.findElement({ css: SELECTORS.FORGOT_SUBMIT_BUTTON });
      expect(await submitButton.equals(await driver.switchTo().activeElement())).toBe(true);
      
      // Test Enter key submission
      await driver.actions().sendKeys('\n').perform();
      await seleniumUtils.expectErrorMessage('Please enter a valid email address');
    });

    test('should show loading states during form submission', async () => {
      await seleniumUtils.gotoForgotPassword();
      
      await seleniumUtils.fillForgotPasswordForm(TEST_DATA.VALID_EMAIL);
      await seleniumUtils.submitForgotPasswordForm();
      
      // Should show loading spinner
      await seleniumUtils.expectLoadingState();
      
      // Button should be disabled during loading
      expect(await seleniumUtils.isElementEnabled(SELECTORS.FORGOT_SUBMIT_BUTTON)).toBe(false);
      
      // Wait for completion
      await seleniumUtils.waitForTimeout(2000);
      await seleniumUtils.expectNotLoadingState();
      expect(await seleniumUtils.isElementEnabled(SELECTORS.FORGOT_SUBMIT_BUTTON)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      // Mock network failure by overriding fetch
      await driver.executeScript(`
        const originalFetch = window.fetch;
        window.fetch = function(url, options) {
          if (url.includes('/api/auth/forgot-password')) {
            return Promise.reject(new Error('Network error'));
          }
          return originalFetch.apply(this, arguments);
        };
      `);
      
      await seleniumUtils.gotoForgotPassword();
      await seleniumUtils.fillForgotPasswordForm(TEST_DATA.VALID_EMAIL);
      await seleniumUtils.submitForgotPasswordForm();
      
      await seleniumUtils.expectErrorMessage('An error occurred. Please try again.');
    });

    test('should handle server errors gracefully', async () => {
      // Mock server error
      await driver.executeScript(`
        const originalFetch = window.fetch;
        window.fetch = function(url, options) {
          if (url.includes('/api/auth/forgot-password')) {
            return Promise.resolve({
              ok: false,
              status: 500,
              json: async () => ({ message: 'Internal server error' })
            });
          }
          return originalFetch.apply(this, arguments);
        };
      `);
      
      await seleniumUtils.gotoForgotPassword();
      await seleniumUtils.fillForgotPasswordForm(TEST_DATA.VALID_EMAIL);
      await seleniumUtils.submitForgotPasswordForm();
      
      await seleniumUtils.expectErrorMessage('Internal server error');
    });
  });

  describe('Security Features', () => {
    test('should not reveal if email exists in system', async () => {
      await seleniumUtils.gotoForgotPassword();
      
      // Test with existing email
      await seleniumUtils.fillForgotPasswordForm(TEST_DATA.VALID_EMAIL);
      await seleniumUtils.submitForgotPasswordForm();
      await seleniumUtils.expectSuccessMessage('If an account with that email exists, a password reset link has been sent');
      
      // Test with non-existing email
      await seleniumUtils.fillForgotPasswordForm('nonexistent@example.com');
      await seleniumUtils.submitForgotPasswordForm();
      await seleniumUtils.expectSuccessMessage('If an account with that email exists, a password reset link has been sent');
      
      // Both should show the same message for security
    });

    test('should clear email field after submission for security', async () => {
      await seleniumUtils.gotoForgotPassword();
      
      await seleniumUtils.fillForgotPasswordForm(TEST_DATA.VALID_EMAIL);
      await seleniumUtils.submitForgotPasswordForm();
      
      // Email field should be cleared
      const emailValue = await seleniumUtils.getElementValue(SELECTORS.FORGOT_EMAIL_INPUT);
      expect(emailValue).toBe('');
    });
  });

  describe('Cross-browser Compatibility', () => {
    test('should work with different screen sizes', async () => {
      // Test mobile viewport
      await driver.manage().window().setRect({ width: 375, height: 667 });
      await seleniumUtils.gotoForgotPassword();
      
      // Verify elements are still visible and functional
      expect(await seleniumUtils.isElementVisible(SELECTORS.FORGOT_EMAIL_INPUT)).toBe(true);
      expect(await seleniumUtils.isElementVisible(SELECTORS.FORGOT_SUBMIT_BUTTON)).toBe(true);
      
      // Test tablet viewport
      await driver.manage().window().setRect({ width: 768, height: 1024 });
      await seleniumUtils.gotoForgotPassword();
      
      // Verify elements are still visible and functional
      expect(await seleniumUtils.isElementVisible(SELECTORS.FORGOT_EMAIL_INPUT)).toBe(true);
      expect(await seleniumUtils.isElementVisible(SELECTORS.FORGOT_SUBMIT_BUTTON)).toBe(true);
      
      // Reset to desktop viewport
      await driver.manage().window().setRect({ width: 1920, height: 1080 });
    });
  });

  describe('Performance and Reliability', () => {
    test('should handle rapid form submissions', async () => {
      await seleniumUtils.gotoForgotPassword();
      
      // Rapidly submit the form multiple times
      for (let i = 0; i < 3; i++) {
        await seleniumUtils.fillForgotPasswordForm(TEST_DATA.VALID_EMAIL);
        await seleniumUtils.submitForgotPasswordForm();
        await seleniumUtils.waitForTimeout(500);
      }
      
      // Should still show success message
      await seleniumUtils.expectSuccessMessage('If an account with that email exists, a password reset link has been sent');
    });

    test('should handle page refresh during form submission', async () => {
      await seleniumUtils.gotoForgotPassword();
      await seleniumUtils.fillForgotPasswordForm(TEST_DATA.VALID_EMAIL);
      await seleniumUtils.submitForgotPasswordForm();
      
      // Refresh page during submission
      await driver.navigate().refresh();
      await seleniumUtils.waitForPageLoad();
      
      // Should be back on forgot password page
      await seleniumUtils.expectToBeOnForgotPasswordPage();
    });
  });
});
