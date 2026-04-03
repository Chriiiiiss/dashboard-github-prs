import { useState, useMemo, useCallback } from 'react';
import type { PullRequest, Filters, RoleFilter, SortOption } from '@localTypes/github';

const DEFAULT_FILTERS: Filters = {
  role: 'all',
  repo: '',
  search: '',
  sort: 'newest',
};

export const useFilters = (prs: PullRequest[], username: string | undefined) => {
  const [filters, setFiltersState] = useState<Filters>(DEFAULT_FILTERS);

  const setFilter = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFiltersState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const availableRepos = useMemo(
    () => [...new Set(prs.map((pr) => pr.repo))].sort(),
    [prs],
  );

  const filteredPRs = useMemo(() => {
    let result = [...prs];

    // Role filter
    if (filters.role !== 'all' && username) {
      result = result.filter((pr) => {
        if (filters.role === 'author') return pr.author.login === username;
        if (filters.role === 'reviewer')
          return pr.reviews.some((r) => r.user.login === username);
        return true;
      });
    }

    // Repo filter
    if (filters.repo) {
      result = result.filter((pr) => pr.repo === filters.repo);
    }

    // Search filter
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (pr) =>
          pr.title.toLowerCase().includes(q) ||
          pr.repo.toLowerCase().includes(q) ||
          `#${pr.number}`.includes(q),
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (filters.sort) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'recently_updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [prs, filters, username]);

  return {
    filters,
    setFilter,
    filteredPRs,
    availableRepos,
  };
};
