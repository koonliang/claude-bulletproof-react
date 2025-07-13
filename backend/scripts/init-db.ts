import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function initDatabase() {
  try {
    console.log('Initializing database...');
    
    // Test database connection
    await prisma.$connect();
    console.log('Database connected successfully');
    
    // Run migrations
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

initDatabase();