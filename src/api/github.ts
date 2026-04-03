import type { User, PRSearchItem, Review, CheckRun } from '@localTypes/github';

const GITHUB_API = 'https://api.github.com';

const headers = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
});

export const fetchUser = async (token: string): Promise<User> => {
  const res = await fetch(`${GITHUB_API}/user`, { headers: headers(token) });
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
};

export const searchUserPRs = async (
  token: string,
  username: string,
): Promise<PRSearchItem[]> => {
  const items: PRSearchItem[] = [];
  let page = 1;

  while (true) {
    const q = encodeURIComponent(`org:stonal-tech is:pr is:open involves:${username}`);
    const res = await fetch(
      `${GITHUB_API}/search/issues?q=${q}&per_page=100&page=${page}`,
      { headers: headers(token) },
    );

    if (!res.ok) throw new Error(`Search failed: ${res.status}`);

    const data = await res.json();
    items.push(...data.items);

    if (items.length >= data.total_count) break;
    page++;
  }

  return items;
};

export const fetchPRDetails = async (
  token: string,
  owner: string,
  repo: string,
  prNumber: number,
): Promise<{ head: { ref: string; sha: string }; base: { ref: string } }> => {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/pulls/${prNumber}`,
    { headers: headers(token) },
  );
  if (!res.ok) throw new Error(`Failed to fetch PR #${prNumber}`);
  return res.json();
};

export const fetchPRReviews = async (
  token: string,
  owner: string,
  repo: string,
  prNumber: number,
): Promise<Review[]> => {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/pulls/${prNumber}/reviews`,
    { headers: headers(token) },
  );
  if (!res.ok) throw new Error(`Failed to fetch reviews for PR #${prNumber}`);
  return res.json();
};

export const fetchCheckRuns = async (
  token: string,
  owner: string,
  repo: string,
  sha: string,
): Promise<CheckRun[]> => {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/commits/${sha}/check-runs?per_page=100`,
    { headers: headers(token) },
  );
  if (!res.ok) throw new Error(`Failed to fetch check runs`);
  const data = await res.json();
  return data.check_runs;
};

export const postPRComment = async (
  token: string,
  owner: string,
  repo: string,
  issueNumber: number,
  body: string,
): Promise<void> => {
  const res = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}/issues/${issueNumber}/comments`,
    {
      method: 'POST',
      headers: { ...headers(token), 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    },
  );
  if (!res.ok) throw new Error(`Failed to post comment: ${res.status}`);
};
