# Project Milestones — Hacker News Frontend Clone
---

> **Companion document to `prd.md` and `production-checklist.md`**  
> **See `glossary.md` for terminology definitions.**  
> Milestones ordered for incremental delivery. Testing integrated into each milestone.

---

## Milestone Overview

| # | Milestone | Focus | Est. Duration |
|---|-----------|-------|---------------|
| M1 | Project Foundation | Setup, Config, Error Handling, Logging + Tests | 5-6 hrs |
| M2 | Domain & Resilient Adapter | Models, Adapter with retry/cache/timeout + Tests | 5-6 hrs |
| M3 | Services Layer | Business logic, hooks + Tests | 3-4 hrs |
| M4 | Post List Page | Homepage with posts + Tests | 4-5 hrs |
| M5 | Post Detail & Comments | Detail page with threaded comments + Tests | 4-5 hrs |
| M6 | Production Readiness | Health checks, security headers, Docker, CI | 4-5 hrs |
| M7 | Documentation & Polish | README, architecture docs, styling | 2-3 hrs |

**Total Estimated Duration:** 28-35 hours

---

## Testing Approach

**Testing is integrated into each milestone, not a separate phase.**

Each milestone includes:
- Unit tests for new utilities/functions
- Component tests for new UI components
- Integration tests where applicable

### Testing Tools
- **Jest** — Test runner
- **React Testing Library** — Component testing
- **MSW (Mock Service Worker)** — API mocking

### Setup in M1
MSW and Jest are configured in M1 and used throughout all subsequent milestones.

---

## Security Scope (Read-Only Website)

Since this is a **read-only website** with no user authentication, forms, or user-generated content:

### Required Security
| Security Measure | Why Needed |
|------------------|------------|
| Basic security headers | Defense in depth, prevent clickjacking |
| HTML sanitization for HN comments | HN API returns HTML that could contain XSS |
| CSP header | Restrict resource loading |
| Parameter validation | Ensure post IDs are numeric |

### NOT Required (Read-Only App)
| Security Measure | Why Not Needed |
|------------------|----------------|
| CSRF protection | No forms or state-changing actions |
| Authentication/Sessions | No user accounts |
| Input validation for forms | No user input fields |
| Rate limiting | No user actions to limit |
| Password hashing | No passwords |

---

## M1: Project Foundation

**Goal:** Establish project structure with production-grade infrastructure and testing foundation.

### Tasks

#### M1.1 — Scaffold Next.js Application
- [ ] Initialize Next.js 14+ with App Router, **Turbopack enabled**, and **no import alias** (answer "No" to alias prompt or use `--no-import-alias` flag)
- [ ] Verify `package.json` has `"dev": "next dev --turbopack"` for Turbopack dev server
- [ ] Configure TypeScript (`tsconfig.json`) — ensure no `paths` alias configured
- [ ] Install and configure Tailwind CSS
- [ ] Add ESLint with code quality rules (see `production-checklist.md` §1)
- [ ] Add Prettier for formatting
- [ ] Configure ESLint complexity rules (`complexity`, `max-lines-per-function`, `max-depth`, `max-params`)
- [ ] Configure TypeScript strict rules (`no-explicit-any`, `explicit-function-return-type`)
- [ ] Initialize Git repository

**Output:** Empty Next.js app that builds and runs with Turbopack and code quality enforcement

#### M1.2 — Create Folder Structure
- [ ] Create all directories per naming conventions:
  ```
  app/
  components/
  domain/
  services/
  adapters/
  hooks/
  lib/
  mocks/
  tests/
  ```

**Output:** Complete folder structure matching PRD

#### M1.3 — Testing Infrastructure Setup
- [ ] Install Jest, React Testing Library, MSW
- [ ] Create `jest.config.js`
- [ ] Create `jest.setup.ts` (start MSW server)
- [ ] Create `mocks/handlers.ts` (empty, ready for handlers)
- [ ] Create `mocks/server.ts` (MSW server for tests)
- [ ] Add test script to `package.json`
- [ ] Verify `npm test` runs successfully

**Output:** Working test infrastructure

