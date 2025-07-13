import { env } from '@/config/env';

export const enableMocking = async () => {
  if (env.ENABLE_API_MOCKING) {
    const { worker } = await import('./browser');
    const { initializeDb } = await import('./db');

    // Import debug utilities for browser console
    await import('./debug-utils');

    await initializeDb();
    return worker.start();
  }
};
