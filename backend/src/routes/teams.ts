import { Router } from 'express';
import { asyncHandler } from '../middleware/error-handler.js';
import prisma from '../config/database.js';

const router = Router();

// Get all teams (public endpoint for registration)
router.get('/', asyncHandler(async (req, res) => {
  const teams = await prisma.team.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.json({ data: teams });
}));

export { router as teamRoutes };