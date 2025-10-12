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
        className="ml-4 rounded-md bg-gray-700 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-600 hover:text-white"
        aria-label="Open Search"
      >
        Search
      </button>
    </div>
  );
};
