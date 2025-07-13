import { Router, Response } from 'express';
import { z } from 'zod';
import { asyncHandler, createError } from '../middleware/error-handler.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import prisma from '../config/database.js';

const router = Router();

const commentSchema = z.object({
  body: z.string().min(1, 'Comment body is required'),
  discussionId: z.string().min(1, 'Discussion ID is required'),
});

// Get comments with pagination
router.get('/', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const discussionId = req.query.discussionId as string;
  
  if (!discussionId) {
    throw createError('Discussion ID is required', 400);
  }

  const limit = 10;
  const skip = (page - 1) * limit;

  // Verify discussion exists and belongs to user's team
  const discussion = await prisma.discussion.findFirst({
    where: {
      id: discussionId,
      teamId: req.user!.teamId,
    },
  });

  if (!discussion) {
    throw createError('Discussion not found', 404);
  }

  // Get total count
  const total = await prisma.comment.count({
    where: { discussionId },
  });

  // Get comments
  const comments = await prisma.comment.findMany({
    where: { discussionId },
    orderBy: { createdAt: 'asc' },
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
    data: comments,
    meta: {
      page,
      total,
      totalPages,
    },
  });
}));

// Create comment
router.post('/', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const data = commentSchema.parse(req.body);

  // Verify discussion exists and belongs to user's team
  const discussion = await prisma.discussion.findFirst({
    where: {
      id: data.discussionId,
      teamId: req.user!.teamId,
    },
  });

  if (!discussion) {
    throw createError('Discussion not found', 404);
  }

  const comment = await prisma.comment.create({
    data: {
      body: data.body,
      discussionId: data.discussionId,
      authorId: req.user!.id,
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

  res.status(201).json(comment);
}));

// Delete comment
router.delete('/:commentId', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { commentId } = req.params;

  // Find comment
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      discussion: {
        select: { teamId: true },
      },
    },
  });

  if (!comment) {
    throw createError('Comment not found', 404);
  }

  // Check if comment belongs to user's team
  if (comment.discussion.teamId !== req.user!.teamId) {
    throw createError('Comment not found', 404);
  }

  // Check if user can delete this comment (author or admin)
  const canDelete = comment.authorId === req.user!.id || req.user!.role === 'ADMIN';
  
  if (!canDelete) {
    throw createError('Not authorized to delete this comment', 403);
  }

  await prisma.comment.delete({
    where: { id: commentId },
  });

  res.json({ message: 'Comment deleted successfully' });
}));

export { router as commentRoutes };