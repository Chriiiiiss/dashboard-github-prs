import type { PRStats, ReviewStatus } from '@localTypes/github';
import styles from './StatsBar.module.scss';

interface StatsBarProps {
  stats: PRStats;
  activeFilter: ReviewStatus | 'all';
  onFilterClick: (filter: ReviewStatus | 'all') => void;
}

const STAT_ITEMS: { key: ReviewStatus | 'all'; label: string; colorClass: string }[] = [
  { key: 'all', label: 'Total', colorClass: 'total' },
  { key: 'draft', label: 'Draft', colorClass: 'draft' },
  { key: 'review_required', label: 'Needs Review', colorClass: 'needs-review' },
  { key: 'approved', label: 'Approved', colorClass: 'approved' },
  { key: 'changes_requested', label: 'Changes Requested', colorClass: 'changes-requested' },
];

const getStatValue = (stats: PRStats, key: ReviewStatus | 'all'): number => {
  switch (key) {
    case 'all': return stats.total;
    case 'draft': return stats.draft;
    case 'review_required': return stats.needsReview;
    case 'approved': return stats.approved;
    case 'changes_requested': return stats.changesRequested;
  }
};

export const StatsBar = ({ stats, activeFilter, onFilterClick }: StatsBarProps) => (
  <div className={styles.stats}>
    {STAT_ITEMS.map(({ key, label, colorClass }) => (
      <button
        key={key}
        type="button"
        className={`${styles.stats__card} ${styles[`stats__card--${colorClass}`]} ${activeFilter === key ? styles['stats__card--active'] : ''}`}
        onClick={() => onFilterClick(key)}
      >
        <span className={styles.stats__value}>{getStatValue(stats, key)}</span>
        <span className={styles.stats__label}>{label}</span>
      </button>
    ))}
  </div>
);
