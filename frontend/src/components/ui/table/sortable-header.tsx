import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/utils/cn';

export type SortDirection = 'asc' | 'desc' | null;

type SortableHeaderProps = {
  title: string;
  sortKey: string;
  currentSortBy: string | null;
  currentSortOrder: SortDirection;
  onSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  className?: string;
};

export const SortableHeader = ({
  title,
  sortKey,
  currentSortBy,
  currentSortOrder,
  onSort,
  className,
}: SortableHeaderProps) => {
  const isActive = currentSortBy === sortKey;
  const isAsc = isActive && currentSortOrder === 'asc';
  const isDesc = isActive && currentSortOrder === 'desc';

  const handleClick = () => {
    if (!isActive || isDesc) {
      // If not active or currently desc, sort asc
      onSort(sortKey, 'asc');
    } else {
      // If currently asc, sort desc
      onSort(sortKey, 'desc');
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'flex items-center gap-1 font-medium transition-colors hover:text-gray-900',
        isActive ? 'text-gray-900' : 'text-gray-600',
        className,
      )}
    >
      {title}
      {!isActive && <ChevronsUpDown className="size-4 text-gray-400" />}
      {isAsc && <ChevronUp className="size-4 text-blue-600" />}
      {isDesc && <ChevronDown className="size-4 text-blue-600" />}
    </button>
  );
};
