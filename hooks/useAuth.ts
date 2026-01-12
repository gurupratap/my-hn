'use client';

/**
 * useAuth Hook (Stub)
 *
 * Placeholder hook for authentication state.
 * Currently returns unauthenticated state as this is a read-only app.
 *
 * This stub exists for future extensibility if authentication
 * features are added (e.g., voting, commenting, user profiles).
 */

import { type User } from '../domain/models';

interface UseAuthResult {
  /** Current user (null when not authenticated) */
  user: User | null;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether auth state is being determined */
  loading: boolean;
}

/**
 * Hook for accessing authentication state.
 *
 * @returns Authentication state (currently always unauthenticated)
 *
 * @example
 * const { user, isAuthenticated } = useAuth();
 * if (isAuthenticated) {
 *   // Show user-specific content
 * }
 */
export function useAuth(): UseAuthResult {
  // Stub implementation - always returns unauthenticated
  return {
    user: null,
    isAuthenticated: false,
    loading: false,
  };
}
