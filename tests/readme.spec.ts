/**
 * README validation tests
 *
 * Framework: The test suite is written to be compatible with Vitest or Jest.
 * If your project uses Vitest, keep the import below. If using Jest with globals,
 * you may remove the import line safely. We prefer using the project's existing framework.
 */
import { describe, it, expect } from 'vitest'; // Safe for Vitest; Jest will ignore if transformed or can be removed if needed.

import fs from 'fs';
import path from 'path';

function readReadme(): string {
  // Typical locations: README.md at repo root. Adjust if your project keeps it elsewhere.
  const candidates = [
    'README.md',
    'Readme.md',
    'readme.md',
    path.join('docs', 'README.md'),
  ];
  for (const p of candidates) {
    const abs = path.resolve(process.cwd(), p);
    if (fs.existsSync(abs)) {
      return fs.readFileSync(abs, 'utf-8');
    }
  }
  throw new Error('README file not found in expected locations.');
}

function hasHeading(md: string, level: number, text: string): boolean {
  const lines = md.split(/\r?\n/);
  const prefix = '#'.repeat(level);
  return lines.some((line) => {
    const trimmed = line.trim();
    if (!trimmed.startsWith(prefix)) return false;
    const rest = trimmed.slice(prefix.length).trim();
    return rest === text;
  });
}

function hasListItem(md: string, text: string): boolean {
  const lines = md.split(/\r?\n/);
  return lines.some((line) => {
    const trimmed = line.trim();
    if (trimmed.length < 2) return false;
    const firstChar = trimmed[0];
    if (!['-', '*', '+'].includes(firstChar) || trimmed[1] !== ' ') return false;
    const rest = trimmed.slice(2).trim();
    return rest === text;
  });
}

function hasCodeFence(md: string, lang?: string): boolean {
  // Look for ``` or ```lang fences
  const re = lang
    ? new RegExp("```\\s*" + lang + "\\b[\\s\\S]*?```", "m")
    : /```[\s\S]*?```/m;
  return re.test(md);
}

