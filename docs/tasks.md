# Implementation Task List — Hacker News Frontend Clone
---

> **Generated from `milestones.md` and validated against `production-checklist.md`**  
> **See `glossary.md` for terminology definitions.**  
> Tasks ordered for implementation. Each task references the specification it fulfills.

---

## Task Overview

| Phase | Tasks | Est. Hours |
|-------|-------|------------|
| M1: Project Foundation | 26 tasks | 4-5 hrs |
| M2: Domain & Resilient Adapter | 24 tasks | 5-6 hrs |
| M3: Services Layer | 18 tasks | 3-4 hrs |
| M4: Post List Page | 22 tasks | 4-5 hrs |
| M5: Post Detail & Comments | 24 tasks | 4-5 hrs |
| M6: Production Readiness | 24 tasks | 4-5 hrs |
| M7: Documentation & Polish | 16 tasks | 2-3 hrs |

**Total: 154 tasks | 26-33 hours**

**Note:** Custom caching removed — using Next.js built-in fetch caching.

---

## Validation Summary

| production-checklist.md Section | Covered In | Status |
|-------------------|------------|--------|
| 1. Code Quality & Maintainability | M1.1 (ESLint rules), All milestones (ongoing) | ✅ |
| 2. Environment & Configuration | M1.4 | ✅ |
| 3. Error Handling Strategy | M1.5 | ✅ |
| 4. Logging | M1.6 | ✅ |
| 5. API Adapter Resilience | M1.7, M2.3 | ✅ |
| 6. Caching Strategy (Next.js built-in) | M2.3 | ✅ |
| 7. Health Checks | M6.1 | ✅ |
| 8. Security (Read-Only) | M5.1, M6.2 | ✅ |
| 9. Metrics & Monitoring | M6.7 (optional) | ✅ |
| 10. Error Tracking | M6.8 (optional) | ✅ |
| 11. CI Pipeline | M6.5 | ✅ |
| 12. Docker & Docker Compose | M6.3, M6.4 | ✅ |
| 13. Documentation | M7.1, M7.2 | ✅ |

---

## M1: Project Foundation

### M1.1 — Scaffold Next.js Application ✅

| # | Task | Spec Reference | Status |
|---|------|----------------|--------|
| 1.1.1 | Run `npx create-next-app@latest` with TypeScript, App Router, Turbopack enabled, and **no import alias** (answer "No" to alias prompt or use `--no-import-alias` flag) | milestones M1.1 | ✅ |
| 1.1.2 | Verify `package.json` has `"dev": "next dev --turbopack"` script for Turbopack dev server | milestones M1.1 | ✅ |
| 1.1.3 | Verify TypeScript is configured in `tsconfig.json` (no `paths` alias configured) | milestones M1.1 | ✅ |
| 1.1.4 | Install Tailwind CSS: `npm install -D tailwindcss postcss autoprefixer` | milestones M1.1 | ✅ |
| 1.1.5 | Run `npx tailwindcss init -p` to generate config files | milestones M1.1 | ✅ |
| 1.1.6 | Configure `tailwind.config.ts` with content paths | milestones M1.1 | ✅ |
| 1.1.7 | Add Tailwind directives to `app/globals.css` | milestones M1.1 | ✅ |
| 1.1.8 | Install ESLint plugins: `npm install -D eslint-config-prettier` | milestones M1.1 | ✅ |
| 1.1.9 | Install Prettier: `npm install -D prettier` | milestones M1.1 | ✅ |
| 1.1.10 | Create `.prettierrc` configuration file | milestones M1.1 | ✅ |
| 1.1.11 | Update `.eslintrc.json` to extend prettier | milestones M1.1 | ✅ |
| 1.1.12 | Add ESLint rule: `complexity` with max 10 | production-checklist §1 | ✅ |
| 1.1.13 | Add ESLint rule: `max-lines-per-function` with max 50 (warn) | production-checklist §1 | ✅ |
| 1.1.14 | Add ESLint rule: `max-depth` with max 3 | production-checklist §1 | ✅ |
| 1.1.15 | Add ESLint rule: `max-params` with max 4 | production-checklist §1 | ✅ |
| 1.1.16 | Add ESLint rule: `no-nested-ternary` as error | production-checklist §1 | ✅ |
| 1.1.17 | Add TypeScript rule: `@typescript-eslint/no-explicit-any` as error | production-checklist §1 | ✅ |
| 1.1.18 | Add TypeScript rule: `@typescript-eslint/explicit-function-return-type` (warn, with exceptions) | production-checklist §1 | ✅ |
| 1.1.19 | Initialize Git repository: `git init` | milestones M1.1 | ✅ |
| 1.1.20 | Create `.gitignore` with Node.js and Next.js patterns | milestones M1.1 | ✅ |
| 1.1.21 | Verify `npm run dev --turbopack` starts successfully with Turbopack | milestones M1.1 | ✅ |
| 1.1.22 | Verify `npm run build` completes successfully | milestones M1.1 | ✅ |
| 1.1.23 | Verify `npm run lint` passes with no errors | milestones M1.1 | ✅ |

### M1.2 — Create Folder Structure ✅

| # | Task | Spec Reference | Status |
|---|------|----------------|--------|
| 1.2.1 | Create `components/` directory | prd naming conventions | ✅ |
| 1.2.2 | Create `domain/` directory | prd naming conventions | ✅ |
| 1.2.3 | Create `services/` directory | prd naming conventions | ✅ |
| 1.2.4 | Create `adapters/` directory | prd naming conventions | ✅ |
| 1.2.5 | Create `hooks/` directory | prd naming conventions | ✅ |
| 1.2.6 | Create `lib/` directory | prd naming conventions | ✅ |
| 1.2.7 | Create `mocks/` directory | milestones M1.2 | ✅ |
| 1.2.8 | Create `tests/` directory | milestones M1.2 | ✅ |
| 1.2.9 | Add `.gitkeep` to empty directories | milestones M1.2 | ✅ |

### M1.3 — Testing Infrastructure Setup

