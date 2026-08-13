"use client";

import React, { useState } from "react";
import { ListingDetail } from "@/types";
import DateRangePicker from "./DateRangePicker";
import GuestSelector from "./GuestSelector";

interface BookingCardProps {
  listing: ListingDetail;
  checkIn: string;
  checkOut: string;
  guests: number;
  onCheckInChange: (date: string) => void;
  onCheckOutChange: (date: string) => void;
  onGuestsChange: (guests: number) => void;
  onReserve: () => void;
  loading: boolean;
}

export default function BookingCard({
  listing,
  checkIn,
  checkOut,
  guests,
  onCheckInChange,
  onCheckOutChange,
  onGuestsChange,
  onReserve,
  loading,
}: BookingCardProps) {
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);

  const numNights =
    checkIn && checkOut
      ? Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
      : 0;

  const subtotal = listing.price_per_night * (numNights > 0 ? numNights : 1);
  const serviceFee = Math.round(subtotal * 0.12 * 100) / 100;
  const total = subtotal + serviceFee;

  const originalPrice = Math.round(listing.price_per_night * 1.15);

  return (
    <div id="booking-card" className="sticky top-28 space-y-4">
      {/* Top Banner: Prices include all fees */}
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-3 px-4 shadow-sm text-sm font-semibold text-gray-900 dark:text-white">
        <span className="text-base">🏷️</span>
        <span>Prices include all fees</span>
      </div>

      {/* Main Booking Box */}
      <div className="rounded-3xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-xl space-y-5">
        {/* Price header */}
        <div className="flex items-baseline gap-2">
          <span className="text-gray-400 dark:text-slate-500 line-through text-lg font-medium">
            ${originalPrice}
          </span>
          <span className="text-[26px] font-bold text-gray-900 dark:text-white">
            ${listing.price_per_night}
          </span>
          <span className="text-sm font-medium text-gray-600 dark:text-slate-400">
            for {numNights > 0 ? `${numNights} night${numNights > 1 ? "s" : ""}` : "1 night"}
          </span>
        </div>

        {/* Date & Guest Box */}
        <div className="rounded-2xl border border-gray-400 dark:border-slate-600 overflow-hidden bg-white dark:bg-slate-900">
          <DateRangePicker
            checkIn={checkIn}
            checkOut={checkOut}
            onCheckInChange={onCheckInChange}
            onCheckOutChange={onCheckOutChange}
            unavailableDates={listing.unavailable_dates}
          />
          <div className="relative border-t border-gray-400 dark:border-slate-600">
            <button
              type="button"
              onClick={() => setShowGuestDropdown(!showGuestDropdown)}
              className="flex w-full items-center justify-between p-3 text-left transition hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-800 dark:text-slate-300">
                  GUESTS
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {guests} guest{guests > 1 ? "s" : ""}
                </span>
              </div>
              <svg viewBox="0 0 16 16" className="h-4 w-4 fill-gray-700 dark:fill-slate-300">
                <path d="M8 11.5l-5-5L4.4 5 8 8.6 11.6 5 13 6.5z" />
              </svg>
            </button>

            {showGuestDropdown && (
              <div className="absolute top-full left-0 right-0 z-30 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-b-2xl shadow-xl p-3">
                <GuestSelector
                  guests={guests}
                  maxGuests={listing.max_guests}
                  onChange={(val) => {
                    onGuestsChange(val);
                    setShowGuestDropdown(false);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Reserve Button */}
        <button
          type="button"
          onClick={onReserve}
          disabled={!checkIn || !checkOut || numNights <= 0 || loading}
          className="w-full rounded-2xl bg-[#E00B41] hover:bg-[#d70466] py-3.5 text-base font-bold text-white transition shadow-md disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Processing..." : "Reserve"}
        </button>

        <p className="text-center text-xs font-medium text-gray-500 dark:text-slate-400">
          You won&apos;t be charged yet
        </p>

        {/* Price Breakdown */}
        {numNights > 0 && (
          <div className="space-y-3 border-t border-gray-200 dark:border-slate-700 pt-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-slate-300">
              <span className="underline">
                ${listing.price_per_night} × {numNights} night{numNights !== 1 ? "s" : ""}
              </span>
              <span>${subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-slate-300">
              <span className="underline">Service fee</span>
              <span>${serviceFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 dark:border-slate-700 pt-3 text-base font-bold text-gray-900 dark:text-white">
              <span>Total</span>
              <span>${total.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Report listing link */}
      <div className="text-center pt-3">
        <button className="inline-flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-slate-300 hover:text-black dark:hover:text-white transition cursor-pointer">
          <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="h-4 w-4 fill-current shrink-0">
            <path d="M28 6H17V4a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v24a1 1 0 1 0 2 0v-9h11v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1zm-2 13H17V8h9v11z" />
          </svg>
          <span className="underline">Report this listing</span>
        </button>
      </div>
    </div>
  );
}
