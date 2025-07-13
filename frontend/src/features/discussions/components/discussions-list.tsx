import { useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router';

import { Link } from '@/components/ui/link';
import { Spinner } from '@/components/ui/spinner';
import { Table, SortableHeader } from '@/components/ui/table';
import { paths } from '@/config/paths';
import { formatDate } from '@/utils/format';

import { getDiscussionQueryOptions } from '../api/get-discussion';
import { useDiscussions } from '../api/get-discussions';

import { DeleteDiscussion } from './delete-discussion';
import { DiscussionsPagination } from './discussions-pagination';

export type DiscussionsListProps = {
  onDiscussionPrefetch?: (id: string) => void;
  search?: string;
  sortBy?: 'title' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
};

export const DiscussionsList = ({
  onDiscussionPrefetch,
  search,
  sortBy = 'createdAt',
  sortOrder = 'desc',
}: DiscussionsListProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = +(searchParams.get('page') || 1);

  const discussionsQuery = useDiscussions({
    page,
    search,
    sortBy,
    sortOrder,
  });
  const queryClient = useQueryClient();

  const handleSort = (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sortBy', newSortBy);
    newParams.set('sortOrder', newSortOrder);
    newParams.set('page', '1'); // Reset to first page when sorting changes
    setSearchParams(newParams);
  };

  if (discussionsQuery.isLoading) {
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const discussions = discussionsQuery.data?.data;
  const meta = discussionsQuery.data?.meta;

  if (!discussions) return null;

  if (discussions.length === 0 && search) {
    return (
      <div className="flex h-32 w-full items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">
            No discussions found for &quot;{search}&quot;
          </p>
          <p className="text-sm text-gray-400">
            Try adjusting your search terms
          </p>
        </div>
      </div>
    );
  }

  if (discussions.length === 0) {
    return (
      <div className="flex h-32 w-full items-center justify-center">
        <p className="text-gray-500">No discussions found</p>
      </div>
    );
  }

  return (
    <>
      <Table
        data={discussions}
        columns={[
          {
            title: (
              <SortableHeader
                title="Title"
                sortKey="title"
                currentSortBy={sortBy}
                currentSortOrder={sortOrder}
                onSort={handleSort}
              />
            ),
            field: 'title',
          },
          {
            title: (
              <SortableHeader
                title="Created At"
                sortKey="createdAt"
                currentSortBy={sortBy}
                currentSortOrder={sortOrder}
                onSort={handleSort}
              />
            ),
            field: 'createdAt',
            Cell({ entry: { createdAt } }) {
              return <span>{formatDate(createdAt)}</span>;
            },
          },
          {
            title: '',
            field: 'id',
            Cell({ entry: { id } }) {
              return (
                <Link
                  onMouseEnter={() => {
                    // Prefetch the discussion data when the user hovers over the link
                    queryClient.prefetchQuery(getDiscussionQueryOptions(id));
                    onDiscussionPrefetch?.(id);
                  }}
                  to={paths.app.discussion.getHref(id)}
                >
                  View
                </Link>
              );
            },
          },
          {
            title: '',
            field: 'id',
            Cell({ entry: { id } }) {
              return <DeleteDiscussion id={id} />;
            },
          },
        ]}
      />
      {meta && (
        <DiscussionsPagination
          totalPages={meta.totalPages}
          currentPage={meta.page}
        />
      )}
    </>
  );
};
