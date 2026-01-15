'use client';

/**
 * ErrorDisplay Component
 *
 * Shared error UI used by all error boundaries.
 * Provides customizable title, message, and size variants.
 */

import Link from 'next/link';

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  digest?: string;
  onRetry: () => void;
  size?: 'default' | 'large';
}

const WARNING_ICON_PATH =
  'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';

const RETRY_ICON_PATH =
  'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15';

const HOME_ICON_PATH =
  'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6';

const SIZE_CLASSES = {
  default: {
    iconContainer: 'w-16 h-16 mb-6',
    icon: 'w-8 h-8',
    title: 'text-2xl font-bold text-gray-900 mb-2',
    message: 'text-gray-600 mb-6',
    digest: 'text-xs text-gray-400 mb-6',
    buttonGap: 'gap-3',
    button: 'px-5 py-2.5 text-sm',
    buttonIcon: 'w-4 h-4 mr-2',
  },
  large: {
    iconContainer: 'w-20 h-20 mb-8',
    icon: 'w-10 h-10',
    title: 'text-3xl font-bold text-gray-900 mb-3',
    message: 'text-gray-600 mb-8 text-lg',
    digest: 'text-xs text-gray-400 mb-8',
    buttonGap: 'gap-4',
    button: 'px-6 py-3 text-base',
    buttonIcon: 'w-5 h-5 mr-2',
  },
} as const;

export default function ErrorDisplay({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  digest,
  onRetry,
  size = 'default',
}: ErrorDisplayProps): React.ReactElement {
  const classes = SIZE_CLASSES[size];

  return (
    <div className="max-w-md w-full text-center">
      <div
        className={`mx-auto ${classes.iconContainer} rounded-full bg-red-100 flex items-center justify-center`}
      >
        <svg
          className={`${classes.icon} text-red-600`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={WARNING_ICON_PATH}
          />
        </svg>
      </div>

      <h1 className={classes.title}>{title}</h1>
      <p className={classes.message}>{message}</p>

      {digest && <p className={classes.digest}>Error ID: {digest}</p>}

      <div className={`flex flex-col sm:flex-row ${classes.buttonGap} justify-center`}>
        <button
          onClick={onRetry}
          className={`inline-flex items-center justify-center ${classes.button} font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors`}
        >
          <svg
            className={classes.buttonIcon}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={RETRY_ICON_PATH}
            />
          </svg>
          Try Again
        </button>

        <Link
          href="/"
          className={`inline-flex items-center justify-center ${classes.button} font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors`}
        >
          <svg
            className={classes.buttonIcon}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={HOME_ICON_PATH}
            />
          </svg>
          Go Home
        </Link>
      </div>
    </div>
  );
}
