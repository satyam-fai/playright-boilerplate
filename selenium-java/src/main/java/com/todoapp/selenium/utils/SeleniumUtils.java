package com.todoapp.selenium.utils;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Selenium utilities for TodoApp forgot password flow testing
 */
public class SeleniumUtils {
    private static final Logger logger = LoggerFactory.getLogger(SeleniumUtils.class);
    
    private final WebDriver driver;
    private final WebDriverWait wait;
    private final Map<String, Object> capturedEmails = new ConcurrentHashMap<>();
    
    // Page URLs
    public static final String BASE_URL = "http://localhost:3003";
    public static final String LOGIN_URL = BASE_URL + "/login";
    public static final String FORGOT_PASSWORD_URL = BASE_URL + "/forgot-password";
    public static final String RESET_PASSWORD_URL = BASE_URL + "/reset-password";
    public static final String DASHBOARD_URL = BASE_URL + "/dashboard";
    
    // Selectors
    public static final String LOGIN_EMAIL_INPUT = "#email-address";
    public static final String LOGIN_PASSWORD_INPUT = "#password";
    public static final String LOGIN_SUBMIT_BUTTON = "button[type=\"submit\"]";
    public static final String FORGOT_PASSWORD_LINK = "a[href=\"/forgot-password\"]";
    
    public static final String FORGOT_EMAIL_INPUT = "#email";
    public static final String FORGOT_SUBMIT_BUTTON = "button[type=\"submit\"]";
    public static final String FORGOT_SUCCESS_MESSAGE = ".text-green-700, .text-green-300";
    public static final String FORGOT_ERROR_MESSAGE = ".text-red-700, .text-red-300";
    
    public static final String RESET_PASSWORD_INPUT = "#password";
    public static final String RESET_CONFIRM_PASSWORD_INPUT = "#confirmPassword";
    public static final String RESET_SUBMIT_BUTTON = "button[type=\"submit\"]";
    public static final String RESET_SUCCESS_MESSAGE = ".text-green-700, .text-green-300";
    public static final String RESET_ERROR_MESSAGE = ".text-red-700, .text-red-300";
    
    public static final String LOADING_SPINNER = ".animate-spin, [class*=\"animate-spin\"]";
    public static final String BACK_TO_LOGIN_LINK = "a[href=\"/login\"]";
    
    // Test data
    public static final String VALID_EMAIL = "test@example.com";
    public static final String INVALID_EMAIL = "invalid-email";
    public static final String WEAK_PASSWORD = "123";
    public static final String VALID_PASSWORD = "newPassword123";
    public static final String MISMATCH_PASSWORD = "differentPassword123";
    
    public SeleniumUtils(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }
    
