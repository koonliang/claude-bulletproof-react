import dotenv from 'dotenv';
import path from 'path';

// Set NODE_ENV to test FIRST before loading any env files
process.env.NODE_ENV = 'test';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.test'), override: true });

// Set shorter test timeout since we're using mocks (no real database operations)
jest.setTimeout(10000);

console.log('[Test Setup] Using mocked Prisma client - no database setup required');