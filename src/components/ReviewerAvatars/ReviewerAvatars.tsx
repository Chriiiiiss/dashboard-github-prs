import { UserAvatar, Tooltip } from '@stonal-tech/lib-design-system-react';
import type { Review } from '@localTypes/github';
import styles from './ReviewerAvatars.module.scss';

interface ReviewerAvatarsProps {
  reviews: Review[];
}

export const ReviewerAvatars = ({ reviews }: ReviewerAvatarsProps) => {
  // Deduplicate reviewers, keep latest review per user
  const reviewerMap = new Map<string, Review>();
  for (const review of reviews) {
    const existing = reviewerMap.get(review.user.login);
    if (!existing || new Date(review.submitted_at) > new Date(existing.submitted_at)) {
      reviewerMap.set(review.user.login, review);
    }
  }

  const uniqueReviewers = [...reviewerMap.values()];
  if (uniqueReviewers.length === 0) return null;

  return (
    <div className={styles.reviewers}>
      {uniqueReviewers.map((review) => (
        <Tooltip.Root key={review.user.login}>
          <Tooltip.Trigger>
            <UserAvatar
              name={review.user.login}
              imgUrl={review.user.avatar_url}
              variantSize="xs"
            />
          </Tooltip.Trigger>
          <Tooltip.Content placement="top">
            {review.user.login} — {review.state.toLowerCase().replace('_', ' ')}
          </Tooltip.Content>
        </Tooltip.Root>
      ))}
    </div>
  );
};