| # | Task | Spec Reference |
|---|------|----------------|
| 1.3.1 | Install Jest: `npm install -D jest @types/jest` | milestones M1.3 |
| 1.3.2 | Install ts-jest: `npm install -D ts-jest` | milestones M1.3 |
| 1.3.3 | Install React Testing Library: `npm install -D @testing-library/react @testing-library/jest-dom` | milestones M1.3 |
| 1.3.4 | Install jest-environment-jsdom: `npm install -D jest-environment-jsdom` | milestones M1.3 |
| 1.3.5 | Install MSW: `npm install -D msw` | milestones M1.3 |
| 1.3.6 | Create `jest.config.js` with Next.js configuration | milestones M1.3 |
| 1.3.7 | Create `jest.setup.ts` with Testing Library and MSW setup | milestones M1.3 |
| 1.3.8 | Create `mocks/handlers.ts` with empty handlers array | milestones M1.3 |
| 1.3.9 | Create `mocks/server.ts` with MSW setupServer | milestones M1.3 |
| 1.3.10 | Add `"test": "jest"` script to `package.json` | milestones M1.3 |
| 1.3.11 | Add `"test:watch": "jest --watch"` script to `package.json` | milestones M1.3 |
| 1.3.12 | Add `"test:coverage": "jest --coverage"` script to `package.json` | milestones M1.3 |
| 1.3.13 | Create sample test file to verify Jest runs | milestones M1.3 |
| 1.3.14 | Run `npm test` and verify it passes | milestones M1.3 |

### M1.4 — Configuration Module

| # | Task | Spec Reference |
|---|------|----------------|
| 1.4.1 | Create `lib/config.ts` | production-checklist §2 |
| 1.4.2 | Implement `getEnvVar(name, required)` helper function | production-checklist §2 |
| 1.4.3 | Implement `parseIntEnv(name, defaultValue)` helper function | production-checklist §2 |
| 1.4.4 | Define `NODE_ENV` config (required) | production-checklist §2 |
| 1.4.5 | Define `NEXT_PUBLIC_API_BASE_URL` config (required) | production-checklist §2 |
| 1.4.6 | Define `DATA_SOURCE` config (optional, default: 'hackernews') | production-checklist §2 |
| 1.4.7 | Define `LOG_LEVEL` config (optional, default: 'info') | production-checklist §2 |
| 1.4.8 | Define `CACHE_TTL_SECONDS` config (optional, default: 60) | production-checklist §2 |
| 1.4.9 | Define `API_TIMEOUT_MS` config (optional, default: 10000) | production-checklist §2 |
| 1.4.10 | Define `API_RETRY_COUNT` config (optional, default: 3) | production-checklist §2 |
| 1.4.11 | Export typed `config` object with `as const` | production-checklist §2 |
| 1.4.12 | Implement fail-fast validation for missing required vars | production-checklist §2 |
| 1.4.13 | Create `.env.example` with all variables documented | production-checklist §2 |
| 1.4.14 | Create `.env.development` with development defaults | production-checklist §2 |
| 1.4.15 | Create `.env.local.example` (copy template for local) | production-checklist §2 |
| 1.4.16 | Create `tests/lib/config.test.ts` | milestones M1.4 |
| 1.4.17 | **Test:** Throws error when required var is missing | milestones M1.4 |
| 1.4.18 | **Test:** Returns default for optional vars | milestones M1.4 |
| 1.4.19 | **Test:** Parses integer values correctly | milestones M1.4 |

### M1.5 — Error Handling Infrastructure

| # | Task | Spec Reference |
|---|------|----------------|
| 1.5.1 | Create `lib/errors.ts` | production-checklist §3 |
| 1.5.2 | Implement `AppError` base class with `code`, `statusCode`, `isOperational` | production-checklist §3 |
| 1.5.3 | Implement `ApiAdapterError` extending AppError (status 502) | production-checklist §3 |
| 1.5.4 | Implement `NotFoundError` extending AppError (status 404) | production-checklist §3 |
| 1.5.5 | Implement `TimeoutError` extending AppError (status 504) | production-checklist §3 |
| 1.5.6 | Ensure all errors capture stack trace | production-checklist §3 |
| 1.5.7 | Create `app/error.tsx` error boundary component | production-checklist §3 |
| 1.5.8 | Implement user-friendly error message in error boundary | production-checklist §3 |
| 1.5.9 | Add "Try Again" button with `reset()` function | production-checklist §3 |
| 1.5.10 | Add "Go Home" link to error boundary | production-checklist §3 |
| 1.5.11 | Create `app/global-error.tsx` for layout errors | production-checklist §3 |
| 1.5.12 | Style error boundaries with Tailwind | milestones M1.5 |
| 1.5.13 | Create `tests/lib/errors.test.ts` | milestones M1.5 |
| 1.5.14 | **Test:** AppError has correct properties | milestones M1.5 |
| 1.5.15 | **Test:** Each error type has correct status code | milestones M1.5 |
| 1.5.16 | Create `tests/app/error.test.tsx` | milestones M1.5 |
| 1.5.17 | **Test:** Error boundary renders error message | milestones M1.5 |
| 1.5.18 | **Test:** Try Again button calls reset | milestones M1.5 |

### M1.6 — Logging Module

| # | Task | Spec Reference |
|---|------|----------------|
| 1.6.1 | Install pino: `npm install pino` | production-checklist §4 |
| 1.6.2 | Install pino-pretty for dev: `npm install -D pino-pretty` | production-checklist §4 |
| 1.6.3 | Create `lib/logger.ts` | production-checklist §4 |
| 1.6.4 | Configure pino with JSON output | production-checklist §4 |
| 1.6.5 | Implement log level from `LOG_LEVEL` config | production-checklist §4 |
| 1.6.6 | Add `timestamp` field (ISO 8601) | production-checklist §4 |
| 1.6.7 | Export typed logger with `error`, `warn`, `info`, `debug` methods | production-checklist §4 |
| 1.6.8 | Configure pino-pretty for development only | production-checklist §4 |

### M1.7 — Retry Utility

