import request from 'supertest';
import { createTestApp } from '../../../tests/utils/app';
import { cleanDatabase, disconnectDatabase, testPrisma } from '../../../tests/utils/database';
import { createMockUser, createMockTeam } from '../../../tests/factories';
import { createTestUser, createTestAdmin, getAuthHeaders } from '../../../tests/utils/auth';

describe('User Routes', () => {
  const app = createTestApp();

  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  describe('GET /users', () => {
    it('should return paginated list of team members', async () => {
      const admin = await createTestAdmin();
      const user1 = await createTestUser({ firstName: 'Alice' }, admin.teamId);
      const user2 = await createTestUser({ firstName: 'Bob' }, admin.teamId);

      const response = await request(app)
        .get('/users')
        .set(getAuthHeaders(admin))
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.data).toHaveLength(3);
      expect(response.body.meta.total).toBe(3);
      expect(response.body.meta.limit).toBe(50);
      expect(response.body.meta.offset).toBe(0);
      expect(response.body.meta.hasMore).toBe(false);
      
      // Verify no password is returned
      response.body.data.forEach((user: any) => {
        expect(user).not.toHaveProperty('password');
      });
    });

    it('should filter users by search query', async () => {
      const admin = await createTestAdmin();
      const user1 = await createTestUser({ firstName: 'Alice', lastName: 'Johnson' }, admin.teamId);

      const response = await request(app)
        .get('/users?search=Alice')
        .set(getAuthHeaders(admin))
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].firstName).toBe('Alice');
    });

    it('should paginate results correctly', async () => {
      const admin = await createTestAdmin();
      await createTestUser({ firstName: 'User1' }, admin.teamId);
      await createTestUser({ firstName: 'User2' }, admin.teamId);

      const response = await request(app)
        .get('/users?limit=2&offset=0')
        .set(getAuthHeaders(admin))
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta.limit).toBe(2);
      expect(response.body.meta.offset).toBe(0);
      expect(response.body.meta.hasMore).toBe(true);
    });

    it('should only return users from same team', async () => {
      const admin = await createTestAdmin();
      const otherTeamAdmin = await createTestAdmin(); // Different team

      const response = await request(app)
        .get('/users')
        .set(getAuthHeaders(admin))
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].teamId).toBe(admin.teamId);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/users')
        .expect(401);
    });
  });

  describe('GET /users/:userId', () => {
    it('should return specific user from same team', async () => {
      const admin = await createTestAdmin();
      const user = await createTestUser({}, admin.teamId);

      const response = await request(app)
        .get(`/users/${user.id}`)
        .set(getAuthHeaders(admin))
        .expect(200);

      expect(response.body.id).toBe(user.id);
      expect(response.body.firstName).toBe(user.firstName);
      expect(response.body.teamId).toBe(admin.teamId);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 404 for non-existent user', async () => {
      const admin = await createTestAdmin();

      await request(app)
        .get('/users/non-existent-id')
        .set(getAuthHeaders(admin))
        .expect(404);
    });

    it('should return 404 for user from different team', async () => {
      const admin = await createTestAdmin();
      const otherTeamUser = await createTestUser(); // Different team

      await request(app)
        .get(`/users/${otherTeamUser.id}`)
        .set(getAuthHeaders(admin))
        .expect(404);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/users/some-user-id')
        .expect(401);
    });
  });

  describe('POST /users (Admin only)', () => {
    it('should allow admin to create new user', async () => {
      const admin = await createTestAdmin();
      const userData = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        password: 'password123',
        role: 'USER' as const,
        bio: 'Test bio'
      };

      const response = await request(app)
        .post('/users')
        .set(getAuthHeaders(admin))
        .send(userData)
        .expect(201);

      expect(response.body.firstName).toBe(userData.firstName);
      expect(response.body.lastName).toBe(userData.lastName);
      expect(response.body.email).toBe(userData.email);
      expect(response.body.role).toBe(userData.role);
      expect(response.body.bio).toBe(userData.bio);
      expect(response.body.teamId).toBe(admin.teamId);
      expect(response.body).not.toHaveProperty('password');
    });

    it('should reject duplicate email', async () => {
      const admin = await createTestAdmin();
      const existingUser = await createTestUser({ email: 'existing@example.com' }, admin.teamId);
      
      const userData = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'existing@example.com',
        password: 'password123',
        role: 'USER' as const
      };

      await request(app)
        .post('/users')
        .set(getAuthHeaders(admin))
        .send(userData)
        .expect(400);
    });

    it('should require admin role', async () => {
      const user = await createTestUser({ role: 'USER' });
      const userData = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        password: 'password123',
        role: 'USER'
      };

      await request(app)
        .post('/users')
        .set(getAuthHeaders(user))
        .send(userData)
        .expect(403);
    });

    it('should require authentication', async () => {
      const userData = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        password: 'password123',
        role: 'USER'
      };

      await request(app)
        .post('/users')
        .send(userData)
        .expect(401);
    });

    it('should validate required fields', async () => {
      const admin = await createTestAdmin();

      await request(app)
        .post('/users')
        .set(getAuthHeaders(admin))
        .send({}) // Empty data
        .expect(400);
    });
  });

  describe('PUT /users/:userId (Admin only)', () => {
    it('should allow admin to update user profile', async () => {
      const admin = await createTestAdmin();
      const user = await createTestUser({}, admin.teamId);
      const updateData = {
        firstName: 'UpdatedFirst',
        lastName: 'UpdatedLast',
        email: 'updated@example.com',
        bio: 'Updated bio'
      };

      const response = await request(app)
        .put(`/users/${user.id}`)
        .set(getAuthHeaders(admin))
        .send(updateData)
        .expect(200);

      expect(response.body.firstName).toBe(updateData.firstName);
      expect(response.body.lastName).toBe(updateData.lastName);
      expect(response.body.email).toBe(updateData.email);
      expect(response.body.bio).toBe(updateData.bio);
    });

    it('should reject email already in use by another user', async () => {
      const admin = await createTestAdmin();
      const user = await createTestUser({}, admin.teamId);
      const existingUser = await createTestUser({ email: 'existing@example.com' }, admin.teamId);
      
      const updateData = {
        firstName: 'UpdatedFirst',
        lastName: 'UpdatedLast',
        email: 'existing@example.com',
        bio: 'Updated bio'
      };

      await request(app)
        .put(`/users/${user.id}`)
        .set(getAuthHeaders(admin))
        .send(updateData)
        .expect(400);
    });

    it('should return 404 for user from different team', async () => {
      const admin = await createTestAdmin();
      const otherTeamUser = await createTestUser(); // Different team
      const updateData = {
        firstName: 'UpdatedFirst',
        lastName: 'UpdatedLast',
        email: 'updated@example.com'
      };

      await request(app)
        .put(`/users/${otherTeamUser.id}`)
        .set(getAuthHeaders(admin))
        .send(updateData)
        .expect(404);
    });

    it('should require admin role', async () => {
      const user = await createTestUser({ role: 'USER' });
      const updateData = {
        firstName: 'UpdatedFirst',
        lastName: 'UpdatedLast',
        email: 'updated@example.com'
      };

      await request(app)
        .put(`/users/${user.id}`)
        .set(getAuthHeaders(user))
        .send(updateData)
        .expect(403);
    });
  });

  describe('PUT /users/:userId/role (Admin only)', () => {
    it('should allow admin to update user role', async () => {
      const admin = await createTestAdmin();
      const user = await createTestUser({ role: 'USER' }, admin.teamId);

      const response = await request(app)
        .put(`/users/${user.id}/role`)
        .set(getAuthHeaders(admin))
        .send({ role: 'ADMIN' })
        .expect(200);

      expect(response.body.role).toBe('ADMIN');
    });

    it('should prevent admin from demoting themselves', async () => {
      const admin = await createTestAdmin();

      await request(app)
        .put(`/users/${admin.id}/role`)
        .set(getAuthHeaders(admin))
        .send({ role: 'USER' })
        .expect(400);
    });

    it('should return 404 for user from different team', async () => {
      const admin = await createTestAdmin();
      const otherTeamUser = await createTestUser(); // Different team

      await request(app)
        .put(`/users/${otherTeamUser.id}/role`)
        .set(getAuthHeaders(admin))
        .send({ role: 'ADMIN' })
        .expect(404);
    });

    it('should require admin role', async () => {
      const user = await createTestUser({ role: 'USER' });

      await request(app)
        .put(`/users/${user.id}/role`)
        .set(getAuthHeaders(user))
        .send({ role: 'ADMIN' })
        .expect(403);
    });

    it('should validate role value', async () => {
      const admin = await createTestAdmin();
      const user = await createTestUser({}, admin.teamId);

      await request(app)
        .put(`/users/${user.id}/role`)
        .set(getAuthHeaders(admin))
        .send({ role: 'INVALID_ROLE' })
        .expect(400);
    });
  });

  describe('PATCH /users/profile (Self-update)', () => {
    it('should allow user to update own profile', async () => {
      const user = await createTestUser();
      const updateData = {
        firstName: 'UpdatedFirst',
        lastName: 'UpdatedLast',
        email: 'updated@example.com',
        bio: 'Updated bio'
      };

      const response = await request(app)
        .patch('/users/profile')
        .set(getAuthHeaders(user))
        .send(updateData)
        .expect(200);

      expect(response.body.firstName).toBe(updateData.firstName);
      expect(response.body.lastName).toBe(updateData.lastName);
      expect(response.body.email).toBe(updateData.email);
      expect(response.body.bio).toBe(updateData.bio);
    });

    it('should reject email already in use', async () => {
      const user = await createTestUser({ email: 'user@example.com' });
      const existingUser = await createTestUser({ email: 'existing@example.com' });
      
      const updateData = {
        firstName: 'UpdatedFirst',
        lastName: 'UpdatedLast',
        email: 'existing@example.com'
      };

      await request(app)
        .patch('/users/profile')
        .set(getAuthHeaders(user))
        .send(updateData)
        .expect(400);
    });

    it('should allow keeping same email', async () => {
      const user = await createTestUser({ email: 'user@example.com' });
      const updateData = {
        firstName: 'UpdatedFirst',
        lastName: 'UpdatedLast',
        email: 'user@example.com' // Same email
      };

      const response = await request(app)
        .patch('/users/profile')
        .set(getAuthHeaders(user))
        .send(updateData)
        .expect(200);

      expect(response.body.email).toBe(updateData.email);
    });

    it('should require authentication', async () => {
      const updateData = {
        firstName: 'UpdatedFirst',
        lastName: 'UpdatedLast',
        email: 'updated@example.com'
      };

      await request(app)
        .patch('/users/profile')
        .send(updateData)
        .expect(401);
    });

    it('should validate required fields', async () => {
      const user = await createTestUser();

      await request(app)
        .patch('/users/profile')
        .set(getAuthHeaders(user))
        .send({ firstName: '' }) // Invalid data
        .expect(400);
    });
  });

  describe('DELETE /users/:userId (Admin only)', () => {
    it('should allow admin to delete user', async () => {
      const admin = await createTestAdmin();
      const user = await createTestUser({}, admin.teamId);

      const response = await request(app)
        .delete(`/users/${user.id}`)
        .set(getAuthHeaders(admin))
        .expect(200);

      expect(response.body.message).toBe('User deleted successfully');
    });

    it('should prevent admin from deleting themselves', async () => {
      const admin = await createTestAdmin();

      await request(app)
        .delete(`/users/${admin.id}`)
        .set(getAuthHeaders(admin))
        .expect(400);
    });

    it('should return 404 for non-existent user', async () => {
      const admin = await createTestAdmin();

      await request(app)
        .delete('/users/non-existent-id')
        .set(getAuthHeaders(admin))
        .expect(404);
    });

    it('should return 404 for user from different team', async () => {
      const admin = await createTestAdmin();
      const otherTeamUser = await createTestUser(); // Different team

      await request(app)
        .delete(`/users/${otherTeamUser.id}`)
        .set(getAuthHeaders(admin))
        .expect(404);
    });

    it('should require admin role', async () => {
      const user = await createTestUser({ role: 'USER' });
      const targetUser = await createTestUser();

      await request(app)
        .delete(`/users/${targetUser.id}`)
        .set(getAuthHeaders(user))
        .expect(403);
    });

    it('should require authentication', async () => {
      await request(app)
        .delete('/users/some-user-id')
        .expect(401);
    });
  });
});