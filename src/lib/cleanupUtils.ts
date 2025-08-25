import { cleanupExpiredTokens } from './passwordResetUtils';

// Clean up expired tokens every hour
export const startTokenCleanup = () => {
    // Clean up immediately
    cleanupExpiredTokens().catch(console.error);

    // Then clean up every hour
    setInterval(() => {
        cleanupExpiredTokens().catch(console.error);
    }, 60 * 60 * 1000); // 1 hour
};

// For development, clean up more frequently
export const startDevTokenCleanup = () => {
    // Clean up immediately
    cleanupExpiredTokens().catch(console.error);

    // Then clean up every 5 minutes in development
    setInterval(() => {
        cleanupExpiredTokens().catch(console.error);
    }, 5 * 60 * 1000); // 5 minutes
};
