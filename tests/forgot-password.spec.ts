import { test, expect } from '@playwright/test';
import { TestUtils, TEST_DATA, SELECTORS } from './utils/test-utils';

test.describe('Forgot Password Flow', () => {
  let testUtils: TestUtils;

  test.beforeEach(async ({ page }) => {
    testUtils = new TestUtils(page);
    
    // Setup email mock for testing
    await testUtils.setupEmailMock();
  });

  test.describe('Navigation and UI', () => {
    test('should navigate to forgot password page from login', async ({ page }) => {
      await testUtils.gotoLogin();
      await testUtils.expectToBeOnLoginPage();

      // Click forgot password link
      await page.click(SELECTORS.FORGOT_PASSWORD_LINK);
      await testUtils.waitForAnimations();
      
      await testUtils.expectToBeOnForgotPasswordPage();
    });

    test('should display proper UI elements on forgot password page', async ({ page }) => {
      await testUtils.gotoForgotPassword();

      // Check for key UI elements
      await expect(page.locator('h2')).toContainText('Forgot your password?');
      await expect(page.locator('p')).toContainText('Enter your email address');
      await expect(page.locator(SELECTORS.FORGOT_EMAIL_INPUT)).toBeVisible();
      await expect(page.locator(SELECTORS.FORGOT_SUBMIT_BUTTON)).toBeVisible();
      await expect(page.locator(SELECTORS.BACK_TO_LOGIN_LINK)).toBeVisible();
    });

    test('should navigate back to login from forgot password page', async ({ page }) => {
      await testUtils.gotoForgotPassword();
      
      await page.click(SELECTORS.BACK_TO_LOGIN_LINK);
      await testUtils.waitForAnimations();
      
      await testUtils.expectToBeOnLoginPage();
    });
  });

  test.describe('Form Validation', () => {
    test('should show error for empty email', async ({ page }) => {
      await testUtils.gotoForgotPassword();
      
      // Submit form without email
      await testUtils.submitForgotPasswordForm();
      
      await testUtils.expectErrorMessage('Please enter a valid email address');
    });

    test('should show error for invalid email format', async ({ page }) => {
      await testUtils.gotoForgotPassword();
      
      // Fill with invalid email
      await testUtils.fillForgotPasswordForm(TEST_DATA.INVALID_EMAIL);
      await testUtils.submitForgotPasswordForm();
      
      await testUtils.expectErrorMessage('Please enter a valid email address');
    });

    test('should show error for email without @ symbol', async ({ page }) => {
      await testUtils.gotoForgotPassword();
      
      // Fill with email missing @
      await testUtils.fillForgotPasswordForm('testexample.com');
      await testUtils.submitForgotPasswordForm();
      
      await testUtils.expectErrorMessage('Please enter a valid email address');
    });
  });

  test.describe('Successful Password Reset Flow', () => {
    test('should successfully send reset email for valid email', async ({ page }) => {
      await testUtils.gotoForgotPassword();
      
      // Fill with valid email
      await testUtils.fillForgotPasswordForm(TEST_DATA.VALID_EMAIL);
      await testUtils.submitForgotPasswordForm();
      
      // Should show loading state
      await testUtils.expectLoadingState();
      
      // Wait for response
      await testUtils.expectNotLoadingState();
      
      // Should show success message
      await testUtils.expectSuccessMessage('If an account with that email exists, a password reset link has been sent');
      
      // Email field should be cleared for security
      await expect(page.locator(SELECTORS.FORGOT_EMAIL_INPUT)).toHaveValue('');
    });

    test('should handle non-existent email gracefully', async ({ page }) => {
      await testUtils.gotoForgotPassword();
      
      // Fill with non-existent email
      await testUtils.fillForgotPasswordForm('nonexistent@example.com');
      await testUtils.submitForgotPasswordForm();
      
      // Should still show success message (security feature)
      await testUtils.expectSuccessMessage('If an account with that email exists, a password reset link has been sent');
    });

    test('should complete full password reset flow', async ({ page }) => {
      // Step 1: Request password reset
      await testUtils.gotoForgotPassword();
      await testUtils.fillForgotPasswordForm(TEST_DATA.VALID_EMAIL);
      await testUtils.submitForgotPasswordForm();
      
      await testUtils.expectSuccessMessage('If an account with that email exists, a password reset link has been sent');
      
      // Step 2: Extract reset token from email
      const resetToken = await testUtils.extractResetTokenFromEmail();
      expect(resetToken).toBeTruthy();
      
      // Step 3: Navigate to reset password page
      await testUtils.gotoResetPassword(resetToken!);
      await testUtils.expectToBeOnResetPasswordPage();
      
      // Step 4: Fill and submit new password
      await testUtils.fillResetPasswordForm(TEST_DATA.VALID_PASSWORD, TEST_DATA.VALID_PASSWORD);
      await testUtils.submitResetPasswordForm();
      
      // Should show loading state
      await testUtils.expectLoadingState();
      
      // Wait for response
      await testUtils.expectNotLoadingState();
      
      // Should show success message
      await testUtils.expectSuccessMessage('Password has been reset successfully');
      
      // Should redirect to login page after 3 seconds
      await page.waitForTimeout(3500);
      await testUtils.expectToBeOnLoginPage();
    });

    test('should allow login with new password after reset', async ({ page }) => {
      // First, reset the password
      await testUtils.gotoForgotPassword();
      await testUtils.fillForgotPasswordForm(TEST_DATA.VALID_EMAIL);
      await testUtils.submitForgotPasswordForm();
      
      const resetToken = await testUtils.extractResetTokenFromEmail();
      expect(resetToken).toBeTruthy();
      
      await testUtils.gotoResetPassword(resetToken!);
      await testUtils.fillResetPasswordForm(TEST_DATA.VALID_PASSWORD, TEST_DATA.VALID_PASSWORD);
      await testUtils.submitResetPasswordForm();
      
      // Wait for redirect to login
      await page.waitForTimeout(3500);
      await testUtils.expectToBeOnLoginPage();
      
      // Now try to login with new password
      await testUtils.fillLoginForm(TEST_DATA.VALID_EMAIL, TEST_DATA.VALID_PASSWORD);
      await testUtils.submitLoginForm();
      
      // Should successfully login and redirect to dashboard
      await testUtils.expectToBeOnDashboard();
    });
  });

  test.describe('Reset Password Page Validation', () => {
    test('should show error for weak password', async ({ page }) => {
      // Get a valid token first
      await testUtils.gotoForgotPassword();
      await testUtils.fillForgotPasswordForm(TEST_DATA.VALID_EMAIL);
      await testUtils.submitForgotPasswordForm();
      
      const resetToken = await testUtils.extractResetTokenFromEmail();
      expect(resetToken).toBeTruthy();
      
      await testUtils.gotoResetPassword(resetToken!);
      
      // Try with weak password
      await testUtils.fillResetPasswordForm(TEST_DATA.WEAK_PASSWORD, TEST_DATA.WEAK_PASSWORD);
      await testUtils.submitResetPasswordForm();
      
      await testUtils.expectErrorMessage('Password must be at least 6 characters long');
    });

    test('should show error for mismatched passwords', async ({ page }) => {
      // Get a valid token first
      await testUtils.gotoForgotPassword();
      await testUtils.fillForgotPasswordForm(TEST_DATA.VALID_EMAIL);
      await testUtils.submitForgotPasswordForm();
      
      const resetToken = await testUtils.extractResetTokenFromEmail();
      expect(resetToken).toBeTruthy();
      
      await testUtils.gotoResetPassword(resetToken!);
      
      // Try with mismatched passwords
      await testUtils.fillResetPasswordForm(TEST_DATA.VALID_PASSWORD, TEST_DATA.MISMATCH_PASSWORD);
      await testUtils.submitResetPasswordForm();
      
      await testUtils.expectErrorMessage('Passwords do not match');
    });

    test('should show error for empty password fields', async ({ page }) => {
      // Get a valid token first
      await testUtils.gotoForgotPassword();
      await testUtils.fillForgotPasswordForm(TEST_DATA.VALID_EMAIL);
      await testUtils.submitForgotPasswordForm();
      
      const resetToken = await testUtils.extractResetTokenFromEmail();
      expect(resetToken).toBeTruthy();
      
      await testUtils.gotoResetPassword(resetToken!);
      
      // Submit without filling password fields
      await testUtils.submitResetPasswordForm();
      
      await testUtils.expectErrorMessage('Password must be at least 6 characters long');
    });
  });

  test.describe('Token Validation', () => {
    test('should show error for invalid token', async ({ page }) => {
      await testUtils.gotoResetPassword('invalid-token');
      
      await expect(page.locator('h2')).toContainText('Invalid Reset Link');
      await expect(page.locator('p')).toContainText('This password reset link is invalid or has expired');
      
      // Should have option to request new reset link
      await expect(page.locator('a[href="/forgot-password"]')).toBeVisible();
    });

    test('should show error for missing token', async ({ page }) => {
      await testUtils.gotoResetPassword('');
      
      await expect(page.locator('h2')).toContainText('Invalid Reset Link');
      await expect(page.locator('p')).toContainText('Invalid reset link. Please request a new password reset');
    });

    test('should show error for expired token', async ({ page }) => {
      // This test would require manipulating the token expiry
      // For now, we'll test with a malformed token
      await testUtils.gotoResetPassword('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.expired');
      
      await expect(page.locator('h2')).toContainText('Invalid Reset Link');
    });
  });

  test.describe('Accessibility and UX', () => {
    test('should have proper form labels and accessibility', async ({ page }) => {
      await testUtils.gotoForgotPassword();
      
      // Check for proper labels
      await expect(page.locator('label[for="email"]')).toContainText('Email address');
      
      // Check for proper input attributes
      const emailInput = page.locator(SELECTORS.FORGOT_EMAIL_INPUT);
      await expect(emailInput).toHaveAttribute('type', 'email');
      await expect(emailInput).toHaveAttribute('required');
      await expect(emailInput).toHaveAttribute('autocomplete', 'email');
    });

    test('should handle keyboard navigation', async ({ page }) => {
      await testUtils.gotoForgotPassword();
      
      // Tab through form elements
      await page.keyboard.press('Tab');
      await expect(page.locator(SELECTORS.FORGOT_EMAIL_INPUT)).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator(SELECTORS.FORGOT_SUBMIT_BUTTON)).toBeFocused();
      
      // Test Enter key submission
      await page.keyboard.press('Enter');
      await testUtils.expectErrorMessage('Please enter a valid email address');
    });

    test('should show loading states during form submission', async ({ page }) => {
      await testUtils.gotoForgotPassword();
      
      await testUtils.fillForgotPasswordForm(TEST_DATA.VALID_EMAIL);
      await testUtils.submitForgotPasswordForm();
      
      // Should show loading spinner
      await testUtils.expectLoadingState();
      
      // Button should be disabled during loading
      await expect(page.locator(SELECTORS.FORGOT_SUBMIT_BUTTON)).toBeDisabled();
      
      // Wait for completion
      await testUtils.expectNotLoadingState();
      await expect(page.locator(SELECTORS.FORGOT_SUBMIT_BUTTON)).toBeEnabled();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Mock network failure
      await page.route('**/api/auth/forgot-password', route => {
        route.abort('failed');
      });
      
      await testUtils.gotoForgotPassword();
      await testUtils.fillForgotPasswordForm(TEST_DATA.VALID_EMAIL);
      await testUtils.submitForgotPasswordForm();
      
      await testUtils.expectErrorMessage('An error occurred. Please try again.');
    });

    test('should handle server errors gracefully', async ({ page }) => {
      // Mock server error
      await page.route('**/api/auth/forgot-password', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Internal server error' })
        });
      });
      
      await testUtils.gotoForgotPassword();
      await testUtils.fillForgotPasswordForm(TEST_DATA.VALID_EMAIL);
      await testUtils.submitForgotPasswordForm();
      
      await testUtils.expectErrorMessage('Internal server error');
    });
  });

  test.describe('Security Features', () => {
    test('should not reveal if email exists in system', async ({ page }) => {
      await testUtils.gotoForgotPassword();
      
      // Test with existing email
      await testUtils.fillForgotPasswordForm(TEST_DATA.VALID_EMAIL);
      await testUtils.submitForgotPasswordForm();
      await testUtils.expectSuccessMessage('If an account with that email exists, a password reset link has been sent');
      
      // Test with non-existing email
      await testUtils.fillForgotPasswordForm('nonexistent@example.com');
      await testUtils.submitForgotPasswordForm();
      await testUtils.expectSuccessMessage('If an account with that email exists, a password reset link has been sent');
      
      // Both should show the same message for security
    });

    test('should clear email field after submission for security', async ({ page }) => {
      await testUtils.gotoForgotPassword();
      
      await testUtils.fillForgotPasswordForm(TEST_DATA.VALID_EMAIL);
      await testUtils.submitForgotPasswordForm();
      
      // Email field should be cleared
      await expect(page.locator(SELECTORS.FORGOT_EMAIL_INPUT)).toHaveValue('');
    });
  });
});
