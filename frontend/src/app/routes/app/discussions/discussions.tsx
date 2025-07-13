import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { LoaderFunctionArgs, useSearchParams } from 'react-router';

import { ContentLayout } from '@/components/layouts';
import { getInfiniteCommentsQueryOptions } from '@/features/comments/api/get-comments';
import { getDiscussionsQueryOptions } from '@/features/discussions/api/get-discussions';
import { CreateDiscussion } from '@/features/discussions/components/create-discussion';
import { DiscussionsList } from '@/features/discussions/components/discussions-list';
import { SearchDiscussions } from '@/features/discussions/components/search-discussions';

export const clientLoader =
  (queryClient: QueryClient) =>
  async ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);

    const page = Number(url.searchParams.get('page') || 1);
    const search = url.searchParams.get('search') || undefined;
    const sortBy = (url.searchParams.get('sortBy') || 'createdAt') as
      | 'title'
      | 'createdAt';
    const sortOrder = (url.searchParams.get('sortOrder') || 'desc') as
      | 'asc'
      | 'desc';

    const query = getDiscussionsQueryOptions({
      page,
      search,
      sortBy,
      sortOrder,
    });

    // Always fetch fresh data for page changes
    return await queryClient.fetchQuery(query);
  };

const DiscussionsRoute = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';
  const page = searchParams.get('page') || '1';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  return (
    <ContentLayout title="Discussions">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="max-w-md flex-1">
            <SearchDiscussions />
          </div>
          <CreateDiscussion />
        </div>
        <DiscussionsList
          key={`${page}-${searchTerm}-${sortBy}-${sortOrder}`}
          search={searchTerm}
          sortBy={sortBy as 'title' | 'createdAt'}
          sortOrder={sortOrder as 'asc' | 'desc'}
          onDiscussionPrefetch={(id) => {
            // Prefetch the comments data when the user hovers over the link in the list
            queryClient.prefetchInfiniteQuery(
              getInfiniteCommentsQueryOptions(id),
            );
          }}
        />
      </div>
    </ContentLayout>
  );
};

export default DiscussionsRoute;
