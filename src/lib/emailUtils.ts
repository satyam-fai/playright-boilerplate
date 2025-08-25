import nodemailer from 'nodemailer';

// Create a test account for development (you can replace with real SMTP credentials)
const createTestAccount = async () => {
    try {
        const testAccount = await nodemailer.createTestAccount();
        return nodemailer.createTransporter({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    } catch (error) {
        console.error('Error creating test account:', error);
        throw error;
    }
};

// For production, use real SMTP credentials
const createProductionTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

export const sendPasswordResetEmail = async (
    email: string,
    resetToken: string,
    resetUrl: string
) => {
    try {
        const transporter = process.env.NODE_ENV === 'production'
            ? createProductionTransporter()
            : await createTestAccount();

        const mailOptions = {
            from: process.env.SMTP_USER || 'noreply@todoapp.com',
            to: email,
            subject: 'Password Reset Request - TodoApp',
            html: `
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
      `,
        };

        const info = await transporter.sendMail(mailOptions);

        if (process.env.NODE_ENV !== 'production') {
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send password reset email');
    }
};
