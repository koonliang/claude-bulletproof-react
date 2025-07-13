import { PrismaClient } from '@prisma/client';

// Simplified Prisma client configuration for MySQL
// Testing uses mocked Prisma client instead of real database

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma client with MySQL configuration
const createPrismaClient = () => {
  console.log('[Prisma] Using MySQL database');
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['info', 'warn', 'error'] : ['error'],
  });
};

// Use global instance to prevent multiple clients in development
const prismaClient = globalForPrisma.prisma ?? createPrismaClient();

// Store the client globally in non-production environments
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prismaClient;
}

export default prismaClient;
