# Bulletproof React Application

A production-ready, full-stack React application demonstrating modern web development best practices and bulletproof architecture patterns. This project showcases how to build scalable, maintainable, and secure web applications using cutting-edge technologies.

## 🚀 Features

- 🔐 **Secure Authentication** - JWT-based auth with HTTP-only cookies and bcrypt password hashing
- 👥 **Multi-tenancy** - Team-based architecture with role-based access control (ADMIN/USER)
- 📝 **Discussion System** - Create, manage, and participate in team discussions
- 💬 **Real-time Comments** - Interactive comment system with proper authorization
- 🎨 **Modern UI** - Beautiful, accessible interface built with Radix UI and Tailwind CSS
- 🧪 **Comprehensive Testing** - Unit, integration, and E2E tests with high coverage
- 🛡️ **Security First** - Rate limiting, CORS, CSP headers, input validation
- 📱 **Responsive Design** - Mobile-first approach with excellent UX
- 🔧 **Developer Experience** - Hot reload, TypeScript, ESLint, Prettier, Storybook

## 🏗️ Architecture

### Frontend Stack
- **React 18** - Latest React with concurrent features
- **TypeScript** - Type safety and better developer experience
- **Vite** - Lightning-fast build tool and dev server
- **React Router 7** - Modern routing with lazy loading
- **TanStack Query** - Powerful data fetching and caching
- **Zustand** - Lightweight state management
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible, unstyled UI components
- **React Hook Form** - Performant forms with easy validation
- **Zod** - TypeScript-first schema validation

### Backend Stack
- **Node.js** - JavaScript runtime
- **Express.js** - Fast, unopinionated web framework
- **TypeScript** - Type safety on the backend
- **Prisma ORM** - Type-safe database toolkit
- **MySQL** - Reliable relational database
- **JWT** - Secure token-based authentication
- **bcrypt** - Password hashing
- **Zod** - Runtime type validation

### Testing & Quality
- **Vitest** - Fast unit testing framework
- **Playwright** - Reliable E2E testing
- **Testing Library** - Simple and complete testing utilities
- **Jest** - JavaScript testing framework for backend
- **MSW** - API mocking for development and testing
- **Storybook** - Component development and documentation
- **ESLint** - Code linting and consistency
- **Prettier** - Code formatting

## 📋 Prerequisites

- **Node.js** 20+ 
- **MySQL** 8.0+
- **Yarn** 1.22+ (for frontend)
- **npm** (for backend)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd claude-bulletproof-react
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials and JWT secret

# Set up database
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

The backend will be running on `http://localhost:3001`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env
# Configure API URL and other settings

# Start development server
yarn dev:backend
```

The frontend will be running on `http://localhost:3000`

## 🔧 Development

### Available Scripts

#### Frontend
```bash
yarn dev          # Start with MSW mocks
yarn dev:backend  # Start connected to real backend
yarn build        # Build for production
yarn test         # Run unit tests
yarn test-e2e     # Run E2E tests
yarn lint         # Run ESLint
yarn check-types  # TypeScript type checking
yarn storybook    # Start Storybook
```

#### Backend
```bash
npm run dev       # Start development server
npm run build     # Build TypeScript
npm test          # Run tests
npm run test:coverage  # Run tests with coverage
npm run lint      # Run ESLint
npm run type-check     # TypeScript type checking
npm run db:migrate     # Run database migrations
npm run db:seed        # Seed database
npm run db:reset       # Reset database
```

### Development Modes

The application supports multiple development environments:

- **Mock Mode** (`yarn dev`): Frontend runs with MSW for API mocking
- **Full-stack Mode** (`yarn dev:backend`): Frontend connects to real backend
- **Testing Mode**: Isolated test environment with separate database

## 🧪 Testing

### Running Tests
```bash
# Frontend unit tests
cd frontend && yarn test

# Backend tests
cd backend && npm test

# E2E tests
cd frontend && yarn test-e2e
```

### Test Coverage
The project maintains high test coverage with:
- Unit tests for components and utilities
- Integration tests for API endpoints
- E2E tests for critical user flows
- Component testing with Storybook

## 🔐 Authentication & Authorization

### User Roles
- **ADMIN**: Can create, update, and delete discussions
- **USER**: Can view discussions and add comments

### Security Features
- JWT tokens stored in HTTP-only cookies
- Password hashing with bcrypt
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Security headers with Helmet
- Input validation with Zod schemas
- Team-based data isolation

### Sample Credentials
After running `npm run db:seed`:
- **Admin**: `admin@acme.com` / `password123`
- **User**: `jane@acme.com` / `password123`
- **Team 2 Admin**: `bob@tech.com` / `password123`

## 📊 Database Schema

The application uses a multi-tenant architecture with team-based data isolation:

- **Users** - Authentication and profile information
- **Teams** - Organization containers
- **Discussions** - Team-scoped content (admin-created)
- **Comments** - User-generated discussion responses

## 🚢 Deployment

### Frontend Deployment
```bash
cd frontend
yarn build
# Deploy dist/ folder to your static hosting service
```

### Backend Deployment
```bash
cd backend
npm run build
npm run db:migrate:deploy
npm start
```

### Environment Variables

#### Frontend (prefix with VITE_APP_)
- `VITE_APP_API_URL` - Backend API URL
- `VITE_APP_ENABLE_API_MOCKING` - Enable MSW mocking

#### Backend
- `NODE_ENV` - Environment mode
- `PORT` - Server port (default: 3001)
- `JWT_SECRET` - JWT signing secret
- `DATABASE_URL` - Database connection string
- `CORS_ORIGIN` - Allowed CORS origin

## 📁 Project Structure

```
bulletproof-react/
├── frontend/                 # React application
│   ├── src/
│   │   ├── app/             # Application routing and providers
│   │   ├── components/      # Shared UI components
│   │   ├── features/        # Feature-based modules
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Configured libraries
│   │   ├── testing/         # Test utilities and mocks
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── e2e/                 # End-to-end tests
├── backend/                 # Node.js API
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API route handlers
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   ├── prisma/              # Database schema and migrations
│   ├── scripts/             # Database scripts
│   └── tests/               # Test files and utilities
└── docs/                    # Documentation
```

## 🎯 Key Principles

### Frontend Architecture
- **Feature-based organization** - Code organized by business features
- **Unidirectional data flow** - Clear separation between app, features, and shared code
- **Component composition** - Reusable, composable UI components
- **Type safety** - Full TypeScript coverage with strict mode

### Backend Architecture
- **Clean architecture** - Separation of concerns with clear layers
- **Security by design** - Security considerations built into every layer
- **Team-based multi-tenancy** - Data isolation by team membership
- **Error handling** - Comprehensive error handling and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Ensure all tests pass: `yarn test && npm test`
5. Run linting: `yarn lint && npm run lint`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## 📚 Learning Resources

This project demonstrates many modern web development concepts:

- **React Patterns** - Hooks, context, error boundaries, suspense
- **TypeScript** - Advanced types, generics, utility types
- **API Design** - RESTful APIs, authentication, authorization
- **Database Design** - Relational modeling, migrations, seeding
- **Testing Strategies** - Unit, integration, and E2E testing
- **Security** - Authentication, authorization, data protection
- **Performance** - Code splitting, lazy loading, optimization

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by bulletproof architecture patterns
- Built with modern React and Node.js best practices
- Designed for real-world production use

---

**Built with ❤️ for the developer community**