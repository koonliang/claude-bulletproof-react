# Bulletproof React Backend

A Node.js/Express backend API that replaces the MSW mock handlers used in the frontend. Built with TypeScript, Prisma ORM, and MySQL.

## Features

- 🔐 **JWT Authentication** - Secure user authentication with bcrypt password hashing
- 👥 **Team-based Architecture** - Users belong to teams with role-based access control
- 📝 **Discussion System** - Create, read, update, and delete discussions with pagination and search
- 💬 **Comment System** - Add comments to discussions with proper authorization
- 🛡️ **Security** - Rate limiting, CORS, helmet, input validation
- 📊 **Database** - MySQL with Prisma ORM for type-safe database operations

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL
- **ORM**: Prisma
- **Authentication**: JWT with bcrypt
- **Validation**: Zod
- **Security**: Helmet, CORS, Rate limiting

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user

### Users
- `GET /users` - Get team members
- `PATCH /users/profile` - Update user profile
- `DELETE /users/:userId` - Delete user (admin only)

### Teams
- `GET /teams` - Get all teams (for registration)

### Discussions
- `GET /discussions` - Get discussions with pagination/search
- `GET /discussions/:id` - Get single discussion
- `POST /discussions` - Create discussion (admin only)
- `PATCH /discussions/:id` - Update discussion (admin only)
- `DELETE /discussions/:id` - Delete discussion (admin only)

### Comments
- `GET /comments?discussionId=:id` - Get comments for discussion
- `POST /comments` - Create comment
- `DELETE /comments/:id` - Delete comment

### Health Check
- `GET /healthcheck` - Server health check

## Setup Instructions

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=3001
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   DATABASE_URL="mysql://username:password@localhost:3306/bulletproof_react"
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Set up database**
   ```bash
   # Create database and run migrations
   npx prisma migrate dev
   
   # Or use the provided script
   npm run db:migrate
   ```

5. **Seed the database**
   ```bash
   npm run db:seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3001`

## Database Scripts

- `npm run db:init` - Initialize database connection
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:reset` - Reset database (delete all data)

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Sample Data

After running `npm run db:seed`, you can use these login credentials:

- **Admin User**: `admin@acme.com` / `password123`
- **Regular User**: `jane@acme.com` / `password123`
- **Team 2 Admin**: `bob@tech.com` / `password123`

## Security Features

- Password hashing with bcrypt
- JWT tokens with configurable expiration
- HTTP-only cookies for token storage
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Security headers with Helmet
- Input validation with Zod
- Team-based data isolation

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts    # Prisma client configuration
│   │   └── env.ts         # Environment validation
│   ├── middleware/
│   │   ├── auth.ts        # JWT authentication middleware
│   │   └── error-handler.ts # Error handling middleware
│   ├── routes/
│   │   ├── auth.ts        # Authentication routes
│   │   ├── users.ts       # User management routes
│   │   ├── teams.ts       # Team routes
│   │   ├── discussions.ts # Discussion routes
│   │   └── comments.ts    # Comment routes
│   ├── types/
│   │   └── index.ts       # TypeScript type definitions
│   ├── utils/
│   │   └── auth.ts        # Authentication utilities
│   └── index.ts           # Main application entry point
├── scripts/
│   ├── init-db.ts         # Database initialization
│   ├── seed-data.ts       # Database seeding
│   └── reset-db.ts        # Database reset
├── prisma/
│   └── schema.prisma      # Database schema
├── package.json
├── tsconfig.json
└── README.md
```

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Set production environment variables
3. Run database migrations:
   ```bash
   npx prisma migrate deploy
   ```

4. Start the server:
   ```bash
   npm start
   ```

## License

This project is part of the Bulletproof React application.