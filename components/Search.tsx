// components/Search.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PagefindUI } from '@pagefind/default-ui';

export const Search = () => {
  const [pagefind, setPagefind] = useState<PagefindUI | null>(null);

  const openSearch = useCallback(() => {
    if (pagefind) {
      pagefind.open();
    }
  }, [pagefind]);

  useEffect(() => {
    const initPagefind = async () => {
      if (typeof window !== 'undefined' && !pagefind) {
        try {
          const PagefindUI = (await import('@pagefind/default-ui')).PagefindUI;
          const pf = new PagefindUI({
            element: '#search',
            showSubResults: true,
            resetStyles: false,
          });
          setPagefind(pf);
        } catch (error) {
          console.error('Failed to load Pagefind UI:', error);
        }
      }
    };
    initPagefind();
  }, [pagefind]);

  useEffect(() => {
    // Add CSS for Pagefind
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/pagefind/pagefind-ui.css';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div>
      <div id="search"></div>
      <button
        onClick={openSearch}
        className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
        aria-label="Open Search"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <span className="ml-1.5 hidden sm:inline">Search</span>
      </button>
    </div>
  );
};
