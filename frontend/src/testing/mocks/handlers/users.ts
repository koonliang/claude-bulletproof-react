import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

import { db, persistDb } from '../db';
import {
  requireAuth,
  requireAdmin,
  sanitizeUser,
  networkDelay,
} from '../utils';

type ProfileBody = {
  email: string;
  firstName: string;
  lastName: string;
  bio: string;
};

type UpdateUserBody = {
  email: string;
  firstName: string;
  lastName: string;
  bio?: string;
};

type UpdateUserRoleBody = {
  role: 'USER' | 'ADMIN';
};

export const usersHandlers = [
  http.get(`${env.API_URL}/users`, async ({ cookies, request }) => {
    await networkDelay();

    try {
      const { user, error } = requireAuth(cookies);
      if (error) {
        return HttpResponse.json({ message: error }, { status: 401 });
      }

      const url = new URL(request.url);
      const search = url.searchParams.get('search');
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      let result = db.user
        .findMany({
          where: {
            teamId: {
              equals: user?.teamId,
            },
          },
        })
        .map(sanitizeUser);

      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        result = result.filter(
          (u) =>
            u.firstName.toLowerCase().includes(searchLower) ||
            u.lastName.toLowerCase().includes(searchLower) ||
            u.email.toLowerCase().includes(searchLower),
        );
      }

      // Sort by firstName, then lastName
      result.sort((a, b) => {
        if (a.firstName !== b.firstName) {
          return a.firstName.localeCompare(b.firstName);
        }
        return a.lastName.localeCompare(b.lastName);
      });

      // Apply pagination
      const total = result.length;
      const paginatedResult = result.slice(offset, offset + limit);

      return HttpResponse.json({ 
        data: paginatedResult,
        meta: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        }
      });
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      );
    }
  }),

  // Get individual user by ID
  http.get(`${env.API_URL}/users/:userId`, async ({ cookies, params }) => {
    await networkDelay();

    try {
      const { user, error } = requireAuth(cookies);
      if (error) {
        return HttpResponse.json({ message: error }, { status: 401 });
      }

      const userId = params.userId as string;
      const targetUser = db.user.findFirst({
        where: {
          id: { equals: userId },
          teamId: { equals: user?.teamId },
        },
      });

      if (!targetUser) {
        return HttpResponse.json({ message: 'User not found' }, { status: 404 });
      }

      return HttpResponse.json(sanitizeUser(targetUser));
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      );
    }
  }),

  // Update user profile (admin only)
  http.put(`${env.API_URL}/users/:userId`, async ({ request, cookies, params }) => {
    await networkDelay();

    try {
      const { user, error } = requireAuth(cookies);
      if (error) {
        return HttpResponse.json({ message: error }, { status: 401 });
      }
      requireAdmin(user);

      const userId = params.userId as string;
      const data = (await request.json()) as UpdateUserBody;

      const targetUser = db.user.findFirst({
        where: {
          id: { equals: userId },
          teamId: { equals: user?.teamId },
        },
      });

      if (!targetUser) {
        return HttpResponse.json({ message: 'User not found' }, { status: 404 });
      }

      // Check if email is already taken by another user
      if (data.email !== targetUser.email) {
        const existingUser = db.user.findFirst({
          where: { email: { equals: data.email } },
        });
        
        if (existingUser && existingUser.id !== userId) {
          return HttpResponse.json({ message: 'Email already in use' }, { status: 400 });
        }
      }

      const result = db.user.update({
        where: { id: { equals: userId } },
        data,
      });
      
      if (!result) {
        return HttpResponse.json({ message: 'User not found' }, { status: 404 });
      }
      
      await persistDb('user');
      return HttpResponse.json(sanitizeUser(result));
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      );
    }
  }),

  // Update user role (admin only)
  http.put(`${env.API_URL}/users/:userId/role`, async ({ request, cookies, params }) => {
    await networkDelay();

    try {
      const { user, error } = requireAuth(cookies);
      if (error) {
        return HttpResponse.json({ message: error }, { status: 401 });
      }
      requireAdmin(user);

      const userId = params.userId as string;
      const { role } = (await request.json()) as UpdateUserRoleBody;

      const targetUser = db.user.findFirst({
        where: {
          id: { equals: userId },
          teamId: { equals: user?.teamId },
        },
      });

      if (!targetUser) {
        return HttpResponse.json({ message: 'User not found' }, { status: 404 });
      }

      // Prevent admin from demoting themselves
      if (userId === user?.id && role === 'USER') {
        return HttpResponse.json({ message: 'Cannot change your own role' }, { status: 400 });
      }

      const result = db.user.update({
        where: { id: { equals: userId } },
        data: { role },
      });
      
      if (!result) {
        return HttpResponse.json({ message: 'User not found' }, { status: 404 });
      }
      
      await persistDb('user');
      return HttpResponse.json(sanitizeUser(result));
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      );
    }
  }),

  http.patch(`${env.API_URL}/users/profile`, async ({ request, cookies }) => {
    await networkDelay();

    try {
      const { user, error } = requireAuth(cookies);
      if (error) {
        return HttpResponse.json({ message: error }, { status: 401 });
      }
      const data = (await request.json()) as ProfileBody;
      const result = db.user.update({
        where: {
          id: {
            equals: user?.id,
          },
        },
        data,
      });
      await persistDb('user');
      return HttpResponse.json(result);
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      );
    }
  }),

  http.delete(`${env.API_URL}/users/:userId`, async ({ cookies, params }) => {
    await networkDelay();

    try {
      const { user, error } = requireAuth(cookies);
      if (error) {
        return HttpResponse.json({ message: error }, { status: 401 });
      }
      const userId = params.userId as string;
      requireAdmin(user);
      const result = db.user.delete({
        where: {
          id: {
            equals: userId,
          },
          teamId: {
            equals: user?.teamId,
          },
        },
      });
      await persistDb('user');
      return HttpResponse.json(result);
    } catch (error: any) {
      return HttpResponse.json(
        { message: error?.message || 'Server Error' },
        { status: 500 },
      );
    }
  }),
];
