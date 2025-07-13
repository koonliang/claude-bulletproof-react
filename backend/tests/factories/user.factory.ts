import { User, Team } from '@prisma/client';

// Proper bcrypt hash for 'password123'
const DEFAULT_PASSWORD_HASH = '$2b$10$DES.UvmX92caMx00ejNx7uzNtuLHBssxmBIoVj7c1XE5Kz7irov/C';

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'user_123',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  password: DEFAULT_PASSWORD_HASH,
  role: 'USER',
  bio: null,
  teamId: 'team_123',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  ...overrides,
});

export const createMockAdmin = (overrides: Partial<User> = {}): User =>
  createMockUser({
    id: 'admin_123',
    email: 'admin@example.com',
    role: 'ADMIN',
    ...overrides,
  });

export const createMockUserWithTeam = (userOverrides: Partial<User> = {}, teamOverrides: Partial<Team> = {}) => {
  const team = createMockTeam(teamOverrides);
  const user = createMockUser({ teamId: team.id, ...userOverrides });
  return { user, team };
};

export const createMockTeam = (overrides: Partial<Team> = {}): Team => ({
  id: 'team_123',
  name: 'Test Team',
  description: 'A test team for testing purposes',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  ...overrides,
});