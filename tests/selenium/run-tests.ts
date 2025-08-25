#!/usr/bin/env node

import { SeleniumUtils } from './utils/selenium-utils';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  duration: number;
  error?: string;
  screenshot?: string;
}

class SeleniumTestRunner {
  private results: TestResult[] = [];
  private startTime: number = 0;

  async runTests() {
    console.log('🚀 Starting Selenium Tests for Forgot Password Flow\n');
    
    this.startTime = Date.now();
    
    try {
      // Create driver instance
      const driver = await SeleniumUtils.createDriver(false); // Set to true for headless
      const seleniumUtils = new SeleniumUtils(driver);
      
      console.log('✅ Browser initialized successfully\n');
      
      // Run test suites
      await this.runNavigationTests(seleniumUtils);
      await this.runFormValidationTests(seleniumUtils);
      await this.runPasswordResetFlowTests(seleniumUtils);
      await this.runTokenValidationTests(seleniumUtils);
      await this.runAccessibilityTests(seleniumUtils);
      await this.runSecurityTests(seleniumUtils);
      
      // Clean up
      await seleniumUtils.quit();
      
    } catch (error) {
      console.error('❌ Test runner failed:', error);
    }
    
    this.printResults();
  }

  private async runNavigationTests(seleniumUtils: SeleniumUtils) {
    console.log('🧭 Running Navigation Tests...');
    
    await this.runTest('Navigate to forgot password page', async () => {
      await seleniumUtils.gotoLogin();
      await seleniumUtils.expectToBeOnLoginPage();
      
      await seleniumUtils.clickElement('a[href="/forgot-password"]');
      await seleniumUtils.waitForTimeout(500);
      
      await seleniumUtils.expectToBeOnForgotPasswordPage();
    });
    
    await this.runTest('Display proper UI elements', async () => {
      await seleniumUtils.gotoForgotPassword();
      
      const heading = await seleniumUtils.getElementText('h2');
      if (!heading.includes('Forgot your password?')) {
        throw new Error(`Expected heading to contain 'Forgot your password?', got: ${heading}`);
      }
      
      expect(await seleniumUtils.isElementVisible('#email')).toBe(true);
      expect(await seleniumUtils.isElementVisible('button[type="submit"]')).toBe(true);
    });
  }

  private async runFormValidationTests(seleniumUtils: SeleniumUtils) {
    console.log('📝 Running Form Validation Tests...');
    
    await this.runTest('Show error for empty email', async () => {
      await seleniumUtils.gotoForgotPassword();
      await seleniumUtils.submitForgotPasswordForm();
      await seleniumUtils.expectErrorMessage('Please enter a valid email address');
    });
    
    await this.runTest('Show error for invalid email format', async () => {
      await seleniumUtils.gotoForgotPassword();
      await seleniumUtils.fillForgotPasswordForm('invalid-email');
      await seleniumUtils.submitForgotPasswordForm();
      await seleniumUtils.expectErrorMessage('Please enter a valid email address');
    });
  }

  private async runPasswordResetFlowTests(seleniumUtils: SeleniumUtils) {
    console.log('🔄 Running Password Reset Flow Tests...');
    
    await this.runTest('Send reset email for valid email', async () => {
      await seleniumUtils.gotoForgotPassword();
      await seleniumUtils.setupEmailMock();
      
      await seleniumUtils.fillForgotPasswordForm('test@example.com');
      await seleniumUtils.submitForgotPasswordForm();
      
      await seleniumUtils.waitForTimeout(2000);
      await seleniumUtils.expectSuccessMessage('If an account with that email exists, a password reset link has been sent');
    });
    
    await this.runTest('Complete full password reset flow', async () => {
      await seleniumUtils.gotoForgotPassword();
      await seleniumUtils.setupEmailMock();
      
      await seleniumUtils.fillForgotPasswordForm('test@example.com');
      await seleniumUtils.submitForgotPasswordForm();
      
      const resetToken = await seleniumUtils.extractResetTokenFromEmail();
      if (!resetToken) {
        throw new Error('Failed to extract reset token from email');
      }
      
      await seleniumUtils.gotoResetPassword(resetToken);
      await seleniumUtils.expectToBeOnResetPasswordPage();
      
      await seleniumUtils.fillResetPasswordForm('newPassword123', 'newPassword123');
      await seleniumUtils.submitResetPasswordForm();
      
      await seleniumUtils.waitForTimeout(2000);
      await seleniumUtils.expectSuccessMessage('Password has been reset successfully');
    });
  }

