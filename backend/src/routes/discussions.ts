import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, createError } from '../middleware/error-handler.js';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';
import prisma from '../config/database.js';

const router = Router();

const discussionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Body is required'),
});

// Get discussions with pagination and search
router.get('/', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const search = req.query.search as string || '';
  const sortBy = req.query.sortBy as string || 'createdAt';
  const sortOrder = req.query.sortOrder as string || 'desc';
  
  const limit = 10;
  const skip = (page - 1) * limit;

  // Build where clause
  const whereClause = {
    teamId: req.user!.teamId,
    ...(search && {
      OR: [
        { title: { contains: search } },
        { body: { contains: search } },
      ],
    }),
  };

  // Build order by clause  
  const orderBy = sortBy === 'title' 
    ? { title: sortOrder as 'asc' | 'desc' }
    : { createdAt: sortOrder as 'asc' | 'desc' };

  // Get total count
  const total = await prisma.discussion.count({
    where: whereClause,
  });

  // Get discussions
  const discussions = await prisma.discussion.findMany({
    where: whereClause,
    orderBy,
    skip,
    take: limit,
    include: {
      author: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          teamId: true,
          bio: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  const totalPages = Math.ceil(total / limit);

  res.json({
    data: discussions,
    meta: {
      page,
      total,
      totalPages,
    },
  });
}));

// Get single discussion
router.get('/:discussionId', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { discussionId } = req.params;

  const discussion = await prisma.discussion.findFirst({
    where: {
      id: discussionId,
      teamId: req.user!.teamId,
    },
    include: {
      author: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          teamId: true,
          bio: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!discussion) {
    throw createError('Discussion not found', 404);
  }

  res.json({ data: discussion });
}));

// Create discussion (admin only)
router.post('/', authenticate, requireAdmin, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const data = discussionSchema.parse(req.body);

  const discussion = await prisma.discussion.create({
    data: {
      ...data,
      authorId: req.user!.id,
      teamId: req.user!.teamId,
    },
    include: {
      author: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          teamId: true,
          bio: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  res.status(201).json(discussion);
}));

// Update discussion (admin only)
router.patch('/:discussionId', authenticate, requireAdmin, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { discussionId } = req.params;
  const data = discussionSchema.parse(req.body);

  // Check if discussion exists and belongs to the same team
  const existingDiscussion = await prisma.discussion.findFirst({
    where: {
      id: discussionId,
      teamId: req.user!.teamId,
    },
  });

  if (!existingDiscussion) {
    throw createError('Discussion not found', 404);
  }

  const discussion = await prisma.discussion.update({
    where: { id: discussionId },
    data,
    include: {
      author: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          teamId: true,
          bio: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  res.json(discussion);
}));

// Delete discussion (admin only)
router.delete('/:discussionId', authenticate, requireAdmin, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { discussionId } = req.params;

  // Check if discussion exists and belongs to the same team
  const existingDiscussion = await prisma.discussion.findFirst({
    where: {
      id: discussionId,
      teamId: req.user!.teamId,
    },
  });

  if (!existingDiscussion) {
    throw createError('Discussion not found', 404);
  }

  await prisma.discussion.delete({
    where: { id: discussionId },
  });

  res.json({ message: 'Discussion deleted successfully' });
}));

export { router as discussionRoutes };