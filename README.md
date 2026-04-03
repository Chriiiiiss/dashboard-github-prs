# GitHub PR Dashboard

Standalone dashboard to monitor open pull requests across the `stonal-tech` GitHub organization. Authenticates via GitHub OAuth and uses the Stonal Design System for UI components.

## Features

- Lists all open PRs where the authenticated user is author, reviewer, or assignee
- Review status indicators: approved, changes requested, needs review, draft
- CI checks status per PR (success, failure, pending)
- Filter by role (author/reviewer/all), repository, and free-text search
- Sort by newest, oldest, or recently updated
- Clickable stats cards to filter by review status
- Auto-refresh every 60 seconds
- Reviewer avatars with tooltip showing review state
- GitHub label colors rendered from the API

## Prerequisites

- Node.js >= 24
- pnpm
- A GitHub OAuth App (see Setup below)
- AWS CodeArtifact access for `@stonal-tech/*` packages

## Setup

1. Create a GitHub OAuth App at https://github.com/settings/developers:
   - Homepage URL: `http://localhost:5173`
   - Authorization callback URL: `http://localhost:5173/auth/callback`

2. Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

```
GITHUB_CLIENT_ID=<your_client_id>
GITHUB_CLIENT_SECRET=<your_client_secret>
VITE_GITHUB_CLIENT_ID=<your_client_id>
```

3. Login to CodeArtifact and install dependencies:

```bash
pnpm run ca:login
pnpm install
```

## Development

```bash
pnpm run dev
```

This starts both the Express OAuth server (port 3001) and the Vite dev server (port 5173). Open http://localhost:5173.

## Production Build

```bash
pnpm run build
```

Output goes to `dist/`. The Express server serves these static files when `NODE_ENV=production`.

## Architecture

```
dashboard-github-prs/
├── server/index.ts            Express server: POST /api/auth/token (OAuth code exchange)
├── src/
│   ├── api/github.ts          GitHub API client (search, reviews, checks, user)
│   ├── auth/                  AuthContext, AuthProvider, ProtectedRoute
│   ├── hooks/
│   │   ├── usePullRequests.ts Fetch + enrich PRs + 60s polling
│   │   ├── useFilters.ts      Client-side filtering and sorting
│   │   └── useAuth.ts         Auth context shorthand
│   ├── components/
│   │   ├── DashboardHeader/   Org name, user info, refresh, sign out
│   │   ├── StatsBar/          Clickable stat cards by review status
│   │   ├── PRFilters/         Role segmented control, repo filter, search, sort
│   │   ├── PRCard/            PR card with status, labels, reviewers, checks
│   │   ├── PRList/            PR list with loading and empty states
│   │   ├── StatusBadge/       Colored pill for review status
│   │   ├── ReviewerAvatars/   Stacked reviewer avatars with tooltips
│   │   └── ChecksIndicator/   CI status icon with tooltip
│   ├── pages/
│   │   ├── LoginPage/         GitHub sign-in screen
│   │   ├── CallbackPage/      OAuth callback handler
│   │   └── DashboardPage/     Main dashboard assembly
│   ├── types/github.ts        TypeScript interfaces
│   └── styles/main.scss       Global styles and design token imports
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Tech Stack

- React 19, TypeScript, Vite
- Express (OAuth token exchange server)
- GitHub REST API v3
- @stonal-tech/lib-design-system-react (UI components)
- @stonal-tech/lib-design-token (design tokens, SCSS)
- SCSS Modules
