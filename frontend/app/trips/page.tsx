"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getUserBookings } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/components/Toast";
import { Booking } from "@/types";

export default function TripsPage() {
  const { currentUser } = useUser();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    getUserBookings(currentUser.id)
      .then(setBookings)
      .catch(() => showToast("Failed to load trips", "error"))
      .finally(() => setLoading(false));
  }, [currentUser, showToast]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-[32px] font-extrabold text-gray-900 dark:text-white">Trips</h1>
        <div className="mt-8 grid gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
              <div className="flex gap-6">
                <div className="h-32 w-48 rounded-xl bg-gray-200 dark:bg-slate-700" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-1/3 rounded bg-gray-200 dark:bg-slate-700" />
                  <div className="h-4 w-1/4 rounded bg-gray-200 dark:bg-slate-700" />
                  <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-slate-700" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-[32px] font-extrabold text-gray-900 dark:text-white">Trips</h1>

      {bookings.length === 0 ? (
        <div className="mt-12 text-center rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-12 shadow-xs">
          <p className="text-xl font-bold text-gray-900 dark:text-white">No trips booked... yet!</p>
          <p className="mt-2 text-sm text-gray-600 dark:text-slate-300 font-medium">
            Time to dust off your bags and start planning your next adventure.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] px-6 py-3 text-sm font-bold text-white transition hover:opacity-95 shadow-md"
          >
            Start searching
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {bookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/listings/${booking.listing_id}`}
              className="block overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition hover:shadow-md cursor-pointer"
            >
              <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="h-48 w-full md:h-auto md:w-56 shrink-0">
                  <img
                    src={booking.listing?.images?.[0]?.image_url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"}
                    alt={booking.listing?.title || "Listing"}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {booking.listing?.title}
                        </h3>
                        <p className="mt-0.5 text-sm font-medium text-gray-600 dark:text-slate-300">
                          📍 {booking.listing?.location}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 capitalize border border-emerald-200 dark:border-emerald-800 shrink-0">
                        {booking.status}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-t border-gray-100 dark:border-slate-700 pt-4">
                    <div className="flex gap-6 text-sm">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">Check-in</p>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {new Date(booking.check_in).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">Checkout</p>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {new Date(booking.check_out).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">Guests</p>
                        <p className="font-bold text-gray-900 dark:text-white">{booking.guests}</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">Total Price</p>
                      <p className="text-lg font-extrabold text-gray-900 dark:text-white">
                        ${booking.total_price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
