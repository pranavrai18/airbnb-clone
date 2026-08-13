"use client";

import React from "react";

export interface GuestCounts {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

interface GuestListPopoverProps {
  counts: GuestCounts;
  onChange: (counts: GuestCounts) => void;
  onClose: () => void;
}

export default function GuestListPopover({
  counts,
  onChange,
  onClose,
}: GuestListPopoverProps) {
  const updateCount = (key: keyof GuestCounts, delta: number) => {
    const nextVal = Math.max(0, counts[key] + delta);
    const updated = { ...counts, [key]: nextVal };

    // Automatically set at least 1 adult if children/infants/pets are selected
    if (key !== "adults" && nextVal > 0 && updated.adults === 0) {
      updated.adults = 1;
    }

    onChange(updated);
  };

  const rows = [
    {
      key: "adults" as const,
      title: "Adults",
      subtitle: "Ages 13 or above",
      value: counts.adults,
      min: 0,
      max: 16,
    },
    {
      key: "children" as const,
      title: "Children",
      subtitle: "Ages 2–12",
      value: counts.children,
      min: 0,
      max: 6,
    },
    {
      key: "infants" as const,
      title: "Infants",
      subtitle: "Under 2",
      value: counts.infants,
      min: 0,
      max: 5,
    },
    {
      key: "pets" as const,
      title: "Pets",
      subtitle: "Bringing a service animal?",
      value: counts.pets,
      min: 0,
      max: 5,
    },
  ];

  return (
    <div className="absolute top-full mt-3 right-0 z-50 w-96 overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl animate-scale-in">
      <div className="space-y-6">
        {rows.map(({ key, title, subtitle, value, min, max }) => (
          <div key={key} className="flex items-center justify-between border-b border-gray-100 pb-5 last:border-0 last:pb-0">
            <div>
              <h4 className="text-base font-bold text-[#222222]">{title}</h4>
              <p className="text-xs text-gray-500">{subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => updateCount(key, -1)}
                disabled={value <= min}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-700 transition hover:border-gray-800 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-300"
              >
                −
              </button>
              <span className="w-6 text-center text-sm font-semibold text-gray-800">
                {value}
              </span>
              <button
                type="button"
                onClick={() => updateCount(key, 1)}
                disabled={value >= max}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-700 transition hover:border-gray-800 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-300"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-[#222222] px-5 py-2 text-xs font-semibold text-white hover:bg-black"
        >
          Done
        </button>
      </div>
    </div>
  );
}
