import { prismaMock } from '../mocks/prisma';

// Export the mocked Prisma client for tests
export const testPrisma = prismaMock;

// Mock database operations - no actual database cleanup needed
export const cleanDatabase = async () => {
  // No-op: mocks are reset automatically between tests
  console.log('[Mock] Database cleaned (mocks reset)');
};

export const disconnectDatabase = async () => {
  // No-op: no real database connection to disconnect
  console.log('[Mock] Database disconnected (mock cleanup)');
};