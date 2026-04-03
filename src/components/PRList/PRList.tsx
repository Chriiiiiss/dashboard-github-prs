import { Loader, EmptyState } from '@stonal-tech/lib-design-system-react';
import { PRCard } from '@components/PRCard/PRCard';
import type { PullRequest } from '@localTypes/github';
import styles from './PRList.module.scss';

interface PRListProps {
  prs: PullRequest[];
  isLoading: boolean;
  error: string | null;
}

export const PRList = ({ prs, isLoading, error }: PRListProps) => {
  if (isLoading && prs.length === 0) {
    return (
      <div className={styles.list__center}>
        <Loader isLoading message="Loading pull requests..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.list__center}>
        <EmptyState title="Error loading pull requests" variantSize="md">
          <EmptyState.Description>{error}</EmptyState.Description>
        </EmptyState>
      </div>
    );
  }

  if (prs.length === 0) {
    return (
      <div className={styles.list__center}>
        <EmptyState title="No pull requests found" variantSize="md">
          <EmptyState.Description>
            Try adjusting your filters or check back later.
          </EmptyState.Description>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {prs.map((pr) => (
        <PRCard key={pr.id} pr={pr} />
      ))}
    </div>
  );
};
