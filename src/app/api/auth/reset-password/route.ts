import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
    verifyResetJWT,
    validateResetToken,
    markTokenAsUsed
} from '@/lib/passwordResetUtils';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

// Load users from file
const loadUsers = () => {
    try {
        if (!fs.existsSync(USERS_FILE)) {
            return [];
        }
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading users:', error);
        return [];
    }
};

// Save users to file
const saveUsers = (users: any[]) => {
    try {
        const dataDir = path.dirname(USERS_FILE);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('Error saving users:', error);
        throw new Error('Failed to save user data');
    }
};

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
        if (!validateResetToken(email, resetToken)) {
            return NextResponse.json(
                { message: 'Invalid or expired reset token' },
                { status: 400 }
            );
        }

        // Load users and find the user
        const users = loadUsers();
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
        saveUsers(users);

        // Mark token as used
        markTokenAsUsed(email, resetToken);

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