#### M1.4 — Configuration Module
- [ ] Create `lib/config.ts`
- [ ] Define all environment variables with types
- [ ] Implement validation (fail fast on missing required vars)
- [ ] Create `.env.example` with all variables documented
- [ ] Create `.env.development` with defaults
- [ ] **Test:** Config validation throws on missing required vars

**Env Vars:**
| Variable | Required | Default |
|----------|----------|---------|
| `NODE_ENV` | Yes | `development` |
| `NEXT_PUBLIC_API_BASE_URL` | Yes | — |
| `DATA_SOURCE` | No | `hackernews` |
| `LOG_LEVEL` | No | `info` |
| `CACHE_TTL_SECONDS` | No | `60` |
| `API_TIMEOUT_MS` | No | `10000` |
| `API_RETRY_COUNT` | No | `3` |

**Output:** `lib/config.ts`, `.env.example`, config tests

#### M1.5 — Error Handling Infrastructure
- [ ] Create `lib/errors.ts` with custom error classes:
  - `AppError` (base class)
  - `GatewayError`
  - `NotFoundError`
  - `TimeoutError`
- [ ] Create `app/error.tsx` (root error boundary)
- [ ] Create `app/global-error.tsx` (layout error boundary)
- [ ] **Test:** Error boundary renders error UI correctly

**Output:** `lib/errors.ts`, error boundary components, tests

#### M1.6 — Logging Module
- [ ] Install `pino`
- [ ] Create `lib/logger.ts`
- [ ] Implement structured JSON logging
- [ ] Configure log levels based on `LOG_LEVEL` env var

**Output:** `lib/logger.ts`

#### M1.7 — Retry Utility
- [ ] Create `lib/retry.ts`
- [ ] Implement `withRetry<T>()` function
- [ ] Support exponential backoff (1s → 2s → 4s)
- [ ] Configure max retries from `API_RETRY_COUNT`
- [ ] **Test:** Retry logic with mock failures

**Output:** `lib/retry.ts`, retry tests

#### M1.8 — Caching Strategy (Next.js Built-in)
- [ ] Document Next.js fetch caching approach in adapter code comments
- [ ] No custom `lib/cache.ts` needed — using Next.js `fetch()` with `next: { revalidate }`

**Note:** Custom cache implementation deferred. Next.js built-in caching handles stale-while-revalidate automatically.

**Output:** Caching configured via fetch options in adapter (no separate module)

### M1 Acceptance Criteria
- [ ] `npm run dev` starts without errors
- [ ] `npm run build` completes successfully
- [ ] `npm run lint` passes with no errors
- [ ] `npm test` runs and passes
- [ ] ESLint enforces code quality rules (complexity ≤ 10, max-depth ≤ 3, max-params ≤ 4)
- [ ] TypeScript `any` types cause linter errors
- [ ] Missing required env var causes clear error message
- [ ] Error boundary displays user-friendly UI
- [ ] Retry utility has passing tests

---

## M2: Domain Models & Resilient Adapter

**Goal:** Create domain types and a production-ready API adapter with retry, timeout, caching, and tests.

### Tasks

#### M2.1 — Domain Models
- [ ] Create `domain/models.ts`
- [ ] Define `Post` interface:
  ```typescript
  interface Post {
    id: number;
    title: string;
    url?: string;
    text?: string;
    author: string;
    points: number;
    commentCount: number;
    commentIds: number[];
    createdAt: Date;
  }
  ```
- [ ] Define `Comment` interface:
  ```typescript
  interface Comment {
    id: number;
    author: string;
    text: string;
    createdAt: Date;
    parentId?: number;
    children: Comment[];
  }
  ```
- [ ] Define `User` interface (stub for future)

**Output:** `domain/models.ts`

#### M2.2 — MSW Handlers for HN API
- [ ] Add handlers for HN API endpoints in `mocks/handlers.ts`:
  - `GET /v0/topstories.json`
  - `GET /v0/newstories.json`
  - `GET /v0/beststories.json`
  - `GET /v0/item/:id.json`
- [ ] Create mock data matching HN API response shapes
- [ ] Add handlers for error scenarios (404, 500, timeout)

