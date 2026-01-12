# Production Readiness Specification — Hacker News Frontend Clone
---

> **Companion document to `prd.md`**  
> **See `glossary.md` for terminology definitions.**  
> This document covers production-grade requirements for a **read-only** website that fetches data from the Hacker News API.

---

## Table of Contents

1. [Code Quality & Maintainability](#1-code-quality--maintainability)
2. [Environment & Configuration](#2-environment--configuration)
3. [Error Handling Strategy](#3-error-handling-strategy)
4. [Logging](#4-logging)
5. [API Adapter Resilience](#5-api-adapter-resilience)
6. [Caching Strategy](#6-caching-strategy)
7. [Health Checks](#7-health-checks)
8. [Security (Read-Only Optimized)](#8-security-read-only-optimized)
9. [Metrics & Monitoring](#9-metrics--monitoring)
10. [Error Tracking](#10-error-tracking)
11. [CI Pipeline](#11-ci-pipeline)
12. [Docker & Docker Compose](#12-docker--docker-compose)
13. [Documentation Requirements](#13-documentation-requirements)

---

## 1. Code Quality & Maintainability

**Priority: P0 — Foundational**

Write code that is easy to understand, modify, and extend. New contributors should be able to read and change code without excessive cognitive load.

### Core Principles

| Principle | Description |
|-----------|-------------|
| **Single Responsibility** | Each function, component, and module does one thing well |
| **Composition over Inheritance** | Build complex behavior by combining simple pieces |
| **Explicit over Implicit** | Favor clarity over cleverness; avoid magic |
| **Colocation** | Keep related code together (tests next to source, types with implementation) |
| **Fail Fast** | Validate inputs early; surface errors immediately |

### File & Function Size Limits

| Element | Limit | Rationale |
|---------|-------|-----------|
| Function body | ≤ 30 lines | Fits on one screen; easy to understand |
| React component | ≤ 150 lines | Split if larger; extract hooks/sub-components |
| File | ≤ 300 lines | Split into multiple files if exceeded |
| Function parameters | ≤ 4 | Use options object for more |
| Nesting depth | ≤ 3 levels | Extract helper functions to reduce nesting |

### Naming Conventions

**General:**
* Use descriptive names that reveal intent: `fetchPostById` not `getData`
* Boolean variables: prefix with `is`, `has`, `should`, `can` (`isLoading`, `hasError`)
* Event handlers: prefix with `handle` or `on` (`handleClick`, `onSubmit`)
* Async functions: use verb that implies async (`fetchPosts`, `loadComments`)

**Files:**
* Components: PascalCase (`PostItem.tsx`)
* Utilities/hooks: camelCase (`usePosts.ts`, `formatDate.ts`)
* Constants: SCREAMING_SNAKE_CASE for true constants (`API_TIMEOUT_MS`)

### TypeScript Idioms

**Do:**
```typescript
// Prefer interfaces for object shapes
interface Post {
  id: number;
  title: string;
  author: string;
}

// Use type for unions and intersections
type SortOrder = 'top' | 'new' | 'best';

// Explicit return types for public functions
function getPostById(id: number): Promise<Post> { ... }

// Use readonly for immutable data
interface Config {
  readonly apiUrl: string;
  readonly timeout: number;
}

// Prefer unknown over any
function parseResponse(data: unknown): Post { ... }
```

**Don't:**
```typescript
// ❌ Avoid any
function processData(data: any) { ... }

// ❌ Avoid type assertions unless necessary
const post = data as Post;

// ❌ Avoid complex conditional types in application code
type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;
```

### React & Next.js Idioms

**Component Structure:**
```typescript
// Standard component structure
interface PostItemProps {
  post: Post;
  rank: number;
  onVote?: (id: number) => void;
}

export function PostItem({ post, rank, onVote }: PostItemProps) {
  // 1. Hooks first
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 2. Derived state
  const domain = extractDomain(post.url);
  
  // 3. Event handlers
  const handleToggle = () => setIsExpanded(!isExpanded);
  
  // 4. Early returns for edge cases
  if (!post.title) return null;
  
  // 5. Render
  return (
    <article className="post-item">
      ...
    </article>
  );
}
```

**Server vs Client Components:**
```typescript
// Server Component (default) - no 'use client'
// Use for: data fetching, static content, SEO
export default async function PostListPage() {
  const posts = await fetchPosts();
  return <PostList posts={posts} />;
}

// Client Component - add 'use client'
// Use for: interactivity, hooks, browser APIs
'use client';
export function LoadMoreButton({ onClick }: Props) {
  return <button onClick={onClick}>Load More</button>;
}
```

**Hooks Best Practices:**
```typescript
// Custom hooks extract reusable logic
function usePosts(sort: SortOrder) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Return object with clear names
  return { posts, isLoading, error, refetch };
}
```

### Code Organization Patterns

**Adapter Pattern (for external APIs):**
```typescript
// adapters/hackerNewsAdapter.ts
// Maps external API response to domain models
// All HN-specific logic stays here

export async function getPostById(id: number): Promise<Post> {
  const response = await fetch(`${HN_API}/item/${id}.json`);
  const hnItem = await response.json();
  return mapHnItemToPost(hnItem); // Transform here
}

// Internal helper - not exported
function mapHnItemToPost(item: HnItem): Post {
  return {
    id: item.id,
    title: item.title,
    author: item.by,
    // ... map all fields
  };
}
```

**Service Pattern (for business logic):**
```typescript
// services/postsService.ts
// Orchestrates adapter calls, handles pagination

export async function fetchPosts({ sort, page, pageSize }: FetchOptions) {
  const ids = await adapter.getPostIds(sort);
  const pageIds = paginate(ids, page, pageSize);
  return adapter.getPostsByIds(pageIds);
}
```

### Complexity Constraints

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Cyclomatic complexity | ≤ 10 per function | ESLint rule: `complexity` |
| Cognitive complexity | ≤ 15 per function | SonarJS rule |
| Import depth | ≤ 3 levels | No `../../../../` imports |
| Dependencies per file | ≤ 10 imports | Split if more |

### ESLint Configuration

```javascript
// .eslintrc.js - enforce code quality
module.exports = {
  rules: {
    'complexity': ['error', { max: 10 }],
    'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true }],
    'max-depth': ['error', 3],
    'max-params': ['error', 4],
    'no-nested-ternary': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': ['warn', {
      allowExpressions: true,
      allowTypedFunctionExpressions: true,
    }],
  },
};
```

### Comments & Documentation

**When to Comment:**
* **Why**, not **what**: explain non-obvious decisions
* Complex algorithms: brief explanation of approach
* Workarounds: link to issue/bug being worked around
* Public APIs: JSDoc for exported functions

**When NOT to Comment:**
* Obvious code: `// increment counter` before `count++`
* Commented-out code: delete it, use version control
* TODOs without tickets: create issue instead

**JSDoc for Public APIs:**
```typescript
/**
 * Fetches paginated posts sorted by the given order.
 * 
 * @param options - Fetch configuration
 * @returns Array of posts for the requested page
 * @throws {GatewayError} When HN API is unreachable
 */
export async function fetchPosts(options: FetchOptions): Promise<Post[]> {
  ...
}
```

### Testing for Maintainability

| Practice | Rationale |
|----------|-----------|
| Test behavior, not implementation | Tests don't break on refactors |
| One assertion concept per test | Clear failure messages |
| Descriptive test names | `it('returns empty array when no posts match filter')` |
| Arrange-Act-Assert pattern | Consistent structure |
| Avoid test interdependence | Each test runs in isolation |

### Code Review Checklist

Before merging, verify:

- [ ] Functions are ≤ 30 lines
- [ ] No `any` types without justification
- [ ] Component props have TypeScript interface
- [ ] Complex logic has tests
- [ ] No console.log (use logger)
- [ ] No hardcoded values (use config)
- [ ] Naming follows conventions
- [ ] No deeply nested code (≤ 3 levels)

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

## 2. Environment & Configuration

**Priority: P0 — Do First**

Configuration management is foundational. All other features depend on well-structured configuration.

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | `development` | Runtime environment |
| `NEXT_PUBLIC_API_BASE_URL` | Yes | — | Public API base URL |
| `DATA_SOURCE` | No | `hackernews` | Adapter selection (`hackernews`, `custom`) |
| `LOG_LEVEL` | No | `info` | Logging verbosity (`error`, `warn`, `info`, `debug`) |
| `CACHE_TTL_SECONDS` | No | `60` | Default cache TTL |
| `API_TIMEOUT_MS` | No | `10000` | API adapter timeout |
| `API_RETRY_COUNT` | No | `3` | API adapter max retries |

### Configuration Module

**Location:** `lib/config.ts`

**Requirements:**
* Validate all required env vars at application startup
* Fail fast with clear error message if required vars are missing
* Parse and type-check values (ensure numeric vars are valid numbers)
* Export typed configuration object

**Example Structure:**
```typescript
export const config = {
  nodeEnv: getEnvVar('NODE_ENV'),
  apiBaseUrl: getEnvVar('NEXT_PUBLIC_API_BASE_URL'),
  dataSource: getEnvVar('DATA_SOURCE', false) || 'hackernews',
  logLevel: getEnvVar('LOG_LEVEL', false) || 'info',
  cacheTtl: parseIntEnv('CACHE_TTL_SECONDS', 60),
  apiTimeout: parseIntEnv('API_TIMEOUT_MS', 10000),
  apiRetryCount: parseIntEnv('API_RETRY_COUNT', 3),
} as const;
```

### Environment Files

```
.env.local          # Local overrides (gitignored)
.env.development    # Development defaults
.env.production     # Production defaults
.env.example        # Template with all variables documented
```

---

## 3. Error Handling Strategy

**Priority: P0 — Do First**

Robust error handling must be built into the codebase from day one.

### Custom Error Classes

**Location:** `lib/errors.ts`

**Error Types to Define:**

| Error Class | Use Case | HTTP Status |
|-------------|----------|-------------|
| `AppError` | Base class for all app errors | — |
| `GatewayError` | External API failures | 502 |
| `NotFoundError` | Resource not found | 404 |
| `TimeoutError` | Request timeout | 504 |

**Requirements:**
* All errors extend base `AppError` class
* Include `code` field for programmatic handling
* Include `isOperational` flag to distinguish expected vs unexpected errors
* Capture stack trace

### Client-Side Error Boundaries

**Locations:**

| File | Scope |
|------|-------|
| `app/global-error.tsx` | Root layout failures |
| `app/error.tsx` | Post List Page failures |
| `app/posts/[id]/error.tsx` | Post Detail Page failures |

**Error UI Requirements:**
* Display user-friendly message (no technical jargon)
* Provide "Try Again" button to retry the failed operation
* Provide "Go Home" link as escape hatch
* Log error details before rendering error UI

### Server-Side Error Responses

**Consistent Error Shape:**
```json
{
  "error": {
    "code": "ADAPTER_ERROR",
    "message": "Failed to fetch posts"
  }
}
```

**HTTP Status Code Mapping:**

| Scenario | Status |
|----------|--------|
| Success | 200 |
| Resource not found | 404 |
| Upstream API error | 502 |
| Timeout | 504 |
| Unexpected error | 500 |

---

## 4. Logging

**Priority: P0 — Do First**

Structured logging is essential for debugging and monitoring.

### Logger Module

**Location:** `lib/logger.ts`

**Library:** `pino` (lightweight, JSON output, Next.js compatible)

### Log Levels

| Level | When to Use |
|-------|-------------|
| `error` | Errors requiring attention |
| `warn` | Unexpected but recoverable issues |
| `info` | Key application events |
| `debug` | Detailed debugging info (dev only) |

**Default by Environment:**
* Production: `error`
* Staging: `info`
* Development: `debug`

### Required Log Fields

| Field | Description |
|-------|-------------|
| `timestamp` | ISO 8601 format |
| `level` | Log level |
| `message` | Human-readable message |
| `context` | Object with additional data |
| `error` | Error object with stack (errors only) |

### What to Log

**Server-Side:**
* API adapter calls: method, URL, duration, status
* Cache operations: hit/miss, key, TTL
* Errors with full context and stack trace

**Client-Side:**
* Critical errors only (send to error tracking service)

---

## 5. API Adapter Resilience

**Priority: P0 — Do First**

The adapter layer must handle network failures gracefully.

### Timeout Configuration

| Type | Default | Description |
|------|---------|-------------|
| Request timeout | 10000ms | Total time for request to complete |

**Implementation:**
* Use `AbortController` with `setTimeout` for fetch timeout
* Throw `TimeoutError` when timeout exceeded

### Retry Policy

**Location:** `lib/retry.ts`

**Retry Configuration:**

| Setting | Value |
|---------|-------|
| Max retries | 3 |
| Initial delay | 1000ms |
| Backoff multiplier | 2 |
| Max delay | 8000ms |

**Backoff Sequence:** 1s → 2s → 4s

**Retry On:**
* HTTP 5xx responses
* Network errors (connection refused, timeout)
* HTTP 429 (rate limited) — with longer delay

**Do NOT Retry On:**
* HTTP 4xx responses (except 429)

### Fallback Strategy

**Flow (with Next.js Caching):**
```
Request → Next.js Cache Check
              │
              ├── Fresh cache → Return immediately
              │
              ├── Stale cache → Return stale + revalidate in background
              │
              └── No cache → Call Adapter
                               │
                               ├── Success → Cache + Return
                               │
                               └── Failure → Retry available?
                                      │
                                      ├── Yes → Wait → Retry
                                      │
                                      └── No → Throw error → Error UI
```

**How Next.js Handles Stale Data:**
* Next.js automatically serves stale content while revalidating
* No custom "stale cache fallback" code needed
* If revalidation fails, stale content continues to be served until next successful revalidation

**Requirements:**
* Log errors when API calls fail (even if stale content is served)
* Retry logic applies to cache misses and revalidation attempts

---

## 6. Caching Strategy

**Priority: P1 — Use Next.js Built-in Caching**

Use Next.js built-in fetch caching instead of custom implementation. Simpler, better integrated, less code to maintain.

### Next.js Fetch Caching

**Implementation:** Use native `fetch()` with `next` options in the adapter layer.

```typescript
// In adapters/hackerNewsAdapter.ts
const response = await fetch(url, {
  next: { revalidate: 60 } // Cache for 60 seconds
});
```

### Cache TTLs (Revalidate Times)

| Data Type | Revalidate | Strategy |
|-----------|------------|----------|
| Post list IDs (top/new/best) | 60s | ISR |
| Individual Post | 300s (5 min) | ISR |
| Comments | 120s (2 min) | ISR |

### How It Works

* **First request:** Fetches from HN API and caches the response
* **Within TTL:** Returns cached response instantly (no network call)
* **After TTL:** Serves stale while revalidating in background
* **No custom code:** Next.js handles caching, invalidation, and stale-while-revalidate automatically

### Why Not Custom Cache?

| Aspect | Custom (`lib/cache.ts`) | Next.js Built-in |
|--------|-------------------------|------------------|
| Code complexity | More code to write/test | Zero custom code |
| Stale-while-revalidate | Must implement | Built-in |
| Multi-instance | Needs Redis | Works out of box |
| Integration | Manual | Native to framework |

### Future Enhancement (Deferred)

Custom in-memory cache can be added later if needed for:
* More granular cache control beyond fetch
* Cache warming strategies
* Redis integration for specific use cases
* Caching non-fetch operations

---

## 7. Health Checks

**Priority: P1 — Do Early**

Health checks are required for Docker health checks and load balancers.

### Endpoints

| Endpoint | Purpose | Checks |
|----------|---------|--------|
| `GET /api/health` | Liveness | App is running |
| `GET /api/health/ready` | Readiness | App can serve traffic |

### Liveness Response

**Path:** `app/api/health/route.ts`

```json
{
  "status": "ok",
  "timestamp": "2026-01-10T12:00:00.000Z",
  "version": "1.0.0"
}
```

**Always returns 200** if the process is running.

### Readiness Response

**Path:** `app/api/health/ready/route.ts`

**Checks:**
* Can reach Hacker News API (lightweight request)

**Success (200):**
```json
{
  "status": "ready",
  "checks": {
    "api": { "status": "up", "latencyMs": 150 }
  }
}
```

**Failure (503):**
```json
{
  "status": "not_ready",
  "checks": {
    "api": { "status": "down", "error": "Connection refused" }
  }
}
```

---

## 8. Security (Read-Only Optimized)

**Priority: P1 — Do Early**

Minimal security configuration for a read-only website.

### Security Headers

**Location:** `next.config.js`

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer info |

### Content Security Policy

**Strict CSP for read-only site (no user scripts needed):**

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
font-src 'self';
connect-src 'self' https://hacker-news.firebaseio.com;
frame-ancestors 'none';
```

### HTML Sanitization

**Location:** `lib/sanitize.ts`

**Library:** `isomorphic-dompurify`

**Usage:** Sanitize HTML content from HN API (comment text contains HTML).

**Why Needed:** Even though we don't accept user input, the HN API returns HTML in comments that could potentially contain malicious content.

### Parameter Validation

**Location:** Page components (`app/posts/[id]/page.tsx`)

**Validation:** Post ID must be numeric. Return 404 for invalid IDs.

---

## 9. Metrics & Monitoring

**Priority: P2 — Add After Core Features**

Metrics provide visibility into application health and performance.

### Metrics Library

**Library:** `prom-client`

### Key Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `http_request_duration_seconds` | Histogram | Request latency by route |
| `http_requests_total` | Counter | Request count by route, status |
| `api_adapter_duration_seconds` | Histogram | External API latency |
| `api_adapter_errors_total` | Counter | External API errors |
| `cache_hits_total` | Counter | Cache hits |
| `cache_misses_total` | Counter | Cache misses |

### Metrics Endpoint

**Path:** `app/api/metrics/route.ts`

**Format:** Prometheus text format

**Enable/Disable:** Controlled via `METRICS_ENABLED` env var (default: `false`)

---

## 10. Error Tracking

**Priority: P2 — Add After Core Features**

Centralized error tracking for production debugging.

### Service

**Recommended:** Sentry (has free tier)

### Configuration

| Env Var | Description |
|---------|-------------|
| `SENTRY_DSN` | Sentry project DSN |
| `SENTRY_AUTH_TOKEN` | Auth token for source map upload |

### Setup Files

* `sentry.client.config.ts` — Client-side initialization
* `sentry.server.config.ts` — Server-side initialization

### What to Capture

* Unhandled exceptions (automatic)
* Unhandled promise rejections (automatic)
* Manually captured errors with context

---

## 11. CI Pipeline

**Priority: P2 — Add After Core Features**

Automated quality checks on every pull request.

### GitHub Actions Workflow

**File:** `.github/workflows/ci.yml`

### Pipeline Steps

| Step | Command | Purpose |
|------|---------|---------|
| Checkout | `actions/checkout@v4` | Get code |
| Setup Node | `actions/setup-node@v4` | Install Node 20 |
| Install | `npm ci` | Install dependencies |
| Lint | `npm run lint` | Code style check |
| Type Check | `npm run type-check` | TypeScript validation |
| Test | `npm test -- --coverage` | Run tests with coverage |
| Build | `npm run build` | Verify build works |
| Security Audit | `npm audit --audit-level=high` | Check dependencies |

### Trigger

* On pull request to `main` branch
* On push to `main` branch

---

## 12. Docker & Docker Compose

**Priority: P2 — Add After Core Features**

Containerized deployment for consistency across environments.

### Dockerfile

**File:** `Dockerfile`

**Stages:**

1. **deps** — Install dependencies
2. **builder** — Build the application
3. **runner** — Production image

**Requirements:**
* Multi-stage build for smaller image size
* Run as non-root user
* Include health check instruction
* Target image size: < 200MB

**Base Image:** `node:20-alpine`

### Docker Compose — Production

**File:** `docker-compose.yml`

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_BASE_URL=https://hacker-news.firebaseio.com/v0
      - LOG_LEVEL=info
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped
```

### Docker Compose — Development

**File:** `docker-compose.dev.yml`

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: deps
    command: npm run dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_API_BASE_URL=https://hacker-news.firebaseio.com/v0
      - LOG_LEVEL=debug
```

### Commands

| Command | Purpose |
|---------|---------|
| `docker compose up` | Run production build |
| `docker compose -f docker-compose.dev.yml up` | Run with hot reload |
| `docker compose build` | Rebuild image |
| `docker compose down` | Stop containers |

---

## 13. Documentation Requirements

**Priority: P3 — Ongoing**

Documentation ensures maintainability and onboarding.

### Required Files

| File | Purpose |
|------|---------|
| `README.md` | Setup, run, test instructions |
| `ARCHITECTURE.md` | System design overview |
| `.env.example` | Environment variables template |

### README Structure

```markdown
# Project Name

## Prerequisites
- Node.js 20+
- Docker (optional)

## Quick Start
npm install
npm run dev

## Running with Docker
docker compose up

## Running Tests
npm test

## Environment Variables
See .env.example

## Architecture
See ARCHITECTURE.md

## Swapping Backend
Change export in adapters/index.ts
```

### ARCHITECTURE.md Structure

```markdown
# Architecture

## Overview
Brief description and diagram

## Layers
- Pages (app/)
- Components (components/)
- Services (services/)
- Adapters (adapters/)
- Domain (domain/)

## Data Flow
Request → Page → Service → Adapter → External API

## Key Decisions
- Why App Router
- Why adapter pattern
- Caching strategy
```

---

## File Structure Summary

```
lib/
├── config.ts          # Configuration (Priority: P0)
├── errors.ts          # Error classes (Priority: P0)
├── logger.ts          # Logging (Priority: P0)
├── retry.ts           # Retry logic (Priority: P0)
├── sanitize.ts        # HTML sanitization (Priority: P1)
└── cache.ts           # Custom caching (DEFERRED - using Next.js fetch cache)

app/
├── api/
│   ├── health/
│   │   └── route.ts       # Liveness (Priority: P1)
│   └── health/
│       └── ready/
│           └── route.ts   # Readiness (Priority: P1)
├── error.tsx              # Error boundary (Priority: P0)
└── global-error.tsx       # Root error boundary (Priority: P0)

Root files:
├── Dockerfile             # (Priority: P2)
├── docker-compose.yml     # (Priority: P2)
├── docker-compose.dev.yml # (Priority: P2)
└── .github/workflows/ci.yml # (Priority: P2)
```

---

## Implementation Priority Summary

| Priority | Section | Effort |
|----------|---------|--------|
| **P0** | Code Quality & Maintainability | Ongoing (applied from start) |
| **P0** | Configuration | 1-2 hrs |
| **P0** | Error Handling | 2-3 hrs |
| **P0** | Logging | 1-2 hrs |
| **P0** | API Resilience (retry/timeout) | 2-3 hrs |
| **P1** | Caching (Next.js built-in) | 0.5 hr |
| **P1** | Health Checks | 1 hr |
| **P1** | Security Headers & Sanitization | 1-2 hrs |
| **P2** | Metrics | 2-3 hrs |
| **P2** | Error Tracking (Sentry) | 1-2 hrs |
| **P2** | CI Pipeline | 1-2 hrs |
| **P2** | Docker Setup | 1-2 hrs |
| **P3** | Documentation | Ongoing |

---

*End of Production Readiness Specification*
