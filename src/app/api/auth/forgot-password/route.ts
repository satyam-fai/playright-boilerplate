import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordResetEmail } from '@/lib/emailUtils';
import {
    generateResetToken,
    createResetJWT,
    storeResetToken,
    getResetUrl
} from '@/lib/passwordResetUtils';
import { readDataFromFile } from '@/lib/storage';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        // Validate email
        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { message: 'Please provide a valid email address' },
                { status: 400 }
            );
        }

        // Load users and check if email exists
        const users = await readDataFromFile("users.json");
        const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            // For security reasons, don't reveal if email exists or not
            return NextResponse.json(
                { message: 'If an account with that email exists, a password reset link has been sent.' },
                { status: 200 }
            );
        }

        // Generate reset token
        const resetToken = generateResetToken();

        // Create JWT token
        const jwtToken = createResetJWT(email, resetToken);

        // Store reset token
        await storeResetToken(email, resetToken);

        // Generate reset URL
        const resetUrl = getResetUrl(jwtToken);

        // Send email
        try {
            await sendPasswordResetEmail(email, resetToken, resetUrl);

            return NextResponse.json(
                { message: 'If an account with that email exists, a password reset link has been sent.' },
                { status: 200 }
            );
        } catch (emailError) {
            console.error('Error sending email:', emailError);
            return NextResponse.json(
                { message: 'Failed to send password reset email. Please try again later.' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error in forgot password:', error);
        return NextResponse.json(
            { message: 'An error occurred. Please try again.' },
            { status: 500 }
        );
    }
}