| # | Task | Spec Reference |
|---|------|----------------|
| 1.7.1 | Create `lib/retry.ts` | production-checklist §5 |
| 1.7.2 | Define `RetryOptions` interface (maxRetries, initialDelay, maxDelay, backoffMultiplier) | production-checklist §5 |
| 1.7.3 | Implement `withRetry<T>(fn, options)` generic function | production-checklist §5 |
| 1.7.4 | Implement exponential backoff calculation | production-checklist §5 |
| 1.7.5 | Implement delay with `setTimeout` + Promise | production-checklist §5 |
| 1.7.6 | Use `API_RETRY_COUNT` config for default max retries | production-checklist §5 |
| 1.7.7 | Implement `isRetryableError(error)` helper | production-checklist §5 |
| 1.7.8 | Return true for 5xx status codes | production-checklist §5 |
| 1.7.9 | Return true for network errors | production-checklist §5 |
| 1.7.10 | Return true for 429 (rate limited) | production-checklist §5 |
| 1.7.11 | Return false for other 4xx status codes | production-checklist §5 |
| 1.7.12 | Log retry attempts with logger | production-checklist §4 |
| 1.7.13 | Create `tests/lib/retry.test.ts` | milestones M1.7 |
| 1.7.14 | **Test:** Retries on 500 error | milestones M1.7 |
| 1.7.15 | **Test:** Does not retry on 404 error | milestones M1.7 |
| 1.7.16 | **Test:** Stops after max retries | milestones M1.7 |
| 1.7.17 | **Test:** Backoff delay increases exponentially | milestones M1.7 |

### M1.8 — Caching Strategy (Next.js Built-in)

| # | Task | Spec Reference |
|---|------|----------------|
| 1.8.1 | Document Next.js fetch caching approach in code comments | production-checklist §6 |
| 1.8.2 | No custom `lib/cache.ts` needed — using Next.js `fetch()` with `next: { revalidate }` | production-checklist §6 |

**Note:** Custom cache implementation deferred. Next.js handles caching via `fetch()` options.

### M1 Acceptance Checklist

| # | Criteria | Validates |
|---|----------|-----------|
| M1.AC1 | `npm run dev` starts without errors | M1.1 |
| M1.AC2 | `npm run build` completes successfully | M1.1 |
| M1.AC3 | `npm run lint` passes with code quality rules enforced | M1.1, production-checklist §1 |
| M1.AC4 | ESLint complexity rule (max 10) is configured | M1.1, production-checklist §1 |
| M1.AC5 | ESLint max-depth rule (max 3) is configured | M1.1, production-checklist §1 |
| M1.AC6 | TypeScript `any` types cause linter errors | M1.1, production-checklist §1 |
| M1.AC7 | `npm test` runs and all tests pass | M1.3 |
| M1.AC8 | Missing required env var causes clear error | M1.4, production-checklist §2 |
| M1.AC9 | Error boundary displays user-friendly UI | M1.5, production-checklist §3 |
| M1.AC10 | Logger outputs structured JSON | M1.6, production-checklist §4 |
| M1.AC11 | Retry utility tests pass | M1.7, production-checklist §5 |

---

## M2: Domain Models & Resilient Adapter

### M2.1 — Domain Models

| # | Task | Spec Reference |
|---|------|----------------|
| 2.1.1 | Create `domain/models.ts` | prd domain models |
| 2.1.2 | Define `Post` interface with all fields | prd glossary |
| 2.1.3 | Include `id: number` in Post | prd glossary |
| 2.1.4 | Include `title: string` in Post | prd glossary |
| 2.1.5 | Include `url?: string` in Post (optional) | prd glossary |
| 2.1.6 | Include `text?: string` in Post (optional) | prd glossary |
| 2.1.7 | Include `author: string` in Post | prd glossary |
| 2.1.8 | Include `points: number` in Post | prd glossary |
| 2.1.9 | Include `commentCount: number` in Post | prd glossary |
| 2.1.10 | Include `commentIds: number[]` in Post | prd glossary |
| 2.1.11 | Include `createdAt: Date` in Post | prd glossary |
| 2.1.12 | Define `Comment` interface with all fields | prd glossary |
| 2.1.13 | Include `id: number` in Comment | prd glossary |
| 2.1.14 | Include `author: string` in Comment | prd glossary |
| 2.1.15 | Include `text: string` in Comment | prd glossary |
| 2.1.16 | Include `createdAt: Date` in Comment | prd glossary |
| 2.1.17 | Include `parentId?: number` in Comment (optional) | prd glossary |
| 2.1.18 | Include `children: Comment[]` in Comment | prd glossary |
| 2.1.19 | Define `User` interface (stub for future) | prd glossary |
| 2.1.20 | Export all interfaces | prd domain models |

### M2.2 — MSW Handlers for HN API

| # | Task | Spec Reference |
|---|------|----------------|
| 2.2.1 | Create mock post data in `mocks/data/posts.ts` | milestones M2.2 |
| 2.2.2 | Create mock comment data in `mocks/data/comments.ts` | milestones M2.2 |
| 2.2.3 | Add handler for `GET /v0/topstories.json` | milestones M2.2 |
| 2.2.4 | Add handler for `GET /v0/newstories.json` | milestones M2.2 |
| 2.2.5 | Add handler for `GET /v0/beststories.json` | milestones M2.2 |
| 2.2.6 | Add handler for `GET /v0/item/:id.json` (post) | milestones M2.2 |
| 2.2.7 | Add handler for `GET /v0/item/:id.json` (comment) | milestones M2.2 |
| 2.2.8 | Add error handler for 404 not found | milestones M2.2 |
| 2.2.9 | Add error handler for 500 server error | milestones M2.2 |
| 2.2.10 | Export all handlers from `mocks/handlers.ts` | milestones M2.2 |

### M2.3 — Hacker News Adapter

