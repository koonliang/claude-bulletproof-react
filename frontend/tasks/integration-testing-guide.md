# Integration Testing Guide

This guide provides step-by-step instructions for testing the frontend-backend integration.

## Prerequisites

Before testing, ensure you have:

1. **Backend Dependencies**: `cd backend && npm install`
2. **Frontend Dependencies**: `cd frontend && npm install`
3. **Database Setup**: Backend database configured and running
4. **Environment Files**: Verify all `.env` files are properly configured

## Manual Testing Checklist

### 1. Backend API Testing

First, verify the backend is working independently:

```bash
cd backend
npm run dev
```

Test endpoints manually:
- Navigate to `http://localhost:3001/healthcheck` - should return `{"ok": true}`
- Check Swagger docs at `http://localhost:3001/swagger`

### 2. Frontend Mock Mode (Verify No Regression)

Test that mocking still works:

```bash
cd frontend
npm run dev:mocks
# or npm run dev (default)
```

Open `http://localhost:3000` and verify:
- [ ] Login page loads
- [ ] Registration works with mock data
- [ ] Dashboard loads with mock discussions
- [ ] Navigation between pages works
- [ ] Mock users and teams are displayed

### 3. Frontend + Backend Integration

Start both services:

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend (with real backend)
cd frontend
npm run dev:backend
```

### 4. Authentication Flow Testing

Open `http://localhost:3000` and test:

#### Registration Flow
- [ ] Navigate to registration page
- [ ] Register a new user with valid data
- [ ] Verify user can create a team or join existing team
- [ ] Confirm successful registration redirects to dashboard
- [ ] Check JWT cookie is set in browser dev tools

#### Login Flow
- [ ] Logout if logged in
- [ ] Attempt login with invalid credentials (should fail)
- [ ] Login with valid credentials
- [ ] Verify successful redirect to dashboard
- [ ] Check JWT cookie is set

#### Authentication State
- [ ] Refresh page while logged in (should stay logged in)
- [ ] Navigate between protected routes
- [ ] Logout functionality works
- [ ] Accessing protected routes while logged out redirects to login

### 5. Core Feature Testing

Test all major functionality with real backend:

#### Team Management
- [ ] View team members
- [ ] Team-scoped data isolation works

#### Discussions (Admin Features)
- [ ] Create new discussion (admin users only)
- [ ] Edit existing discussion (admin users only)
- [ ] Delete discussion (admin users only)
- [ ] View discussions list
- [ ] Search discussions

#### Comments (User Features)
- [ ] View comments on discussions
- [ ] Create new comment
- [ ] Delete own comments
- [ ] Comments are properly associated with discussions

#### User Management
- [ ] View user profile
- [ ] Update profile information
- [ ] View users list (if admin)
- [ ] Delete users (admin only)

### 6. Error Handling Testing

Test error scenarios:

#### Network Errors
- [ ] Stop backend server while frontend is running
- [ ] Verify error notifications appear
- [ ] Check graceful degradation

#### Authentication Errors
- [ ] Manually delete JWT cookie
- [ ] Access protected route (should redirect to login)
- [ ] Login with expired token

#### Validation Errors
- [ ] Submit forms with invalid data
- [ ] Verify error messages appear
- [ ] Check field-level validation

### 7. Performance and UX

- [ ] Page load times reasonable
- [ ] No console errors in browser
- [ ] Responsive design works
- [ ] Loading states display properly

## Automated Testing

Run automated tests to ensure no regressions:

```bash
# Frontend unit tests
cd frontend
npm test

# Backend API tests
cd backend
npm test

# E2E tests (if applicable)
cd frontend
npm run test-e2e
```

## Environment Switching Test

Verify environment switching works:

```bash
# Test switching modes
npm run dev:mocks     # Should use MSW
npm run dev:backend   # Should use real API
npm run dev:fullstack # Should use real API
```

Verify in browser dev tools:
- Check Network tab for requests going to correct URLs
- Mock mode: requests intercepted by MSW
- Backend mode: requests go to `localhost:3001`

## Troubleshooting

### Common Issues

1. **CORS Errors**: Verify backend `CORS_ORIGIN` matches frontend URL
2. **Connection Refused**: Ensure backend is running on port 3001
3. **Authentication Loops**: Clear cookies and localStorage
4. **Database Errors**: Check backend database connection
5. **Environment Variables**: Verify all `VITE_APP_*` variables are set

### Debug Mode

For detailed debugging:

```bash
# Backend with debug logging
cd backend
DEBUG=* npm run dev

# Frontend with console logging
# Check browser console for MSW messages when mocking is enabled
```

## Success Criteria

✅ **Integration Complete When:**
- All authentication flows work with real backend
- All CRUD operations function correctly
- Error handling works properly
- Environment switching is seamless
- No regressions in mock mode
- Documentation is complete and accurate