    /**
     * Create WebDriver instance with specified browser
     */
    public static WebDriver createDriver(String browser, boolean headless) {
        WebDriver driver;
        
        switch (browser.toLowerCase()) {
            case "chrome":
                WebDriverManager.chromedriver().setup();
                ChromeOptions chromeOptions = new ChromeOptions();
                if (headless) {
                    chromeOptions.addArguments("--headless");
                }
                chromeOptions.addArguments("--no-sandbox");
                chromeOptions.addArguments("--disable-dev-shm-usage");
                chromeOptions.addArguments("--disable-gpu");
                chromeOptions.addArguments("--window-size=1920,1080");
                driver = new ChromeDriver(chromeOptions);
                break;
                
            case "firefox":
                WebDriverManager.firefoxdriver().setup();
                FirefoxOptions firefoxOptions = new FirefoxOptions();
                if (headless) {
                    firefoxOptions.addArguments("--headless");
                }
                driver = new FirefoxDriver(firefoxOptions);
                break;
                
            default:
                throw new IllegalArgumentException("Unsupported browser: " + browser);
        }
        
        driver.manage().window().maximize();
        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));
        driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(30));
        
        return driver;
    }
    
    // Navigation methods
    public void gotoLogin() {
        driver.get(LOGIN_URL);
        waitForPageLoad();
    }
    
    public void gotoForgotPassword() {
        driver.get(FORGOT_PASSWORD_URL);
        waitForPageLoad();
    }
    
    public void gotoResetPassword(String token) {
        driver.get(RESET_PASSWORD_URL + "?token=" + token);
        waitForPageLoad();
    }
    
    // Form interaction methods
    public void fillLoginForm(String email, String password) {
        fillElement(LOGIN_EMAIL_INPUT, email);
        fillElement(LOGIN_PASSWORD_INPUT, password);
    }
    
    public void submitLoginForm() {
        clickElement(LOGIN_SUBMIT_BUTTON);
    }
    
    public void fillForgotPasswordForm(String email) {
        fillElement(FORGOT_EMAIL_INPUT, email);
    }
    
    public void submitForgotPasswordForm() {
        clickElement(FORGOT_SUBMIT_BUTTON);
    }
    
    public void fillResetPasswordForm(String password, String confirmPassword) {
        fillElement(RESET_PASSWORD_INPUT, password);
        fillElement(RESET_CONFIRM_PASSWORD_INPUT, confirmPassword);
    }
    
    public void submitResetPasswordForm() {
        clickElement(RESET_SUBMIT_BUTTON);
    }
    
    // Element interaction methods
    public void fillElement(String selector, String value) {
        WebElement element = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector(selector)));
        element.clear();
        element.sendKeys(value);
    }
    
    public void clickElement(String selector) {
        WebElement element = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector(selector)));
        element.click();
    }
    
    public String getElementText(String selector) {
        WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(selector)));
        return element.getText();
    }
    
    public String getElementValue(String selector) {
        WebElement element = wait.until(ExpectedConditions.presenceOfElementLocated(By.cssSelector(selector)));
        return element.getAttribute("value");
    }
    
    public boolean isElementVisible(String selector) {
        try {
            return driver.findElement(By.cssSelector(selector)).isDisplayed();
        } catch (NoSuchElementException e) {
            return false;
        }
    }
    
    public boolean isElementEnabled(String selector) {
        try {
            return driver.findElement(By.cssSelector(selector)).isEnabled();
        } catch (NoSuchElementException e) {
            return false;
        }
    }
    
    // Assertion methods
    public void expectToBeOnLoginPage() {
        String currentUrl = driver.getCurrentUrl();
        if (!currentUrl.contains("/login")) {
            throw new AssertionError("Expected to be on login page, but was on: " + currentUrl);
        }
        
        String heading = getElementText("h2");
        if (!heading.contains("Sign in to your account")) {
            throw new AssertionError("Expected login page heading, but got: " + heading);
        }
    }
    
    public void expectToBeOnForgotPasswordPage() {
        String currentUrl = driver.getCurrentUrl();
        if (!currentUrl.contains("/forgot-password")) {
            throw new AssertionError("Expected to be on forgot password page, but was on: " + currentUrl);
        }
        
        String heading = getElementText("h2");
        if (!heading.contains("Forgot your password?")) {
            throw new AssertionError("Expected forgot password page heading, but got: " + heading);
        }
    }
    
    public void expectToBeOnResetPasswordPage() {
        String currentUrl = driver.getCurrentUrl();
        if (!currentUrl.contains("/reset-password")) {
            throw new AssertionError("Expected to be on reset password page, but was on: " + currentUrl);
        }
        
        String heading = getElementText("h2");
        if (!heading.contains("Reset your password")) {
            throw new AssertionError("Expected reset password page heading, but got: " + heading);
        }
    }
    
    public void expectToBeOnDashboard() {
        String currentUrl = driver.getCurrentUrl();
        if (!currentUrl.contains("/dashboard")) {
            throw new AssertionError("Expected to be on dashboard, but was on: " + currentUrl);
        }
        
        String heading = getElementText("h1");
        if (!heading.contains("TodoApp")) {
            throw new AssertionError("Expected dashboard heading, but got: " + heading);
        }
    }
    
    public void expectSuccessMessage(String expectedMessage) {
        String[] successSelectors = {FORGOT_SUCCESS_MESSAGE, RESET_SUCCESS_MESSAGE};
        
        for (String selector : successSelectors) {
            try {
                String message = getElementText(selector);
                if (message.contains(expectedMessage)) {
                    return;
                }
            } catch (Exception e) {
                // Continue to next selector
            }
        }
        
        throw new AssertionError("Expected success message \"" + expectedMessage + "\" not found");
    }
    
    public void expectErrorMessage(String expectedMessage) {
        String[] errorSelectors = {FORGOT_ERROR_MESSAGE, RESET_ERROR_MESSAGE};
        
        for (String selector : errorSelectors) {
            try {
                String message = getElementText(selector);
                if (message.contains(expectedMessage)) {
                    return;
                }
            } catch (Exception e) {
                // Continue to next selector
            }
        }
        
        throw new AssertionError("Expected error message \"" + expectedMessage + "\" not found");
    }
    
    public void expectLoadingState() {
        if (!isElementVisible(LOADING_SPINNER)) {
            throw new AssertionError("Loading spinner not visible");
        }
    }
    
    public void expectNotLoadingState() {
        if (isElementVisible(LOADING_SPINNER)) {
            throw new AssertionError("Loading spinner still visible");
        }
    }
    
    // Email mock methods
    public void setupEmailMock() {
        String script = """
            window.capturedEmails = [];
            
            // Store original fetch
            const originalFetch = window.fetch;
            
            // Override fetch
            window.fetch = async function(url, options) {
                if (url.includes('/api/auth/forgot-password')) {
                    // Mock the response
                    const mockResponse = {
                        ok: true,
                        status: 200,
                        json: async () => ({
                            message: 'If an account with that email exists, a password reset link has been sent.'
                        })
                    };
                    
                    // Generate mock reset URL
                    const email = JSON.parse(options.body).email;
                    const mockToken = 'mock-token-' + Date.now() + '-' + email.replace('@', '-').replace('.', '-');
                    const resetUrl = 'http://localhost:3003/reset-password?token=' + mockToken;
                    
                    // Store email data
                    window.capturedEmails.push({
                        to: email,
                        subject: 'Password Reset Request - TodoApp',
                        resetUrl: resetUrl
                    });
                    
                    return Promise.resolve(mockResponse);
                }
                
                // Call original fetch for other requests
                return originalFetch.apply(this, arguments);
            };
            """;
        
        ((JavascriptExecutor) driver).executeScript(script);
    }
    
    @SuppressWarnings("unchecked")
    public Map<String, Object> getLastEmail() {
        List<Map<String, Object>> emails = (List<Map<String, Object>>) 
            ((JavascriptExecutor) driver).executeScript("return window.capturedEmails || [];");
        
        if (emails.isEmpty()) {
            return null;
        }
        
        return emails.get(emails.size() - 1);
    }
    
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getAllEmails() {
        return (List<Map<String, Object>>) 
            ((JavascriptExecutor) driver).executeScript("return window.capturedEmails || [];");
    }
    
    public void clearEmails() {
        ((JavascriptExecutor) driver).executeScript("window.capturedEmails = [];");
    }
    
    public String extractResetTokenFromEmail() {
        Map<String, Object> lastEmail = getLastEmail();
        if (lastEmail == null || lastEmail.get("resetUrl") == null) {
            return null;
        }
        
        String resetUrl = (String) lastEmail.get("resetUrl");
        String[] parts = resetUrl.split("token=");
        return parts.length > 1 ? parts[1] : null;
    }
    
    public String getResetUrlFromEmail() {
        Map<String, Object> lastEmail = getLastEmail();
        return lastEmail != null ? (String) lastEmail.get("resetUrl") : null;
    }
    
    // Utility methods
    public void waitForPageLoad() {
        wait.until(webDriver -> ((JavascriptExecutor) webDriver)
            .executeScript("return document.readyState").equals("complete"));
    }
    
    public void waitForElement(String selector) {
        wait.until(ExpectedConditions.presenceOfElementLocated(By.cssSelector(selector)));
    }
    
    public void waitForElementVisible(String selector) {
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector(selector)));
    }
    
    public void waitForElementNotVisible(String selector) {
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.cssSelector(selector)));
    }
    
    public void waitForText(String selector, String text) {
        wait.until(ExpectedConditions.textToBePresentInElementLocated(By.cssSelector(selector), text));
    }
    
    public void waitForUrl(String url) {
        wait.until(ExpectedConditions.urlContains(url));
    }
    
    public void waitForTimeout(long milliseconds) {
        try {
            Thread.sleep(milliseconds);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
    
    // Screenshot method
    public void takeScreenshot(String filename) {
        try {
            File screenshot = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
            Path screenshotsDir = Paths.get("screenshots");
            if (!Files.exists(screenshotsDir)) {
                Files.createDirectories(screenshotsDir);
            }
            
            Path destination = screenshotsDir.resolve(filename + ".png");
            Files.copy(screenshot.toPath(), destination);
            logger.info("Screenshot saved: {}", destination);
        } catch (IOException e) {
            logger.error("Failed to take screenshot", e);
        }
    }
    
    // Cleanup method
    public void quit() {
        if (driver != null) {
            driver.quit();
        }
    }
    
    // Getter for driver
    public WebDriver getDriver() {
        return driver;
    }
}
