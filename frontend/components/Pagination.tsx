"use client";

import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1 py-8">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 dark:text-slate-200 transition hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current">
          <path d="M10.354 3.354 5.707 8l4.647 4.646-.708.708L4.293 8l5.353-5.354z" />
        </svg>
      </button>

      {getPages().map((page, i) =>
        page === "..." ? (
          <span key={`dots-${i}`} className="flex h-10 w-10 items-center justify-center text-sm font-bold text-gray-400 dark:text-slate-500">
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page as number)}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition cursor-pointer ${
              currentPage === page
                ? "bg-gray-900 text-white dark:bg-slate-700 dark:text-white shadow-xs"
                : "text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800"
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex h-10 w-10 items-center justify-center rounded-full text-gray-700 dark:text-slate-200 transition hover:bg-gray-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
      >
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current">
          <path d="M5.646 3.354 10.293 8l-4.647 4.646.708.708L11.707 8 6.354 2.646z" />
        </svg>
      </button>
    </div>
  );
}
