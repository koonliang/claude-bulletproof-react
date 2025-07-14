import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';
import { User } from '@/types/api';

export const updateUserRoleInputSchema = z.object({
  role: z.enum(['USER', 'ADMIN'], { required_error: 'Role is required' }),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleInputSchema>;

export const updateUserRole = ({ userId, data }: { userId: string; data: UpdateUserRoleInput }): Promise<User> => {
  return api.put(`/users/${userId}/role`, data);
};

type UseUpdateUserRoleOptions = {
  mutationConfig?: MutationConfig<typeof updateUserRole>;
};

export const useUpdateUserRole = ({ mutationConfig }: UseUpdateUserRoleOptions = {}) => {
  const queryClient = useQueryClient();

  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.userId] });
      onSuccess?.(data, variables, context);
    },
    ...restConfig,
    mutationFn: updateUserRole,
  });
};