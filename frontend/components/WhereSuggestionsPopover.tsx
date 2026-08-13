"use client";

import React from "react";

const SUGGESTED_LOCATIONS = [
  { location: "Malibu, California", subtitle: "Beachfront cottages & ocean views", icon: "🏖️" },
  { location: "New York, New York", subtitle: "Manhattan lofts & city lights", icon: "🏙️" },
  { location: "Aspen, Colorado", subtitle: "Mountain cabins & ski retreats", icon: "🏔️" },
  { location: "Miami, Florida", subtitle: "Luxury villas & infinity pools", icon: "🌴" },
  { location: "San Francisco, California", subtitle: "Golden Gate views & Marina studio", icon: "🌉" },
  { location: "Scottsdale, Arizona", subtitle: "Desert retreats & cactus pools", icon: "🌵" },
  { location: "Portland, Oregon", subtitle: "Pacific Northwest treehouses", icon: "🌲" },
  { location: "Boston, Massachusetts", subtitle: "Historic Back Bay brownstones", icon: "🏛️" },
  { location: "Lake Tahoe, California", subtitle: "Peaceful lakefront docks", icon: "⛵" },
  { location: "Chicago, Illinois", subtitle: "Downtown penthouse skyline", icon: "🏙️" },
  { location: "Napa Valley, California", subtitle: "Vineyard tours & wine tasting", icon: "🍷" },
];

interface WhereSuggestionsPopoverProps {
  query: string;
  onSelectLocation: (location: string) => void;
}

export default function WhereSuggestionsPopover({
  query,
  onSelectLocation,
}: WhereSuggestionsPopoverProps) {
  const filtered = SUGGESTED_LOCATIONS.filter((loc) =>
    loc.location.toLowerCase().includes(query.toLowerCase())
  );

  const displayList = filtered.length > 0 ? filtered : SUGGESTED_LOCATIONS;

  return (
    <div className="absolute top-full mt-3 left-0 z-50 w-96 overflow-hidden rounded-3xl border border-gray-200 bg-white p-4 shadow-2xl animate-scale-in">
      <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-400">
        Suggested destinations
      </p>
      <div className="max-h-72 overflow-y-auto space-y-1">
        {displayList.map(({ location, subtitle, icon }) => (
          <button
            key={location}
            type="button"
            onClick={() => onSelectLocation(location)}
            className="flex w-full items-center gap-4 rounded-2xl px-3 py-3 text-left transition hover:bg-gray-100 cursor-pointer"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xl">
              {icon}
            </div>
            <div>
              <p className="text-sm font-bold text-[#222222]">{location}</p>
              <p className="text-xs text-gray-500">{subtitle}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
