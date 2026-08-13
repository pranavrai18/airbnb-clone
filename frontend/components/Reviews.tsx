"use client";

import React from "react";
import { Review } from "@/types";

interface ReviewsProps {
  reviews: Review[];
  avgRating: number | null;
}

export default function Reviews({ reviews, avgRating }: ReviewsProps) {
  if (reviews.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 32 32" className="h-5 w-5 fill-amber-500">
          <path d="M15.094 1.579l-4.124 8.885-9.86 1.27a1 1 0 0 0-.542 1.736l7.293 6.565-1.965 9.852a1 1 0 0 0 1.483 1.061L16 25.951l8.625 4.997a1 1 0 0 0 1.482-1.06l-1.965-9.853 7.293-6.565a1 1 0 0 0-.541-1.735l-9.86-1.271-4.127-8.885a1 1 0 0 0-1.814 0z" />
        </svg>
        <h2 className="text-[22px] font-bold text-gray-900 dark:text-white">
          {avgRating} · {reviews.length} review{reviews.length !== 1 ? "s" : ""}
        </h2>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-2">
        {reviews.map((review) => (
          <div key={review.id}>
            <div className="flex items-center gap-3">
              {review.user?.avatar_url ? (
                <img
                  src={review.user.avatar_url}
                  alt={review.user.name}
                  className="h-12 w-12 rounded-full object-cover border border-gray-200 dark:border-slate-700"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 dark:bg-slate-700 text-lg font-bold text-white">
                  {review.user?.name?.[0] || "?"}
                </div>
              )}
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{review.user?.name || "Guest"}</p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      viewBox="0 0 32 32"
                      className={`h-3 w-3 ${i < review.rating ? "fill-amber-500" : "fill-gray-300 dark:fill-slate-600"}`}
                    >
                      <path d="M15.094 1.579l-4.124 8.885-9.86 1.27a1 1 0 0 0-.542 1.736l7.293 6.565-1.965 9.852a1 1 0 0 0 1.483 1.061L16 25.951l8.625 4.997a1 1 0 0 0 1.482-1.06l-1.965-9.853 7.293-6.565a1 1 0 0 0-.541-1.735l-9.86-1.271-4.127-8.885a1 1 0 0 0-1.814 0z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-3 text-[15px] leading-relaxed text-gray-700 dark:text-slate-300">
              {review.comment}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
