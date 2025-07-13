import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import { QueryConfig } from '@/lib/react-query';
import { Discussion, Meta } from '@/types/api';

export const getDiscussions = (
  page = 1,
  search?: string,
  sortBy?: 'title' | 'createdAt',
  sortOrder?: 'asc' | 'desc',
): Promise<{
  data: Discussion[];
  meta: Meta;
}> => {
  return api.get(`/discussions`, {
    params: {
      page,
      ...(search && { search }),
      ...(sortBy && { sortBy }),
      ...(sortOrder && { sortOrder }),
    },
  });
};

export const getDiscussionsQueryOptions = ({
  page,
  search,
  sortBy,
  sortOrder,
}: {
  page?: number;
  search?: string;
  sortBy?: 'title' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
} = {}) => {
  return queryOptions({
    queryKey: ['discussions', { page, search, sortBy, sortOrder }],
    queryFn: () => getDiscussions(page, search, sortBy, sortOrder),
    staleTime: 0, // Force refetch when query key changes
    refetchOnMount: 'always', // Always refetch when component mounts
  });
};

type UseDiscussionsOptions = {
  page?: number;
  search?: string;
  sortBy?: 'title' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  queryConfig?: QueryConfig<typeof getDiscussionsQueryOptions>;
};

export const useDiscussions = ({
  queryConfig,
  page,
  search,
  sortBy,
  sortOrder,
}: UseDiscussionsOptions = {}) => {
  return useQuery({
    ...getDiscussionsQueryOptions({ page, search, sortBy, sortOrder }),
    ...queryConfig,
  });
};
