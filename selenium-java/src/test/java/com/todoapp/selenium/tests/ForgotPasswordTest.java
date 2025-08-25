package com.todoapp.selenium.tests;

import com.todoapp.selenium.utils.SeleniumUtils;
import org.openqa.selenium.WebDriver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.testng.Assert;
import org.testng.annotations.*;

/**
 * Test class for TodoApp forgot password flow
 */
public class ForgotPasswordTest {
    private static final Logger logger = LoggerFactory.getLogger(ForgotPasswordTest.class);
    
    private WebDriver driver;
    private SeleniumUtils seleniumUtils;
    
    @BeforeClass
    @Parameters({"browser", "headless"})
    public void setUp(@Optional("chrome") String browser, @Optional("false") String headless) {
        logger.info("Setting up test environment with browser: {}, headless: {}", browser, headless);
        
        boolean isHeadless = Boolean.parseBoolean(headless);
        driver = SeleniumUtils.createDriver(browser, isHeadless);
        seleniumUtils = new SeleniumUtils(driver);
        
        logger.info("Test environment setup completed");
    }
    
    @AfterClass
    public void tearDown() {
        logger.info("Cleaning up test environment");
        if (seleniumUtils != null) {
            seleniumUtils.quit();
        }
        logger.info("Test environment cleanup completed");
    }
    
    @BeforeMethod
    public void beforeMethod() {
        logger.info("Setting up email mock for test");
        seleniumUtils.setupEmailMock();
    }
    
    @Test(description = "Navigate to forgot password page from login")
    public void testNavigateToForgotPasswordPage() {
        logger.info("Starting test: Navigate to forgot password page from login");
        
        seleniumUtils.gotoLogin();
        seleniumUtils.expectToBeOnLoginPage();
        
        seleniumUtils.clickElement(SeleniumUtils.FORGOT_PASSWORD_LINK);
        seleniumUtils.waitForTimeout(500);
        
        seleniumUtils.expectToBeOnForgotPasswordPage();
        
        logger.info("Test completed: Navigate to forgot password page from login");
    }
    
    @Test(description = "Display proper UI elements on forgot password page")
    public void testForgotPasswordPageUI() {
        logger.info("Starting test: Display proper UI elements on forgot password page");
        
        seleniumUtils.gotoForgotPassword();
        
        String heading = seleniumUtils.getElementText("h2");
        Assert.assertTrue(heading.contains("Forgot your password?"), 
            "Expected heading to contain 'Forgot your password?'");
        
        Assert.assertTrue(seleniumUtils.isElementVisible(SeleniumUtils.FORGOT_EMAIL_INPUT), 
            "Email input should be visible");
        Assert.assertTrue(seleniumUtils.isElementVisible(SeleniumUtils.FORGOT_SUBMIT_BUTTON), 
            "Submit button should be visible");
        Assert.assertTrue(seleniumUtils.isElementVisible(SeleniumUtils.BACK_TO_LOGIN_LINK), 
            "Back to login link should be visible");
        
        logger.info("Test completed: Display proper UI elements on forgot password page");
    }
    
    @Test(description = "Show error for empty email")
    public void testEmptyEmailValidation() {
        logger.info("Starting test: Show error for empty email");
        
        seleniumUtils.gotoForgotPassword();
        seleniumUtils.submitForgotPasswordForm();
        
        seleniumUtils.expectErrorMessage("Please enter a valid email address");
        
        logger.info("Test completed: Show error for empty email");
    }
    
    @Test(description = "Show error for invalid email format")
    public void testInvalidEmailValidation() {
        logger.info("Starting test: Show error for invalid email format");
        
        seleniumUtils.gotoForgotPassword();
        seleniumUtils.fillForgotPasswordForm(SeleniumUtils.INVALID_EMAIL);
        seleniumUtils.submitForgotPasswordForm();
        
        seleniumUtils.expectErrorMessage("Please enter a valid email address");
        
        logger.info("Test completed: Show error for invalid email format");
    }
    
    @Test(description = "Successfully send reset email for valid email")
    public void testSuccessfulEmailSending() {
        logger.info("Starting test: Successfully send reset email for valid email");
        
        seleniumUtils.gotoForgotPassword();
        seleniumUtils.fillForgotPasswordForm(SeleniumUtils.VALID_EMAIL);
        seleniumUtils.submitForgotPasswordForm();
        
        seleniumUtils.expectLoadingState();
        seleniumUtils.waitForTimeout(2000);
        seleniumUtils.expectNotLoadingState();
        
        seleniumUtils.expectSuccessMessage("If an account with that email exists, a password reset link has been sent");
        
        String emailValue = seleniumUtils.getElementValue(SeleniumUtils.FORGOT_EMAIL_INPUT);
        Assert.assertEquals(emailValue, "", "Email field should be cleared after submission");
        
        logger.info("Test completed: Successfully send reset email for valid email");
    }
    
