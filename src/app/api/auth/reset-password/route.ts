import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import {
    verifyResetJWT,
    validateResetToken,
    markTokenAsUsed
} from '@/lib/passwordResetUtils';
import { readDataFromFile, writeDataToFile } from '@/lib/storage';

export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json();

        // Validate input
        if (!token) {
            return NextResponse.json(
                { message: 'Reset token is required' },
                { status: 400 }
            );
        }

        if (!password || password.length < 6) {
            return NextResponse.json(
                { message: 'Password must be at least 6 characters long' },
                { status: 400 }
            );
        }

        // Verify JWT token
        const decoded = verifyResetJWT(token);
        if (!decoded) {
            return NextResponse.json(
                { message: 'Invalid or expired reset token' },
                { status: 400 }
            );
        }

        const { email, resetToken } = decoded;

        // Validate reset token
        if (!(await validateResetToken(email, resetToken))) {
            return NextResponse.json(
                { message: 'Invalid or expired reset token' },
                { status: 400 }
            );
        }

        // Load users and find the user
        const users = await readDataFromFile("users.json");
        const userIndex = users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());

        if (userIndex === -1) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            );
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Update user's password
        users[userIndex].password = hashedPassword;

        // Save updated users
        const saveSuccess = await writeDataToFile("users.json", users);
        if (!saveSuccess) {
            return NextResponse.json(
                { message: 'Failed to update password' },
                { status: 500 }
            );
        }

        // Mark token as used
        await markTokenAsUsed(email, resetToken);

        return NextResponse.json(
            { message: 'Password has been reset successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in reset password:', error);
        return NextResponse.json(
            { message: 'An error occurred. Please try again.' },
            { status: 500 }
        );
    }
}
