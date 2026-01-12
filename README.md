# my-hn

A Hacker News client built with Next.js 16 and React 19.

## Tech Stack

- **Framework**: Next.js 16.1 with Turbopack
- **UI**: React 19, Tailwind CSS 4
- **Testing**: Jest 30, Testing Library, MSW 2
- **Logging**: Pino
- **Language**: TypeScript 5

## Project Structure

```
my-hn/
├── adapters/           # Data source adapters
│   ├── types.ts        # Adapter interface definition
│   ├── hackerNewsAdapter.ts  # HN API implementation
│   └── index.ts        # Adapter factory
├── app/                # Next.js App Router pages
├── domain/             # Domain models (Post, Comment, User)
├── lib/                # Shared utilities
│   ├── config.ts       # Environment configuration
│   ├── errors.ts       # Custom error classes
│   ├── http-status.ts  # HTTP status constants
│   ├── logger.ts       # Pino logger
│   └── retry.ts        # Retry with exponential backoff
├── mocks/              # MSW mock handlers for testing
└── tests/              # Test files mirroring source structure
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
npm install
```

### Environment Setup

Copy the example environment file:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production/test) | - |
| `HN_API_BASE_URL` | Hacker News API base URL | `https://hacker-news.firebaseio.com` |

Optional variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATA_SOURCE` | Adapter to use | `hackernews` |
| `LOG_LEVEL` | Logging level (error/warn/info/debug) | `info` |
| `CACHE_TTL_SECONDS` | Cache TTL for fetch revalidation | `60` |
| `API_TIMEOUT_MS` | Request timeout in ms | `10000` |
| `API_RETRY_COUNT` | Retry attempts for failed requests | `3` |

### Running

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Linting
npm run lint
```

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

Tests use MSW to mock API responses without hitting the real Hacker News API.

## Architecture

### Adapter Pattern

The application uses an adapter pattern to abstract data sources. All adapters implement the `Adapter` interface:

```typescript
interface Adapter {
  getTopPostIds(): Promise<number[]>;
  getNewPostIds(): Promise<number[]>;
  getBestPostIds(): Promise<number[]>;
  getPostById(id: number): Promise<Post>;
  getPostsByIds(ids: number[]): Promise<Post[]>;
  getCommentById(id: number): Promise<Comment>;
}
```

To add a new data source:

1. Create `adapters/yourAdapter.ts` implementing `Adapter`
2. Add a case in `adapters/index.ts` switch statement
3. Set `DATA_SOURCE=yoursource` in environment

### Error Handling

Custom error classes extend `AppError`:

- `GatewayError` (502) - Upstream API failures
- `NotFoundError` (404) - Resource not found
- `TimeoutError` (504) - Request timeout

### Retry Logic

Failed requests are retried with exponential backoff:

- Retries on: 5xx errors, 429 rate limiting, network errors
- No retry on: 4xx client errors (except 429)
- Configurable via `API_RETRY_COUNT` and retry options

## License

Private
