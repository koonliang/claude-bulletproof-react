import request from 'supertest';
import { createTestApp } from '../../../tests/utils/app';
import { cleanDatabase, testPrisma, disconnectDatabase } from '../../../tests/utils/database';
import { createTestUser, createTestAdmin, getAuthHeaders } from '../../../tests/utils/auth';
import { createTestTeam, createTestDiscussion } from '../../../tests/utils/factories';

describe('Discussion Routes', () => {
  const app = createTestApp();

  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  describe('GET /discussions', () => {
    it('should get discussions for authenticated user', async () => {
      const team = await createTestTeam();
      const user = await createTestUser({}, team.id);
      const authHeaders = getAuthHeaders(user);

      // Create a test discussion
      await createTestDiscussion({
        title: 'Test Discussion',
        body: 'Test Body',
        authorId: user.id,
        teamId: team.id,
      });

      const response = await request(app)
        .get('/discussions')
        .set(authHeaders)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('Test Discussion');
      expect(response.body.data[0].author).toBeDefined();
      expect(response.body.data[0].author).not.toHaveProperty('password');
    });

    it('should return empty array when no discussions exist', async () => {
      const team = await createTestTeam();
      const user = await createTestUser({}, team.id);
      const authHeaders = getAuthHeaders(user);

      const response = await request(app)
        .get('/discussions')
        .set(authHeaders)
        .expect(200);

      expect(response.body.data).toHaveLength(0);
      expect(response.body.meta.total).toBe(0);
    });

    it('should not get discussions without authentication', async () => {
      const response = await request(app)
        .get('/discussions')
        .expect(401);

      expect(response.body.message).toBe('Access token is required');
    });

    it('should filter discussions by search query', async () => {
      const team = await createTestTeam();
      const user = await createTestUser({}, team.id);
      const authHeaders = getAuthHeaders(user);

      // Create multiple discussions
      await createTestDiscussion({
        title: 'React Discussion',
        body: 'About React framework',
        authorId: user.id,
        teamId: team.id,
      });

      await createTestDiscussion({
        title: 'Vue Discussion',
        body: 'About Vue framework',
        authorId: user.id,
        teamId: team.id,
      });

      const response = await request(app)
        .get('/discussions?search=React')
        .set(authHeaders)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('React Discussion');
    });
  });

  describe('GET /discussions/:discussionId', () => {
    it('should get single discussion', async () => {
      const team = await createTestTeam();
      const user = await createTestUser({}, team.id);
      const authHeaders = getAuthHeaders(user);

      const discussion = await createTestDiscussion({
        title: 'Test Discussion',
        body: 'Test Body',
        authorId: user.id,
        teamId: team.id,
      });

      const response = await request(app)
        .get(`/discussions/${discussion.id}`)
        .set(authHeaders)
        .expect(200);

      expect(response.body.data.id).toBe(discussion.id);
      expect(response.body.data.title).toBe('Test Discussion');
      expect(response.body.data.author).toBeDefined();
    });

    it('should return 404 for non-existent discussion', async () => {
      const team = await createTestTeam();
      const user = await createTestUser({}, team.id);
      const authHeaders = getAuthHeaders(user);

      const response = await request(app)
        .get('/discussions/non-existent-id')
        .set(authHeaders)
        .expect(404);

      expect(response.body.message).toBe('Discussion not found');
    });
  });

  describe('POST /discussions', () => {
    it('should create discussion as admin', async () => {
      const team = await createTestTeam();
      const admin = await createTestAdmin(team.id);
      const authHeaders = getAuthHeaders(admin);

      const discussionData = {
        title: 'New Discussion',
        body: 'Discussion content'
      };

      const response = await request(app)
        .post('/discussions')
        .set(authHeaders)
        .send(discussionData)
        .expect(201);

      expect(response.body.title).toBe(discussionData.title);
      expect(response.body.body).toBe(discussionData.body);
      expect(response.body.authorId).toBe(admin.id);
      expect(response.body.teamId).toBe(team.id);
    });

    it('should not create discussion as regular user', async () => {
      const team = await createTestTeam();
      const user = await createTestUser({}, team.id);
      const authHeaders = getAuthHeaders(user);

      const discussionData = {
        title: 'New Discussion',
        body: 'Discussion content'
      };

      const response = await request(app)
        .post('/discussions')
        .set(authHeaders)
        .send(discussionData)
        .expect(403);

      expect(response.body.message).toBe('Admin access required');
    });

    it('should validate required fields', async () => {
      const team = await createTestTeam();
      const admin = await createTestAdmin(team.id);
      const authHeaders = getAuthHeaders(admin);

      const response = await request(app)
        .post('/discussions')
        .set(authHeaders)
        .send({
          title: '', // Empty title
          body: ''   // Empty body
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('PATCH /discussions/:discussionId', () => {
    it('should update discussion as admin', async () => {
      const team = await createTestTeam();
      const admin = await createTestAdmin(team.id);
      const authHeaders = getAuthHeaders(admin);

      const discussion = await createTestDiscussion({
        title: 'Original Title',
        body: 'Original Body',
        authorId: admin.id,
        teamId: team.id,
      });

      const updateData = {
        title: 'Updated Title',
        body: 'Updated Body'
      };

      const response = await request(app)
        .patch(`/discussions/${discussion.id}`)
        .set(authHeaders)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe(updateData.title);
      expect(response.body.body).toBe(updateData.body);
    });

    it('should not update discussion as regular user', async () => {
      const team = await createTestTeam();
      const admin = await createTestAdmin(team.id);
      const user = await createTestUser({}, team.id);
      const userAuthHeaders = getAuthHeaders(user);

      const discussion = await createTestDiscussion({
        title: 'Original Title',
        body: 'Original Body',
        authorId: admin.id,
        teamId: team.id,
      });

      const response = await request(app)
        .patch(`/discussions/${discussion.id}`)
        .set(userAuthHeaders)
        .send({ title: 'Updated Title', body: 'Updated Body' })
        .expect(403);

      expect(response.body.message).toBe('Admin access required');
    });
  });

  describe('DELETE /discussions/:discussionId', () => {
    it('should delete discussion as admin', async () => {
      const team = await createTestTeam();
      const admin = await createTestAdmin(team.id);
      const authHeaders = getAuthHeaders(admin);

      const discussion = await createTestDiscussion({
        title: 'To Delete',
        body: 'Will be deleted',
        authorId: admin.id,
        teamId: team.id,
      });

      const response = await request(app)
        .delete(`/discussions/${discussion.id}`)
        .set(authHeaders)
        .expect(200);

      expect(response.body.message).toBe('Discussion deleted successfully');

      // Verify discussion is deleted
      const deletedDiscussion = await testPrisma.discussion.findUnique({
        where: { id: discussion.id }
      });
      expect(deletedDiscussion).toBeNull();
    });

    it('should not delete discussion as regular user', async () => {
      const team = await createTestTeam();
      const admin = await createTestAdmin(team.id);
      const user = await createTestUser({}, team.id);
      const userAuthHeaders = getAuthHeaders(user);

      const discussion = await createTestDiscussion({
        title: 'To Delete',
        body: 'Should not be deleted',
        authorId: admin.id,
        teamId: team.id,
      });

      const response = await request(app)
        .delete(`/discussions/${discussion.id}`)
        .set(userAuthHeaders)
        .expect(403);

      expect(response.body.message).toBe('Admin access required');
    });

    it('should return 404 for non-existent discussion', async () => {
      const team = await createTestTeam();
      const admin = await createTestAdmin(team.id);
      const authHeaders = getAuthHeaders(admin);

      const response = await request(app)
        .delete('/discussions/non-existent-id')
        .set(authHeaders)
        .expect(404);

      expect(response.body.message).toBe('Discussion not found');
    });
  });
});