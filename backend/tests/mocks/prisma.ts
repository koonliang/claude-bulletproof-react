import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

// Create a deep mock of PrismaClient
export const prismaMock = mockDeep<PrismaClient>();

// Export type for use in tests
export type MockPrisma = DeepMockProxy<PrismaClient>;

// Counter for generating unique IDs and user storage
let idCounter = 1;
const generateId = () => (idCounter++).toString();

// Store created entities to maintain consistency within tests
const userStore: Record<string, any> = {};
const discussionStore: Record<string, any> = {};
const commentStore: Record<string, any> = {};
const teamDiscussions: Record<string, string[]> = {}; // teamId -> discussionIds[]
const discussionComments: Record<string, string[]> = {}; // discussionId -> commentIds[]

// Mock data generators
const generateTeam = (data: any = {}) => ({
  id: generateId(),
  name: data.name || `Test Team ${Date.now()}`,
  description: data.description || 'A test team for testing purposes',
  createdAt: new Date(),
  updatedAt: new Date(),
  users: [],
  discussions: [],
  ...data,
});

const generateUser = (data: any = {}, includePassword = true) => {
  // If an ID is provided, check if we have this user in our store first
  if (data.id && userStore[data.id]) {
    const storedUser = { ...userStore[data.id] };
    if (!includePassword) {
      delete storedUser.password;
    }
    return storedUser;
  }
  
  const user: any = {
    id: generateId(),
    email: data.email || `test-${Date.now()}@example.com`,
    firstName: data.firstName || 'Test',
    lastName: data.lastName || 'User',
    role: data.role || 'USER',
    teamId: data.teamId || generateId(),
    createdAt: new Date(),
    updatedAt: new Date(),
    team: null,
    discussions: [],
    comments: [],
    ...data,
  };
  
  if (includePassword) {
    user.password = data.password || '$2b$10$hashedpassword';
  }
  
  return user;
};

const generateDiscussion = (data: any = {}) => ({
  id: generateId(),
  title: data.title || `Test Discussion ${Date.now()}`,
  body: data.body || 'This is a test discussion for testing purposes.',
  authorId: data.authorId || generateId(),
  teamId: data.teamId || generateId(),
  createdAt: new Date(),
  updatedAt: new Date(),
  author: null,
  team: null,
  comments: [],
  ...data,
});

const generateComment = (data: any = {}) => ({
  id: generateId(),
  body: data.body || `Test comment ${Date.now()}`,
  authorId: data.authorId || generateId(),
  discussionId: data.discussionId || generateId(),
  createdAt: new Date(),
  updatedAt: new Date(),
  author: null,
  discussion: null,
  ...data,
});

