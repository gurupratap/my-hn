/**
 * Tests for SortTabs Component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import SortTabs from '../../components/SortTabs';

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({
    children,
    href,
    className,
    'aria-current': ariaCurrent,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
    'aria-current'?: string;
  }): React.ReactElement {
    return (
      <a href={href} className={className} aria-current={ariaCurrent}>
        {children}
      </a>
    );
  };
});

describe('SortTabs', () => {
  it('renders all sort options', () => {
    render(<SortTabs activeSort="top" />);

    expect(screen.getByText('Top')).toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Best')).toBeInTheDocument();
  });

  it('active tab is highlighted when top is selected', () => {
    render(<SortTabs activeSort="top" />);

    const topTab = screen.getByText('Top');
    expect(topTab).toHaveAttribute('aria-current', 'page');
    expect(topTab).toHaveClass('bg-orange-500');
  });

  it('active tab is highlighted when new is selected', () => {
    render(<SortTabs activeSort="new" />);

    const newTab = screen.getByText('New');
    expect(newTab).toHaveAttribute('aria-current', 'page');
    expect(newTab).toHaveClass('bg-orange-500');
  });

  it('active tab is highlighted when best is selected', () => {
    render(<SortTabs activeSort="best" />);

    const bestTab = screen.getByText('Best');
    expect(bestTab).toHaveAttribute('aria-current', 'page');
    expect(bestTab).toHaveClass('bg-orange-500');
  });

  it('tab links have correct hrefs', () => {
    render(<SortTabs activeSort="top" />);

    expect(screen.getByText('Top')).toHaveAttribute('href', '/');
    expect(screen.getByText('New')).toHaveAttribute('href', '/?sort=new');
    expect(screen.getByText('Best')).toHaveAttribute('href', '/?sort=best');
  });

  it('inactive tabs do not have aria-current', () => {
    render(<SortTabs activeSort="top" />);

    const newTab = screen.getByText('New');
    const bestTab = screen.getByText('Best');

    expect(newTab).not.toHaveAttribute('aria-current');
    expect(bestTab).not.toHaveAttribute('aria-current');
  });

  it('has accessible navigation role', () => {
    render(<SortTabs activeSort="top" />);

    const nav = screen.getByRole('navigation', { name: /sort posts/i });
    expect(nav).toBeInTheDocument();
  });
});
