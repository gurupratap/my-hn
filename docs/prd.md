# Product Requirements Document — Hacker News Frontend Clone
---

## Executive summary

A read-only, mobile-responsive Hacker News frontend clone built with Next.js (App Router), React, TypeScript, and Tailwind CSS. 

**Key goals:**
* Consistent domain language (use *Post* everywhere)
* Clean layered architecture (Domain Models → Services → API Adapter → Pages/Components)
* Production-ready infrastructure (error handling, logging, retry logic, health checks)
* Strong testability (Jest + React Testing Library + MSW)
* Next.js built-in caching for performance (no custom cache implementation)
* Dockerized deployment with CI/CD pipeline
* Minimal dependencies so backend (Go/Python) can be swapped by updating the API Adapter only

**Scope:** Post List Page, Post Detail Page with threaded Comments, sorting, pagination, responsive UI, tests, Docker, CI.

**Companion documents:**
* `glossary.md` — Terminology and naming conventions
* `production-checklist.md` — Production readiness specifications
* `milestones.md` — Detailed milestone breakdown
* `tasks.md` — Implementation task list

---

# User flows

> **See `glossary.md` for terminology definitions.**

## 1. Browse Posts

* User lands on Post List Page (`/`).
* Default sort = Top. User can switch to New/Best via tabs.
* Page displays 30 posts; "Load more" fetches next slice via service.
* Clicking a post title navigates to Post Detail Page (`/posts/{id}`).

## 2. View Post & Comments

* Post Detail Page shows `PostDetail` (title, meta, points, commentCount).
* Below, `CommentList` renders nested `CommentItem`s.
* Comments may be collapsed/expanded (client-only state in the `CommentItem` component).

## 3. (Optional) Search/Sort

* Search box filters visible posts by title (client) or calls the adapter search endpoint (if implemented).

## 4. (Future) Auth & Actions

* Auth state is provided by `AuthContext` (hook `useAuth`).
* When authenticated, `PostItem` and `CommentItem` enable Vote buttons and show Submit/Edit flows (only UI initially).

---

# Product scope

**Must-have**

* Post List Page (paginated or "Load more") with PostItem showing:
  * Rank, title (link), domain, author, points, commentCount
* Post Detail Page with PostDetail at top and threaded comments below
* Sorting controls: Top / New / Best (UI only; map to relevant adapter calls)
* Responsive design (mobile-first)
* Domain Models + API Adapter (Hacker News) and Services
* Tests: unit tests for adapter mapping + component tests for PostList and Comment rendering using MSW
* Dockerfile for dev/prod run

**Nice-to-have if time permits**

* Client-side "Load more" (infinite scroll)
* Search by title (client-side filter)
* Basic auth UI stub and Submit Post Page (form UI, no backend)
* Small set of integration tests

---

# Naming + file/folder conventions

> **See `glossary.md` for complete naming rules and terminology.**

Adopt these conventions from day 0 so reviewers and teammates immediately understand the project.

* `app/` (Next.js App Router)
  * `app/page.tsx` → **Post List Page**
  * `app/posts/[id]/page.tsx` → **Post Detail Page**
  * `app/submit/page.tsx` → **Submit Post Page** (placeholder initially)
  * `app/login/page.tsx`, `app/signup/page.tsx` (placeholders)

* `components/`
  * `components/PostList.tsx`
  * `components/PostItem.tsx`
  * `components/PostDetail.tsx`
  * `components/CommentList.tsx`
  * `components/CommentItem.tsx`
  * `components/Navbar.tsx`

* `domain/`
  * `domain/models.ts` — Domain Model interfaces (`Post`, `Comment`, `User`)

* `services/`
  * `services/postsService.ts` — business logic (pagination, sort keys)
  * `services/commentsService.ts` — comment tree building and depth limiting

* `adapters/`
  * `adapters/hackerNewsAdapter.ts` — implementation of API Adapter (maps HN response → Domain Models)
  * `adapters/index.ts` — exports chosen adapter; swapping backends changes this file only

* `hooks/`
  * `hooks/usePosts.ts`
  * `hooks/useComments.ts`
  * `hooks/useAuth.ts`

* `lib/`
  * `lib/config.ts` — central config (e.g., `NEXT_PUBLIC_API_BASE_URL`, data source flag)
  * `lib/errors.ts` — custom error classes (`AppError`, `ApiAdapterError`, `NotFoundError`, `TimeoutError`)
  * `lib/logger.ts` — structured logging with pino
  * `lib/retry.ts` — retry utility with exponential backoff
  * `lib/sanitize.ts` — HTML sanitization for comment content

* `mocks/` — MSW handlers for tests and dev
* `tests/` — Jest + RTL tests

---

# Technical implementation plan

> **See `milestones.md` for detailed task breakdown and `production-checklist.md` for production readiness specifications.**

## M1 — Project Foundation (4-5 hrs)

* Scaffold Next.js app with TypeScript, Tailwind, ESLint, Prettier
* Configure ESLint with code quality rules (see `production-checklist.md` §1)
* Create folder structure from Naming section
* Set up Jest, React Testing Library, and MSW for testing
* Add `lib/config.ts` with environment variable validation
* Add `lib/errors.ts` with custom error classes
* Add `lib/logger.ts` with structured logging (pino)
* Add `lib/retry.ts` with exponential backoff utility
* Create error boundary components (`app/error.tsx`, `app/global-error.tsx`)