| # | Task | Spec Reference |
|---|------|----------------|
| 2.3.1 | Create `adapters/hackerNewsAdapter.ts` | prd adapters |
| 2.3.2 | Define HN API response types (internal, not exported) | prd adapters |
| 2.3.3 | Implement `mapHNPostToPost(hnItem)` mapping function | prd adapters |
| 2.3.4 | Map `descendants` → `commentCount` | prd adapters |
| 2.3.5 | Map `kids` → `commentIds` (default to []) | prd adapters |
| 2.3.6 | Map `time` → `createdAt` (Unix → Date) | prd adapters |
| 2.3.7 | Implement `mapHNCommentToComment(hnItem)` mapping function | prd adapters |
| 2.3.8 | Implement `fetchWithTimeout(url, timeoutMs)` using AbortController | production-checklist §5 |
| 2.3.9 | Throw `TimeoutError` when timeout exceeded | production-checklist §5 |
| 2.3.10 | Implement `fetchWithRetry(url)` using `withRetry` | production-checklist §5 |
| 2.3.11 | Implement `getTopPostIds(): Promise<number[]>` | milestones M2.3 |
| 2.3.12 | Use `fetch()` with `next: { revalidate: 60 }` for post ID lists | production-checklist §6 |
| 2.3.13 | Implement `getNewPostIds(): Promise<number[]>` | milestones M2.3 |
| 2.3.14 | Implement `getBestPostIds(): Promise<number[]>` | milestones M2.3 |
| 2.3.15 | Implement `getPostById(id): Promise<Post>` | milestones M2.3 |
| 2.3.16 | Use `fetch()` with `next: { revalidate: 300 }` for individual posts | production-checklist §6 |
| 2.3.17 | Throw `NotFoundError` for missing posts | production-checklist §3 |
| 2.3.18 | Implement `getPostsByIds(ids): Promise<Post[]>` | milestones M2.3 |
| 2.3.19 | Use `Promise.all` for batch fetching | milestones M2.3 |
| 2.3.20 | Implement `getCommentById(id): Promise<Comment>` | milestones M2.3 |
| 2.3.21 | Use `fetch()` with `next: { revalidate: 120 }` for comments | production-checklist §6 |
| 2.3.22 | Log all adapter calls with duration | production-checklist §4 |

### M2.4 — Adapter Tests

| # | Task | Spec Reference |
|---|------|----------------|
| 2.4.1 | Create `tests/adapters/hackerNewsAdapter.test.ts` | milestones M2.4 |
| 2.4.2 | **Test:** `mapHNPostToPost` maps all fields correctly | milestones M2.4 |
| 2.4.3 | **Test:** `mapHNCommentToComment` maps all fields correctly | milestones M2.4 |
| 2.4.4 | **Test:** `getTopPostIds()` returns array of numbers | milestones M2.4 |
| 2.4.5 | **Test:** `getPostById()` returns valid Post | milestones M2.4 |
| 2.4.6 | **Test:** `getPostById()` throws NotFoundError for 404 | milestones M2.4 |
| 2.4.7 | **Test:** Adapter retries on 500 then throws ApiAdapterError | milestones M2.4 |
| 2.4.8 | **Test:** Timeout triggers TimeoutError | milestones M2.4 |

**Note:** Next.js fetch caching is tested at integration level, not unit tests.

### M2.5 — Adapter Index

| # | Task | Spec Reference |
|---|------|----------------|
| 2.5.1 | Create `adapters/index.ts` | prd adapters |
| 2.5.2 | Import hackerNewsAdapter | prd adapters |
| 2.5.3 | Export adapter based on `DATA_SOURCE` config | prd adapters |
| 2.5.4 | Add comment documenting how to swap adapters | prd backend swap |

### M2 Acceptance Checklist

| # | Criteria | Validates |
|---|----------|-----------|
| M2.AC1 | Domain models are typed correctly | M2.1 |
| M2.AC2 | All adapter methods return domain types | M2.3 |
| M2.AC3 | Mapping tests pass | M2.4 |
| M2.AC4 | Error handling tests pass | M2.4, production-checklist §3 |
| M2.AC5 | Retry behavior verified | M2.4, production-checklist §5 |
| M2.AC6 | Next.js fetch caching configured with correct revalidate times | M2.3, production-checklist §6 |
| M2.AC7 | All tests pass with MSW (no real network) | M2.4 |

---

## M3: Services Layer

### M3.1 — Posts Service

| # | Task | Spec Reference |
|---|------|----------------|
| 3.1.1 | Create `services/postsService.ts` | prd services |
| 3.1.2 | Define `FetchPostsParams` type (sort, pageSize, page) | milestones M3.1 |
| 3.1.3 | Define `SortType` as 'top' \| 'new' \| 'best' | milestones M3.1 |
| 3.1.4 | Implement `fetchPosts(params): Promise<Post[]>` | milestones M3.1 |
| 3.1.5 | Call correct adapter method based on sort | milestones M3.1 |
| 3.1.6 | Slice post IDs for pagination | milestones M3.1 |
| 3.1.7 | Batch fetch posts using `getPostsByIds` | milestones M3.1 |
| 3.1.8 | Implement `getPostById(id): Promise<Post>` | milestones M3.1 |
| 3.1.9 | Create `tests/services/postsService.test.ts` | milestones M3.1 |
| 3.1.10 | **Test:** Pagination returns correct slice | milestones M3.1 |
| 3.1.11 | **Test:** Sort parameter selects correct ID list | milestones M3.1 |
| 3.1.12 | **Test:** getPostById returns single post | milestones M3.1 |

### M3.2 — Comments Service

| # | Task | Spec Reference |
|---|------|----------------|
| 3.2.1 | Create `services/commentsService.ts` | prd services |
| 3.2.2 | Define `GetCommentsParams` type (postId, maxDepth) | milestones M3.2 |
| 3.2.3 | Implement `getCommentsByPostId(postId, maxDepth?): Promise<Comment[]>` | milestones M3.2 |
| 3.2.4 | Fetch post to get `commentIds` | milestones M3.2 |
| 3.2.5 | Implement recursive comment fetching | milestones M3.2 |
| 3.2.6 | Limit recursion depth (default: 3) | milestones M3.2 |
| 3.2.7 | Build nested comment tree | milestones M3.2 |
| 3.2.8 | Handle missing/deleted comments gracefully | milestones M3.2 |
| 3.2.9 | Create `tests/services/commentsService.test.ts` | milestones M3.2 |
| 3.2.10 | **Test:** Comment tree builds correctly | milestones M3.2 |
| 3.2.11 | **Test:** Depth limiting stops recursion | milestones M3.2 |
| 3.2.12 | **Test:** Handles missing comments without crashing | milestones M3.2 |

### M3.3 — Client Hooks

| # | Task | Spec Reference |
|---|------|----------------|
| 3.3.1 | Create `hooks/usePosts.ts` | prd hooks |
| 3.3.2 | Implement loading, error, data state management | prd hooks |
| 3.3.3 | Implement refetch function | prd hooks |
| 3.3.4 | Create `hooks/useComments.ts` | prd hooks |
| 3.3.5 | Implement loading, error, data state management | prd hooks |
| 3.3.6 | Create `hooks/useAuth.ts` (stub) | prd hooks |
| 3.3.7 | Return `{ user: null, isAuthenticated: false }` | prd hooks |

