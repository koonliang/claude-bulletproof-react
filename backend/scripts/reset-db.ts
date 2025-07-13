import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDatabase() {
  try {
    console.log('Resetting database...');
    
    // Delete all data in order (to handle foreign key constraints)
    await prisma.comment.deleteMany({});
    await prisma.discussion.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.team.deleteMany({});
    
    console.log('Database reset completed');
  } catch (error) {
    console.error('Database reset failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();