## M2 — Domain Models & Resilient Adapter (5-6 hrs)

* Create `domain/models.ts` with `Post`, `Comment`, `User` interfaces
* Implement `adapters/hackerNewsAdapter.ts`:
  * Map Hacker News JSON → Domain Models
  * Integrate timeout handling with `AbortController`
  * Wrap calls with retry utility
  * Use Next.js fetch caching: `fetch(url, { next: { revalidate: 60 } })`
  * Provide methods: `getTopPostIds()`, `getPostById(id)`, `getPostsByIds(ids[])`, `getCommentById(id)`
* Add MSW handlers for testing
* Add unit tests for mapping logic

**Caching:** Uses Next.js built-in fetch caching (no custom `lib/cache.ts` needed).

## M3 — Services Layer (3-4 hrs)

* `services/postsService.ts`:
  * `fetchPosts({ sort, pageSize, page })` — pagination logic
  * `getPostById(id)` — single post fetch
* `services/commentsService.ts`:
  * `getCommentsByPostId(postId, maxDepth?)` — recursive comment tree building
* `hooks/usePosts.ts`, `hooks/useComments.ts`, `hooks/useAuth.ts` (stub)

## M4 — Post List Page (4-5 hrs)

* `app/page.tsx` (server component) with sorting via URL params
* `components/PostList.tsx`, `components/PostItem.tsx`
* `components/SortTabs.tsx` — Top / New / Best tabs
* `components/LoadMoreButton.tsx` — client-side pagination
* `components/Navbar.tsx`
* Component tests with RTL

## M5 — Post Detail Page & Comments (4-5 hrs)

* Add `lib/sanitize.ts` for HTML sanitization (comment XSS protection)
* `app/posts/[id]/page.tsx` with post ID validation
* `components/PostDetail.tsx`
* `components/CommentList.tsx`, `components/CommentItem.tsx`
* Collapse/expand functionality for comments
* Component tests with RTL

## M6 — Production Readiness (4-5 hrs)

* Health check endpoints (`/api/health`, `/api/health/ready`)
* Security headers in `next.config.js` (CSP, X-Frame-Options, etc.)
* Multi-stage `Dockerfile` with non-root user
* `docker-compose.yml` for production, `docker-compose.dev.yml` for development
* GitHub Actions CI workflow

## M7 — Documentation & Polish (2-3 hrs)

* Complete `README.md` with setup, Docker, and architecture
* `ARCHITECTURE.md` with layer diagram
* Responsive design polish
* Skeleton loaders for loading states

---

# Testing & CI

**Testing is integrated into each milestone, not a separate phase.**

* Unit tests for:
  * Error classes (`lib/errors.ts`)
  * Retry utility (`lib/retry.ts`)
  * Config validation (`lib/config.ts`)
  * HTML sanitization (`lib/sanitize.ts`)
  * Adapter mapping logic
  * Service pagination and tree building
* Component tests (RTL) for `PostList`, `PostItem`, `CommentList`, `CommentItem`
* Use MSW to stub all external HTTP in tests
* CI (GitHub Actions):
  * Steps: `checkout` → `install` → `lint` → `type-check` → `test` → `build` → `audit`
  * See `production-checklist.md` §11 for full CI specification

---

# Backend swap plan

> How to replace Hacker News API with Go/Python backend

1. Implement new adapter `adapters/customBackendAdapter.ts` returning Domain Models with same method signatures as `hackerNewsAdapter`.
2. Update `adapters/index.ts` to export the custom adapter (optionally controlled by `DATA_SOURCE` env var).
3. No changes required in `services/`, `hooks/`, `components/`, or `pages/`.

**Key point:** UI & services consume Domain Models only — don't leak any HN-specific fields (e.g., `kids`, `descendants`) into components. Adapter does all mapping.

---

# Quick reviewer checklist

**Documentation:**
* `README.md` — How to run locally, Docker commands, tests, environment variables, architecture overview
* `ARCHITECTURE.md` — Layer diagram, data flow explanation
* Note in README: "To swap backend change `adapters/index.ts`"

**Project structure:**
* `domain/models.ts` — domain types
* `lib/config.ts` — configuration with validation
* `lib/errors.ts` — custom error classes
* `lib/logger.ts` — structured logging
* `lib/retry.ts` — retry utility
* `lib/sanitize.ts` — HTML sanitization
* `adapters/hackerNewsAdapter.ts` — with Next.js fetch caching
* `services/postsService.ts`, `services/commentsService.ts`
* `app/page.tsx` and `app/posts/[id]/page.tsx`
* `app/error.tsx`, `app/global-error.tsx` — error boundaries
* `app/api/health/route.ts` — health check endpoint
* `components/` — PostList, PostItem, PostDetail, CommentList, CommentItem, etc.
* `mocks/` — MSW handlers
* `tests/` — Jest + RTL tests
* `Dockerfile`, `docker-compose.yml`
* `.github/workflows/ci.yml`

**Verification:**
* Tests pass locally (`npm test`)
* Linting passes (`npm run lint`) with code quality rules enforced
* CI workflow passes
* Security headers configured in `next.config.js`
* No `any` types in production code
* Functions ≤ 30 lines, components ≤ 150 lines (per `production-checklist.md` §1)

---

*End of Product Requirements Document*
