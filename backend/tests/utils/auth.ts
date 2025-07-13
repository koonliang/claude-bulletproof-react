import { generateToken } from '../../src/utils/auth.js';
import { testPrisma } from './database.js';
import { hashPassword } from '../../src/utils/auth.js';

export interface TestUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'USER';
  password?: string;
}

export const createTestUser = async (userData: Partial<TestUser> = {}, teamId?: string): Promise<TestUser> => {
  const defaultUser = {
    email: `test-${Date.now()}-${Math.random().toString(36).substr(2, 5)}@example.com`,
    firstName: 'Test',
    lastName: 'User',
    role: 'USER' as const,
    password: 'password123',
  };

  const user = { ...defaultUser, ...userData };
  const hashedPassword = await hashPassword(user.password);

  // Create a team first if user doesn't have one and no teamId provided
  let finalTeamId = teamId;
  if (!finalTeamId) {
    const team = await testPrisma.team.create({
      data: {
        name: `${user.firstName} Team ${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        description: 'Test team',
      },
    });
    finalTeamId = team.id;
  } else {
    // Verify the team exists if teamId was provided
    const existingTeam = await testPrisma.team.findUnique({
      where: { id: finalTeamId },
    });
    if (!existingTeam) {
      throw new Error(`Team with id ${finalTeamId} not found when creating user`);
    }
  }

  const createdUser = await testPrisma.user.create({
    data: {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      password: hashedPassword,
      teamId: finalTeamId,
    },
  });

  return {
    ...createdUser,
    password: user.password,
  };
};

export const generateAuthToken = (user: TestUser): string => {
  return generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
};

export const createTestAdmin = async (teamId?: string): Promise<TestUser> => {
  return createTestUser({ role: 'ADMIN' }, teamId);
};

export const getAuthHeaders = (user: TestUser) => {
  const token = generateAuthToken(user);
  return {
    Authorization: `Bearer ${token}`,
  };
};