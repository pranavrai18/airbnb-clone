"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getListingDetail, createBooking } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/components/Toast";
import { ListingDetail, Booking } from "@/types";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentUser } = useUser();
  const { showToast } = useToast();

  const listingId = Number(searchParams.get("listing_id"));
  const checkIn = searchParams.get("check_in") || "";
  const checkOut = searchParams.get("check_out") || "";
  const guests = Number(searchParams.get("guests") || 1);

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState<Booking | null>(null);

  useEffect(() => {
    if (listingId) {
      getListingDetail(listingId)
        .then(setListing)
        .catch(() => showToast("Failed to load listing", "error"))
        .finally(() => setLoading(false));
    }
  }, [listingId, showToast]);

  const numNights = checkIn && checkOut
    ? Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 0;

  const subtotal = listing ? listing.price_per_night * numNights : 0;
  const serviceFee = Math.round(subtotal * 0.12 * 100) / 100;
  const total = subtotal + serviceFee;

  const handleConfirmBooking = async () => {
    if (!currentUser || !listing) return;
    setConfirming(true);
    try {
      const booking = await createBooking({
        listing_id: listing.id,
        guest_id: currentUser.id,
        check_in: checkIn,
        check_out: checkOut,
        guests,
      });
      setConfirmed(booking);
      showToast("Booking confirmed! 🎉", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Booking failed", "error");
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-1/3 rounded bg-gray-200" />
          <div className="h-64 rounded-xl bg-gray-200" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-lg text-gray-500">Listing not found</p>
      </div>
    );
  }

  // Confirmation state
  if (confirmed) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-teal-500">
          <svg viewBox="0 0 32 32" className="h-10 w-10 fill-white">
            <path d="M13.1 22.5 5.3 14.7l1.4-1.4 6.4 6.4L25.3 7.5l1.4 1.4z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Booking Confirmed!</h1>
        <p className="mt-3 text-lg text-gray-500">
          Your reservation at <span className="font-semibold text-gray-800">{listing.title}</span> is confirmed.
        </p>

        <div className="mx-auto mt-8 max-w-md rounded-xl border border-gray-200 bg-gray-50 p-6 text-left">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Check-in</span>
              <span className="font-medium text-gray-800">{new Date(confirmed.check_in).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Checkout</span>
              <span className="font-medium text-gray-800">{new Date(confirmed.check_out).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Guests</span>
              <span className="font-medium text-gray-800">{confirmed.guests}</span>
            </div>
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-gray-800">Total</span>
                <span className="text-gray-800">${confirmed.total_price.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => router.push("/trips")}
            className="rounded-lg bg-gray-800 px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-900"
          >
            View My Trips
          </button>
          <button
            onClick={() => router.push("/")}
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-sm text-gray-600 transition hover:text-gray-800"
      >
        <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current">
          <path d="M10.354 3.354 5.707 8l4.647 4.646-.708.708L4.293 8l5.353-5.354z" />
        </svg>
        Back
      </button>

      <h1 className="text-[32px] font-bold text-gray-800">Confirm and pay</h1>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Left - Trip details */}
        <div className="space-y-6">
          <div>
            <h2 className="text-[22px] font-semibold text-gray-800">Your trip</h2>

            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Dates</p>
                  <p className="text-sm text-gray-500">
                    {new Date(checkIn).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    {" – "}
                    {new Date(checkOut).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Guests</p>
                  <p className="text-sm text-gray-500">
                    {guests} guest{guests !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mock Payment */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-[22px] font-semibold text-gray-800">Pay with</h2>
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-16 items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-blue-800 text-xs font-bold text-white">
                  VISA
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">•••• •••• •••• 4242</p>
                  <p className="text-xs text-gray-400">Mock payment — no real charges</p>
                </div>
              </div>
            </div>
          </div>

          {/* Confirm button */}
          <button
            onClick={handleConfirmBooking}
            disabled={confirming}
            className="w-full rounded-xl bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] py-4 text-lg font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {confirming ? "Confirming..." : "Confirm booking"}
          </button>

          <p className="text-center text-xs text-gray-400">
            This is a mock checkout. No real payment will be processed.
          </p>
        </div>

        {/* Right - Booking summary */}
        <div>
          <div className="sticky top-28 rounded-xl border border-gray-200 p-6">
            <div className="flex gap-4">
              <img
                src={listing.images[0]?.image_url || ""}
                alt={listing.title}
                className="h-32 w-32 rounded-xl object-cover"
              />
              <div>
                <p className="text-xs text-gray-400">{listing.property_type}</p>
                <p className="mt-1 font-medium text-gray-800">{listing.title}</p>
                <p className="mt-1 text-sm text-gray-500">{listing.location}</p>
                {listing.avg_rating && (
                  <div className="mt-2 flex items-center gap-1 text-sm">
                    <svg viewBox="0 0 32 32" className="h-3 w-3 fill-gray-800">
                      <path d="M15.094 1.579l-4.124 8.885-9.86 1.27a1 1 0 0 0-.542 1.736l7.293 6.565-1.965 9.852a1 1 0 0 0 1.483 1.061L16 25.951l8.625 4.997a1 1 0 0 0 1.482-1.06l-1.965-9.853 7.293-6.565a1 1 0 0 0-.541-1.735l-9.86-1.271-4.127-8.885a1 1 0 0 0-1.814 0z" />
                    </svg>
                    <span>{listing.avg_rating}</span>
                    <span className="text-gray-400">({listing.review_count})</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-3 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-800">Price details</h3>
              <div className="flex justify-between text-base text-gray-600">
                <span>
                  ${listing.price_per_night} × {numNights} night{numNights !== 1 ? "s" : ""}
                </span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base text-gray-600">
                <span>Service fee</span>
                <span>${serviceFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-semibold text-gray-800">
                <span>Total (USD)</span>
                <span>${total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-1/3 rounded bg-gray-200" />
            <div className="h-64 rounded-xl bg-gray-200" />
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
