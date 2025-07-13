import { useSearchParams } from 'react-router';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/table/pagination';

export type DiscussionsPaginationProps = {
  totalPages: number;
  currentPage: number;
};

export const DiscussionsPagination = ({
  totalPages,
  currentPage,
}: DiscussionsPaginationProps) => {
  const [searchParams] = useSearchParams();

  const createHref = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    return `/app/discussions?${params.toString()}`;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <Pagination className="justify-end py-8">
      <PaginationContent>
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious href={createHref(currentPage - 1)} />
          </PaginationItem>
        )}
        {currentPage > 2 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationLink href={createHref(currentPage - 1)}>
              {currentPage - 1}
            </PaginationLink>
          </PaginationItem>
        )}
        <PaginationItem className="rounded-sm bg-gray-200">
          <PaginationLink href={createHref(currentPage)}>
            {currentPage}
          </PaginationLink>
        </PaginationItem>
        {totalPages > currentPage && (
          <PaginationItem>
            <PaginationLink href={createHref(currentPage + 1)}>
              {currentPage + 1}
            </PaginationLink>
          </PaginationItem>
        )}
        {totalPages > currentPage + 1 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}
        {currentPage < totalPages && (
          <PaginationItem>
            <PaginationNext href={createHref(currentPage + 1)} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};