**Output:** MSW handlers for all adapter tests

#### M2.3 — Hacker News Adapter
- [ ] Create `adapters/hackerNewsAdapter.ts`
- [ ] Implement mapping from HN API response to Domain Models:
  - `descendants` → `commentCount`
  - `kids` → `commentIds`
  - `time` → `createdAt` (convert Unix timestamp)
- [ ] Implement adapter methods:
  - `getTopPostIds(): Promise<number[]>`
  - `getNewPostIds(): Promise<number[]>`
  - `getBestPostIds(): Promise<number[]>`
  - `getPostById(id: number): Promise<Post>`
  - `getPostsByIds(ids: number[]): Promise<Post[]>`
  - `getCommentById(id: number): Promise<Comment>`
- [ ] Integrate timeout handling (`AbortController`)
- [ ] Wrap API calls with `withRetry()`
- [ ] Use Next.js fetch caching with `next: { revalidate }` option
- [ ] Map errors to custom error classes
- [ ] Log all adapter calls

**Revalidate Times (Next.js Caching):**
| Data | Revalidate |
|------|------------|
| Post ID lists | 60s |
| Individual posts | 300s (5 min) |
| Comments | 120s (2 min) |

**Output:** `adapters/hackerNewsAdapter.ts`

#### M2.4 — Adapter Tests
- [ ] **Test:** HN JSON → Domain Model mapping
- [ ] **Test:** `getTopPostIds()` returns array
- [ ] **Test:** `getPostById()` returns Post
- [ ] **Test:** 404 response throws NotFoundError
- [ ] **Test:** 500 response retries then throws GatewayError
- [ ] **Test:** Timeout triggers TimeoutError

**Note:** Next.js fetch caching is tested at integration level, not unit tests.

**Output:** `tests/adapters/hackerNewsAdapter.test.ts`

#### M2.5 — Adapter Index
- [ ] Create `adapters/index.ts`
- [ ] Export adapter based on `DATA_SOURCE` config

**Output:** `adapters/index.ts`

### M2 Acceptance Criteria
- [ ] All adapter methods work correctly
- [ ] Mapping tests pass
- [ ] Error handling tests pass
- [ ] Retry behavior verified
- [ ] Next.js fetch caching configured with correct revalidate times
- [ ] All tests pass with MSW (no real network calls)

---

## M3: Services Layer

**Goal:** Create business logic layer with pagination and data transformation, fully tested.

### Tasks

#### M3.1 — Posts Service
- [ ] Create `services/postsService.ts`
- [ ] Implement `fetchPosts({ sort, pageSize, page })`:
  - Get post IDs based on sort (top/new/best)
  - Slice IDs for pagination
  - Batch fetch posts by IDs
  - Return `Post[]`
- [ ] Implement `getPostById(id)`:
  - Fetch single post
  - Handle not found
- [ ] **Test:** Pagination slices correctly
- [ ] **Test:** Sort parameter selects correct ID list

**Output:** `services/postsService.ts`, tests

#### M3.2 — Comments Service
- [ ] Create `services/commentsService.ts`
- [ ] Implement `getCommentsByPostId(postId, maxDepth?)`:
  - Fetch post to get `commentIds`
  - Recursively fetch comments (limit depth for MVP)
  - Build nested comment tree
  - Return `Comment[]`
- [ ] Handle missing/deleted comments gracefully
- [ ] **Test:** Comment tree builds correctly
- [ ] **Test:** Depth limiting works

**Output:** `services/commentsService.ts`, tests

#### M3.3 — Client Hooks
- [ ] Create `hooks/usePosts.ts`:
  - Use `useState` / `useEffect` or SWR
  - Handle loading, error, data states
  - Support refetch
- [ ] Create `hooks/useComments.ts`:
  - Fetch comments for a post
  - Handle loading, error states
- [ ] Create `hooks/useAuth.ts` (stub for future):
  - Return `{ user: null, isAuthenticated: false }`

**Output:** `hooks/usePosts.ts`, `hooks/useComments.ts`, `hooks/useAuth.ts`

