import { promises as fs } from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");

// Ensure data directory exists
export async function ensureDataDir() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (error) {
    console.error("Error creating data directory:", error);
  }
}

// Read data from a JSON file
export async function readDataFromFile(filename: string) {
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

// Write data to a JSON file
export async function writeDataToFile(filename: string, data: any) {
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

// Find a user by email
export async function findUserByEmail(email: string) {
  const users = await readDataFromFile("users.json");
  return users.find((user: any) => user.email === email);
}

// Add a new user
export async function addUser(user: { id: string; name: string; email: string; password: string }) {
  const users = await readDataFromFile("users.json");
  users.push(user);
  return await writeDataToFile("users.json", users);
}

// Find a user by ID
export async function findUserById(id: string) {
  const users = await readDataFromFile("users.json");
  return users.find((user: any) => user.id === id);
}