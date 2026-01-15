'use client';

/**
 * Post Detail Error Boundary
 *
 * Catches and displays errors for the post detail page.
 * Provides user-friendly error messages with recovery options.
 */

import ErrorDisplay from '../../../components/ErrorDisplay';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps): React.ReactElement {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <ErrorDisplay
        title="Could not load post"
        message={error.message || 'An error occurred while loading this post. Please try again.'}
        digest={error.digest}
        onRetry={reset}
      />
    </div>
  );
}
