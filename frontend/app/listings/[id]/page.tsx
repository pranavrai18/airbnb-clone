"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { getListingDetail } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import { useSearch } from "@/context/SearchContext";
import { useToast } from "@/components/Toast";
import { ListingDetail } from "@/types";
import PhotoGallery from "@/components/PhotoGallery";
import Amenities from "@/components/Amenities";
import Reviews from "@/components/Reviews";
import BookingCard from "@/components/BookingCard";

const HOST_META_PRESETS = [
  {
    born: "Born in the 90s",
    work: "Architect & Interior Designer",
    hostingSince: "2019",
    coHostName: "Lakshit",
    coHostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
  },
  {
    born: "Born in the 80s",
    work: "Culinary Chef & Food Explorer",
    hostingSince: "2017",
    coHostName: "Elena",
    coHostAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
  },
  {
    born: "Born in the 00s",
    work: "Event Designer & Stylist",
    hostingSince: "2022",
    coHostName: "Rohan",
    coHostAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
  },
  {
    born: "Born in the 70s",
    work: "Landscape Architect & Horticulturist",
    hostingSince: "2015",
    coHostName: "Sophia",
    coHostAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
  },
  {
    born: "Born in the 90s",
    work: "Creative Director & Traveler",
    hostingSince: "2020",
    coHostName: "Carlos",
    coHostAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
  },
  {
    born: "Born in the 80s",
    work: "Boutique Hotelier & Sommelier",
    hostingSince: "2018",
    coHostName: "Maya",
    coHostAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
  },
];

