import { Builder, By, until, WebDriver, WebElement } from 'selenium-webdriver';
import { Options } from 'selenium-webdriver/chrome';

// Page URLs
export const PAGES = {
    LOGIN: 'http://localhost:3003/login',
    FORGOT_PASSWORD: 'http://localhost:3003/forgot-password',
    RESET_PASSWORD: 'http://localhost:3003/reset-password',
    DASHBOARD: 'http://localhost:3003/dashboard',
} as const;

// Reusable selectors
export const SELECTORS = {
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
    RESET_SUBMIT_BUTTON: 'button[type="submit"]',
    RESET_SUCCESS_MESSAGE: '.text-green-700, .text-green-300',
    RESET_ERROR_MESSAGE: '.text-red-700, .text-red-300',

    // Common
    LOADING_SPINNER: '.animate-spin, [class*="animate-spin"]',
    BACK_TO_LOGIN_LINK: 'a[href="/login"]',
} as const;

// Test data
export const TEST_DATA = {
    VALID_EMAIL: 'test@example.com',
    INVALID_EMAIL: 'invalid-email',
    EMPTY_EMAIL: '',
    WEAK_PASSWORD: '123',
    VALID_PASSWORD: 'newPassword123',
    MISMATCH_PASSWORD: 'differentPassword123',
} as const;

// Email mock data
export interface MockEmail {
    to: string;
    subject: string;
    html: string;
    resetUrl?: string;
}

export class SeleniumUtils {
    private driver: WebDriver;
    private capturedEmails: MockEmail[] = [];

    constructor(driver: WebDriver) {
        this.driver = driver;
    }

    // Driver setup
    static async createDriver(headless: boolean = false): Promise<WebDriver> {
        const options = new Options();

        if (headless) {
            options.addArguments('--headless');
        }

        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments('--disable-gpu');
        options.addArguments('--window-size=1920,1080');

        return new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
    }

    // Navigation helpers
    async gotoLogin(): Promise<void> {
        await this.driver.get(PAGES.LOGIN);
        await this.waitForPageLoad();
    }

    async gotoForgotPassword(): Promise<void> {
        await this.driver.get(PAGES.FORGOT_PASSWORD);
        await this.waitForPageLoad();
    }

    async gotoResetPassword(token: string): Promise<void> {
        await this.driver.get(`${PAGES.RESET_PASSWORD}?token=${token}`);
        await this.waitForPageLoad();
    }

    // Form interaction helpers
    async fillLoginForm(email: string, password: string): Promise<void> {
        await this.fillElement(SELECTORS.LOGIN_EMAIL_INPUT, email);
        await this.fillElement(SELECTORS.LOGIN_PASSWORD_INPUT, password);
    }

    async submitLoginForm(): Promise<void> {
        await this.clickElement(SELECTORS.LOGIN_SUBMIT_BUTTON);
    }

    async fillForgotPasswordForm(email: string): Promise<void> {
        await this.fillElement(SELECTORS.FORGOT_EMAIL_INPUT, email);
    }

    async submitForgotPasswordForm(): Promise<void> {
        await this.clickElement(SELECTORS.FORGOT_SUBMIT_BUTTON);
    }

    async fillResetPasswordForm(password: string, confirmPassword: string): Promise<void> {
        await this.fillElement(SELECTORS.RESET_PASSWORD_INPUT, password);
        await this.fillElement(SELECTORS.RESET_CONFIRM_PASSWORD_INPUT, confirmPassword);
    }

    async submitResetPasswordForm(): Promise<void> {
        await this.clickElement(SELECTORS.RESET_SUBMIT_BUTTON);
    }

    // Element interaction helpers
    async fillElement(selector: string, value: string): Promise<void> {
        const element = await this.driver.findElement(By.css(selector));
        await element.clear();
        await element.sendKeys(value);
    }

    async clickElement(selector: string): Promise<void> {
        const element = await this.driver.findElement(By.css(selector));
        await element.click();
    }

    async getElementText(selector: string): Promise<string> {
        const element = await this.driver.findElement(By.css(selector));
        return await element.getText();
    }

    async getElementValue(selector: string): Promise<string> {
        const element = await this.driver.findElement(By.css(selector));
        return await element.getAttribute('value');
    }

    async isElementVisible(selector: string): Promise<boolean> {
        try {
            const element = await this.driver.findElement(By.css(selector));
            return await element.isDisplayed();
        } catch {
            return false;
        }
    }

    async isElementEnabled(selector: string): Promise<boolean> {
        try {
            const element = await this.driver.findElement(By.css(selector));
            return await element.isEnabled();
        } catch {
            return false;
        }
    }

    // Assertion helpers
    async expectToBeOnLoginPage(): Promise<void> {
        const currentUrl = await this.driver.getCurrentUrl();
        if (!currentUrl.includes('/login')) {
            throw new Error(`Expected to be on login page, but was on: ${currentUrl}`);
        }

        const heading = await this.getElementText('h2');
        if (!heading.includes('Sign in to your account')) {
            throw new Error(`Expected login page heading, but got: ${heading}`);
        }
    }

    async expectToBeOnForgotPasswordPage(): Promise<void> {
        const currentUrl = await this.driver.getCurrentUrl();
        if (!currentUrl.includes('/forgot-password')) {
            throw new Error(`Expected to be on forgot password page, but was on: ${currentUrl}`);
        }

        const heading = await this.getElementText('h2');
        if (!heading.includes('Forgot your password?')) {
            throw new Error(`Expected forgot password page heading, but got: ${heading}`);
        }
    }

