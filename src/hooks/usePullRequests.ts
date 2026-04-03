import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { searchUserPRs, fetchPRDetails, fetchPRReviews, fetchCheckRuns } from '@api/github';
import type { PullRequest, PRSearchItem, Review, CheckRun, ReviewStatus, ChecksStatus, PRStats } from '@localTypes/github';

const POLL_INTERVAL = 60_000;

const extractRepoInfo = (repositoryUrl: string) => {
  const parts = repositoryUrl.replace('https://api.github.com/repos/', '').split('/');
  return { owner: parts[0], repo: parts[1] };
};

const computeReviewStatus = (reviews: Review[], isDraft: boolean): ReviewStatus => {
  if (isDraft) return 'draft';
  if (reviews.length === 0) return 'review_required';

  const latestByUser = new Map<string, Review>();
  for (const review of reviews) {
    const existing = latestByUser.get(review.user.login);
    if (!existing || new Date(review.submitted_at) > new Date(existing.submitted_at)) {
      latestByUser.set(review.user.login, review);
    }
  }

  const states = [...latestByUser.values()].map((r) => r.state);
  if (states.includes('CHANGES_REQUESTED')) return 'changes_requested';
  if (states.includes('APPROVED')) return 'approved';
  return 'review_required';
};

const computeChecksStatus = (checks: CheckRun[]): ChecksStatus => {
  if (checks.length === 0) return 'none';
  if (checks.some((c) => c.conclusion === 'failure')) return 'failure';
  if (checks.some((c) => c.status !== 'completed')) return 'pending';
  return 'success';
};

const computeStats = (prs: PullRequest[]): PRStats => ({
  total: prs.length,
  draft: prs.filter((pr) => pr.draft).length,
  needsReview: prs.filter((pr) => pr.reviewStatus === 'review_required').length,
  approved: prs.filter((pr) => pr.reviewStatus === 'approved').length,
  changesRequested: prs.filter((pr) => pr.reviewStatus === 'changes_requested').length,
});

const enrichPR = async (
  token: string,
  item: PRSearchItem,
): Promise<PullRequest> => {
  const { owner, repo } = extractRepoInfo(item.repository_url);

  const [details, reviews, checks] = await Promise.allSettled([
    fetchPRDetails(token, owner, repo, item.number),
    fetchPRReviews(token, owner, repo, item.number),
    fetchPRDetails(token, owner, repo, item.number).then((d) =>
      fetchCheckRuns(token, owner, repo, d.head.sha),
    ),
  ]);

  const prDetails = details.status === 'fulfilled' ? details.value : null;
  const prReviews: Review[] = reviews.status === 'fulfilled' ? reviews.value : [];
  const prChecks: CheckRun[] = checks.status === 'fulfilled' ? checks.value : [];

  return {
    id: item.id,
    number: item.number,
    title: item.title,
    htmlUrl: item.html_url,
    state: item.state,
    draft: item.draft,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    author: item.user,
    labels: item.labels,
    assignees: item.assignees,
    repo,
    owner,
    headRef: prDetails?.head.ref ?? '',
    baseRef: prDetails?.base.ref ?? '',
    reviews: prReviews,
    checks: prChecks,
    reviewStatus: computeReviewStatus(prReviews, item.draft),
    checksStatus: computeChecksStatus(prChecks),
  };
};

export const usePullRequests = () => {
  const { token, user } = useAuth();
  const [prs, setPrs] = useState<PullRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const fetchAll = useCallback(async () => {
    if (!token || !user) return;

    setIsLoading(true);
    setError(null);

    try {
      const items = await searchUserPRs(token, user.login);

      // Enrich in batches of 5 to avoid rate limits
      const enriched: PullRequest[] = [];
      for (let i = 0; i < items.length; i += 5) {
        const batch = items.slice(i, i + 5);
        const results = await Promise.all(batch.map((item) => enrichPR(token, item)));
        enriched.push(...results);
      }

      setPrs(enriched);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch PRs');
    } finally {
      setIsLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    fetchAll();

    intervalRef.current = setInterval(fetchAll, POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [fetchAll]);

  return {
    prs,
    isLoading,
    error,
    refresh: fetchAll,
    stats: computeStats(prs),
  };
};
