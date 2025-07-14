import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';

import { Input } from '@/components/ui/form';
import { useDebounce } from '@/hooks/use-debounce';

export const SearchUsers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get('search') || '',
  );

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const handleSearch = useCallback(
    (term: string) => {
      setSearchParams((prevParams) => {
        const newSearchParams = new URLSearchParams(prevParams);

        if (term) {
          newSearchParams.set('search', term);
        } else {
          newSearchParams.delete('search');
        }

        // Reset to first page when searching
        newSearchParams.delete('offset');

        return newSearchParams;
      });
    },
    [setSearchParams],
  );

  const handleClear = useCallback(() => {
    setSearchTerm('');
    handleSearch('');
  }, [handleSearch]);

  useEffect(() => {
    // Only update search params if the debounced term is different from current search param
    const currentSearchParam = searchParams.get('search') || '';
    if (debouncedSearchTerm !== currentSearchParam) {
      handleSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, handleSearch, searchParams]);

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        registration={{}}
        className="pr-8"
      />
      {searchTerm && (
        <button
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
};