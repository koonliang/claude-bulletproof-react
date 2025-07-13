# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Workflow Requirements

1. First think through the problem, read the codebase for relevant files, and write a plan and create it under the folder tasks/todo.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Linting must pass, test for linting error for the changes
8. Spin a parallel sub-agent to write test scripts to test the changes, all tests must pass.
9. Finally, add a review section to the [todo.md] file with a summary of the changes you made and any other relevant information.

## Essential Commands

### Development
- `npm run dev` - Start development server with hot reload on port 3001
- `npm run build` - Build TypeScript to JavaScript  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint (must pass before committing)
- `npm run type-check` - Run TypeScript type checking (must pass before committing)

### Database Operations
- `npm run db:init` - Initialize database connection
- `npm run db:migrate` - Run Prisma migrations  
- `npm run db:seed` - Seed database with sample data
- `npm run db:reset` - Reset database (delete all data)

### Testing
- `npm test` - Run all tests with Jest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:ci` - Run tests in CI mode with coverage

### Single Test Execution
```bash
# Run specific test file
npm test -- src/routes/__tests__/auth.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="login"
```

## Architecture Overview

### Core Technology Stack
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Database**: MySQL with Prisma ORM (SQLite for tests)
- **Authentication**: JWT tokens stored in HTTP-only cookies
- **Validation**: Zod schemas for environment and request validation
- **Testing**: Jest with Supertest for API testing

### Multi-Tenancy Architecture
This application implements **team-based multi-tenancy**:

- **Data Isolation**: All data (discussions, comments) is scoped by `teamId`
- **User-Team Relationship**: Each user belongs to exactly one team
- **Access Control**: Users can only access data from their own team
- **Admin Privileges**: ADMIN users have elevated permissions within their team

### Authentication Flow
1. **Registration**: Users register with email/password + team selection
2. **Login**: Returns JWT token stored in HTTP-only cookie
3. **Authorization**: Middleware validates JWT and attaches `user` to request
4. **Team Scoping**: Database queries automatically filter by user's `teamId`

### Database Schema Design
- **Users**: Store auth info + profile data, linked to one team
- **Teams**: Container for user groups and discussions
- **Discussions**: Team-scoped content created by admins
- **Comments**: User-generated responses to discussions

### Security Implementation
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for specific frontend origin
- **Helmet**: Security headers including CSP
- **Password Hashing**: bcrypt with salt rounds
- **JWT Security**: HTTP-only cookies prevent XSS attacks
- **Input Validation**: Zod schemas on all endpoints

### Testing Architecture
- **Test Database**: Separate SQLite database (`test.db`)
- **Test Isolation**: Each test suite resets database state
- **Test Utilities**: Helper functions in `tests/utils/` for auth and database operations
- **Coverage Target**: Aim for >75% coverage on new code

### Error Handling Strategy
- **Operational Errors**: User-facing errors with appropriate HTTP status codes
- **System Errors**: Logged server-side, generic message to user
- **Validation Errors**: Detailed field-level validation messages
- **Authentication Errors**: Consistent 401/403 responses

## File Structure Patterns

### Route Organization
```
src/routes/
├── auth.ts          # Registration, login, logout, profile
├── users.ts         # User management (team members)
├── teams.ts         # Team operations
├── discussions.ts   # Discussion CRUD (admin only create/update/delete)
├── comments.ts      # Comment operations on discussions
└── __tests__/       # Route-specific integration tests
```

### Middleware Chain
Request flow: `Security (Helmet, CORS, Rate Limit) → Body Parsing → Authentication → Authorization → Route Handler → Error Handler`

### Configuration Management
- **Environment Variables**: Validated with Zod schemas in `src/config/env.ts`
- **Database Config**: Prisma client configuration in `src/config/database.ts`
- **Type Definitions**: Shared TypeScript types in `src/types/index.ts`

## Common Development Patterns

### Adding New Protected Routes
1. Import `authenticate` middleware from `src/middleware/auth.ts`
2. Apply middleware: `router.get('/endpoint', authenticate, handler)`
3. Access authenticated user via `req.user` (typed with `AuthenticatedRequest`)
4. All database queries automatically scope by `req.user.teamId`

### Adding Admin-Only Routes
```typescript
import { authenticate, requireAdmin } from '../middleware/auth.js';
router.delete('/admin-endpoint', authenticate, requireAdmin, handler);
```

### Database Query Patterns
Always scope by team for multi-tenancy:
```typescript
const discussions = await prisma.discussion.findMany({
  where: { teamId: req.user.teamId },
  include: { author: true }
});
```

### Error Handling Pattern
```typescript
import { createError } from '../middleware/error-handler.js';
if (!resource) {
  throw createError(404, 'Resource not found');
}
```

### Test File Structure
- **Setup**: Database initialization in global `beforeAll`
- **Authentication**: Use `createTestUser()` and `authenticateRequest()` helpers
- **Assertions**: Test both success and error cases
- **Cleanup**: Automatic database reset between test suites

## Security Best Practices

- Never log sensitive data (passwords, JWT tokens)
- Always validate input with Zod schemas
- Use parameterized queries (Prisma handles this automatically)
- Implement proper error messages that don't leak system information
- Team-scope all database operations
- Use HTTPS-only cookies in production