### M3 Acceptance Checklist

| # | Criteria | Validates |
|---|----------|-----------|
| M3.AC1 | Pagination returns correct slices | M3.1 |
| M3.AC2 | Comment tree structure is correct | M3.2 |
| M3.AC3 | Hooks provide loading/error/data states | M3.3 |
| M3.AC4 | All service tests pass | M3.1, M3.2 |

---

## M4: Post List Page

### M4.1 — Post List Page

| # | Task | Spec Reference |
|---|------|----------------|
| 4.1.1 | Create `app/page.tsx` as server component | prd pages |
| 4.1.2 | Parse sort from URL search params (default: 'top') | milestones M4.1 |
| 4.1.3 | Call `postsService.fetchPosts()` server-side | milestones M4.1 |
| 4.1.4 | Pass posts to `PostList` component | milestones M4.1 |
| 4.1.5 | Create `app/loading.tsx` with skeleton UI | milestones M4.1 |

### M4.2 — PostList Component

| # | Task | Spec Reference |
|---|------|----------------|
| 4.2.1 | Create `components/PostList.tsx` | prd components |
| 4.2.2 | Accept `posts: Post[]` prop | prd components |
| 4.2.3 | Render list of `PostItem` components | prd components |
| 4.2.4 | Pass rank (index + 1) to each PostItem | prd scope |
| 4.2.5 | Implement empty state UI | milestones M4.2 |
| 4.2.6 | Style with Tailwind (mobile-first) | prd scope |
| 4.2.7 | Create `tests/components/PostList.test.tsx` | milestones M4.2 |
| 4.2.8 | **Test:** Renders correct number of posts | milestones M4.2 |
| 4.2.9 | **Test:** Empty state shown when no posts | milestones M4.2 |

### M4.3 — PostItem Component

| # | Task | Spec Reference |
|---|------|----------------|
| 4.3.1 | Create `components/PostItem.tsx` | prd components |
| 4.3.2 | Accept `post: Post` and `rank: number` props | prd components |
| 4.3.3 | Display rank number | prd scope |
| 4.3.4 | Display title with link (external URL or detail page) | prd scope |
| 4.3.5 | Extract and display domain from URL | prd scope |
| 4.3.6 | Display author name | prd scope |
| 4.3.7 | Display points count | prd scope |
| 4.3.8 | Display comment count with link to detail page | prd scope |
| 4.3.9 | Display relative time (e.g., "2 hours ago") | prd scope |
| 4.3.10 | Use Next.js `<Link>` for internal navigation | prd components |
| 4.3.11 | Style with Tailwind | prd scope |
| 4.3.12 | Create `tests/components/PostItem.test.tsx` | milestones M4.3 |
| 4.3.13 | **Test:** All fields rendered correctly | milestones M4.3 |
| 4.3.14 | **Test:** External URL opens in new tab | milestones M4.3 |
| 4.3.15 | **Test:** Comment link has correct href | milestones M4.3 |

### M4.4 — Sorting Controls

| # | Task | Spec Reference |
|---|------|----------------|
| 4.4.1 | Create `components/SortTabs.tsx` | prd components |
| 4.4.2 | Display tabs: Top, New, Best | prd scope |
| 4.4.3 | Accept `activeSort: SortType` prop | milestones M4.4 |
| 4.4.4 | Use URL search params for navigation | milestones M4.4 |
| 4.4.5 | Highlight active tab | milestones M4.4 |
| 4.4.6 | Style with Tailwind | prd scope |
| 4.4.7 | Create `tests/components/SortTabs.test.tsx` | milestones M4.4 |
| 4.4.8 | **Test:** Active tab is highlighted | milestones M4.4 |
| 4.4.9 | **Test:** Tab links have correct hrefs | milestones M4.4 |

### M4.5 — Load More

| # | Task | Spec Reference |
|---|------|----------------|
| 4.5.1 | Create `components/LoadMoreButton.tsx` (client component) | milestones M4.5 |
| 4.5.2 | Implement onClick to fetch next page | milestones M4.5 |
| 4.5.3 | Append new posts to existing list | milestones M4.5 |
| 4.5.4 | Show loading state while fetching | milestones M4.5 |
| 4.5.5 | Hide button when no more posts | milestones M4.5 |

### M4.6 — Navbar

| # | Task | Spec Reference |
|---|------|----------------|
| 4.6.1 | Create `components/Navbar.tsx` | prd components |
| 4.6.2 | Add logo/title with link to home | prd components |
| 4.6.3 | Add navigation links | prd components |
| 4.6.4 | Style with Tailwind | prd scope |
| 4.6.5 | Add Navbar to `app/layout.tsx` | milestones M4.6 |

### M4 Acceptance Checklist

| # | Criteria | Validates |
|---|----------|-----------|
| M4.AC1 | Homepage displays 30 posts | M4.1 |
| M4.AC2 | Posts show all required fields | M4.3 |
| M4.AC3 | Sorting tabs work | M4.4 |
| M4.AC4 | Load more fetches next page | M4.5 |
| M4.AC5 | All component tests pass | M4.2, M4.3, M4.4 |

---

## M5: Post Detail & Comments

### M5.1 — HTML Sanitization

| # | Task | Spec Reference |
|---|------|----------------|
| 5.1.1 | Install isomorphic-dompurify: `npm install isomorphic-dompurify` | production-checklist §8 |
| 5.1.2 | Install jsdom for server-side: `npm install jsdom` | production-checklist §8 |
| 5.1.3 | Create `lib/sanitize.ts` | production-checklist §8 |
| 5.1.4 | Implement `sanitizeHtml(html: string): string` | production-checklist §8 |
| 5.1.5 | Configure DOMPurify options (strip scripts, etc.) | production-checklist §8 |
| 5.1.6 | Create `tests/lib/sanitize.test.ts` | milestones M5.1 |
| 5.1.7 | **Test:** Removes script tags | milestones M5.1 |
| 5.1.8 | **Test:** Removes onclick handlers | milestones M5.1 |
| 5.1.9 | **Test:** Preserves safe HTML (p, a, code) | milestones M5.1 |
| 5.1.10 | **Test:** Handles XSS payloads | milestones M5.1 |

