import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { User } from '@/types/api';

export type GetUsersParams = {
  search?: string;
  limit?: number;
  offset?: number;
};

export type GetUsersResponse = {
  data: User[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
};

export const getUsers = (
  params: GetUsersParams = {},
): Promise<GetUsersResponse> => {
  const searchParams = new URLSearchParams();

  if (params.search) {
    searchParams.append('search', params.search);
  }
  if (params.limit) {
    searchParams.append('limit', params.limit.toString());
  }
  if (params.offset) {
    searchParams.append('offset', params.offset.toString());
  }

  const queryString = searchParams.toString();
  const url = queryString ? `/users?${queryString}` : '/users';

  return api.get(url);
};

export const getUsersQueryOptions = (params: GetUsersParams = {}) => {
  return queryOptions({
    queryKey: ['users', params],
    queryFn: () => getUsers(params),
  });
};

type UseUsersOptions = {
  params?: GetUsersParams;
  queryConfig?: QueryConfig<typeof getUsersQueryOptions>;
};

export const useUsers = ({
  params = {},
  queryConfig,
}: UseUsersOptions = {}) => {
  return useQuery({
    ...getUsersQueryOptions(params),
    ...queryConfig,
  });
};
