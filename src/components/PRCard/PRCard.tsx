import { useState } from 'react';
import { Link, Button, Tooltip } from '@stonal-tech/lib-design-system-react';
import { useAuth } from '@hooks/useAuth';
import { postPRComment } from '@api/github';
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

const isRenovatePR = (pr: PullRequest): boolean =>
  pr.author.login === 'renovate' || pr.author.login === 'renovate[bot]';

const buildClaudeFixPrompt = (pr: PullRequest): string =>
  `@claude

This is a Renovate dependency update PR. Please fix it:

1. Checkout \`main\` and create a new branch \`chore/fix-deps-${pr.repo}\`
2. Merge the Renovate branch \`${pr.headRef}\` into this new branch
3. Run the build and identify all failures
4. Fix all errors (type errors, breaking changes, deprecated APIs, lint issues)
5. Commit the fixes and push the branch
6. Create a PR targeting \`main\` with title "fix(deps): resolve ${pr.title}"`;

type FixStatus = 'idle' | 'loading' | 'success' | 'error';

export const PRCard = ({ pr }: PRCardProps) => {
  const { token } = useAuth();
  const [fixStatus, setFixStatus] = useState<FixStatus>('idle');

  const handleFixWithClaude = async () => {
    if (!token || fixStatus === 'loading' || fixStatus === 'success') return;
    setFixStatus('loading');
    try {
      await postPRComment(token, pr.owner, pr.repo, pr.number, buildClaudeFixPrompt(pr));
      setFixStatus('success');
    } catch {
      setFixStatus('error');
      setTimeout(() => setFixStatus('idle'), 3000);
    }
  };

  const fixLabel = {
    idle: 'Fix with Claude',
    loading: 'Posting...',
    success: 'Triggered',
    error: 'Failed',
  }[fixStatus];

  return (
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
        {isRenovatePR(pr) && (
          <Tooltip.Root>
            <Tooltip.Trigger>
              <div>
                <Button
                  variant={fixStatus === 'success' ? 'filled' : 'outline'}
                  variantSize="xs"
                  hasLoader={fixStatus === 'loading'}
                  isDisabled={fixStatus === 'success' || fixStatus === 'loading'}
                  onClick={handleFixWithClaude}
                >
                  {fixLabel}
                </Button>
              </div>
            </Tooltip.Trigger>
            <Tooltip.Content placement="top">
              Post @claude comment to trigger automated fix
            </Tooltip.Content>
          </Tooltip.Root>
        )}
        <ReviewerAvatars reviews={pr.reviews} />
        <span className={styles.card__time} title={new Date(pr.updatedAt).toLocaleString()}>
          {formatRelativeTime(pr.updatedAt)}
        </span>
      </div>
    </div>
  );
};