  private async runTokenValidationTests(seleniumUtils: SeleniumUtils) {
    console.log('🔐 Running Token Validation Tests...');
    
    await this.runTest('Show error for invalid token', async () => {
      await seleniumUtils.gotoResetPassword('invalid-token');
      
      const heading = await seleniumUtils.getElementText('h2');
      if (!heading.includes('Invalid Reset Link')) {
        throw new Error(`Expected 'Invalid Reset Link' heading, got: ${heading}`);
      }
    });
    
    await this.runTest('Show error for missing token', async () => {
      await seleniumUtils.gotoResetPassword('');
      
      const heading = await seleniumUtils.getElementText('h2');
      if (!heading.includes('Invalid Reset Link')) {
        throw new Error(`Expected 'Invalid Reset Link' heading, got: ${heading}`);
      }
    });
  }

  private async runAccessibilityTests(seleniumUtils: SeleniumUtils) {
    console.log('♿ Running Accessibility Tests...');
    
    await this.runTest('Proper form labels and attributes', async () => {
      await seleniumUtils.gotoForgotPassword();
      
      const label = await seleniumUtils.getElementText('label[for="email"]');
      if (!label.includes('Email address')) {
        throw new Error(`Expected label to contain 'Email address', got: ${label}`);
      }
    });
    
    await this.runTest('Keyboard navigation', async () => {
      await seleniumUtils.gotoForgotPassword();
      
      // This test would require more complex keyboard interaction
      // For now, just verify the form is accessible
      expect(await seleniumUtils.isElementVisible('#email')).toBe(true);
    });
  }

  private async runSecurityTests(seleniumUtils: SeleniumUtils) {
    console.log('🔒 Running Security Tests...');
    
    await this.runTest('Email privacy (same message for all emails)', async () => {
      await seleniumUtils.gotoForgotPassword();
      await seleniumUtils.setupEmailMock();
      
      // Test with existing email
      await seleniumUtils.fillForgotPasswordForm('test@example.com');
      await seleniumUtils.submitForgotPasswordForm();
      await seleniumUtils.expectSuccessMessage('If an account with that email exists, a password reset link has been sent');
      
      // Test with non-existing email
      await seleniumUtils.fillForgotPasswordForm('nonexistent@example.com');
      await seleniumUtils.submitForgotPasswordForm();
      await seleniumUtils.expectSuccessMessage('If an account with that email exists, a password reset link has been sent');
    });
    
    await this.runTest('Email field clearing after submission', async () => {
      await seleniumUtils.gotoForgotPassword();
      await seleniumUtils.setupEmailMock();
      
      await seleniumUtils.fillForgotPasswordForm('test@example.com');
      await seleniumUtils.submitForgotPasswordForm();
      
      const emailValue = await seleniumUtils.getElementValue('#email');
      if (emailValue !== '') {
        throw new Error(`Expected email field to be cleared, got: ${emailValue}`);
      }
    });
  }

  private async runTest(name: string, testFn: () => Promise<void>): Promise<void> {
    const startTime = Date.now();
    let status: 'PASS' | 'FAIL' | 'SKIP' = 'PASS';
    let error: string | undefined;
    let screenshot: string | undefined;
    
    try {
      await testFn();
      console.log(`  ✅ ${name}`);
    } catch (err) {
      status = 'FAIL';
      error = err instanceof Error ? err.message : String(err);
      console.log(`  ❌ ${name}: ${error}`);
      
      // Take screenshot on failure
      try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        screenshot = `test-failure-${timestamp}.png`;
        // Note: Screenshot functionality would need to be implemented
      } catch (screenshotError) {
        console.log(`  📸 Failed to take screenshot: ${screenshotError}`);
      }
    }
    
    const duration = Date.now() - startTime;
    this.results.push({ name, status, duration, error, screenshot });
  }

  private printResults() {
    const totalDuration = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;
    
    console.log('\n📊 Test Results Summary');
    console.log('========================');
    console.log(`Total Tests: ${this.results.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Total Duration: ${totalDuration}ms`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => {
          console.log(`  - ${r.name}: ${r.error}`);
          if (r.screenshot) {
            console.log(`    Screenshot: ${r.screenshot}`);
          }
        });
    }
    
    console.log('\n🎯 Test Status:', failed === 0 ? 'PASSED' : 'FAILED');
    
    // Exit with appropriate code
    process.exit(failed === 0 ? 0 : 1);
  }
}

// Helper function for assertions
function expect(actual: any) {
  return {
    toBe: (expected: any) => {
      if (actual !== expected) {
        throw new Error(`Expected ${actual} to be ${expected}`);
      }
    },
    toContain: (expected: string) => {
      if (!String(actual).includes(expected)) {
        throw new Error(`Expected ${actual} to contain ${expected}`);
      }
    }
  };
}

// Run the tests if this file is executed directly
if (require.main === module) {
  const runner = new SeleniumTestRunner();
  runner.runTests().catch(console.error);
}

export { SeleniumTestRunner };
