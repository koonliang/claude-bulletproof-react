# React Vite Application

## Get Started

Prerequisites:

- Node 20+
- Yarn 1.22+

To set up the app execute the following commands.

```bash
git clone https://github.com/alan2207/bulletproof-react.git
cd bulletproof-react
cd apps/react-vite
cp .env.example .env
yarn install
```

## Development Modes

This application supports multiple development modes for different use cases:

##### `yarn dev` or `yarn dev:mocks`

Runs the app in development mode with **Mock Service Worker (MSW)**.\
Uses mocked API responses for all backend calls.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.\
Perfect for frontend development when backend is unavailable.

##### `yarn dev:backend`

Runs the app in development mode connected to the **real backend API**.\
Requires the backend server to be running on port 3001.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.\
Best for full-stack development and testing.

##### `yarn dev:fullstack`

Alias for `yarn dev:backend` - runs connected to the real backend.\
Use this when both frontend and backend are running for integrated development.

## Backend Integration

To run with the real backend:

1. Ensure the backend is running on port 3001 (`cd ../backend && npm run dev`)
2. Use `yarn dev:backend` or `yarn dev:fullstack`
3. The frontend will connect to `http://localhost:3001` instead of using mocks

##### `yarn build`

Builds the app for production to the `dist` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

See the section about [deployment](https://vitejs.dev/guide/static-deploy) for more information.