### M3 Acceptance Criteria
- [ ] Pagination returns correct slices
- [ ] Comment tree structure is correct
- [ ] Hooks provide loading/error/data states
- [ ] All service tests pass

---

## M4: Post List Page

**Goal:** Implement homepage with post list, sorting, and load more.

### Tasks

#### M4.1 — Post List Page
- [ ] Create `app/page.tsx` (server component)
- [ ] Fetch posts using `postsService`
- [ ] Create `app/loading.tsx`
- [ ] Use existing `app/error.tsx`

**Output:** `app/page.tsx`, `app/loading.tsx`

#### M4.2 — PostList Component
- [ ] Create `components/PostList.tsx`
- [ ] Render list of `PostItem`
- [ ] Show empty state
- [ ] **Test:** Renders correct number of posts
- [ ] **Test:** Empty state shown when no posts

**Output:** `components/PostList.tsx`, tests

#### M4.3 — PostItem Component
- [ ] Create `components/PostItem.tsx`
- [ ] Display rank, title, domain, author, points, comment count, time
- [ ] Link to external URL and detail page
- [ ] **Test:** All fields rendered correctly
- [ ] **Test:** Links have correct hrefs

**Output:** `components/PostItem.tsx`, tests

#### M4.4 — Sorting Controls
- [ ] Create `components/SortTabs.tsx`
- [ ] Tabs: Top / New / Best
- [ ] Use URL search params
- [ ] **Test:** Active tab highlighted
- [ ] **Test:** Tab click updates URL

**Output:** `components/SortTabs.tsx`, tests

#### M4.5 — Load More
- [ ] Implement "Load More" button
- [ ] Append new posts to list

**Output:** Load more functionality

#### M4.6 — Navbar
- [ ] Create `components/Navbar.tsx`
- [ ] Add to `app/layout.tsx`

**Output:** `components/Navbar.tsx`

### M4 Acceptance Criteria
- [ ] Homepage displays posts
- [ ] Sorting works
- [ ] Load more works
- [ ] All component tests pass

---

## M5: Post Detail & Comments

**Goal:** Implement post detail page with threaded comments.

### Tasks

#### M5.1 — HTML Sanitization
- [ ] Create `lib/sanitize.ts`
- [ ] Install `isomorphic-dompurify`
- [ ] Sanitize HN comment HTML (removes malicious scripts)
- [ ] **Test:** XSS payloads are neutralized

**Output:** `lib/sanitize.ts`, tests

#### M5.2 — Post Detail Page
- [ ] Create `app/posts/[id]/page.tsx`
- [ ] Fetch post and comments
- [ ] Create `app/posts/[id]/loading.tsx`
- [ ] Create `app/posts/[id]/error.tsx`
- [ ] Validate post ID parameter (numeric only)

**Output:** Post detail page files

#### M5.3 — PostDetail Component
- [ ] Create `components/PostDetail.tsx`
- [ ] Display title, URL/text, author, points, time
- [ ] **Test:** All fields rendered

**Output:** `components/PostDetail.tsx`, tests

#### M5.4 — CommentList Component
- [ ] Create `components/CommentList.tsx`
- [ ] Render nested `CommentItem` components
- [ ] **Test:** Nested structure renders correctly

**Output:** `components/CommentList.tsx`, tests

#### M5.5 — CommentItem Component
- [ ] Create `components/CommentItem.tsx`
- [ ] Display author, time, sanitized text
- [ ] Collapse/expand toggle
- [ ] Render children recursively
- [ ] **Test:** Collapse hides children
- [ ] **Test:** Sanitized HTML rendered safely

**Output:** `components/CommentItem.tsx`, tests

### M5 Acceptance Criteria
- [ ] Detail page shows post and comments
- [ ] Comments render as nested tree
- [ ] Collapse/expand works
- [ ] HTML in comments is sanitized
- [ ] Invalid post ID returns 404
- [ ] All tests pass

---

## M6: Production Readiness

**Goal:** Add health checks, minimal security headers, Docker, and CI.

### Tasks

#### M6.1 — Health Checks
- [ ] Create `app/api/health/route.ts` (liveness)
- [ ] Create `app/api/health/ready/route.ts` (readiness)
- [ ] **Test:** Endpoints return correct responses