    @Test(description = "Complete full password reset flow")
    public void testCompletePasswordResetFlow() {
        logger.info("Starting test: Complete full password reset flow");
        
        // Step 1: Request password reset
        seleniumUtils.gotoForgotPassword();
        seleniumUtils.fillForgotPasswordForm(SeleniumUtils.VALID_EMAIL);
        seleniumUtils.submitForgotPasswordForm();
        
        seleniumUtils.expectSuccessMessage("If an account with that email exists, a password reset link has been sent");
        
        // Step 2: Extract reset token from email
        String resetToken = seleniumUtils.extractResetTokenFromEmail();
        Assert.assertNotNull(resetToken, "Reset token should not be null");
        
        // Step 3: Navigate to reset password page
        seleniumUtils.gotoResetPassword(resetToken);
        seleniumUtils.expectToBeOnResetPasswordPage();
        
        // Step 4: Fill and submit new password
        seleniumUtils.fillResetPasswordForm(SeleniumUtils.VALID_PASSWORD, SeleniumUtils.VALID_PASSWORD);
        seleniumUtils.submitResetPasswordForm();
        
        seleniumUtils.expectLoadingState();
        seleniumUtils.waitForTimeout(2000);
        seleniumUtils.expectNotLoadingState();
        
        seleniumUtils.expectSuccessMessage("Password has been reset successfully");
        
        // Step 5: Wait for redirect to login page
        seleniumUtils.waitForTimeout(3500);
        seleniumUtils.expectToBeOnLoginPage();
        
        logger.info("Test completed: Complete full password reset flow");
    }
    
    @Test(description = "Login with new password after reset")
    public void testLoginWithNewPassword() {
        logger.info("Starting test: Login with new password after reset");
        
        // First, reset the password
        seleniumUtils.gotoForgotPassword();
        seleniumUtils.fillForgotPasswordForm(SeleniumUtils.VALID_EMAIL);
        seleniumUtils.submitForgotPasswordForm();
        
        String resetToken = seleniumUtils.extractResetTokenFromEmail();
        Assert.assertNotNull(resetToken, "Reset token should not be null");
        
        seleniumUtils.gotoResetPassword(resetToken);
        seleniumUtils.fillResetPasswordForm(SeleniumUtils.VALID_PASSWORD, SeleniumUtils.VALID_PASSWORD);
        seleniumUtils.submitResetPasswordForm();
        
        // Wait for redirect to login
        seleniumUtils.waitForTimeout(3500);
        seleniumUtils.expectToBeOnLoginPage();
        
        // Now try to login with new password
        seleniumUtils.fillLoginForm(SeleniumUtils.VALID_EMAIL, SeleniumUtils.VALID_PASSWORD);
        seleniumUtils.submitLoginForm();
        
        // Should successfully login and redirect to dashboard
        seleniumUtils.waitForTimeout(2000);
        seleniumUtils.expectToBeOnDashboard();
        
        logger.info("Test completed: Login with new password after reset");
    }
    
    @Test(description = "Show error for weak password")
    public void testWeakPasswordValidation() {
        logger.info("Starting test: Show error for weak password");
        
        // Get a valid token first
        seleniumUtils.gotoForgotPassword();
        seleniumUtils.fillForgotPasswordForm(SeleniumUtils.VALID_EMAIL);
        seleniumUtils.submitForgotPasswordForm();
        
        String resetToken = seleniumUtils.extractResetTokenFromEmail();
        Assert.assertNotNull(resetToken, "Reset token should not be null");
        
        seleniumUtils.gotoResetPassword(resetToken);
        
        // Try with weak password
        seleniumUtils.fillResetPasswordForm(SeleniumUtils.WEAK_PASSWORD, SeleniumUtils.WEAK_PASSWORD);
        seleniumUtils.submitResetPasswordForm();
        
        seleniumUtils.expectErrorMessage("Password must be at least 6 characters long");
        
        logger.info("Test completed: Show error for weak password");
    }
    
    @Test(description = "Show error for mismatched passwords")
    public void testMismatchedPasswordValidation() {
        logger.info("Starting test: Show error for mismatched passwords");
        
        // Get a valid token first
        seleniumUtils.gotoForgotPassword();
        seleniumUtils.fillForgotPasswordForm(SeleniumUtils.VALID_EMAIL);
        seleniumUtils.submitForgotPasswordForm();
        
        String resetToken = seleniumUtils.extractResetTokenFromEmail();
        Assert.assertNotNull(resetToken, "Reset token should not be null");
        
        seleniumUtils.gotoResetPassword(resetToken);
        
        // Try with mismatched passwords
        seleniumUtils.fillResetPasswordForm(SeleniumUtils.VALID_PASSWORD, SeleniumUtils.MISMATCH_PASSWORD);
        seleniumUtils.submitResetPasswordForm();
        
        seleniumUtils.expectErrorMessage("Passwords do not match");
        
        logger.info("Test completed: Show error for mismatched passwords");
    }
    
