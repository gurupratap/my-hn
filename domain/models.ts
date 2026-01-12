/**
 * Domain Models
 *
 * Core domain types used throughout the application.
 * These models are independent of any external API structure.
 */

/**
 * Post type enumeration
 */
export type PostType = 'story' | 'job' | 'poll';

/**
 * Represents a Hacker News post (story, job, poll, etc.)
 */
export interface Post {
  /** Unique identifier for the post */
  id: number;

  /** Type of post */
  type: PostType;

  /** Post title */
  title: string;

  /** External URL (optional - text posts don't have URLs) */
  url?: string;

  /** Post text content (optional - link posts don't have text) */
  text?: string;

  /** Username of the post author */
  author: string;

  /** Number of upvotes */
  points: number;

  /** Total number of comments */
  commentCount: number;

  /** IDs of top-level comments */
  commentIds: number[];

  /** When the post was created */
  createdAt: Date;

  /** Whether the post has been deleted */
  deleted?: boolean;

  /** Whether the post is dead/flagged */
  dead?: boolean;
}

/**
 * Represents a comment on a post
 */
export interface Comment {
  /** Unique identifier for the comment */
  id: number;

  /** Username of the comment author */
  author: string;

  /** Comment text content (may contain HTML) */
  text: string;

  /** When the comment was created */
  createdAt: Date;

  /** ID of the parent (post or comment) */
  parentId: number;

  /** IDs of child comments (from API) */
  commentIds: number[];

  /** Nested child comments (assembled by service layer) */
  children: Comment[];

  /** Whether the comment has been deleted */
  deleted?: boolean;

  /** Whether the comment is dead/flagged */
  dead?: boolean;
}

/**
 * Represents a user (stub for future implementation)
 */
export interface User {
  /** Unique username */
  id: string;

  /** When the user account was created */
  createdAt: Date;

  /** User's karma score */
  karma: number;

  /** User's self-description (optional) */
  about?: string;
}
