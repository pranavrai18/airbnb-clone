"use client";

import React from "react";
import { ListingCard } from "@/types";
import ListingCardComponent from "./ListingCard";

interface ListingGridProps {
  listings: ListingCard[];
  favoriteIds: Set<number>;
  onToggleFavorite: (listingId: number) => void;
  loading: boolean;
}

export default function ListingGrid({
  listings,
  favoriteIds,
  onToggleFavorite,
  loading,
}: ListingGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="animate-pulse space-y-3">
            <div className="aspect-square rounded-2xl bg-gray-200 dark:bg-slate-800" />
            <div className="space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-slate-800" />
              <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-slate-800" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="py-20 text-center rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
        <p className="text-lg font-bold text-gray-900 dark:text-white">No listings found</p>
        <p className="mt-1 text-sm font-medium text-gray-600 dark:text-slate-300">Try adjusting your search or category filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {listings.map((listing) => (
        <ListingCardComponent
          key={listing.id}
          listing={listing}
          isFavorited={favoriteIds.has(listing.id)}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
