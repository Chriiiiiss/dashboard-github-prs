import { Link } from '@stonal-tech/lib-design-system-react';
import { StatusBadge } from '@components/StatusBadge/StatusBadge';
import { ReviewerAvatars } from '@components/ReviewerAvatars/ReviewerAvatars';
import { ChecksIndicator } from '@components/ChecksIndicator/ChecksIndicator';
import type { PullRequest } from '@localTypes/github';
import styles from './PRCard.module.scss';

interface PRCardProps {
  pr: PullRequest;
}

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const isLightColor = (hex: string): boolean => {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
};

export const PRCard = ({ pr }: PRCardProps) => (
  <div className={styles.card}>
    <div className={styles.card__indicators}>
      <StatusBadge status={pr.reviewStatus} />
      <ChecksIndicator status={pr.checksStatus} />
    </div>

    <div className={styles.card__body}>
      <div className={styles.card__titleRow}>
        <Link href={pr.htmlUrl} variant="default">
          {pr.title}
        </Link>
        <span className={styles.card__number}>#{pr.number}</span>
      </div>

      <div className={styles.card__meta}>
        <span className={styles.card__repo}>{pr.repo}</span>

        {pr.labels.length > 0 && (
          <span className={styles.card__labels}>
            {pr.labels.map((label) => (
              <span
                key={label.id}
                className={styles.card__label}
                style={{
                  backgroundColor: `#${label.color}`,
                  color: isLightColor(label.color) ? '#24292f' : '#fff',
                }}
              >
                {label.name}
              </span>
            ))}
          </span>
        )}

        <span className={styles.card__branch}>
          {pr.headRef} → {pr.baseRef}
        </span>
      </div>
    </div>

    <div className={styles.card__aside}>
      <ReviewerAvatars reviews={pr.reviews} />
      <span className={styles.card__time} title={new Date(pr.updatedAt).toLocaleString()}>
        {formatRelativeTime(pr.updatedAt)}
      </span>
    </div>
  </div>
);
