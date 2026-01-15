'use client';

/**
 * Error Boundary Component
 *
 * Catches and displays errors within the app's routes.
 * Provides user-friendly error messages with recovery options.
 */

import ErrorDisplay from '../components/ErrorDisplay';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps): React.ReactElement {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <ErrorDisplay
        message={error.message || undefined}
        digest={error.digest}
        onRetry={reset}
      />
    </div>
  );
}
