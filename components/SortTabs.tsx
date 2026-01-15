/**
 * SortTabs Component
 *
 * Navigation tabs for switching between post sort orders.
 */

import Link from 'next/link';
import type { SortType } from '../services/postsService';

interface SortTabsProps {
  activeSort: SortType;
}

const SORT_OPTIONS: { value: SortType; label: string }[] = [
  { value: 'top', label: 'Top' },
  { value: 'new', label: 'New' },
  { value: 'best', label: 'Best' },
];

export default function SortTabs({
  activeSort,
}: SortTabsProps): React.ReactElement {
  return (
    <nav className="shrink-0 bg-gray-100 py-2" aria-label="Sort posts">
      <div className="mx-auto flex max-w-4xl gap-1 px-4">
        {SORT_OPTIONS.map(({ value, label }) => {
          const isActive = activeSort === value;
          const href = value === 'top' ? '/' : `/?sort=${value}`;

          return (
            <Link
              key={value}
              href={href}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
