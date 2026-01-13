# my-hn

A Hacker News client built with Next.js 16 and React 19.

## Tech Stack

- **Framework**: Next.js 16.1 with Turbopack
- **UI**: React 19, Tailwind CSS 4
- **Testing**: Jest 30, Testing Library, MSW 2
- **Logging**: Pino
- **Language**: TypeScript 5

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

### Docker

Run the application using Docker Compose:

```bash
# Production build and run
docker compose up app

# Development with hot-reload
docker compose up dev
```

The dev service mounts your local directory and runs `npm run dev` with hot-reload enabled.

To rebuild after changes to Dockerfile or dependencies:

```bash
docker compose build app
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

### Retry Logic

Failed requests are retried with exponential backoff:

- Retries on: 5xx errors, 429 rate limiting, network errors
- No retry on: 4xx client errors (except 429)
- Configurable via `API_RETRY_COUNT` and retry options

## AI Usage

This project was built with assistance from various AI tools throughout different phases.

### Tools Used

- **ChatGPT (Deep Research)** - Brainstorming product requirements
- **Claude Opus 4.5** - Refining requirements and development
- **Cursor** - Code development
- **Claude Code** - Primary development tool
- **Wingman (Dedalus Labs)** - Code development

### Workflow

**Planning Phase:**

1. Used GPT 5.2 Deep Research to brainstorm and finalize the project scope
2. Built the glossary and PRD based on the research output
3. Used Claude Opus 4.5 to refine these into milestones and generate production requirements
4. Generated tasks for each milestone in `tasks.md`

**Development Phase:**

1. Picked a milestone from `tasks.md`
2. Used Cursor/Claude Code to complete the tasks (most development done with Claude Code)
3. Reviewed the changes
4. Fixed any issues
5. Committed the changes
6. Repeated for the next milestone

## License

Private
