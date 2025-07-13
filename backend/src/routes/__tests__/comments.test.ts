import request from 'supertest';
import { createTestApp } from '../../../tests/utils/app';
import { cleanDatabase, testPrisma, disconnectDatabase } from '../../../tests/utils/database';
import { createTestUser, createTestAdmin, getAuthHeaders } from '../../../tests/utils/auth';
import { createTestTeam, createTestDiscussion, createTestComment } from '../../../tests/utils/factories';

describe('Comment Routes', () => {
  const app = createTestApp();

  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectDatabase();
  });

  describe('GET /comments', () => {
    it('should get comments for authenticated user with valid discussionId', async () => {
      const team = await createTestTeam();
      const user = await createTestUser({}, team.id);
      const authHeaders = getAuthHeaders(user);

      const discussion = await createTestDiscussion({
        title: 'Test Discussion',
        body: 'Test Body',
        authorId: user.id,
        teamId: team.id,
      });

      await createTestComment(user.id, discussion.id, {
        body: 'Test comment content'
      });

      const response = await request(app)
        .get(`/comments?discussionId=${discussion.id}`)
        .set(authHeaders)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].body).toBe('Test comment content');
      expect(response.body.data[0].author).toBeDefined();
      expect(response.body.data[0].author).not.toHaveProperty('password');
      expect(response.body.meta.total).toBe(1);
    });

    it('should return paginated comments with correct metadata', async () => {
      const team = await createTestTeam();
      const user = await createTestUser({}, team.id);
      const authHeaders = getAuthHeaders(user);

      const discussion = await createTestDiscussion({
        title: 'Test Discussion',
        body: 'Test Body',
        authorId: user.id,
        teamId: team.id,
      });

      // Create multiple comments
      for (let i = 1; i <= 15; i++) {
        await createTestComment(user.id, discussion.id, {
          body: `Comment ${i}`
        });
      }

      const response = await request(app)
        .get(`/comments?discussionId=${discussion.id}&page=2`)
        .set(authHeaders)
        .expect(200);

      expect(response.body.data).toHaveLength(5); // Should get 5 comments on page 2 (10 per page default)
      expect(response.body.meta.page).toBe(2);
      expect(response.body.meta.total).toBe(15);
      expect(response.body.meta.totalPages).toBe(2);
    });

    it('should return empty array when discussion has no comments', async () => {
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
        .get(`/comments?discussionId=${discussion.id}`)
        .set(authHeaders)
        .expect(200);

      expect(response.body.data).toHaveLength(0);
      expect(response.body.meta.total).toBe(0);
    });

    it('should not get comments without authentication', async () => {
      const response = await request(app)
        .get('/comments?discussionId=test-id')
        .expect(401);

      expect(response.body.message).toBe('Access token is required');
    });

    it('should require discussionId query parameter', async () => {
      const team = await createTestTeam();
      const user = await createTestUser({}, team.id);
      const authHeaders = getAuthHeaders(user);

      const response = await request(app)
        .get('/comments')
        .set(authHeaders)
        .expect(400);

      expect(response.body.message).toBe('Discussion ID is required');
    });

    it('should return 404 for non-existent discussion', async () => {
      const team = await createTestTeam();
      const user = await createTestUser({}, team.id);
      const authHeaders = getAuthHeaders(user);

      const response = await request(app)
        .get('/comments?discussionId=non-existent-id')
        .set(authHeaders)
        .expect(404);

      expect(response.body.message).toBe('Discussion not found');
    });

    it('should return 404 for discussion not in user team', async () => {
      const team1 = await createTestTeam();
      const team2 = await createTestTeam();
      const user1 = await createTestUser({}, team1.id);
      const user2 = await createTestUser({}, team2.id);
      const authHeaders = getAuthHeaders(user1);

      const discussion = await createTestDiscussion({
        title: 'Team 2 Discussion',
        body: 'Team 2 Body',
        authorId: user2.id,
        teamId: team2.id,
      });

      const response = await request(app)
        .get(`/comments?discussionId=${discussion.id}`)
        .set(authHeaders)
        .expect(404);

      expect(response.body.message).toBe('Discussion not found');
    });
  });

  describe('POST /comments', () => {
    it('should create comment successfully', async () => {
      const team = await createTestTeam();
      const user = await createTestUser({}, team.id);
      const authHeaders = getAuthHeaders(user);

      const discussion = await createTestDiscussion({
        title: 'Test Discussion',
        body: 'Test Body',
        authorId: user.id,
        teamId: team.id,
      });

      const commentData = {
        body: 'This is a test comment',
        discussionId: discussion.id,
      };

      const response = await request(app)
        .post('/comments')
        .set(authHeaders)
        .send(commentData)
        .expect(201);

      expect(response.body.body).toBe(commentData.body);
      expect(response.body.discussionId).toBe(discussion.id);
      expect(response.body.authorId).toBe(user.id);
      expect(response.body.author).toBeDefined();
      expect(response.body.author.email).toBe(user.email);
      expect(response.body.author).not.toHaveProperty('password');
    });

    it('should not create comment without authentication', async () => {
      const commentData = {
        body: 'This is a test comment',
        discussionId: 'test-id',
      };

      const response = await request(app)
        .post('/comments')
        .send(commentData)
        .expect(401);

      expect(response.body.message).toBe('Access token is required');
    });

    it('should validate required fields', async () => {
      const team = await createTestTeam();
      const user = await createTestUser({}, team.id);
      const authHeaders = getAuthHeaders(user);

      const response = await request(app)
        .post('/comments')
        .set(authHeaders)
        .send({
          body: '', // Empty body
          discussionId: '', // Empty discussionId
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should require body field', async () => {
      const team = await createTestTeam();
      const user = await createTestUser({}, team.id);
      const authHeaders = getAuthHeaders(user);

      const response = await request(app)
        .post('/comments')
        .set(authHeaders)
        .send({
          discussionId: 'test-id',
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should require discussionId field', async () => {
      const team = await createTestTeam();
      const user = await createTestUser({}, team.id);
      const authHeaders = getAuthHeaders(user);

      const response = await request(app)
        .post('/comments')
        .set(authHeaders)
        .send({
          body: 'Test comment',
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should return 404 for non-existent discussion', async () => {
      const team = await createTestTeam();
      const user = await createTestUser({}, team.id);
      const authHeaders = getAuthHeaders(user);

      const commentData = {
        body: 'This is a test comment',
        discussionId: 'non-existent-id',
      };

      const response = await request(app)
        .post('/comments')
        .set(authHeaders)
        .send(commentData)
        .expect(404);

      expect(response.body.message).toBe('Discussion not found');
    });

    it('should return 404 for discussion not in user team', async () => {
      const team1 = await createTestTeam();
      const team2 = await createTestTeam();
      const user1 = await createTestUser({}, team1.id);
      const user2 = await createTestUser({}, team2.id);
      const authHeaders = getAuthHeaders(user1);

      const discussion = await createTestDiscussion({
        title: 'Team 2 Discussion',
        body: 'Team 2 Body',
        authorId: user2.id,
        teamId: team2.id,
      });

      const commentData = {
        body: 'This should fail',
        discussionId: discussion.id,
      };

      const response = await request(app)
        .post('/comments')
        .set(authHeaders)
        .send(commentData)
        .expect(404);

      expect(response.body.message).toBe('Discussion not found');
    });
  });

  describe('DELETE /comments/:commentId', () => {
    it('should allow author to delete own comment', async () => {
      const team = await createTestTeam();
      const user = await createTestUser({}, team.id);
      const authHeaders = getAuthHeaders(user);

      const discussion = await createTestDiscussion({
        title: 'Test Discussion',
        body: 'Test Body',
        authorId: user.id,
        teamId: team.id,
      });

      const comment = await createTestComment(user.id, discussion.id, {
        body: 'Comment to delete'
      });

      const response = await request(app)
        .delete(`/comments/${comment.id}`)
        .set(authHeaders)
        .expect(200);

      expect(response.body.message).toBe('Comment deleted successfully');

      // Verify comment is deleted
      const deletedComment = await testPrisma.comment.findUnique({
        where: { id: comment.id }
      });
      expect(deletedComment).toBeNull();
    });

    it('should allow admin to delete any comment in team', async () => {
      const team = await createTestTeam();
      const user = await createTestUser({}, team.id);
      const admin = await createTestAdmin(team.id);
      const adminAuthHeaders = getAuthHeaders(admin);

      const discussion = await createTestDiscussion({
        title: 'Test Discussion',
        body: 'Test Body',
        authorId: user.id,
        teamId: team.id,
      });

      const comment = await createTestComment(user.id, discussion.id, {
        body: 'Comment to delete by admin'
      });

      const response = await request(app)
        .delete(`/comments/${comment.id}`)
        .set(adminAuthHeaders)
        .expect(200);

      expect(response.body.message).toBe('Comment deleted successfully');

      // Verify comment is deleted
      const deletedComment = await testPrisma.comment.findUnique({
        where: { id: comment.id }
      });
      expect(deletedComment).toBeNull();
    });

    it('should not delete comment without authentication', async () => {
      const response = await request(app)
        .delete('/comments/test-comment-id')
        .expect(401);

      expect(response.body.message).toBe('Access token is required');
    });

    it('should return 404 for non-existent comment', async () => {
      const team = await createTestTeam();
      const user = await createTestUser({}, team.id);
      const authHeaders = getAuthHeaders(user);

      const response = await request(app)
        .delete('/comments/non-existent-id')
        .set(authHeaders)
        .expect(404);

      expect(response.body.message).toBe('Comment not found');
    });

    it('should return 404 for comment not in user team', async () => {
      const team1 = await createTestTeam();
      const team2 = await createTestTeam();
      const user1 = await createTestUser({}, team1.id);
      const user2 = await createTestUser({}, team2.id);
      const authHeaders = getAuthHeaders(user1);

      const discussion = await createTestDiscussion({
        title: 'Team 2 Discussion',
        body: 'Team 2 Body',
        authorId: user2.id,
        teamId: team2.id,
      });

      const comment = await createTestComment(user2.id, discussion.id, {
        body: 'Team 2 comment'
      });

      const response = await request(app)
        .delete(`/comments/${comment.id}`)
        .set(authHeaders)
        .expect(404);

      expect(response.body.message).toBe('Comment not found');
    });

    it('should return 403 when regular user tries to delete other user comment', async () => {
      const team = await createTestTeam();
      const user1 = await createTestUser({}, team.id);
      const user2 = await createTestUser({}, team.id);
      const authHeaders = getAuthHeaders(user1);

      const discussion = await createTestDiscussion({
        title: 'Test Discussion',
        body: 'Test Body',
        authorId: user1.id,
        teamId: team.id,
      });

      const comment = await createTestComment(user2.id, discussion.id, {
        body: 'Comment by user2'
      });

      const response = await request(app)
        .delete(`/comments/${comment.id}`)
        .set(authHeaders)
        .expect(403);

      expect(response.body.message).toBe('Not authorized to delete this comment');
    });
  });
});