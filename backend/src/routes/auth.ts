import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler, createError } from '../middleware/error-handler.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';
import prisma from '../config/database.js';

const router = Router();

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  teamId: z.string().nullable().optional(),
  teamName: z.string().nullable().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Register
router.post('/register', asyncHandler(async (req, res) => {
  const data = registerSchema.parse(req.body);
  
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });
  
  if (existingUser) {
    throw createError('User already exists', 400);
  }

  let teamId: string;
  let role: 'ADMIN' | 'USER' = 'USER';

  if (!data.teamId) {
    // Create new team
    const team = await prisma.team.create({
      data: {
        name: data.teamName || `${data.firstName} Team`,
        description: '',
      },
    });
    teamId = team.id;
    role = 'ADMIN';
  } else {
    // Join existing team
    const existingTeam = await prisma.team.findUnique({
      where: { id: data.teamId },
    });
    
    if (!existingTeam) {
      throw createError('The team you are trying to join does not exist!', 400);
    }
    teamId = data.teamId;
    role = 'USER';
  }

  // Hash password
  const hashedPassword = await hashPassword(data.password);
  
  // Create user
  const user = await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      role,
      teamId,
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

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Set cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(201).json({
    user,
    jwt: token,
  });
}));

// Login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });
  
  if (!user) {
    throw createError('Invalid credentials', 401);
  }

  // Check password
  const isValidPassword = await comparePassword(password, user.password);
  
  if (!isValidPassword) {
    throw createError('Invalid credentials', 401);
  }

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Set cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...userWithoutPassword } = user;

  res.json({
    user: userWithoutPassword,
    jwt: token,
  });
}));

// Logout
router.post('/logout', asyncHandler(async (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
}));

// Get current user
router.get('/me', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
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

  res.json({ data: user });
}));

export { router as authRoutes };