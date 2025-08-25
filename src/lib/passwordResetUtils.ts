import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

interface ResetToken {
    email: string;
    token: string;
    expiresAt: number;
    used: boolean;
}

const RESET_TOKENS_FILE = path.join(process.cwd(), 'data', 'resetTokens.json');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const TOKEN_EXPIRY_HOURS = 1; // 1 hour

// Ensure the data directory exists
const ensureDataDirectory = () => {
    const dataDir = path.dirname(RESET_TOKENS_FILE);
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
};

// Load reset tokens from file
const loadResetTokens = (): ResetToken[] => {
    try {
        ensureDataDirectory();
        if (!fs.existsSync(RESET_TOKENS_FILE)) {
            return [];
        }
        const data = fs.readFileSync(RESET_TOKENS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading reset tokens:', error);
        return [];
    }
};

// Save reset tokens to file
const saveResetTokens = (tokens: ResetToken[]) => {
    try {
        ensureDataDirectory();
        fs.writeFileSync(RESET_TOKENS_FILE, JSON.stringify(tokens, null, 2));
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
export const storeResetToken = (email: string, resetToken: string): void => {
    const tokens = loadResetTokens();

    // Remove any existing tokens for this email
    const filteredTokens = tokens.filter(token => token.email !== email);

    // Add new token
    const newToken: ResetToken = {
        email,
        token: resetToken,
        expiresAt: Date.now() + (TOKEN_EXPIRY_HOURS * 60 * 60 * 1000), // 1 hour from now
        used: false,
    };

    filteredTokens.push(newToken);
    saveResetTokens(filteredTokens);
};

// Validate reset token
export const validateResetToken = (email: string, resetToken: string): boolean => {
    const tokens = loadResetTokens();

    // Clean up expired tokens
    const now = Date.now();
    const validTokens = tokens.filter(token =>
        token.expiresAt > now && !token.used
    );

    if (validTokens.length !== tokens.length) {
        saveResetTokens(validTokens);
    }

    const token = validTokens.find(t =>
        t.email === email && t.token === resetToken && !t.used
    );

    return !!token;
};

// Mark token as used
export const markTokenAsUsed = (email: string, resetToken: string): void => {
    const tokens = loadResetTokens();

    const tokenIndex = tokens.findIndex(t =>
        t.email === email && t.token === resetToken
    );

    if (tokenIndex !== -1) {
        tokens[tokenIndex].used = true;
        saveResetTokens(tokens);
    }
};

// Clean up expired tokens
export const cleanupExpiredTokens = (): void => {
    const tokens = loadResetTokens();
    const now = Date.now();

    const validTokens = tokens.filter(token =>
        token.expiresAt > now && !token.used
    );

    if (validTokens.length !== tokens.length) {
        saveResetTokens(validTokens);
        console.log(`Cleaned up ${tokens.length - validTokens.length} expired reset tokens`);
    }
};

// Get reset URL
export const getResetUrl = (jwtToken: string): string => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/reset-password?token=${jwtToken}`;
};
