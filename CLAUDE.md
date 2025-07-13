# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack React application demonstrating bulletproof architecture patterns. The project is split into two main directories:
- `frontend/` - React TypeScript application with Vite
- `backend/` - Node.js Express API with TypeScript and Prisma

## Essential Commands

### Frontend Development
- `cd frontend && yarn dev` - Start frontend development server on port 3000 with MSW mocks
- `cd frontend && yarn dev:backend` - Start frontend connected to real backend API
- `cd frontend && yarn build` - Build frontend for production
- `cd frontend && yarn test` - Run unit tests with Vitest
- `cd frontend && yarn test-e2e` - Run Playwright end-to-end tests
- `cd frontend && yarn lint` - Run ESLint (must pass before committing)
- `cd frontend && yarn check-types` - Run TypeScript type checking
- `cd frontend && yarn storybook` - Start Storybook for component development

### Backend Development
- `cd backend && npm run dev` - Start backend development server on port 3001
- `cd backend && npm run build` - Build TypeScript to JavaScript
- `cd backend && npm run test` - Run Jest tests
- `cd backend && npm run test:coverage` - Run tests with coverage
- `cd backend && npm run lint` - Run ESLint
- `cd backend && npm run type-check` - Run TypeScript type checking

### Database Operations (Backend)
- `cd backend && npm run db:migrate` - Run Prisma migrations
- `cd backend && npm run db:seed` - Seed database with sample data
- `cd backend && npm run db:reset` - Reset database (delete all data)
- `cd backend && npm run db:setup:dev` - Full database setup for development

## Architecture Overview

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with React plugin
- **Routing**: React Router 7 with lazy loading
- **State Management**: Zustand for global state, TanStack Query for server state
- **Styling**: Tailwind CSS with Radix UI components
- **Testing**: Vitest for unit tests, Playwright for E2E
- **Mocking**: MSW (Mock Service Worker) for API mocking during development

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: MySQL with Prisma ORM (SQLite for tests)
- **Authentication**: JWT tokens in HTTP-only cookies
- **Security**: Rate limiting, CORS, Helmet, bcrypt password hashing
- **Validation**: Zod schemas for all inputs
- **Multi-tenancy**: Team-based data isolation

### Feature-Based Organization
Both frontend and backend follow feature-based folder structure:
- Each feature contains its own components, API calls, types, and utilities
- Cross-feature imports are discouraged for better maintainability
- Shared code lives in dedicated folders (components, utils, lib)

## Development Patterns

### Frontend Patterns
- **Component Structure**: Components are organized by feature with shared components in `/components`
- **API Integration**: TanStack Query hooks for data fetching with MSW mocks for development
- **Form Handling**: React Hook Form with Zod validation
- **Error Boundaries**: React Error Boundary for component-level error handling
- **Route Protection**: HOC pattern for authentication guards

### Backend Patterns
- **Multi-tenancy**: All database operations are scoped by user's teamId
- **Authentication Middleware**: JWT validation with user context injection
- **Error Handling**: Centralized error handler with typed error responses
- **Database Queries**: Prisma with automatic team-based filtering

## Key Features

### Authentication System
- JWT-based authentication with refresh tokens
- Team-based user registration and access control
- Role-based permissions (ADMIN, USER)
- Password hashing with bcrypt

### Discussion System
- Team-scoped discussions with CRUD operations
- Comment system for user engagement
- Pagination and search functionality
- Admin-only discussion management

### Development Modes
Frontend supports multiple development environments:
- **Mock Mode** (`yarn dev`): Uses MSW for API mocking
- **Backend Mode** (`yarn dev:backend`): Connects to real backend on port 3001
- **Testing Mode**: Separate test environment with isolated database

## Security Considerations

- Environment variables validated with Zod schemas
- SQL injection prevention through Prisma ORM
- XSS protection with HTTP-only cookies
- CORS configuration for specific origins
- Rate limiting and security headers
- Input validation on all endpoints

## Testing Strategy

### Frontend Testing
- Unit tests with Vitest and Testing Library
- Component testing with Storybook
- E2E tests with Playwright
- MSW for API mocking in tests

### Backend Testing
- Jest for unit and integration tests
- Supertest for API endpoint testing
- Separate SQLite test database
- Mock factories for test data generation

## Environment Configuration

### Frontend Environment Variables (prefix with VITE_APP_)
- `VITE_APP_API_URL` - Backend API URL
- `VITE_APP_ENABLE_API_MOCKING` - Enable/disable MSW mocking

### Backend Environment Variables
- `NODE_ENV` - Environment (development/production/test)
- `PORT` - Server port (default: 3001)
- `JWT_SECRET` - JWT signing secret
- `DATABASE_URL` - Database connection string
- `CORS_ORIGIN` - Allowed CORS origin

## Development Workflow

1. Start backend: `cd backend && npm run dev`
2. Set up database: `cd backend && npm run db:setup:dev`
3. Start frontend: `cd frontend && yarn dev:backend`
4. Run tests before committing: Both `yarn test` and `npm test`
5. Ensure linting passes: Both `yarn lint` and `npm run lint`

## Common Tasks

### Adding New Features
1. Create feature folder in appropriate `/features` directory
2. Add API endpoints in backend `/routes`
3. Create components and hooks in frontend feature folder
4. Add tests for both frontend and backend
5. Update types and validation schemas

### Database Changes
1. Modify Prisma schema in `backend/prisma/schema.prisma`
2. Run `npm run db:migrate` to create migration
3. Update seed data if needed
4. Regenerate Prisma client with `npm run db:generate`