### M5.2 — Post Detail Page

| # | Task | Spec Reference |
|---|------|----------------|
| 5.2.1 | Create `app/posts/[id]/page.tsx` as server component | prd pages |
| 5.2.2 | Validate post ID is numeric | production-checklist §8 |
| 5.2.3 | Return 404 for invalid IDs | production-checklist §8 |
| 5.2.4 | Fetch post using `postsService.getPostById()` | milestones M5.2 |
| 5.2.5 | Fetch comments using `commentsService.getCommentsByPostId()` | milestones M5.2 |
| 5.2.6 | Render `PostDetail` component | milestones M5.2 |
| 5.2.7 | Render `CommentList` component | milestones M5.2 |
| 5.2.8 | Create `app/posts/[id]/loading.tsx` | milestones M5.2 |
| 5.2.9 | Create `app/posts/[id]/error.tsx` | production-checklist §3 |

### M5.3 — PostDetail Component

| # | Task | Spec Reference |
|---|------|----------------|
| 5.3.1 | Create `components/PostDetail.tsx` | prd components |
| 5.3.2 | Accept `post: Post` prop | prd components |
| 5.3.3 | Display title | prd scope |
| 5.3.4 | Display URL as link (if external) | prd scope |
| 5.3.5 | Display text content (if text post) | prd scope |
| 5.3.6 | Display author name | prd scope |
| 5.3.7 | Display points count | prd scope |
| 5.3.8 | Display posted time | prd scope |
| 5.3.9 | Display comment count | prd scope |
| 5.3.10 | Style with Tailwind | prd scope |
| 5.3.11 | Create `tests/components/PostDetail.test.tsx` | milestones M5.3 |
| 5.3.12 | **Test:** All fields rendered correctly | milestones M5.3 |

### M5.4 — CommentList Component

| # | Task | Spec Reference |
|---|------|----------------|
| 5.4.1 | Create `components/CommentList.tsx` | prd components |
| 5.4.2 | Accept `comments: Comment[]` prop | prd components |
| 5.4.3 | Render list of `CommentItem` components | prd components |
| 5.4.4 | Handle empty comments state | milestones M5.4 |
| 5.4.5 | Create `tests/components/CommentList.test.tsx` | milestones M5.4 |
| 5.4.6 | **Test:** Renders correct number of comments | milestones M5.4 |
| 5.4.7 | **Test:** Nested comments render correctly | milestones M5.4 |

### M5.5 — CommentItem Component

| # | Task | Spec Reference |
|---|------|----------------|
| 5.5.1 | Create `components/CommentItem.tsx` (client component) | prd components |
| 5.5.2 | Accept `comment: Comment` prop | prd components |
| 5.5.3 | Display author name | prd scope |
| 5.5.4 | Display relative time | prd scope |
| 5.5.5 | Display sanitized comment text using `dangerouslySetInnerHTML` | production-checklist §8 |
| 5.5.6 | Call `sanitizeHtml()` before rendering | production-checklist §8 |
| 5.5.7 | Implement collapse/expand state using `useState` | prd scope |
| 5.5.8 | Add collapse/expand toggle button | prd scope |
| 5.5.9 | Render nested `CommentList` for children | prd components |
| 5.5.10 | Apply indentation based on nesting level | prd scope |
| 5.5.11 | Style with Tailwind | prd scope |
| 5.5.12 | Create `tests/components/CommentItem.test.tsx` | milestones M5.5 |
| 5.5.13 | **Test:** Collapse button hides children | milestones M5.5 |
| 5.5.14 | **Test:** Expand button shows children | milestones M5.5 |
| 5.5.15 | **Test:** HTML is sanitized before rendering | milestones M5.5 |

### M5 Acceptance Checklist

| # | Criteria | Validates |
|---|----------|-----------|
| M5.AC1 | Detail page shows post information | M5.2, M5.3 |
| M5.AC2 | Comments render as nested tree | M5.4, M5.5 |
| M5.AC3 | Collapse/expand works | M5.5 |
| M5.AC4 | HTML in comments is sanitized | M5.1, M5.5, production-checklist §8 |
| M5.AC5 | Invalid post ID returns 404 | M5.2, production-checklist §8 |
| M5.AC6 | All tests pass | M5.1, M5.3, M5.4, M5.5 |

---

## M6: Production Readiness

### M6.1 — Health Checks

| # | Task | Spec Reference |
|---|------|----------------|
| 6.1.1 | Create `app/api/health/route.ts` | production-checklist §7 |
| 6.1.2 | Return `{ status: "ok", timestamp, version }` | production-checklist §7 |
| 6.1.3 | Always return 200 status | production-checklist §7 |
| 6.1.4 | Create `app/api/health/ready/route.ts` | production-checklist §7 |
| 6.1.5 | Check HN API connectivity with lightweight request | production-checklist §7 |
| 6.1.6 | Return 200 with checks object on success | production-checklist §7 |
| 6.1.7 | Return 503 with error details on failure | production-checklist §7 |
| 6.1.8 | Create `tests/api/health.test.ts` | milestones M6.1 |
| 6.1.9 | **Test:** Liveness returns 200 | milestones M6.1 |
| 6.1.10 | **Test:** Readiness returns 200 when API up | milestones M6.1 |
| 6.1.11 | **Test:** Readiness returns 503 when API down | milestones M6.1 |

### M6.2 — Security Headers

| # | Task | Spec Reference |
|---|------|----------------|
| 6.2.1 | Open `next.config.js` | production-checklist §8 |
| 6.2.2 | Add `X-Content-Type-Options: nosniff` header | production-checklist §8 |
| 6.2.3 | Add `X-Frame-Options: DENY` header | production-checklist §8 |
| 6.2.4 | Add `Referrer-Policy: strict-origin-when-cross-origin` header | production-checklist §8 |
| 6.2.5 | Add Content-Security-Policy header | production-checklist §8 |
| 6.2.6 | Set `default-src 'self'` | production-checklist §8 |
| 6.2.7 | Set `script-src 'self'` | production-checklist §8 |
| 6.2.8 | Set `style-src 'self' 'unsafe-inline'` | production-checklist §8 |
| 6.2.9 | Set `img-src 'self' data: https:` | production-checklist §8 |
| 6.2.10 | Set `connect-src 'self' https://hacker-news.firebaseio.com` | production-checklist §8 |
| 6.2.11 | Set `frame-ancestors 'none'` | production-checklist §8 |
| 6.2.12 | Verify headers in browser dev tools | production-checklist §8 |

