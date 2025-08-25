import { Page } from '@playwright/test';

export interface MockEmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class EmailMock {
  private page: Page;
  private capturedEmails: Array<{
    to: string;
    subject: string;
    html: string;
    resetUrl?: string;
  }> = [];

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Mock the email service to capture emails instead of sending them
   */
  async setupEmailMock() {
    await this.page.route('**/api/auth/forgot-password', async (route) => {
      const request = route.request();
      const postData = request.postDataJSON();
      
      try {
        // Simulate email sending
        const mockResponse: MockEmailResponse = {
          success: true,
          messageId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };

        // Extract reset URL from the email HTML (this would normally be in the email)
        const resetUrl = this.extractResetUrlFromEmail(postData.email);
        
        // Store the email for later retrieval
        this.capturedEmails.push({
          to: postData.email,
          subject: 'Password Reset Request - TodoApp',
          html: this.generateMockEmailHTML(postData.email, resetUrl),
          resetUrl
        });

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'If an account with that email exists, a password reset link has been sent.'
          })
        });
      } catch (error) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Failed to send password reset email. Please try again later.'
          })
        });
      }
    });
  }

  /**
   * Get the last captured email
   */
  getLastEmail() {
    return this.capturedEmails[this.capturedEmails.length - 1];
  }

  /**
   * Get all captured emails
   */
  getAllEmails() {
    return [...this.capturedEmails];
  }

  /**
   * Clear captured emails
   */
  clearEmails() {
    this.capturedEmails = [];
  }

  /**
   * Extract reset URL from email (simulated)
   */
  private extractResetUrlFromEmail(email: string): string {
    // In a real scenario, this would extract from the actual email
    // For testing, we'll generate a mock URL
    const mockToken = `mock-token-${Date.now()}-${email.replace('@', '-').replace('.', '-')}`;
    return `http://localhost:3003/reset-password?token=${mockToken}`;
  }

  /**
   * Generate mock email HTML
   */
  private generateMockEmailHTML(email: string, resetUrl: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">TodoApp</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Password Reset Request</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin: 0 0 20px 0;">Hello!</h2>
          
          <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0;">
            You recently requested to reset your password for your TodoApp account. 
            Click the button below to reset it.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      display: inline-block; 
                      font-weight: bold;
                      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0;">
            If you didn't request a password reset, please ignore this email or 
            contact support if you have concerns.
          </p>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              This password reset link will expire in 1 hour for security reasons.
            </p>
            <p style="color: #999; font-size: 14px; margin: 10px 0 0 0;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="color: #667eea; font-size: 14px; word-break: break-all; margin: 5px 0 0 0;">
              ${resetUrl}
            </p>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Extract reset token from the last email
   */
  extractResetTokenFromLastEmail(): string | null {
    const lastEmail = this.getLastEmail();
    if (!lastEmail?.resetUrl) return null;

    const tokenMatch = lastEmail.resetUrl.match(/token=([^&]+)/);
    return tokenMatch ? tokenMatch[1] : null;
  }

  /**
   * Get reset URL from the last email
   */
  getResetUrlFromLastEmail(): string | null {
    const lastEmail = this.getLastEmail();
    return lastEmail?.resetUrl || null;
  }

  /**
   * Mock email service failure
   */
  async mockEmailFailure() {
    await this.page.route('**/api/auth/forgot-password', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Failed to send password reset email. Please try again later.'
        })
      });
    });
  }

  /**
   * Mock email service timeout
   */
  async mockEmailTimeout() {
    await this.page.route('**/api/auth/forgot-password', async (route) => {
      // Simulate timeout by not fulfilling the route
      // This will cause the request to timeout
    });
  }
}
