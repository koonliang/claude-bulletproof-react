import { Discussion, Comment } from '@prisma/client';

export const createMockDiscussion = (overrides: Partial<Discussion> = {}): Discussion => ({
  id: 'discussion_123',
  title: 'Test Discussion',
  body: 'This is a test discussion body with some content for testing purposes.',
  authorId: 'user_123',
  teamId: 'team_123',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  ...overrides,
});

export const createMockComment = (overrides: Partial<Comment> = {}): Comment => ({
  id: 'comment_123',
  body: 'This is a test comment on a discussion.',
  authorId: 'user_123',
  discussionId: 'discussion_123',
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  ...overrides,
});

export const createMockDiscussionWithComments = (
  discussionOverrides: Partial<Discussion> = {},
  commentOverrides: Partial<Comment>[] = []
) => {
  const discussion = createMockDiscussion(discussionOverrides);
  const comments = commentOverrides.length > 0 
    ? commentOverrides.map(override => createMockComment({ discussionId: discussion.id, ...override }))
    : [createMockComment({ discussionId: discussion.id })];
  
  return { discussion, comments };
};