### M6.3 — Dockerfile

| # | Task | Spec Reference |
|---|------|----------------|
| 6.3.1 | Create `Dockerfile` | production-checklist §22 |
| 6.3.2 | Use `node:20-alpine` as base image | production-checklist §22 |
| 6.3.3 | Create `deps` stage for dependency installation | production-checklist §22 |
| 6.3.4 | Create `builder` stage for building app | production-checklist §22 |
| 6.3.5 | Create `runner` stage for production | production-checklist §22 |
| 6.3.6 | Set `NODE_ENV=production` in runner | production-checklist §22 |
| 6.3.7 | Create non-root user `nextjs` | production-checklist §22 |
| 6.3.8 | Run as non-root user | production-checklist §22 |
| 6.3.9 | Copy only necessary files to runner | production-checklist §22 |
| 6.3.10 | Add `HEALTHCHECK` instruction | production-checklist §22 |
| 6.3.11 | Expose port 3000 | production-checklist §22 |
| 6.3.12 | Set `CMD ["npm", "start"]` | production-checklist §22 |

### M6.4 — Docker Compose

| # | Task | Spec Reference |
|---|------|----------------|
| 6.4.1 | Create `docker-compose.yml` for production | production-checklist §22 |
| 6.4.2 | Configure build context and Dockerfile | production-checklist §22 |
| 6.4.3 | Map port 3000 | production-checklist §22 |
| 6.4.4 | Set environment variables | production-checklist §22 |
| 6.4.5 | Configure healthcheck | production-checklist §22 |
| 6.4.6 | Set `restart: unless-stopped` | production-checklist §22 |
| 6.4.7 | Create `docker-compose.dev.yml` for development | production-checklist §22 |
| 6.4.8 | Configure volume mounts for hot reload | production-checklist §22 |
| 6.4.9 | Set development environment variables | production-checklist §22 |

### M6.5 — GitHub Actions CI

| # | Task | Spec Reference |
|---|------|----------------|
| 6.5.1 | Create `.github/workflows/ci.yml` | production-checklist §21 |
| 6.5.2 | Add trigger on pull_request to main | production-checklist §21 |
| 6.5.3 | Add trigger on push to main | production-checklist §21 |
| 6.5.4 | Add checkout step | production-checklist §21 |
| 6.5.5 | Add setup-node step (Node 20) | production-checklist §21 |
| 6.5.6 | Add npm ci step | production-checklist §21 |
| 6.5.7 | Add lint step: `npm run lint` | production-checklist §21 |
| 6.5.8 | Add `"type-check": "tsc --noEmit"` script to package.json | production-checklist §21 |
| 6.5.9 | Add type-check step: `npm run type-check` | production-checklist §21 |
| 6.5.10 | Add test step: `npm test -- --coverage` | production-checklist §21 |
| 6.5.11 | Add build step: `npm run build` | production-checklist §21 |
| 6.5.12 | Add security audit step: `npm audit --audit-level=high` | production-checklist §21 |

### M6.6 — Verify Production Build

| # | Task | Spec Reference |
|---|------|----------------|
| 6.6.1 | Run `npm run build` locally | milestones M6.6 |
| 6.6.2 | Run `docker compose build` | milestones M6.6 |
| 6.6.3 | Run `docker compose up` | milestones M6.6 |
| 6.6.4 | Verify app loads at localhost:3000 | milestones M6.6 |
| 6.6.5 | Verify `/api/health` returns 200 | production-checklist §7 |
| 6.6.6 | Verify `/api/health/ready` returns 200 | production-checklist §7 |

### M6.7 — Metrics (Optional)

| # | Task | Spec Reference |
|---|------|----------------|
| 6.7.1 | Install prom-client: `npm install prom-client` | production-checklist §8 |
| 6.7.2 | Create `lib/metrics.ts` | production-checklist §8 |
| 6.7.3 | Define `http_request_duration_seconds` histogram | production-checklist §8 |
| 6.7.4 | Define `api_adapter_duration_seconds` histogram | production-checklist §8 |
| 6.7.5 | Define `cache_hits_total` counter | production-checklist §8 |
| 6.7.6 | Define `cache_misses_total` counter | production-checklist §8 |
| 6.7.7 | Create `app/api/metrics/route.ts` | production-checklist §8 |
| 6.7.8 | Add `METRICS_ENABLED` env var | production-checklist §8 |

### M6.8 — Error Tracking (Optional)

| # | Task | Spec Reference |
|---|------|----------------|
| 6.8.1 | Install Sentry: `npx @sentry/wizard@latest -i nextjs` | production-checklist §9 |
| 6.8.2 | Configure `sentry.client.config.ts` | production-checklist §9 |
| 6.8.3 | Configure `sentry.server.config.ts` | production-checklist §9 |
| 6.8.4 | Add `SENTRY_DSN` to env vars | production-checklist §9 |
| 6.8.5 | Add `SENTRY_AUTH_TOKEN` for source maps | production-checklist §9 |
| 6.8.6 | Test error capture in Sentry dashboard | production-checklist §9 |

### M6 Acceptance Checklist

| # | Criteria | Validates |
|---|----------|-----------|
| M6.AC1 | `/api/health` returns 200 | M6.1, production-checklist §7 |
| M6.AC2 | `/api/health/ready` checks API connectivity | M6.1, production-checklist §7 |
| M6.AC3 | Security headers present in responses | M6.2, production-checklist §8 |
| M6.AC4 | Docker container builds and runs | M6.3, M6.4, production-checklist §22 |
| M6.AC5 | CI pipeline passes | M6.5, production-checklist §21 |
| M6.AC6 | All tests pass | M6.1 |

---

## M7: Documentation & Polish

### M7.1 — README.md

