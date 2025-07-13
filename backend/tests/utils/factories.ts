import { testPrisma } from './database.js';
import { TestUser } from './auth.js';

export const createTestTeam = async (teamData: any = {}) => {
  const defaultTeam = {
    name: `Test Team ${Date.now()}`,
    description: 'A test team for testing purposes',
  };

  const team = { ...defaultTeam, ...teamData };

  return await testPrisma.team.create({
    data: team,
    include: {
      users: true,
      discussions: true,
    },
  });
};

export const createTestDiscussion = async (discussionData: { title?: string; body?: string; authorId: string; teamId: string }) => {
  const defaultDiscussion = {
    title: `Test Discussion ${Date.now()}`,
    body: 'This is a test discussion for testing purposes.',
  };

  const { authorId, teamId, ...restData } = discussionData;
  const discussion = { ...defaultDiscussion, ...restData };

  // Verify the author exists first
  const existingUser = await testPrisma.user.findUnique({
    where: { id: authorId },
  });

  if (!existingUser) {
    throw new Error(`User ${authorId} not found when creating discussion. Test setup issue.`);
  }

  // Verify the team exists
  const existingTeam = await testPrisma.team.findUnique({
    where: { id: teamId },
  });

  if (!existingTeam) {
    throw new Error(`Team ${teamId} not found when creating discussion. Test setup issue.`);
  }

  // Update user to be in the correct team if needed
  if (existingUser.teamId !== teamId) {
    await testPrisma.user.update({
      where: { id: authorId },
      data: { teamId },
    });
  }

  return await testPrisma.discussion.create({
    data: {
      ...discussion,
      authorId,
      teamId,
    },
    include: {
      author: true,
      team: true,
      comments: true,
    },
  });
};

export const createTestComment = async (authorId: string, discussionId: string, commentData: any = {}) => {
  const defaultComment = {
    body: `Test comment ${Date.now()}`,
  };

  const comment = { ...defaultComment, ...commentData };

  // Verify the author exists
  const existingUser = await testPrisma.user.findUnique({
    where: { id: authorId },
  });

  if (!existingUser) {
    throw new Error(`User ${authorId} not found when creating comment. Test setup issue.`);
  }

  // Get discussion to ensure author is in the same team
  const discussion = await testPrisma.discussion.findUnique({
    where: { id: discussionId },
    select: { teamId: true },
  });

  if (!discussion) {
    throw new Error(`Discussion ${discussionId} not found when creating comment. Test setup issue.`);
  }

  // Update user to be in the correct team if needed
  if (existingUser.teamId !== discussion.teamId) {
    await testPrisma.user.update({
      where: { id: authorId },
      data: { teamId: discussion.teamId },
    });
  }

  return await testPrisma.comment.create({
    data: {
      ...comment,
      authorId,
      discussionId,
    },
    include: {
      author: true,
      discussion: true,
    },
  });
};

export const addUserToTeam = async (userId: string, teamId: string) => {
  return await testPrisma.user.update({
    where: { id: userId },
    data: { teamId },
    include: {
      team: true,
    },
  });
};