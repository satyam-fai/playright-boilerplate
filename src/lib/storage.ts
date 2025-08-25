import { promises as fs } from "fs";
import path from "path";

// In-memory storage for serverless environments
const memoryStorage: { [key: string]: any } = {
    users: [
        {
            id: "1",
            name: "Test User",
            email: "test@example.com",
            password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i" // password123
        }
    ],
    resetTokens: []
};

// Check if we're in a serverless environment
const isServerless = () => {
    return process.env.VERCEL === '1' ||
        process.env.NODE_ENV === 'production' ||
        process.env.AWS_LAMBDA_FUNCTION_NAME ||
        process.env.FUNCTIONS_EMULATOR;
};

// File-based storage for development
const dataDir = path.join(process.cwd(), "data");

export async function ensureDataDir() {
    if (isServerless()) return;

    try {
        await fs.mkdir(dataDir, { recursive: true });
    } catch (error) {
        console.error("Error creating data directory:", error);
    }
}

export async function readDataFromFile(filename: string) {
    if (isServerless()) {
        // Return from memory storage
        const key = filename.replace('.json', '');
        return memoryStorage[key] || [];
    }

    try {
        await ensureDataDir();
        const filePath = path.join(dataDir, filename);
        const data = await fs.readFile(filePath, "utf8");
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist, return empty array
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
            return [];
        }
        console.error(`Error reading ${filename}:`, error);
        return [];
    }
}

export async function writeDataToFile(filename: string, data: any) {
    if (isServerless()) {
        // Store in memory
        const key = filename.replace('.json', '');
        memoryStorage[key] = data;
        return true;
    }

    try {
        await ensureDataDir();
        const filePath = path.join(dataDir, filename);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${filename}:`, error);
        return false;
    }
}

// User management functions
export async function findUserByEmail(email: string) {
    const users = await readDataFromFile("users.json");
    return users.find((user: any) => user.email === email);
}

export async function addUser(user: { id: string; name: string; email: string; password: string }) {
    const users = await readDataFromFile("users.json");
    users.push(user);
    return await writeDataToFile("users.json", users);
}

export async function findUserById(id: string) {
    const users = await readDataFromFile("users.json");
    return users.find((user: any) => user.id === id);
}

export async function updateUser(email: string, updates: any) {
    const users = await readDataFromFile("users.json");
    const userIndex = users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());

    if (userIndex === -1) {
        return false;
    }

    users[userIndex] = { ...users[userIndex], ...updates };
    return await writeDataToFile("users.json", users);
}

// Reset token management
export async function saveResetToken(email: string, token: string, expiresAt: Date) {
    const tokens = await readDataFromFile("resetTokens.json");
    tokens[email] = { token, expiresAt: expiresAt.toISOString() };
    return await writeDataToFile("resetTokens.json", tokens);
}

export async function getResetToken(email: string) {
    const tokens = await readDataFromFile("resetTokens.json");
    return tokens[email];
}

export async function removeResetToken(email: string) {
    const tokens = await readDataFromFile("resetTokens.json");
    delete tokens[email];
    return await writeDataToFile("resetTokens.json", tokens);
}

// Initialize default data for serverless environments
export function initializeServerlessData() {
    if (isServerless()) {
        console.log("Initializing serverless storage with default data");
        // The memoryStorage is already initialized with default data
    }
}