function getHostMetaData(listingId: number) {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(`host_meta_${listingId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          born: parsed.born || "Born in the 90s",
          work: parsed.work || "Event Designer & Stylist",
          hostingSince: parsed.hostingSince || "2026",
          coHostName: parsed.coHostName || "Lakshit",
          coHostAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        };
      } catch (e) {}
    }
  }

  const index = Math.abs(listingId - 1) % HOST_META_PRESETS.length;
  return HOST_META_PRESETS[index];
}

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { currentUser } = useUser();
  const { searchFilter } = useSearch();
  const { showToast } = useToast();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState(searchFilter.check_in || "");
  const [checkOut, setCheckOut] = useState(searchFilter.check_out || "");
  const [guests, setGuests] = useState(searchFilter.guests || 1);
  const [reserving] = useState(false);

  useEffect(() => {
    if (searchFilter.check_in) setCheckIn(searchFilter.check_in);
    if (searchFilter.check_out) setCheckOut(searchFilter.check_out);
    if (searchFilter.guests && searchFilter.guests > 0) setGuests(searchFilter.guests);
  }, [searchFilter]);

  useEffect(() => {
    getListingDetail(Number(id))
      .then(setListing)
      .catch(() => showToast("Failed to load listing", "error"))
      .finally(() => setLoading(false));
  }, [id, showToast]);

  const handleReserve = () => {
    if (!currentUser) {
      showToast("Please select a user", "error");
      return;
    }
    if (!checkIn || !checkOut) {
      showToast("Please select check-in and check-out dates", "error");
      return;
    }
    const queryParams = new URLSearchParams({
      listing_id: id,
      check_in: checkIn,
      check_out: checkOut,
      guests: guests.toString(),
    });
    router.push(`/checkout?${queryParams.toString()}`);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-2/3 rounded bg-gray-200 dark:bg-slate-800" />
          <div className="h-[420px] rounded-xl bg-gray-200 dark:bg-slate-800" />
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 space-y-4">
              <div className="h-6 w-1/2 rounded bg-gray-200 dark:bg-slate-800" />
              <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-slate-800" />
            </div>
            <div className="h-[400px] rounded-xl bg-gray-200 dark:bg-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Listing not found</h1>
          <p className="mt-2 text-gray-600 dark:text-slate-300">This listing may have been removed.</p>
        </div>
      </div>
    );
  }

  const bedrooms = Math.max(1, Math.ceil(listing.max_guests / 2));
  const beds = listing.max_guests;
  const bathrooms = Math.max(1, Math.floor(listing.max_guests / 2));
  const hostMeta = getHostMetaData(listing.id);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 text-gray-900 dark:text-white">
      {/* Photo Gallery */}
      <div id="photos" className="scroll-mt-28">
        <PhotoGallery images={listing.images} title={listing.title} />
      </div>

      {/* Content grid */}
      <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px]">
        {/* Left column */}
        <div className="space-y-8">
          {/* Main Title & Details */}
          <div className="border-b border-gray-200 dark:border-slate-800 pb-6">
            <h1 className="text-[26px] font-extrabold text-gray-900 dark:text-white">
              {listing.property_type === "Experiences" || listing.property_type === "Services"
                ? listing.title
                : `${listing.property_type} in ${listing.location}`}
            </h1>
            <p className="mt-1 text-base text-gray-700 dark:text-slate-300 font-medium">
              {listing.property_type === "Experiences"
                ? `Up to ${listing.max_guests} guests · 2.5 hours duration · All equipment & gear included`
                : listing.property_type === "Services"
                  ? `Up to ${listing.max_guests} guests · On-demand service · Full setup & cleanup included`
                  : `${listing.max_guests} guest${listing.max_guests !== 1 ? "s" : ""} · ${bedrooms} bedroom${bedrooms !== 1 ? "s" : ""} · ${beds} bed${beds !== 1 ? "s" : ""} · ${bathrooms} bathroom${bathrooms !== 1 ? "s" : ""}`}
            </p>
            {listing.avg_rating && (
              <div className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-white">
                <svg viewBox="0 0 32 32" className="h-3.5 w-3.5 fill-amber-500">
                  <path d="M15.094 1.579l-4.124 8.885-9.86 1.27a1 1 0 0 0-.542 1.736l7.293 6.565-1.965 9.852a1 1 0 0 0 1.483 1.061L16 25.951l8.625 4.997a1 1 0 0 0 1.482-1.06l-1.965-9.853 7.293-6.565a1 1 0 0 0-.541-1.735l-9.86-1.271-4.127-8.885a1 1 0 0 0-1.814 0z" />
                </svg>
                <span>★ {listing.avg_rating}</span>
                <span>·</span>
                <span className="underline cursor-pointer">{listing.review_count} reviews</span>
                <span>·</span>
                <span className="underline cursor-pointer">{listing.location}</span>
              </div>
            )}
          </div>

          {/* Host info */}
          <div className="flex items-center gap-4 border-b border-gray-200 dark:border-slate-800 pb-6">
            {listing.host?.avatar_url && (
              <img
                src={listing.host.avatar_url}
                alt={listing.host.name}
                className="h-14 w-14 rounded-full object-cover shadow-sm border border-gray-200 dark:border-slate-700"
              />
            )}
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {listing.property_type === "Services"
                  ? `Provided by ${listing.host?.name}`
                  : `Hosted by ${listing.host?.name}`}
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-0.5">
                {listing.property_type === "Experiences"
                  ? "Certified Local Experience Host"
                  : listing.property_type === "Services"
                    ? "Verified Professional Service Specialist"
                    : "Superhost · 3 months hosting"}
              </p>
            </div>
          </div>

          {/* Highlights for Experiences and Services */}
          {(listing.property_type === "Experiences" || listing.property_type === "Services") && (
            <div className="space-y-4 border-b border-gray-200 dark:border-slate-800 pb-6">
              {listing.property_type === "Experiences" ? (
                <>
                  <div className="flex items-start gap-4">
                    <span className="text-2xl shrink-0">🏄</span>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">All equipment provided</h3>
                      <p className="text-sm text-gray-500 dark:text-slate-400">High-quality gear and safety equipment are included.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-2xl shrink-0">👥</span>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">Small group experience</h3>
                      <p className="text-sm text-gray-500 dark:text-slate-400">Intimate group size for personal guidance and maximum fun.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-2xl shrink-0">⭐</span>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">5-star rated instructor</h3>
                      <p className="text-sm text-gray-500 dark:text-slate-400">Guided by a certified local expert with top guest ratings.</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-4">
                    <span className="text-2xl shrink-0">🍽️</span>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">Customized experience</h3>
                      <p className="text-sm text-gray-500 dark:text-slate-400">Tailored specifically to your preferences and schedule.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <span className="text-2xl shrink-0">🧹</span>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">Full setup & cleanup included</h3>
                      <p className="text-sm text-gray-500 dark:text-slate-400">Relax while our team handles all preparation and tidying up.</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Amenities details list */}
          <div id="amenities" className="border-b border-gray-200 dark:border-slate-800 pb-8 scroll-mt-28">
            <Amenities amenities={listing.amenities} />
          </div>

          {/* Description */}
          <div className="border-b border-gray-200 dark:border-slate-800 pb-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">About this space</h2>
            <p className="text-base leading-relaxed text-gray-700 dark:text-slate-300">{listing.description}</p>
          </div>

          {/* Reviews */}
          <div id="reviews" className="scroll-mt-28">
            <Reviews reviews={listing.reviews} avgRating={listing.avg_rating} />
          </div>

          {/* Where you'll be (Location) */}
          <div id="location" className="border-t border-gray-200 dark:border-slate-800 pt-8 scroll-mt-28">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Where you'll be</h2>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">{listing.location}</p>
            <div className="h-64 w-full rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900 border border-gray-200 dark:border-slate-700 flex flex-col items-center justify-center gap-2 p-6 shadow-inner">
              <span className="text-4xl animate-bounce">📍</span>
              <p className="text-base font-bold text-gray-900 dark:text-white">{listing.location}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Exact location provided after booking.</p>
            </div>
          </div>

          {/* Meet your host section */}
          <div className="border-t border-gray-200 dark:border-slate-800 pt-10 mt-10">
            <h2 className="text-[22px] font-bold text-gray-900 dark:text-white mb-6">Meet your host</h2>

            <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-12 items-start">
              {/* Left Column: Host Profile Card */}
              <div>
                <div className="rounded-[32px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-lg p-8 text-center flex flex-col items-center justify-center relative">
                  {/* Avatar with Pink Superhost Badge */}
                  <div className="relative mb-3">
                    <img
                      src={listing.host?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"}
                      alt={listing.host?.name || "Host"}
                      className="h-28 w-28 rounded-full object-cover shadow-sm border border-gray-100 dark:border-slate-700"
                    />
                    <div className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#E00B41] text-white shadow-md border-2 border-white dark:border-slate-800">
                      <svg viewBox="0 0 32 32" className="h-4 w-4 fill-current">
                        <path d="M16 1L4 6v10c0 8.84 5.12 14.16 12 15 6.88-.84 12-6.16 12-15V6L16 1zm-1 20l-5-5 1.41-1.41L15 18.17l7.59-7.59L24 12l-9 9z" />
                      </svg>
                    </div>
                  </div>

                  {/* Host Name & Subtitle */}
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {listing.host?.name || "Host"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-1">
                    Started hosting in {hostMeta.hostingSince}
                  </p>
                </div>

                {/* Info bullets below host card */}
                <div className="mt-6 space-y-4 px-2">
                  <div className="flex items-center gap-3 text-sm text-gray-900 dark:text-white font-medium">
                    <span className="text-lg">🎈</span>
                    <span>{hostMeta.born}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-900 dark:text-white font-medium">
                    <span className="text-lg">💼</span>
                    <span>My work: {hostMeta.work}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Co-Hosts, Message Button & Protection Notice */}
              <div className="space-y-6 pt-2">
                {/* Co-Hosts */}
                <div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white mb-3">Co-Hosts</h4>
                  <div className="flex items-center gap-3">
                    <img
                      src={hostMeta.coHostAvatar}
                      alt={hostMeta.coHostName}
                      className="h-10 w-10 rounded-full object-cover shadow-xs border border-gray-200 dark:border-slate-700"
                    />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{hostMeta.coHostName}</span>
                  </div>
                </div>

                {/* Message host button */}
                <div>
                  <button
                    type="button"
                    className="rounded-xl bg-[#f7f7f7] dark:bg-slate-800 border border-gray-900 dark:border-slate-600 px-6 py-3 text-sm font-bold text-gray-900 dark:text-white transition hover:bg-gray-200 dark:hover:bg-slate-700 cursor-pointer shadow-xs"
                  >
                    Message host
                  </button>
                </div>

                {/* Protection Notice */}
                <div className="border-t border-gray-200 dark:border-slate-800 pt-6">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 text-[#FF385C]">
                      <svg viewBox="0 0 32 32" className="h-6 w-6 fill-current">
                        <path d="M16 1L4 6v10c0 8.84 5.12 14.16 12 15 6.88-.84 12-6.16 12-15V6L16 1zm-1 20l-5-5 1.41-1.41L15 18.17l7.59-7.59L24 12l-9 9z" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed font-normal">
                      To help protect your payment, always use Airbnb to send money and communicate with hosts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Booking card */}
        <div>
          <BookingCard
            listing={listing}
            checkIn={checkIn}
            checkOut={checkOut}
            guests={guests}
            onCheckInChange={setCheckIn}
            onCheckOutChange={setCheckOut}
            onGuestsChange={setGuests}
            onReserve={handleReserve}
            loading={reserving}
          />
        </div>
      </div>
    </div>
  );
}
