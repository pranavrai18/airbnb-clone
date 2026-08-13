"use client";

import React from "react";

interface WishlistButtonProps {
  isFavorited: boolean;
  onToggle: () => void;
  className?: string;
}

export default function WishlistButton({ isFavorited, onToggle, className = "" }: WishlistButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      className={`group transition-transform hover:scale-110 ${className}`}
      aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
    >
      <svg
        viewBox="0 0 32 32"
        className="h-7 w-7 drop-shadow-sm"
        fill={isFavorited ? "#FF385C" : "rgba(0,0,0,0.5)"}
        stroke="white"
        strokeWidth="2"
      >
        <path d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-7c-1.8 0-3.58.68-4.95 2.05L16 8.1l-2.05-2.05a6.98 6.98 0 0 0-9.9 0A6.98 6.98 0 0 0 2 11c0 7 7 12.27 14 17z" />
      </svg>
    </button>
  );
}