**Output:** Health check endpoints, tests

#### M6.2 — Security Headers (Read-Only Optimized)
- [ ] Configure in `next.config.js`:

| Header | Value |
|--------|-------|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Content-Security-Policy` | Strict policy (see below) |

**CSP for Read-Only Site:**
```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
font-src 'self';
connect-src 'self' https://hacker-news.firebaseio.com;
frame-ancestors 'none';
```

**Output:** Security headers configured

#### M6.3 — Dockerfile
- [ ] Create multi-stage `Dockerfile`
- [ ] Optimize for small image size
- [ ] Run as non-root user
- [ ] Add HEALTHCHECK instruction

**Output:** `Dockerfile`

#### M6.4 — Docker Compose
- [ ] Create `docker-compose.yml` (production)
- [ ] Create `docker-compose.dev.yml` (development with hot reload)
- [ ] Configure health checks

**Output:** Docker Compose files

#### M6.5 — GitHub Actions CI
- [ ] Create `.github/workflows/ci.yml`
- [ ] Steps: checkout, install, lint, type-check, test, build, audit

**Output:** CI workflow

#### M6.6 — Verify Production Build
- [ ] `npm run build` succeeds
- [ ] `docker compose up` works
- [ ] Health checks pass in container
- [ ] All tests pass in CI

**Output:** Verified production setup

### M6 Acceptance Criteria
- [ ] Health endpoints work
- [ ] Security headers present in responses
- [ ] Docker container runs correctly
- [ ] CI pipeline passes

---

## M7: Documentation & Polish

**Goal:** Complete documentation and final refinements.

### Tasks

#### M7.1 — README.md
- [ ] Prerequisites
- [ ] Quick start (local and Docker)
- [ ] Running tests
- [ ] Environment variables
- [ ] Architecture overview
- [ ] Backend swap instructions

**Output:** Complete `README.md`

#### M7.2 — ARCHITECTURE.md
- [ ] Layer diagram
- [ ] Data flow explanation
- [ ] Key decisions

**Output:** `ARCHITECTURE.md`

#### M7.3 — Responsive Design Polish
- [ ] Verify mobile, tablet, desktop layouts
- [ ] Test touch targets

**Output:** Polished responsive UI

#### M7.4 — Loading States
- [ ] Skeleton loaders for post list
- [ ] Skeleton loaders for comments

**Output:** Polished loading states

#### M7.5 — Final Review
- [ ] Run full test suite
- [ ] Verify all features
- [ ] Clean up code

**Output:** Production-ready application

### M7 Acceptance Criteria
- [ ] Documentation complete
- [ ] UI polished
- [ ] All tests pass
- [ ] Ready for deployment

---

## Milestone Dependencies

```
M1 ─────► M2 ─────► M3 ─────► M4 ─────► M5 ─────► M6 ─────► M7
          │                   │         │
          └── Testing ────────┴─────────┘
              integrated throughout
```

**Critical Path:** M1 → M2 → M3 → M4 → M5 → M6 → M7

**Testing runs continuously** — each milestone includes its own tests.

---

## Security Summary (Read-Only)

| Layer | Measure | Implementation |
|-------|---------|----------------|
| HTTP | Security headers | `next.config.js` |
| HTTP | CSP | Restrictive policy, no inline scripts needed |
| Content | HTML sanitization | `lib/sanitize.ts` for HN comment HTML |
| Params | ID validation | Numeric check in `[id]/page.tsx` |

**That's it.** No auth, CSRF, input validation, or rate limiting needed for read-only.

---

## Quick Reference

| Milestone | Focus | Blockers | Est. Hours |
|-----------|-------|----------|------------|
| M1 | Foundation | None | 5-6 |
| M2 | Adapter | M1 | 5-6 |
| M3 | Services | M2 | 3-4 |
| M4 | Post List | M3 | 4-5 |
| M5 | Post Detail | M3 | 4-5 |
| M6 | Production | M5 | 4-5 |
| M7 | Docs/Polish | All | 2-3 |

---

*End of Milestones Document*
