"use client";

import React from "react";

interface GuestSelectorProps {
  guests: number;
  maxGuests: number;
  onChange: (guests: number) => void;
}

export default function GuestSelector({ guests, maxGuests, onChange }: GuestSelectorProps) {
  return (
    <div className="rounded-b-xl border-x border-b border-gray-300 p-3">
      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-800">
        Guests
      </label>
      <div className="mt-1 flex items-center gap-4">
        <button
          onClick={() => onChange(Math.max(1, guests - 1))}
          disabled={guests <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:border-gray-800 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-300"
        >
          −
        </button>
        <span className="w-8 text-center text-base font-medium text-gray-800">{guests}</span>
        <button
          onClick={() => onChange(Math.min(maxGuests, guests + 1))}
          disabled={guests >= maxGuests}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition hover:border-gray-800 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-300"
        >
          +
        </button>
        <span className="ml-1 text-xs text-gray-400">{maxGuests} max</span>
      </div>
    </div>
  );
}
