// Re-export the unified Prisma client
// This ensures backward compatibility while using the correct client
import prismaClient from './prisma.js';

export const prisma = prismaClient;
export default prismaClient;