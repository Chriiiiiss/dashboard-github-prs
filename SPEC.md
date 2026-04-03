# GitHub PR Dashboard — Spec

## Context

Dashboard standalone pour lister les PRs en cours de l'utilisateur connecté sur l'organisation `stonal-tech` GitHub. Auth via GitHub OAuth (pas Keycloak). Styling avec le Design System Stonal (`@stonal-tech/lib-design-system-react` + `@stonal-tech/lib-design-token-ts`).

**Scope** : PRs où l'utilisateur est auteur, reviewer ou assigné.

---

## Architecture

```
dashboard-github-prs/
├── package.json
├── .env.example                    # GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
├── .nvmrc                          # 24
├── vite.config.ts                  # React plugin, SCSS, proxy /api -> Express
├── tsconfig.json                   # Strict mode, path aliases
├── server/
│   └── index.ts                    # Express: POST /api/auth/token (OAuth exchange)
├── src/
│   ├── index.html
│   ├── main.tsx                    # ReactDOM.createRoot
│   ├── App.tsx                     # Router: /login | /auth/callback | /
│   ├── App.module.scss
│   ├── styles/
│   │   └── main.scss              # ITCSS: design tokens import, generic reset
│   ├── auth/
│   │   ├── AuthContext.tsx         # createContext<AuthState>
│   │   ├── AuthProvider.tsx        # OAuth flow: redirect, callback, token storage
│   │   └── ProtectedRoute.tsx      # Redirect to /login if not authenticated
│   ├── api/
│   │   └── github.ts              # Typed fetch: searchPRs, fetchReviews, fetchChecks
│   ├── hooks/
│   │   ├── usePullRequests.ts     # Main data hook: fetch + transform + polling (60s)
│   │   ├── useFilters.ts          # Filter/sort state management
│   │   └── useAuth.ts             # useContext(AuthContext) shorthand
│   ├── types/
│   │   └── github.ts             # PR, Review, CheckRun, User, Label types
│   ├── components/
│   │   ├── DashboardHeader/       # UserAvatar, org name, refresh, sign out
│   │   ├── StatsBar/             # Cards: total, draft, needs review, approved, changes requested
│   │   ├── PRFilters/            # SegmentedControl (role), InputSelectFilter (repo), InputText (search)
│   │   ├── PRList/               # Liste principale
│   │   ├── PRCard/               # Card: title, repo Badge, labels, reviewers, checks, date
│   │   ├── StatusBadge/          # Badge coloré selon statut PR/review
│   │   ├── ReviewerAvatars/      # Stack d'UserAvatar des reviewers
│   │   └── ChecksIndicator/      # Icône success/failure/pending CI checks
│   └── pages/
│       ├── LoginPage/            # Button "Sign in with GitHub"
│       ├── CallbackPage/         # Gère le ?code= retour OAuth
│       └── DashboardPage/        # Assemble Header + Stats + Filters + PRList
```

---

## Étapes d'implémentation

### 1. Scaffolding projet

- Init pnpm dans `dashboard-github-prs/`
- **Dependencies** :
  - Core : `react`, `react-dom`, `react-router-dom`
  - Stonal DS : `@stonal-tech/lib-design-system-react`, `@stonal-tech/lib-design-token-ts`
  - Build : `vite`, `@vitejs/plugin-react`, `typescript`, `sass`
  - Server : `express`, `dotenv`, `cors`
  - Dev : `@types/react`, `@types/react-dom`, `@types/express`, `tsx`, `concurrently`
- `vite.config.ts` : plugin React, path aliases, proxy `/api` → `http://localhost:3001`
- `tsconfig.json` : strict, path aliases
- Scripts :
  ```json
  "dev": "concurrently \"pnpm run dev:server\" \"pnpm run dev:client\"",
  "dev:client": "vite",
  "dev:server": "tsx watch server/index.ts",
  "build": "tsc && vite build"
  ```

### 2. Serveur OAuth Express

