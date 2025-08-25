import { Page, expect } from '@playwright/test';
import { EmailMock } from './email-mock';

// Page URLs
export const PAGES = {
    LOGIN: '/login',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    DASHBOARD: '/dashboard',
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

// Helper functions
export class TestUtils {
    private emailMock: EmailMock;

    constructor(private page: Page) {
        this.emailMock = new EmailMock(page);
    }

    // Navigation helpers
    async gotoLogin() {
        await this.page.goto(PAGES.LOGIN);
        await this.page.waitForLoadState('networkidle');
    }

    async gotoForgotPassword() {
        await this.page.goto(PAGES.FORGOT_PASSWORD);
        await this.page.waitForLoadState('networkidle');
    }

    async gotoResetPassword(token: string) {
        await this.page.goto(`${PAGES.RESET_PASSWORD}?token=${token}`);
        await this.page.waitForLoadState('networkidle');
    }

    // Form interaction helpers
    async fillLoginForm(email: string, password: string) {
        await this.page.fill(SELECTORS.LOGIN_EMAIL_INPUT, email);
        await this.page.fill(SELECTORS.LOGIN_PASSWORD_INPUT, password);
    }

    async submitLoginForm() {
        await this.page.click(SELECTORS.LOGIN_SUBMIT_BUTTON);
    }

    async fillForgotPasswordForm(email: string) {
        await this.page.fill(SELECTORS.FORGOT_EMAIL_INPUT, email);
    }

    async submitForgotPasswordForm() {
        await this.page.click(SELECTORS.FORGOT_SUBMIT_BUTTON);
    }

    async fillResetPasswordForm(password: string, confirmPassword: string) {
        await this.page.fill(SELECTORS.RESET_PASSWORD_INPUT, password);
        await this.page.fill(SELECTORS.RESET_CONFIRM_PASSWORD_INPUT, confirmPassword);
    }

    async submitResetPasswordForm() {
        await this.page.click(SELECTORS.RESET_SUBMIT_BUTTON);
    }

    // Assertion helpers
    async expectToBeOnLoginPage() {
        await expect(this.page).toHaveURL(/.*\/login$/);
        await expect(this.page.locator('h2')).toContainText('Sign in to your account');
    }

    async expectToBeOnForgotPasswordPage() {
        await expect(this.page).toHaveURL(/.*\/forgot-password$/);
        await expect(this.page.locator('h2')).toContainText('Forgot your password?');
    }

    async expectToBeOnResetPasswordPage() {
        await expect(this.page).toHaveURL(/.*\/reset-password/);
        await expect(this.page.locator('h2')).toContainText('Reset your password');
    }

    async expectToBeOnDashboard() {
        await expect(this.page).toHaveURL(/.*\/dashboard$/);
        await expect(this.page.locator('h1')).toContainText('TodoApp');
    }

    async expectSuccessMessage(expectedMessage: string) {
        const successSelector = `${SELECTORS.FORGOT_SUCCESS_MESSAGE}, ${SELECTORS.RESET_SUCCESS_MESSAGE}`;
        await expect(this.page.locator(successSelector)).toContainText(expectedMessage);
    }

    async expectErrorMessage(expectedMessage: string) {
        const errorSelector = `${SELECTORS.FORGOT_ERROR_MESSAGE}, ${SELECTORS.RESET_ERROR_MESSAGE}`;
        await expect(this.page.locator(errorSelector)).toContainText(expectedMessage);
    }

    async expectLoadingState() {
        await expect(this.page.locator(SELECTORS.LOADING_SPINNER)).toBeVisible();
    }

    async expectNotLoadingState() {
        await expect(this.page.locator(SELECTORS.LOADING_SPINNER)).not.toBeVisible();
    }

    // Email mock helpers
    async setupEmailMock() {
        await this.emailMock.setupEmailMock();
    }

    async getLastEmail() {
        return this.emailMock.getLastEmail();
    }

    async getAllEmails() {
        return this.emailMock.getAllEmails();
    }

    async clearEmails() {
        this.emailMock.clearEmails();
    }

    // Token extraction helper
    async extractResetTokenFromEmail() {
        return this.emailMock.extractResetTokenFromLastEmail();
    }

    async getResetUrlFromEmail() {
        return this.emailMock.getResetUrlFromLastEmail();
    }

    // Email failure mocking
    async mockEmailFailure() {
        await this.emailMock.mockEmailFailure();
    }

    async mockEmailTimeout() {
        await this.emailMock.mockEmailTimeout();
    }

    // Utility for waiting for animations
    async waitForAnimations() {
        await this.page.waitForTimeout(500); // Wait for Framer Motion animations
    }
}

// Fixture type for test data
export interface TestFixture {
    testUtils: TestUtils;
    page: Page;
}