| # | Task | Spec Reference |
|---|------|----------------|
| 7.1.1 | Create/update `README.md` | production-checklist §22 |
| 7.1.2 | Add Prerequisites section (Node 20+, Docker) | production-checklist §22 |
| 7.1.3 | Add Quick Start section | production-checklist §22 |
| 7.1.4 | Add `npm install` command | production-checklist §22 |
| 7.1.5 | Add `npm run dev` command | production-checklist §22 |
| 7.1.6 | Add Running with Docker section | production-checklist §22 |
| 7.1.7 | Add `docker compose up` command | production-checklist §22 |
| 7.1.8 | Add Running Tests section | production-checklist §22 |
| 7.1.9 | Add Environment Variables section | production-checklist §22 |
| 7.1.10 | Reference `.env.example` | production-checklist §22 |
| 7.1.11 | Add Architecture overview section | production-checklist §22 |
| 7.1.12 | Add Backend swap instructions | prd backend swap |

### M7.2 — ARCHITECTURE.md

| # | Task | Spec Reference |
|---|------|----------------|
| 7.2.1 | Create `ARCHITECTURE.md` | production-checklist §22 |
| 7.2.2 | Add Overview section with brief description | production-checklist §22 |
| 7.2.3 | Add layer diagram (ASCII or Mermaid) | production-checklist §22 |
| 7.2.4 | Document Pages layer (app/) | production-checklist §22 |
| 7.2.5 | Document Components layer | production-checklist §22 |
| 7.2.6 | Document Services layer | production-checklist §22 |
| 7.2.7 | Document Adapters layer | production-checklist §22 |
| 7.2.8 | Document Domain layer | production-checklist §22 |
| 7.2.9 | Add Data Flow section | production-checklist §22 |
| 7.2.10 | Add Key Decisions section | production-checklist §22 |

### M7.3 — Responsive Design Polish

| # | Task | Spec Reference |
|---|------|----------------|
| 7.3.1 | Verify mobile layout (< 640px) | prd scope |
| 7.3.2 | Verify tablet layout (640px - 1024px) | prd scope |
| 7.3.3 | Verify desktop layout (> 1024px) | prd scope |
| 7.3.4 | Ensure touch targets are 44x44px minimum | prd scope |
| 7.3.5 | Test on actual mobile device if possible | milestones M7.3 |

### M7.4 — Loading States

| # | Task | Spec Reference |
|---|------|----------------|
| 7.4.1 | Add skeleton loader to `app/loading.tsx` | milestones M7.4 |
| 7.4.2 | Add skeleton loader to `app/posts/[id]/loading.tsx` | milestones M7.4 |
| 7.4.3 | Ensure no layout shift during loading | milestones M7.4 |

### M7.5 — Final Review

| # | Task | Spec Reference |
|---|------|----------------|
| 7.5.1 | Run `npm run lint` and fix any issues | milestones M7.5 |
| 7.5.2 | Run `npm run type-check` and fix any issues | milestones M7.5 |
| 7.5.3 | Run `npm test` and ensure all pass | milestones M7.5 |
| 7.5.4 | Run `npm run build` and ensure success | milestones M7.5 |
| 7.5.5 | Remove any console.log statements | milestones M7.5 |
| 7.5.6 | Verify all features work manually | milestones M7.5 |

### M7 Acceptance Checklist

| # | Criteria | Validates |
|---|----------|-----------|
| M7.AC1 | README explains all setup steps | M7.1, production-checklist §22 |
| M7.AC2 | ARCHITECTURE.md documents system design | M7.2, production-checklist §22 |
| M7.AC3 | UI is responsive on all screen sizes | M7.3, prd scope |
| M7.AC4 | Loading states are polished | M7.4 |
| M7.AC5 | All tests pass | M7.5 |
| M7.AC6 | Production build succeeds | M7.5 |

---

## Final Validation Checklist

### production-checklist.md Specification Coverage

| Section | Tasks | Milestone | Status |
|---------|-------|-----------|--------|
| §1 Environment & Configuration | 1.4.1 - 1.4.19 | M1.4 | ✅ |
| §2 Error Handling Strategy | 1.5.1 - 1.5.18 | M1.5 | ✅ |
| §3 Logging | 1.6.1 - 1.6.8 | M1.6 | ✅ |
| §4 API Adapter Resilience | 1.7.1 - 1.7.17, 2.3.8 - 2.3.22 | M1.7, M2.3 | ✅ |
| §5 Caching Strategy (Next.js) | 2.3.12, 2.3.16, 2.3.21 | M2.3 | ✅ |
| §6 Health Checks | 6.1.1 - 6.1.11 | M6.1 | ✅ |
| §7 Security (Read-Only) | 5.1.1 - 5.1.10, 5.2.2 - 5.2.3, 6.2.1 - 6.2.12 | M5.1, M5.2, M6.2 | ✅ |
| §8 Metrics & Monitoring | 6.7.1 - 6.7.8 | M6.7 (optional) | ✅ |
| §9 Error Tracking | 6.8.1 - 6.8.6 | M6.8 (optional) | ✅ |
| §10 CI Pipeline | 6.5.1 - 6.5.12 | M6.5 | ✅ |
| §11 Docker & Docker Compose | 6.3.1 - 6.3.12, 6.4.1 - 6.4.9 | M6.3, M6.4 | ✅ |
| §12 Documentation | 7.1.1 - 7.1.12, 7.2.1 - 7.2.10 | M7.1, M7.2 | ✅ |

### prd.md Feature Coverage

| Feature | Tasks | Milestone | Status |
|---------|-------|-----------|--------|
| Post List Page | 4.1.1 - 4.6.5 | M4 | ✅ |
| Post Detail Page | 5.2.1 - 5.5.15 | M5 | ✅ |
| Threaded Comments | 5.4.1 - 5.5.15 | M5.4, M5.5 | ✅ |
| Sorting (Top/New/Best) | 4.4.1 - 4.4.9 | M4.4 | ✅ |
| Pagination/Load More | 4.5.1 - 4.5.5 | M4.5 | ✅ |
| Responsive Design | 7.3.1 - 7.3.5 | M7.3 | ✅ |
| Domain Models | 2.1.1 - 2.1.20 | M2.1 | ✅ |
| API Adapter | 2.3.1 - 2.3.26 | M2.3 | ✅ |
| Services | 3.1.1 - 3.2.12 | M3.1, M3.2 | ✅ |
| Tests | Throughout all milestones | All | ✅ |
| Dockerfile | 6.3.1 - 6.3.12 | M6.3 | ✅ |

---

*End of Implementation Task List*
