# Backend Integration Guide

This document explains how the frontend has been configured to work with both mocked APIs and the real backend API.

## Environment Configurations

The application now supports multiple environment configurations:

### 1. `.env` (Default - Mocked Development)
```env
# Development environment using mocked API (MSW)
VITE_APP_API_URL=http://localhost:8080/api
VITE_APP_ENABLE_API_MOCKING=true
VITE_APP_MOCK_API_PORT=8080
VITE_APP_URL=http://localhost:3000
```

### 2. `.env.backend` (Real Backend Development)
```env
# Development environment using real backend API
VITE_APP_API_URL=http://localhost:3001
VITE_APP_ENABLE_API_MOCKING=false
VITE_APP_URL=http://localhost:3000
```

### 3. `.env.fullstack` (Full-Stack Development)
```env
# Full-stack development with real backend API
VITE_APP_API_URL=http://localhost:3001
VITE_APP_ENABLE_API_MOCKING=false
VITE_APP_URL=http://localhost:3000
VITE_APP_MOCK_API_PORT=8080
```

## Development Scripts

Use these npm scripts to switch between different modes:

- `npm run dev` or `npm run dev:mocks` - Mocked API development
- `npm run dev:backend` - Real backend API development  
- `npm run dev:fullstack` - Full-stack development

## API Endpoint Compatibility

All frontend API calls are fully compatible with the backend routes:

| Feature | Frontend Calls | Backend Routes | Status |
|---------|---------------|----------------|--------|
| Authentication | `/auth/login`, `/auth/register`, `/auth/logout`, `/auth/me` | ✅ All routes match |
| Discussions | `/discussions/*` | ✅ All routes match |
| Comments | `/comments/*` | ✅ All routes match |
| Users | `/users/*` | ✅ All routes match |
| Teams | `/teams` | ✅ Route matches |

## CORS Configuration

The backend is already configured to accept requests from the frontend:

- **Backend CORS Origin**: `http://localhost:3000` (frontend URL)
- **Credentials**: Enabled for JWT cookie authentication
- **Headers**: Properly configured for API requests

## Authentication Flow

The authentication system works seamlessly with both mocked and real APIs:

- **JWT Tokens**: Stored in HTTP-only cookies
- **Cookie Domain**: Configured for local development
- **Auto-redirect**: 401 responses redirect to login page
- **Team Scoping**: Multi-tenant architecture maintained

## How It Works

1. **Environment Detection**: The app reads `VITE_APP_ENABLE_API_MOCKING` to determine mode
2. **MSW Integration**: When mocking is enabled, MSW intercepts network requests
3. **API Client**: Axios client automatically uses the configured `API_URL`
4. **Seamless Switching**: No code changes needed to switch between modes

## Full-Stack Development Workflow

### Option 1: Separate Terminals
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend  
npm run dev:backend
```

### Option 2: Using the Scripts
```bash
# Start backend first
cd backend && npm run dev

# Then start frontend in backend mode
cd frontend && npm run dev:fullstack
```

## Benefits

- ✅ **Flexible Development**: Work with or without backend
- ✅ **No Code Changes**: Environment-driven configuration
- ✅ **Full Compatibility**: All endpoints match perfectly
- ✅ **Easy Testing**: Switch between real and mock data instantly
- ✅ **Team Collaboration**: Developers can work independently