function hasApiRoute(md: string, method: string, route: string, note?: string): boolean {
  const parts = [`\\\`${method}\\s+${route.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\\``];
  if (note) parts.push(note.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = new RegExp(parts.join('.*'), 'i');
  return re.test(md);
}

describe('README.md structure and content', () => {
  const md = readReadme();

  it('contains the top-level "Todo App" heading', () => {
    expect(hasHeading(md, 1, 'Todo App')).toBe(true);
  });

  it('documents Features section with key capabilities', () => {
    expect(hasHeading(md, 2, 'Features')).toBe(true);
    const features = [
      'User authentication (login/registration)',
      'Todo management (create, read, update, delete)',
      'Data persistence using JSON files',
      'Responsive design with Tailwind CSS',
      'Animations and transitions for enhanced UX',
      'TypeScript for type safety',
    ];
    for (const item of features) {
      expect(hasListItem(md, item)).toBe(true);
    }
  });

  it('includes Getting Started with Prerequisites and Installation steps', () => {
    expect(hasHeading(md, 2, 'Getting Started')).toBe(true);
    expect(hasHeading(md, 3, 'Prerequisites')).toBe(true);
    expect(hasListItem(md, 'Node.js (v14 or later)')).toBe(true);
    expect(hasListItem(md, 'npm or yarn')).toBe(true);

    expect(hasHeading(md, 3, 'Installation')).toBe(true);
    // Ensure code fences exist for bash commands
    expect(hasCodeFence(md, 'bash')).toBe(true);
  });

  it('documents Running the Application with dev command and URL', () => {
    expect(hasHeading(md, 3, 'Running the Application')).toBe(true);
    expect(/npm\s+run\s+dev/.test(md)).toBe(true);
    expect(/http:\/\/localhost:3000/.test(md)).toBe(true);
  });

  it('details UI Enhancements with modern UI items (glassmorphism, gradients, dark mode, etc.)', () => {
    expect(hasHeading(md, 2, 'UI Enhancements')).toBe(true);
    const uiItems = [
      'Glassmorphism design elements',
      'Gradient text and backgrounds',
      'Smooth animations and transitions',
      'Responsive layout for all device sizes',
      'Dark mode support',
      'Card-based design with hover effects',
      'Blob animations in the hero section',
    ];
    for (const item of uiItems) {
      expect(hasListItem(md, item)).toBe(true);
    }
  });

  it('includes Project Structure code block with key directories', () => {
    expect(hasHeading(md, 2, 'Project Structure')).toBe(true);
    // Verify presence of key folders in the tree
    const required = [
      /src\//i,
      /src\/app\//i,
      /src\/app\/api\//i,
      /src\/app\/dashboard\//i,
      /src\/app\/login\//i,
      /src\/app\/register\//i,
      /src\/app\/layout\.tsx/i,
      /src\/app\/page\.tsx/i,
      /src\/components\//i,
      /src\/lib\//i,
      /src\/styles\//i,
      /src\/types\//i,
      /data\//i,
      /public\//i,
      /package\.json/i,
    ];
    for (const pattern of required) {
      expect(pattern.test(md)).toBe(true);
    }
    // Ensure there is at least one code fence showing the structure
    expect(hasCodeFence(md)).toBe(true);
  });

  it('documents Data Persistence with users.json and todos.json', () => {
    expect(hasHeading(md, 3, 'Data Persistence')).toBe(true);
    expect(/`users\.json`/.test(md)).toBe(true);
    expect(/`todos\.json`/.test(md)).toBe(true);
  });

  it('documents Authentication flow including localStorage mention', () => {
    expect(hasHeading(md, 3, 'Authentication')).toBe(true);
    const authPoints = [
      'Users can register for a new account',
      'Registered users can log in to access their dashboard',
      'User sessions are managed using localStorage',
    ];
    for (const p of authPoints) {
      expect(new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(md)).toBe(true);
    }
  });

  it('lists API Routes for auth and todos endpoints with correct HTTP methods', () => {
    expect(hasHeading(md, 3, 'API Routes')).toBe(true);
    expect(hasApiRoute(md, 'POST', '/api/auth/register', 'Register a new user')).toBe(true);
    expect(hasApiRoute(md, 'POST', '/api/auth/login', 'Authenticate a user')).toBe(true);
    expect(hasApiRoute(md, 'GET', '/api/todos\\?userId=\\.\\.\\.', 'Get all todos for a user')).toBe(true);
    expect(hasApiRoute(md, 'POST', '/api/todos', 'Create a new todo')).toBe(true);
    expect(hasApiRoute(md, 'PUT', '/api/todos/\\[id\\]', 'Update a todo')).toBe(true);
    expect(hasApiRoute(md, 'DELETE', '/api/todos/\\[id\\]', 'Delete a todo')).toBe(true);
  });

  it('includes Technologies Used with Next.js, TypeScript, Tailwind CSS, bcryptjs, uuid', () => {
    expect(hasHeading(md, 3, 'Technologies Used')).toBe(true);
    const tech = [
      /\[Next\.js\]\(https?:\/\/nextjs\.org\/\)/i,
      /\[TypeScript\]\(https?:\/\/www\.typescriptlang\.org\/\)/i,
      /\[Tailwind CSS\]\(https?:\/\/tailwindcss\.com\/\)/i,
      /\[bcryptjs\]\(https?:\/\/www\.npmjs\.com\/package\/bcryptjs\)/i,
      /\[uuid\]\(https?:\/\/www\.npmjs\.com\/package\/uuid\)/i,
    ];
    for (const pattern of tech) {
      expect(pattern.test(md)).toBe(true);
    }
  });

  it('describes contributing workflow and mentions MIT License', () => {
    expect(hasHeading(md, 2, 'Contributing')).toBe(true);
    expect(/MIT License/i.test(md)).toBe(true);
  });
});

describe('README.md basic link and fence sanity checks', () => {
  const md = readReadme();

  it('has no empty markdown links like []() or [text]()', () => {
    // Detect []() or [anything]()
    const emptyLinkRe = /\[[^\]]*]\(\s*\)/g;
    expect(emptyLinkRe.test(md)).toBe(false);
  });

  it('has balanced triple backtick fences', () => {
    const fences = (md.match(/```/g) || []).length;
    expect(fences % 2).toBe(0);
  });
});