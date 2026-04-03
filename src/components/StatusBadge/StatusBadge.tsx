import type { ReviewStatus } from '@localTypes/github';
import styles from './StatusBadge.module.scss';

const STATUS_CONFIG: Record<ReviewStatus, { label: string; className: string }> = {
  approved: { label: 'Approved', className: 'approved' },
  changes_requested: { label: 'Changes Requested', className: 'changes-requested' },
  review_required: { label: 'Needs Review', className: 'needs-review' },
  draft: { label: 'Draft', className: 'draft' },
};

interface StatusBadgeProps {
  status: ReviewStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`${styles.badge} ${styles[`badge--${config.className}`]}`}>
      {config.label}
    </span>
  );
};
