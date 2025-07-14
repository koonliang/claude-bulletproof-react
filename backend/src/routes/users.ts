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

const userSearchSchema = z.object({
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

const userUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  bio: z.string().optional(),
});

const roleUpdateSchema = z.object({
  role: z.enum(['USER', 'ADMIN'], { required_error: 'Role is required' }),
});

// Get all users (team members) with search support
router.get('/', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { search, limit, offset } = userSearchSchema.parse(req.query);
  
  const whereClause = {
    teamId: req.user!.teamId,
    ...(search && {
      OR: [
        { firstName: { contains: search} },
        { lastName: { contains: search} },
        { email: { contains: search} },
      ],
    }),
  };

  const users = await prisma.user.findMany({
    where: whereClause,
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
    orderBy: [
      { firstName: 'asc' },
      { lastName: 'asc' },
    ],
    take: limit,
    skip: offset,
  });

  // Get total count for pagination
  const total = await prisma.user.count({
    where: whereClause,
  });

  res.json({ 
    data: users,
    meta: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    }
  });
}));

// Get individual user by ID
router.get('/:userId', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { userId } = req.params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
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

  if (!user) {
    throw createError('User not found', 404);
  }

  // Ensure user is in the same team
  if (user.teamId !== req.user!.teamId) {
    throw createError('User not found', 404);
  }

  res.json(user);
}));

// Update user profile (admin only)
router.put('/:userId', authenticate, requireAdmin, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { userId } = req.params;
  const data = userUpdateSchema.parse(req.body);

  // Check if user exists and is in the same team
  const userToUpdate = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userToUpdate) {
    throw createError('User not found', 404);
  }

  if (userToUpdate.teamId !== req.user!.teamId) {
    throw createError('User not found', 404);
  }

  // Check if email is already taken by another user
  if (data.email !== userToUpdate.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    
    if (existingUser && existingUser.id !== userId) {
      throw createError('Email already in use', 400);
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
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

// Update user role (admin only)
router.put('/:userId/role', authenticate, requireAdmin, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { userId } = req.params;
  const { role } = roleUpdateSchema.parse(req.body);

  // Check if user exists and is in the same team
  const userToUpdate = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userToUpdate) {
    throw createError('User not found', 404);
  }

  if (userToUpdate.teamId !== req.user!.teamId) {
    throw createError('User not found', 404);
  }

  // Prevent admin from demoting themselves
  if (userId === req.user!.id && role === 'USER') {
    throw createError('Cannot change your own role', 400);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role },
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