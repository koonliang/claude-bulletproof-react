import request from 'supertest';
import { createTestApp } from '../../../tests/utils/app';
import { cleanDatabase, disconnectDatabase, testPrisma } from '../../../tests/utils/database';
import { createMockUser, createMockTeam } from '../../../tests/factories';

describe('Auth Routes', () => {
  const app = createTestApp();

  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        teamName: 'Test Team'
      };

      // Mock the database operations
      const mockTeam = createMockTeam({ name: userData.teamName });

      testPrisma.user.findUnique.mockResolvedValue(null); // No existing user
      testPrisma.team.findFirst.mockResolvedValue(null); // No existing team
      testPrisma.team.create.mockResolvedValue(mockTeam);
      // Let the improved mock handle user.create with select clause

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('jwt');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.firstName).toBe(userData.firstName);
      expect(response.body.user.lastName).toBe(userData.lastName);
      expect(response.body.user.role).toBe('ADMIN'); // First user creates team and becomes admin
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should not register user with existing email', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        teamName: 'Test Team'
      };

      const existingUser = createMockUser({ email: userData.email });

      // Mock first call returns null (no existing user), second call returns existing user
      testPrisma.user.findUnique
        .mockResolvedValueOnce(null) // First registration succeeds
        .mockResolvedValueOnce(existingUser); // Second registration fails

      testPrisma.team.findFirst.mockResolvedValue(null);
      testPrisma.team.create.mockResolvedValue(createMockTeam());
      testPrisma.user.create.mockResolvedValue(existingUser);

      // Register first user
      await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      // Try to register with same email
      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toBe('User already exists');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: '123' // Too short
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const mockUser = createMockUser({
        email: 'john.doe@example.com'
      });

      testPrisma.user.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'john.doe@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('jwt');
      expect(response.body.user.email).toBe('john.doe@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should not login with invalid email', async () => {
      testPrisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should not login with invalid password', async () => {
      const mockUser = createMockUser({
        email: 'john.doe@example.com'
      });

      testPrisma.user.findUnique.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'john.doe@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .expect(200);

      expect(response.body.message).toBe('Logged out successfully');
    });
  });

  describe('GET /auth/me', () => {
    it('should get current user with valid token', async () => {
      const mockUser = createMockUser({
        email: 'john.doe@example.com',
        id: 'test-user-id'
      });

      testPrisma.user.findUnique.mockResolvedValue(mockUser);

      // Create a valid JWT token
      const jwt = require('jsonwebtoken');
      const authToken = jwt.sign(
        { userId: mockUser.id, email: mockUser.email, role: mockUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data.email).toBe('john.doe@example.com');
    });

    it('should not get current user without token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .expect(401);

      expect(response.body.message).toBe('Access token is required');
    });

    it('should not get current user with invalid token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.message).toBe('Invalid token');
    });
  });
});