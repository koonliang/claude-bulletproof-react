// Export all factory functions for easy importing
export * from './user.factory';
export * from './discussion.factory';

// Re-export common types
export type { User, Team, Discussion, Comment } from '@prisma/client';