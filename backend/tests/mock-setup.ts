// Mock setup that runs before all tests
import { prismaMock } from './mocks/prisma';

// Mock the prisma module globally with proper ES module syntax
jest.mock('../src/config/prisma.js', () => ({
  __esModule: true,
  default: prismaMock,
}));

jest.mock('../src/config/database.js', () => ({
  __esModule: true,
  default: prismaMock,
  prisma: prismaMock,
}));