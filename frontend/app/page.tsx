"use client";

import React, { useState, useEffect, useCallback } from "react";
import ListingGrid from "@/components/ListingGrid";
import Pagination from "@/components/Pagination";
import { useUser } from "@/context/UserContext";
import { useCategory } from "@/context/CategoryContext";
import { useSearch } from "@/context/SearchContext";
import { useToast } from "@/components/Toast";
import { getListings, getUserFavorites, addFavorite, removeFavorite } from "@/lib/api";
import { ListingCard, SearchParams } from "@/types";
import HostDashboard from "@/app/host/page";

export default function Home() {
  const { currentUser } = useUser();
  const { category } = useCategory();
  const { searchFilter } = useSearch();
  const { showToast } = useToast();
  const [listings, setListings] = useState<ListingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [searchParams, setSearchParams] = useState<SearchParams>({});



  useEffect(() => {
    setPage(1);
    setSearchParams((prev) => ({
      ...prev,
      property_type: category || undefined,
    }));
  }, [category]);

  useEffect(() => {
    setPage(1);
    setSearchParams((prev) => ({
      ...prev,
      location: searchFilter.location || undefined,
      check_in: searchFilter.check_in || undefined,
      check_out: searchFilter.check_out || undefined,
      guests: searchFilter.guests || undefined,
      min_price: searchFilter.min_price || undefined,
      max_price: searchFilter.max_price || undefined,
      amenities: searchFilter.amenities || undefined,
    }));
  }, [searchFilter]);

  const fetchListings = useCallback(async (params: SearchParams) => {
    setLoading(true);
    try {
      const data = await getListings({ ...params, limit: 12 });
      setListings(data.listings);
      setTotalPages(data.total_pages);
      setTotal(data.total);
    } catch {
      showToast("Failed to load listings", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const fetchFavorites = useCallback(async () => {
    if (!currentUser) return;
    try {
      const favs = await getUserFavorites(currentUser.id);
      setFavoriteIds(new Set(favs.map((f) => f.listing_id)));
    } catch {
      // Silent fail for favorites
    }
  }, [currentUser]);

  useEffect(() => {
    fetchListings({ ...searchParams, page });
  }, [page, searchParams, fetchListings]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  if (currentUser?.role === "host") {
    return <HostDashboard />;
  }

  const handleSearch = (params: {
    location: string;
    check_in: string;
    check_out: string;
    guests: number;
  }) => {
    setPage(1);
    setSearchParams((prev) => ({
      ...prev,
      location: params.location || undefined,
      check_in: params.check_in || undefined,
      check_out: params.check_out || undefined,
      guests: params.guests || undefined,
    }));
  };

  const handleFilterChange = (filters: {
    min_price?: number;
    max_price?: number;
    property_type?: string;
    amenities?: string;
  }) => {
    setPage(1);
    setSearchParams((prev) => ({
      ...prev,
      ...filters,
    }));
  };

  const handleToggleFavorite = async (listingId: number) => {
    if (!currentUser) return;
    try {
      if (favoriteIds.has(listingId)) {
        await removeFavorite(listingId, currentUser.id);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(listingId);
          return next;
        });
        showToast("Removed from favorites");
      } else {
        await addFavorite(currentUser.id, listingId);
        setFavoriteIds((prev) => new Set(prev).add(listingId));
        showToast("Added to favorites");
      }
    } catch {
      showToast("Failed to update favorites", "error");
    }
  };

  return (
    <div>
      {/* Section Heading matching screenshot */}
      <div className="mx-auto max-w-[1760px] px-6 pt-6 md:px-10 xl:px-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[24px] font-bold text-gray-900 dark:text-white">
              {category === "Experiences"
                ? "Popular experiences"
                : category === "Services"
                ? "Popular services"
                : "Popular homes"}
            </h2>
            <span className="rounded-full bg-gray-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-700">
              {total} places
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-sm text-gray-400 transition hover:border-gray-800 hover:text-gray-800"
              aria-label="Previous"
            >
              ‹
            </button>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-sm font-bold text-gray-800 transition hover:border-gray-800"
              aria-label="Next"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="mx-auto max-w-[1760px] px-6 py-4 md:px-10 xl:px-20">
        {total > 0 && !loading && (
          <p className="mb-4 text-sm text-gray-500">
            {total} stay{total !== 1 ? "s" : ""}
          </p>
        )}

        {!loading && listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-4xl mb-3">🏡</div>
            <h3 className="text-xl font-bold text-[#222222]">No stays found</h3>
            <p className="mt-1 text-sm text-gray-500 max-w-sm">
              Try adjusting or clearing your search filters to see all available homes, experiences, and services.
            </p>
            <button
              onClick={() => {
                setSearchParams({});
              }}
              className="mt-6 rounded-full bg-[#222222] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-black cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <ListingGrid
              listings={listings}
              favoriteIds={favoriteIds}
              onToggleFavorite={handleToggleFavorite}
              loading={loading}
            />

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
