import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { User } from '@/types/api';

export const createUserInputSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  role: z
    .enum(['USER', 'ADMIN'], { required_error: 'Role is required' })
    .default('USER'),
  bio: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const createUser = (data: CreateUserInput): Promise<User> => {
  return api.post('/users', data);
};

type UseCreateUserOptions = {
  mutationConfig?: MutationConfig<typeof createUser>;
};

export const useCreateUser = ({
  mutationConfig,
}: UseCreateUserOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onSuccess?.(data, variables, context);
    },
    ...restConfig,
    mutationFn: createUser,
  });
};