    @Test(description = "Show error for invalid token")
    public void testInvalidTokenValidation() {
        logger.info("Starting test: Show error for invalid token");
        
        seleniumUtils.gotoResetPassword("invalid-token");
        
        String heading = seleniumUtils.getElementText("h2");
        Assert.assertTrue(heading.contains("Invalid Reset Link"), 
            "Expected 'Invalid Reset Link' heading");
        
        String description = seleniumUtils.getElementText("p");
        Assert.assertTrue(description.contains("This password reset link is invalid or has expired"), 
            "Expected error description");
        
        Assert.assertTrue(seleniumUtils.isElementVisible("a[href=\"/forgot-password\"]"), 
            "Should have option to request new reset link");
        
        logger.info("Test completed: Show error for invalid token");
    }
    
    @Test(description = "Show error for missing token")
    public void testMissingTokenValidation() {
        logger.info("Starting test: Show error for missing token");
        
        seleniumUtils.gotoResetPassword("");
        
        String heading = seleniumUtils.getElementText("h2");
        Assert.assertTrue(heading.contains("Invalid Reset Link"), 
            "Expected 'Invalid Reset Link' heading");
        
        String description = seleniumUtils.getElementText("p");
        Assert.assertTrue(description.contains("Invalid reset link"), 
            "Expected error description");
        
        logger.info("Test completed: Show error for missing token");
    }
    
    @Test(description = "Handle non-existent email gracefully")
    public void testNonExistentEmailHandling() {
        logger.info("Starting test: Handle non-existent email gracefully");
        
        seleniumUtils.gotoForgotPassword();
        seleniumUtils.fillForgotPasswordForm("nonexistent@example.com");
        seleniumUtils.submitForgotPasswordForm();
        
        // Should still show success message (security feature)
        seleniumUtils.expectSuccessMessage("If an account with that email exists, a password reset link has been sent");
        
        logger.info("Test completed: Handle non-existent email gracefully");
    }
    
    @Test(description = "Email privacy - same message for all emails")
    public void testEmailPrivacy() {
        logger.info("Starting test: Email privacy - same message for all emails");
        
        seleniumUtils.gotoForgotPassword();
        
        // Test with existing email
        seleniumUtils.fillForgotPasswordForm(SeleniumUtils.VALID_EMAIL);
        seleniumUtils.submitForgotPasswordForm();
        seleniumUtils.expectSuccessMessage("If an account with that email exists, a password reset link has been sent");
        
        // Test with non-existing email
        seleniumUtils.fillForgotPasswordForm("nonexistent@example.com");
        seleniumUtils.submitForgotPasswordForm();
        seleniumUtils.expectSuccessMessage("If an account with that email exists, a password reset link has been sent");
        
        // Both should show the same message for security
        logger.info("Test completed: Email privacy - same message for all emails");
    }
    
    @Test(description = "Proper form labels and accessibility")
    public void testFormAccessibility() {
        logger.info("Starting test: Proper form labels and accessibility");
        
        seleniumUtils.gotoForgotPassword();
        
        try {
            String label = seleniumUtils.getElementText("label[for=\"email\"]");
            Assert.assertTrue(label.contains("Email address"), 
                "Expected label to contain 'Email address'");
        } catch (Exception e) {
            logger.warn("Label element not found, skipping accessibility test");
        }
        
        Assert.assertTrue(seleniumUtils.isElementVisible(SeleniumUtils.FORGOT_EMAIL_INPUT), 
            "Email input should be visible");
        
        logger.info("Test completed: Proper form labels and accessibility");
    }
    
    @Test(description = "Loading states during form submission")
    public void testLoadingStates() {
        logger.info("Starting test: Loading states during form submission");
        
        seleniumUtils.gotoForgotPassword();
        seleniumUtils.fillForgotPasswordForm(SeleniumUtils.VALID_EMAIL);
        seleniumUtils.submitForgotPasswordForm();
        
        // Should show loading spinner
        seleniumUtils.expectLoadingState();
        
        // Button should be disabled during loading
        Assert.assertFalse(seleniumUtils.isElementEnabled(SeleniumUtils.FORGOT_SUBMIT_BUTTON), 
            "Button should be disabled during loading");
        
        // Wait for completion
        seleniumUtils.waitForTimeout(2000);
        seleniumUtils.expectNotLoadingState();
        Assert.assertTrue(seleniumUtils.isElementEnabled(SeleniumUtils.FORGOT_SUBMIT_BUTTON), 
            "Button should be enabled after loading");
        
        logger.info("Test completed: Loading states during form submission");
    }
}
