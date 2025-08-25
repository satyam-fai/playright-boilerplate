import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { readDataFromFile, writeDataToFile } from './storage';

interface ResetToken {
    email: string;
    token: string;
    expiresAt: number;
    used: boolean;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const TOKEN_EXPIRY_HOURS = 1; // 1 hour

// Load reset tokens from storage
const loadResetTokens = async (): Promise<ResetToken[]> => {
    try {
        const data = await readDataFromFile("resetTokens.json");
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error loading reset tokens:', error);
        return [];
    }
};

// Save reset tokens to storage
const saveResetTokens = async (tokens: ResetToken[]): Promise<void> => {
    try {
        await writeDataToFile("resetTokens.json", tokens);
    } catch (error) {
        console.error('Error saving reset tokens:', error);
        throw new Error('Failed to save reset token');
    }
};

// Generate a secure random token
export const generateResetToken = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

// Create a JWT token for password reset
export const createResetJWT = (email: string, resetToken: string): string => {
    const payload = {
        email,
        resetToken,
        type: 'password-reset',
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: `${TOKEN_EXPIRY_HOURS}h`
    });
};

// Verify and decode JWT token
export const verifyResetJWT = (token: string): { email: string; resetToken: string } | null => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;

        if (decoded.type !== 'password-reset') {
            return null;
        }

        return {
            email: decoded.email,
            resetToken: decoded.resetToken,
        };
    } catch (error) {
        console.error('Error verifying reset JWT:', error);
        return null;
    }
};

// Store reset token
export const storeResetToken = async (email: string, resetToken: string): Promise<void> => {
    const tokens = await loadResetTokens();

    // Remove any existing tokens for this email
    const filteredTokens = tokens.filter((token: ResetToken) => token.email !== email);

    // Add new token
    const newToken: ResetToken = {
        email,
        token: resetToken,
        expiresAt: Date.now() + (TOKEN_EXPIRY_HOURS * 60 * 60 * 1000), // 1 hour from now
        used: false,
    };

    filteredTokens.push(newToken);
    await saveResetTokens(filteredTokens);
};

// Validate reset token
export const validateResetToken = async (email: string, resetToken: string): Promise<boolean> => {
    const tokens = await loadResetTokens();

    // Clean up expired tokens
    const now = Date.now();
    const validTokens = tokens.filter((token: ResetToken) =>
        token.expiresAt > now && !token.used
    );

    if (validTokens.length !== tokens.length) {
        await saveResetTokens(validTokens);
    }

    const token = validTokens.find((t: ResetToken) =>
        t.email === email && t.token === resetToken && !t.used
    );

    return !!token;
};

// Mark token as used
export const markTokenAsUsed = async (email: string, resetToken: string): Promise<void> => {
    const tokens = await loadResetTokens();

    const tokenIndex = tokens.findIndex((t: ResetToken) =>
        t.email === email && t.token === resetToken
    );

    if (tokenIndex !== -1) {
        tokens[tokenIndex].used = true;
        await saveResetTokens(tokens);
    }
};

// Clean up expired tokens
export const cleanupExpiredTokens = async (): Promise<void> => {
    const tokens = await loadResetTokens();
    const now = Date.now();

    const validTokens = tokens.filter((token: ResetToken) =>
        token.expiresAt > now && !token.used
    );

    if (validTokens.length !== tokens.length) {
        await saveResetTokens(validTokens);
        console.log(`Cleaned up ${tokens.length - validTokens.length} expired reset tokens`);
    }
};

// Get reset URL
export const getResetUrl = (jwtToken: string): string => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/reset-password?token=${jwtToken}`;
};
