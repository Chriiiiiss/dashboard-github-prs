import { useState } from 'react';
import { useAuth } from '@hooks/useAuth';
import { usePullRequests } from '@hooks/usePullRequests';
import { useFilters } from '@hooks/useFilters';
import { DashboardHeader } from '@components/DashboardHeader/DashboardHeader';
import { StatsBar } from '@components/StatsBar/StatsBar';
import { PRFilters } from '@components/PRFilters/PRFilters';
import { PRList } from '@components/PRList/PRList';
import type { ReviewStatus } from '@localTypes/github';
import styles from './DashboardPage.module.scss';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { prs, isLoading, error, refresh, stats } = usePullRequests();
  const { filters, setFilter, filteredPRs, availableRepos } = useFilters(prs, user?.login);
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'all'>('all');

  const displayedPRs = statusFilter === 'all'
    ? filteredPRs
    : filteredPRs.filter((pr) => pr.reviewStatus === statusFilter);

  return (
    <div className={styles.dashboard}>
      <DashboardHeader onRefresh={refresh} isLoading={isLoading} />

      <div className={styles.dashboard__content}>
        <StatsBar stats={stats} activeFilter={statusFilter} onFilterClick={setStatusFilter} />

        <PRFilters
          filters={filters}
          onRoleChange={(role) => setFilter('role', role)}
          onRepoChange={(repo) => setFilter('repo', repo)}
          onSearchChange={(search) => setFilter('search', search)}
          onSortChange={(sort) => setFilter('sort', sort)}
          availableRepos={availableRepos}
        />

        <PRList prs={displayedPRs} isLoading={isLoading} error={error} />
      </div>
    </div>
  );
};