// Setup mock implementations
const setupMocks = () => {
  // Team mocks
  prismaMock.team.create.mockImplementation(async ({ data, include }) => {
    const team = generateTeam(data);
    if (include?.users) team.users = [];
    if (include?.discussions) team.discussions = [];
    return team;
  });

  prismaMock.team.findUnique.mockImplementation(async ({ where }) => {
    return generateTeam({ id: where.id });
  });

  // User mocks with state preservation and select support
  prismaMock.user.create.mockImplementation(async ({ data, include, select }) => {
    const user = generateUser(data);
    if (include?.team) user.team = generateTeam({ id: user.teamId });
    
    // Store the user for future findUnique calls
    userStore[user.id] = user;
    userStore[user.email] = user;
    
    // Handle select clause - if select is provided, only return selected fields
    if (select) {
      const selectedUser: any = {};
      Object.keys(select).forEach(key => {
        if (select[key] && user[key] !== undefined) {
          selectedUser[key] = user[key];
        }
      });
      return selectedUser;
    }
    
    return user;
  });

  prismaMock.user.findUnique.mockImplementation(async ({ where, select }) => {
    let user = null;
    
    if (where.id && userStore[where.id]) {
      user = userStore[where.id];
    } else if (where.email && userStore[where.email]) {
      user = userStore[where.email];
    } else {
      // Fallback to generating a user if not found in store
      if (where.id) {
        user = generateUser({ id: where.id });
      } else if (where.email) {
        user = generateUser({ email: where.email });
      } else {
        return null;
      }
    }
    
    // Handle select clause - if select is provided, only return selected fields
    if (select && user) {
      const selectedUser: any = {};
      Object.keys(select).forEach(key => {
        if (select[key] && user[key] !== undefined) {
          selectedUser[key] = user[key];
        }
      });
      return selectedUser;
    }
    
    return user;
  });

  prismaMock.user.update.mockImplementation(async ({ where, data, include }) => {
    const user = generateUser({ id: where.id, ...data });
    if (include?.team) user.team = generateTeam({ id: user.teamId });
    return user;
  });

  // Discussion mocks with state preservation
  prismaMock.discussion.create.mockImplementation(async ({ data, include }) => {
    const discussion = generateDiscussion(data);
    
    // Store the discussion
    discussionStore[discussion.id] = discussion;
    
    // Track discussions by team
    if (!teamDiscussions[discussion.teamId]) {
      teamDiscussions[discussion.teamId] = [];
    }
    teamDiscussions[discussion.teamId].push(discussion.id);
    
    if (include?.author) discussion.author = generateUser({ id: discussion.authorId }, false);
    if (include?.team) discussion.team = generateTeam({ id: discussion.teamId });
    if (include?.comments) discussion.comments = [];
    return discussion;
  });

  prismaMock.discussion.findUnique.mockImplementation(async ({ where }) => {
    if (where.id && discussionStore[where.id]) {
      const discussion = discussionStore[where.id];
      
      // Check teamId if provided in where clause (compound query)
      if (where.teamId && discussion.teamId !== where.teamId) {
        return null; // Discussion exists but not in the specified team
      }
      
      return discussion;
    }
    return null; // Return null if discussion not found (realistic behavior)
  });

  prismaMock.discussion.findFirst.mockImplementation(async ({ where, include }) => {
    // If searching by ID, look in store first
    if (where?.id && discussionStore[where.id]) {
      const discussion = discussionStore[where.id];
      
      // Check teamId if provided in where clause
      if (where.teamId && discussion.teamId !== where.teamId) {
        return null; // Discussion exists but not in the specified team
      }
      
      // Apply includes
      const result = { ...discussion };
      if (include?.author) result.author = generateUser({ id: result.authorId }, false);
      if (include?.team) result.team = generateTeam({ id: result.teamId });
      if (include?.comments) result.comments = [];
      
      return result;
    }
    
    // If searching by teamId only, look through all discussions for that team
    if (where?.teamId && !where.id) {
      const teamId = where.teamId;
      if (teamDiscussions[teamId] && teamDiscussions[teamId].length > 0) {
        const firstDiscussionId = teamDiscussions[teamId][0];
        const discussion = discussionStore[firstDiscussionId];
        if (discussion) {
          const result = { ...discussion };
          if (include?.author) result.author = generateUser({ id: result.authorId }, false);
          if (include?.team) result.team = generateTeam({ id: result.teamId });
          if (include?.comments) result.comments = [];
          return result;
        }
      }
    }
    
    return null; // Return null if discussion not found (realistic behavior)
  });

  prismaMock.discussion.findMany.mockImplementation(async ({ where, include, orderBy, skip, take }) => {
    const teamId = where?.teamId;
    if (!teamId || !teamDiscussions[teamId]) {
      return []; // No discussions for this team
    }
    
    let discussions = teamDiscussions[teamId]
      .map(id => discussionStore[id])
      .filter(Boolean);
    
    // Apply search filter if present
    const hasSearch = where?.OR;
    if (hasSearch) {
      const searchTerms = where.OR?.map((term: any) => term.title?.contains || term.body?.contains).filter(Boolean);
      discussions = discussions.filter(discussion => 
        searchTerms?.some(term => 
          discussion.title.includes(term) || discussion.body.includes(term)
        )
      );
    }

    return discussions.map(discussion => {
      if (include?.author) discussion.author = generateUser({ id: discussion.authorId }, false);
      if (include?.team) discussion.team = generateTeam({ id: discussion.teamId });
      if (include?.comments) discussion.comments = [];
      return discussion;
    });
  });

  prismaMock.discussion.count.mockImplementation(async ({ where }) => {
    const teamId = where?.teamId;
    if (!teamId || !teamDiscussions[teamId]) {
      return 0;
    }
    
    let discussions = teamDiscussions[teamId]
      .map(id => discussionStore[id])
      .filter(Boolean);
    
    // Apply search filter if present
    const hasSearch = where?.OR;
    if (hasSearch) {
      const searchTerms = where.OR?.map((term: any) => term.title?.contains || term.body?.contains).filter(Boolean);
      discussions = discussions.filter(discussion => 
        searchTerms?.some(term => 
          discussion.title.includes(term) || discussion.body.includes(term)
        )
      );
    }
    
    return discussions.length;
  });

  prismaMock.discussion.update.mockImplementation(async ({ where, data, include }) => {
    const discussion = discussionStore[where.id];
    if (!discussion) {
      throw new Error('Discussion not found');
    }
    
    const updatedDiscussion = { ...discussion, ...data, updatedAt: new Date() };
    discussionStore[where.id] = updatedDiscussion;
    
    if (include?.author) updatedDiscussion.author = generateUser({ id: updatedDiscussion.authorId }, false);
    if (include?.team) updatedDiscussion.team = generateTeam({ id: updatedDiscussion.teamId });
    if (include?.comments) updatedDiscussion.comments = [];
    
    return updatedDiscussion;
  });

  prismaMock.discussion.delete.mockImplementation(async ({ where }) => {
    const discussion = discussionStore[where.id];
    if (!discussion) {
      throw new Error('Discussion not found');
    }
    
    // Remove from team discussions
    const teamId = discussion.teamId;
    if (teamDiscussions[teamId]) {
      teamDiscussions[teamId] = teamDiscussions[teamId].filter(id => id !== where.id);
    }
    
    // Remove from store
    delete discussionStore[where.id];
    
    return discussion;
  });

  // Comment mocks with state preservation
  prismaMock.comment.create.mockImplementation(async ({ data, include }) => {
    const comment = generateComment(data);
    
    // Store the comment
    commentStore[comment.id] = comment;
    
    // Track comments by discussion
    if (!discussionComments[comment.discussionId]) {
      discussionComments[comment.discussionId] = [];
    }
    discussionComments[comment.discussionId].push(comment.id);
    
    if (include?.author) comment.author = generateUser({ id: comment.authorId }, false);
    if (include?.discussion) comment.discussion = generateDiscussion({ id: comment.discussionId });
    return comment;
  });

  prismaMock.comment.findUnique.mockImplementation(async ({ where, include }) => {
    if (where.id && commentStore[where.id]) {
      const comment = commentStore[where.id];
      const result = { ...comment };
      
      if (include?.author) result.author = generateUser({ id: comment.authorId }, false);
      if (include?.discussion) {
        // Get the discussion to include its teamId
        const discussion = discussionStore[comment.discussionId];
        if (discussion) {
          result.discussion = { teamId: discussion.teamId };
        } else {
          result.discussion = { teamId: generateId() };
        }
      }
      
      return result;
    }
    return null;
  });

  prismaMock.comment.findMany.mockImplementation(async ({ where, include, orderBy, skip, take }) => {
    const discussionId = where?.discussionId;
    if (!discussionId || !discussionComments[discussionId]) {
      return [];
    }
    
    let comments = discussionComments[discussionId]
      .map(id => commentStore[id])
      .filter(Boolean);
    
    // Apply sorting if specified
    if (orderBy?.createdAt) {
      comments.sort((a, b) => {
        if (orderBy.createdAt === 'asc') {
          return a.createdAt.getTime() - b.createdAt.getTime();
        }
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
    }
    
    // Apply pagination with skip and take
    const startIndex = skip || 0;
    const endIndex = take ? startIndex + take : undefined;
    comments = comments.slice(startIndex, endIndex);
    
    return comments.map(comment => {
      const result = { ...comment };
      if (include?.author) result.author = generateUser({ id: comment.authorId }, false);
      if (include?.discussion) result.discussion = generateDiscussion({ id: comment.discussionId });
      return result;
    });
  });

  prismaMock.comment.count.mockImplementation(async ({ where }) => {
    const discussionId = where?.discussionId;
    if (!discussionId || !discussionComments[discussionId]) {
      return 0;
    }
    return discussionComments[discussionId].length;
  });

  prismaMock.comment.delete.mockImplementation(async ({ where }) => {
    const comment = commentStore[where.id];
    if (!comment) {
      throw new Error('Comment not found');
    }
    
    // Remove from discussion comments
    const discussionId = comment.discussionId;
    if (discussionComments[discussionId]) {
      discussionComments[discussionId] = discussionComments[discussionId].filter(id => id !== where.id);
    }
    
    // Remove from store
    delete commentStore[where.id];
    
    return comment;
  });
};

// Reset mocks and setup before each test
beforeEach(() => {
  mockReset(prismaMock);
  // Clear all stores for test isolation
  Object.keys(userStore).forEach(key => delete userStore[key]);
  Object.keys(discussionStore).forEach(key => delete discussionStore[key]);
  Object.keys(commentStore).forEach(key => delete commentStore[key]);
  Object.keys(teamDiscussions).forEach(key => delete teamDiscussions[key]);
  Object.keys(discussionComments).forEach(key => delete discussionComments[key]);
  idCounter = 1;
  setupMocks();
});