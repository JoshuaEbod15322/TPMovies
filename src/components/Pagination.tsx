import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}) => {
  // Cap max pages realistically for TMDB (typically TMDB caps at 500)
  const maxPages = Math.min(totalPages, 500);

  if (maxPages <= 1) return null;

  const handlePageClick = (page: number) => {
    if (page < 1 || page > maxPages || page === currentPage || isLoading) return;
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate page numbers to display
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const delta = 2; // Number of pages before and after current page

    const left = Math.max(2, currentPage - delta);
    const right = Math.min(maxPages - 1, currentPage + delta);

    pages.push(1);

    if (left > 2) {
      pages.push('...');
    }

    for (let i = left; i <= right; i++) {
      pages.push(i);
    }

    if (right < maxPages - 1) {
      pages.push('...');
    }

    if (maxPages > 1) {
      pages.push(maxPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      id="pagination-controls"
      aria-label="Pagination Navigation"
      className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-6 border-t border-white/10 w-full"
    >
      {/* Page Info */}
      <div className="text-xs text-neutral-400 font-medium order-2 sm:order-1">
        Showing Page <span className="text-white font-bold">{currentPage}</span> of{' '}
        <span className="text-white font-bold">{maxPages.toLocaleString()}</span>
      </div>

      {/* Numeric Buttons */}
      <div className="flex items-center gap-1.5 order-1 sm:order-2 flex-wrap justify-center">
        {/* First Page */}
        <button
          id="pagination-first-btn"
          onClick={() => handlePageClick(1)}
          disabled={currentPage === 1 || isLoading}
          aria-label="Go to first page"
          title="First Page"
          className="p-2 rounded-xl bg-[#0d0d0d] hover:bg-neutral-800 text-neutral-300 hover:text-white border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Prev Page */}
        <button
          id="pagination-prev-btn"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          aria-label="Previous Page"
          className="px-3 py-2 rounded-xl bg-[#0d0d0d] hover:bg-neutral-800 text-neutral-300 hover:text-white border border-white/10 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Dynamic Page Items */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((p, idx) => {
            if (p === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-xs text-neutral-500 select-none font-bold"
                >
                  •••
                </span>
              );
            }

            const pageNum = Number(p);
            const isCurrent = pageNum === currentPage;

            return (
              <button
                key={`page-${pageNum}`}
                id={`pagination-page-${pageNum}`}
                onClick={() => handlePageClick(pageNum)}
                disabled={isLoading}
                aria-current={isCurrent ? 'page' : undefined}
                className={`min-w-[36px] h-9 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                  isCurrent
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-105 border border-red-500'
                    : 'bg-[#0d0d0d] hover:bg-neutral-800 text-neutral-300 hover:text-white border border-white/10'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          id="pagination-next-btn"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === maxPages || isLoading}
          aria-label="Next Page"
          className="px-3 py-2 rounded-xl bg-[#0d0d0d] hover:bg-neutral-800 text-neutral-300 hover:text-white border border-white/10 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          id="pagination-last-btn"
          onClick={() => handlePageClick(maxPages)}
          disabled={currentPage === maxPages || isLoading}
          aria-label="Go to last page"
          title="Last Page"
          className="p-2 rounded-xl bg-[#0d0d0d] hover:bg-neutral-800 text-neutral-300 hover:text-white border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </nav>
  );
};