    async expectToBeOnResetPasswordPage(): Promise<void> {
        const currentUrl = await this.driver.getCurrentUrl();
        if (!currentUrl.includes('/reset-password')) {
            throw new Error(`Expected to be on reset password page, but was on: ${currentUrl}`);
        }

        const heading = await this.getElementText('h2');
        if (!heading.includes('Reset your password')) {
            throw new Error(`Expected reset password page heading, but got: ${heading}`);
        }
    }

    async expectToBeOnDashboard(): Promise<void> {
        const currentUrl = await this.driver.getCurrentUrl();
        if (!currentUrl.includes('/dashboard')) {
            throw new Error(`Expected to be on dashboard, but was on: ${currentUrl}`);
        }

        const heading = await this.getElementText('h1');
        if (!heading.includes('TodoApp')) {
            throw new Error(`Expected dashboard heading, but got: ${heading}`);
        }
    }

    async expectSuccessMessage(expectedMessage: string): Promise<void> {
        const successSelectors = [SELECTORS.FORGOT_SUCCESS_MESSAGE, SELECTORS.RESET_SUCCESS_MESSAGE];

        for (const selector of successSelectors) {
            try {
                const message = await this.getElementText(selector);
                if (message.includes(expectedMessage)) {
                    return;
                }
            } catch {
                // Continue to next selector
            }
        }

        throw new Error(`Expected success message "${expectedMessage}" not found`);
    }

    async expectErrorMessage(expectedMessage: string): Promise<void> {
        const errorSelectors = [SELECTORS.FORGOT_ERROR_MESSAGE, SELECTORS.RESET_ERROR_MESSAGE];

        for (const selector of errorSelectors) {
            try {
                const message = await this.getElementText(selector);
                if (message.includes(expectedMessage)) {
                    return;
                }
            } catch {
                // Continue to next selector
            }
        }

        throw new Error(`Expected error message "${expectedMessage}" not found`);
    }

    async expectLoadingState(): Promise<void> {
        const isVisible = await this.isElementVisible(SELECTORS.LOADING_SPINNER);
        if (!isVisible) {
            throw new Error('Loading spinner not visible');
        }
    }

    async expectNotLoadingState(): Promise<void> {
        const isVisible = await this.isElementVisible(SELECTORS.LOADING_SPINNER);
        if (isVisible) {
            throw new Error('Loading spinner still visible');
        }
    }

    // Email mock helpers
    async setupEmailMock(): Promise<void> {
        // Inject JavaScript to intercept fetch requests
        await this.driver.executeScript(`
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
    `);
    }

    async getLastEmail(): Promise<MockEmail | null> {
        const emails = await this.driver.executeScript('return window.capturedEmails || [];') as MockEmail[];
        return emails.length > 0 ? emails[emails.length - 1] : null;
    }

    async getAllEmails(): Promise<MockEmail[]> {
        return await this.driver.executeScript('return window.capturedEmails || [];') as MockEmail[];
    }

    async clearEmails(): Promise<void> {
        await this.driver.executeScript('window.capturedEmails = [];');
    }

    async extractResetTokenFromEmail(): Promise<string | null> {
        const lastEmail = await this.getLastEmail();
        if (!lastEmail?.resetUrl) return null;

        const tokenMatch = lastEmail.resetUrl.match(/token=([^&]+)/);
        return tokenMatch ? tokenMatch[1] : null;
    }

    async getResetUrlFromEmail(): Promise<string | null> {
        const lastEmail = await this.getLastEmail();
        return lastEmail?.resetUrl || null;
    }

    // Utility methods
    async waitForPageLoad(): Promise<void> {
        await this.driver.wait(until.elementLocated(By.css('body')), 10000);
        await this.driver.wait(() => {
            return this.driver.executeScript('return document.readyState === "complete"');
        }, 10000);
    }

    async waitForElement(selector: string, timeout: number = 10000): Promise<WebElement> {
        return await this.driver.wait(until.elementLocated(By.css(selector)), timeout);
    }

    async waitForElementVisible(selector: string, timeout: number = 10000): Promise<void> {
        await this.driver.wait(until.elementIsVisible(await this.driver.findElement(By.css(selector))), timeout);
    }

    async waitForElementNotVisible(selector: string, timeout: number = 10000): Promise<void> {
        await this.driver.wait(until.stalenessOf(await this.driver.findElement(By.css(selector))), timeout);
    }

    async waitForText(selector: string, text: string, timeout: number = 10000): Promise<void> {
        await this.driver.wait(async () => {
            try {
                const elementText = await this.getElementText(selector);
                return elementText.includes(text);
            } catch {
                return false;
            }
        }, timeout);
    }

    async waitForUrl(url: string, timeout: number = 10000): Promise<void> {
        await this.driver.wait(until.urlContains(url), timeout);
    }

    async waitForTimeout(ms: number): Promise<void> {
        await this.driver.sleep(ms);
    }

    // Screenshot helper
    async takeScreenshot(filename: string): Promise<void> {
        const screenshot = await this.driver.takeScreenshot();
        const fs = require('fs');
        const path = require('path');

        const screenshotsDir = path.join(__dirname, '../../screenshots');
        if (!fs.existsSync(screenshotsDir)) {
            fs.mkdirSync(screenshotsDir, { recursive: true });
        }

        fs.writeFileSync(path.join(screenshotsDir, `${filename}.png`), screenshot, 'base64');
    }

    // Close driver
    async quit(): Promise<void> {
        if (this.driver) {
            await this.driver.quit();
        }
    }
}