**`server/index.ts`** (~50 lignes) :
- `POST /api/auth/token` : reçoit `{ code }`, échange avec GitHub pour `access_token`
- En prod : sert les fichiers statiques `dist/`

### 3. Auth frontend

- **`AuthProvider.tsx`** :
  - `login()` → redirect `github.com/login/oauth/authorize?client_id=XXX&scope=repo,read:org`
  - `handleCallback(code)` → POST `/api/auth/token` → GET `/user` pour profil
  - Token en mémoire (React state), pas localStorage
  - `logout()` → clear state
- **`ProtectedRoute.tsx`** : check `isAuthenticated`, sinon redirect `/login`
- **`LoginPage`** : écran centré + Button "Sign in with GitHub"
- **`CallbackPage`** : extrait `code`, appelle `handleCallback`, redirect `/`

### 4. Client API GitHub

**`api/github.ts`** :
- `searchUserPRs(token, username)` → `GET /search/issues?q=org:stonal-tech+is:pr+is:open+involves:{username}`
- `fetchPRReviews(token, owner, repo, prNumber)` → statut review
- `fetchCheckRuns(token, owner, repo, sha)` → statut CI
- `fetchUser(token)` → profil utilisateur
- Pagination via `Link` header

**`types/github.ts`** : interfaces PR, Review, CheckRun, Label, User

### 5. Styles & Layout

- `styles/main.scss` : import design tokens, reset
- `App.module.scss` : layout grid full-page
- Theme "light" via tokens DS Stonal

### 6. Composants Dashboard

#### DashboardHeader
Header custom : `UserAvatar` + `Title` "stonal-tech" + `Button` refresh/sign out

#### StatsBar
Row de `Card` cliquables : Total | Draft | Needs Review | Approved | Changes Requested

#### PRFilters
- `SegmentedControl` : Author | Reviewer | All
- `InputSelectFilter` : filtre par repo
- `InputText` : recherche titre
- Sort : Newest, Oldest, Recently Updated

#### PRCard
`Card` avec : icône statut, titre (lien GitHub), repo `Badge`, labels `Badge`, `UserAvatar` reviewers, checks indicator, temps relatif, branche source → target

#### PRList
Map de `PRCard` + `Loader` + `EmptyState`

### 7. Hook `usePullRequests`
- Fetch PRs via search API
- Enrichissement lazy : reviews + checks par PR
- Auto-refresh 60s
- Expose : `{ prs, isLoading, error, refresh, stats }`

### 8. Hook `useFilters`
- State : `{ role, repo, search, sort }`
- Filtrage côté client
- Expose : `{ filters, setFilter, filteredPRs, availableRepos }`

---

## Composants Design System utilisés

| Composant | Usage |
|---|---|
| `Button` | Sign in, refresh, sign out |
| `Card` | PR cards, stats cards |
| `Badge` | Repo name, labels, statut |
| `InputText` | Recherche titre |
| `InputSelectFilter` | Filtre repo |
| `SegmentedControl` | Filtre rôle |
| `UserAvatar` | Avatars utilisateur/reviewers |
| `Tooltip` | Info hover |
| `Loader` | Loading states |
| `EmptyState` | Aucun résultat |
| `Icon` | Icônes statut |
| `Title` | Titres sections |
| `Divider` | Séparateurs |
| `Link` | Liens GitHub |

---

## Prérequis

1. **Créer GitHub OAuth App** sur `https://github.com/settings/developers` :
   - Homepage URL : `http://localhost:5173`
   - Callback URL : `http://localhost:5173/auth/callback`
   - Copier `Client ID` et `Client Secret` dans `.env`
2. **AWS CodeArtifact login** : `pnpm run ca:login` (packages `@stonal-tech/*`)

---

## Vérification

1. `pnpm install` → OK
2. `pnpm run dev` → Express + Vite démarrent
3. `http://localhost:5173` → page login
4. Sign in with GitHub → autoriser → dashboard
5. PRs ouvertes affichées avec filtres fonctionnels
6. Auto-refresh 60s
7. Sign out → retour login
