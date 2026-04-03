export interface User {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string | null;
}

export interface Label {
  id: number;
  name: string;
  color: string;
}

export interface PRSearchItem {
  id: number;
  number: number;
  title: string;
  html_url: string;
  state: string;
  draft: boolean;
  created_at: string;
  updated_at: string;
  user: User;
  labels: Label[];
  assignees: User[];
  pull_request: {
    html_url: string;
    merged_at: string | null;
  };
  repository_url: string;
}

export interface Review {
  id: number;
  user: User;
  state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'DISMISSED' | 'PENDING';
  submitted_at: string;
}

export interface CheckRun {
  id: number;
  name: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: 'success' | 'failure' | 'neutral' | 'cancelled' | 'skipped' | 'timed_out' | 'action_required' | null;
}

export interface PullRequest {
  id: number;
  number: number;
  title: string;
  htmlUrl: string;
  state: string;
  draft: boolean;
  createdAt: string;
  updatedAt: string;
  author: User;
  labels: Label[];
  assignees: User[];
  repo: string;
  owner: string;
  headRef: string;
  baseRef: string;
  reviews: Review[];
  checks: CheckRun[];
  reviewStatus: ReviewStatus;
  checksStatus: ChecksStatus;
}

export type ReviewStatus = 'approved' | 'changes_requested' | 'review_required' | 'draft';

export type ChecksStatus = 'success' | 'failure' | 'pending' | 'none';

export interface PRStats {
  total: number;
  draft: number;
  needsReview: number;
  approved: number;
  changesRequested: number;
}

export type RoleFilter = 'author' | 'reviewer' | 'all';
export type SortOption = 'newest' | 'oldest' | 'recently_updated';

export interface Filters {
  role: RoleFilter;
  repo: string;
  search: string;
  sort: SortOption;
}
