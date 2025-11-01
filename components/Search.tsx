// components/Search.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import type { PagefindUI } from "@pagefind/default-ui";
// Load default UI CSS from the package to avoid 404s in dev
import "@pagefind/default-ui/css/ui.css";

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

  // External CSS link injection removed; package CSS is imported above.

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
