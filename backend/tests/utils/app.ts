import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from '../../src/config/env.js';
import { errorHandler } from '../../src/middleware/error-handler.js';
import { authRoutes } from '../../src/routes/auth.js';
import { userRoutes } from '../../src/routes/users.js';
import { teamRoutes } from '../../src/routes/teams.js';
import { discussionRoutes } from '../../src/routes/discussions.js';
import { commentRoutes } from '../../src/routes/comments.js';

export const createTestApp = () => {
  const app = express();

  // Security middleware (simplified for testing)
  app.use(helmet({
    contentSecurityPolicy: false,
  }));

  // CORS
  app.use(cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  }));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Health check
  app.get('/healthcheck', (req, res) => {
    res.json({ ok: true });
  });

  // Routes
  app.use('/auth', authRoutes);
  app.use('/users', userRoutes);
  app.use('/teams', teamRoutes);
  app.use('/discussions', discussionRoutes);
  app.use('/comments', commentRoutes);

  // Error handling middleware
  app.use(errorHandler);

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  return app;
};