# Glossary — Hacker News Frontend Clone
---

> **Single source of truth for terminology**  
> Use these terms everywhere in code, docs, and discussion.

---

## Core Concepts

| Term | Definition |
|------|------------|
| **Post** | A top-level content item (previously called "story"). Fields: `id`, `title`, optional `url` or `text`, `author`, `points`, `commentCount`, `createdAt`, etc. UI & filenames should use `Post` (not story/item). |
| **Comment** | A reply attached to a Post or another Comment. Threaded; has `id`, `author`, `text`, `parentId?`, `children[]`, `createdAt`. |
| **User** | An authenticated person in the system (username, id). Controls whether actions (vote/submit/edit) are available. |

---

## Architecture Layers

| Term | Definition |
|------|------------|
| **Page** | A top-level routed view (Next.js App Router): e.g., **Post List Page**, **Post Detail Page**, **Submit Post Page**. |
| **Layout** | Shared UI wrapper used by Pages (header, footer, nav). |
| **Component** | Reusable UI piece (e.g., `PostItem`, `CommentItem`, `NavBar`). Components live under `components/`. |
| **Domain Model** | TypeScript interfaces that represent Posts, Comments, Users used across the app (source of truth for data shapes). |
| **API Adapter** | The single layer that talks to an external backend (Hacker News API initially). Exposes functions returning Domain Models (e.g., `getPosts`, `getPostById`, `getCommentsByPostId`). Swap backend by changing only the adapter. |
| **Service** | Business logic built on top of the adapter (e.g., pagination logic, mapping). Called by Pages or Hooks. Caching is handled by Next.js built-in fetch caching. |
| **Hook** | Reusable client-side logic (e.g., `useAuth`, `usePosts`, `useComments`) that components use. |
| **Context** | React Context used for global state (e.g., auth status, theme, selectedSort). |
| **Store** | Explicit store only if using an external state library (avoid unless necessary). Prefer Hooks + Context for this project. |

---

## Actions

| Term | Definition |
|------|------------|
| **Submit** | Create a new Post |
| **Vote** | Upvote a Post or Comment |
| **Search** | Find Posts by title or content |
| **Sort** | Order Posts by Top, New, or Best |

Use these verbs precisely in code and docs.

---

## Naming Rules

* Use `Post` prefix for everything post-related (`PostList`, `PostItem`, `PostDetail`).
* Use `Comment` prefix for comment components.
* Do not use "story", "item", or "feed" — use `PostList` instead of `Feed`.
* Pages are always `Page` via the file path (`/posts/[id]/page.tsx` is Post Detail Page).

---

## Common Ambiguity Fixes

| Instead of... | Use... |
|---------------|--------|
| "feed" | **Post List** (component: `PostList`, page: Post List Page) |
| "story" | **Post** |
| "item" | **Post** or **Comment** (be explicit) |
| "page" (ambiguous) | **Post Detail Page** or similar |

---

*End of Glossary*
