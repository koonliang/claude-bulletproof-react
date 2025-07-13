import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, createError } from '../middleware/error-handler.js';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';
import prisma from '../config/database.js';

const router = Router();

const profileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  bio: z.string().optional(),
});

// Get all users (team members)
router.get('/', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const users = await prisma.user.findMany({
    where: {
      teamId: req.user!.teamId,
    },
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
  });

  res.json({ data: users });
}));

// Update user profile
router.patch('/profile', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const data = profileUpdateSchema.parse(req.body);
  
  // Check if email is already taken by another user
  if (data.email !== req.user!.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    
    if (existingUser) {
      throw createError('Email already in use', 400);
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: req.user!.id },
    data,
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
  });

  res.json(updatedUser);
}));

// Delete user (admin only)
router.delete('/:userId', authenticate, requireAdmin, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { userId } = req.params;

  // Check if user exists and is in the same team
  const userToDelete = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userToDelete) {
    throw createError('User not found', 404);
  }

  if (userToDelete.teamId !== req.user!.teamId) {
    throw createError('User not found', 404);
  }

  // Prevent deleting yourself
  if (userId === req.user!.id) {
    throw createError('Cannot delete your own account', 400);
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  res.json({ message: 'User deleted successfully' });
}));

export { router as userRoutes };