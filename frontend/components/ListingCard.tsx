"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ListingCard } from "@/types";
import WishlistButton from "./WishlistButton";

interface ListingCardComponentProps {
  listing: ListingCard;
  isFavorited: boolean;
  onToggleFavorite: (listingId: number) => void;
}

export default function ListingCardComponent({
  listing,
  isFavorited,
  onToggleFavorite,
}: ListingCardComponentProps) {
  const [imgIndex, setImgIndex] = useState(0);
  const images = listing.images.length > 0 ? listing.images : [];
  const mainImage = images[imgIndex]?.image_url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800";

  return (
    <Link href={`/listings/${listing.id}`} className="group block">
      <div className="relative">
        {/* Image container */}
        <div className="relative aspect-square overflow-hidden rounded-2xl">
          <img
            src={mainImage}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />

          {/* Dynamic Badge */}
          <div className="absolute top-3 left-3 rounded-full border border-gray-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 px-3 py-1 text-[12px] font-bold text-gray-900 dark:text-white shadow-xs backdrop-blur-xs">
            {listing.property_type === "Experiences"
              ? "Top Experience"
              : listing.property_type === "Services"
              ? "Popular Service"
              : "Guest favourite"}
          </div>

          {/* Image navigation dots */}
          {images.length > 1 && (
            <>
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {images.slice(0, 5).map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setImgIndex(i);
                    }}
                    className={`h-1.5 w-1.5 rounded-full transition ${
                      i === imgIndex ? "bg-white" : "bg-white/60"
                    }`}
                  />
                ))}
              </div>

              {/* Arrows */}
              {imgIndex > 0 && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setImgIndex((prev) => prev - 1);
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 dark:bg-slate-800/90 opacity-0 shadow transition group-hover:opacity-100"
                >
                  <svg viewBox="0 0 16 16" className="h-3 w-3 fill-gray-800 dark:fill-white">
                    <path d="M10.354 3.354 5.707 8l4.647 4.646-.708.708L4.293 8l5.353-5.354z" />
                  </svg>
                </button>
              )}
              {imgIndex < images.length - 1 && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setImgIndex((prev) => prev + 1);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 dark:bg-slate-800/90 opacity-0 shadow transition group-hover:opacity-100"
                >
                  <svg viewBox="0 0 16 16" className="h-3 w-3 fill-gray-800 dark:fill-white">
                    <path d="M5.646 3.354 10.293 8l-4.647 4.646.708.708L11.707 8 6.354 2.646z" />
                  </svg>
                </button>
              )}
            </>
          )}
        </div>

        {/* Wishlist button */}
        <WishlistButton
          isFavorited={isFavorited}
          onToggle={() => onToggleFavorite(listing.id)}
          className="absolute right-3 top-3"
        />
      </div>

      {/* Info */}
      <div className="mt-2.5 space-y-0.5">
        <h3 className="text-[16px] font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:underline">
          {listing.title}
        </h3>
        <p className="text-[14px] text-gray-600 dark:text-slate-300 font-medium line-clamp-1">
          📍 {listing.location}
        </p>
        <p className="mt-0.5 text-[15px] text-gray-600 dark:text-slate-300 flex items-center justify-between font-medium">
          <span>
            <strong className="font-extrabold text-gray-900 dark:text-white">${listing.price_per_night}</strong>{" "}
            {listing.property_type === "Experiences"
              ? "/ person"
              : listing.property_type === "Services"
              ? "/ service"
              : "per night"}
          </span>
          {listing.avg_rating && (
            <span className="flex items-center gap-1 font-bold text-gray-900 dark:text-white">
              <svg viewBox="0 0 32 32" className="h-3.5 w-3.5 fill-amber-500">
                <path d="M15.094 1.579l-4.124 8.885-9.86 1.27a1 1 0 0 0-.542 1.736l7.293 6.565-1.965 9.852a1 1 0 0 0 1.483 1.061L16 25.951l8.625 4.997a1 1 0 0 0 1.482-1.06l-1.965-9.853 7.293-6.565a1 1 0 0 0-.541-1.735l-9.86-1.271-4.127-8.885a1 1 0 0 0-1.814 0z" />
              </svg>
              {listing.avg_rating}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}
