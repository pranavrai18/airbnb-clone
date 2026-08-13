"use client";

import React, { useState, useEffect } from "react";
import { Amenity } from "@/types";
import { getAmenities } from "@/lib/api";

interface FilterBarProps {
  onFilterChange: (filters: {
    min_price?: number;
    max_price?: number;
    property_type?: string;
    amenities?: string;
  }) => void;
}

const PROPERTY_TYPES = [
  { label: "All", value: "", icon: "🏠" },
  { label: "House", value: "House", icon: "🏡" },
  { label: "Apartment", value: "Apartment", icon: "🏢" },
  { label: "Villa", value: "Villa", icon: "🏰" },
  { label: "Treehouse", value: "Treehouse", icon: "🌳" },
];

export default function FilterBar({ onFilterChange }: FilterBarProps) {
  const [selectedType, setSelectedType] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);

  useEffect(() => {
    getAmenities().then(setAmenities).catch(console.error);
  }, []);

  const handleTypeClick = (value: string) => {
    setSelectedType(value);
    onFilterChange({
      property_type: value || undefined,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
      amenities: selectedAmenities.length ? selectedAmenities.join(",") : undefined,
    });
  };

  const handleApplyFilters = () => {
    onFilterChange({
      property_type: selectedType || undefined,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
      amenities: selectedAmenities.length ? selectedAmenities.join(",") : undefined,
    });
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setSelectedType("");
    setMinPrice("");
    setMaxPrice("");
    setSelectedAmenities([]);
    onFilterChange({});
    setShowFilters(false);
  };

  const toggleAmenity = (id: number) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const activeFilterCount =
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    selectedAmenities.length;

  return (
    <div className="border-b border-gray-100">
      <div className="mx-auto flex max-w-[1760px] items-center gap-4 overflow-x-auto px-6 py-4 md:px-10 xl:px-20">
        {/* Property type categories */}
        <div className="flex items-center gap-6">
          {PROPERTY_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => handleTypeClick(type.value)}
              className={`flex flex-col items-center gap-1 whitespace-nowrap border-b-2 pb-1 pt-1 transition ${
                selectedType === type.value
                  ? "border-gray-800 text-gray-800"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              <span className="text-xl">{type.icon}</span>
              <span className="text-xs font-medium">{type.label}</span>
            </button>
          ))}
        </div>

        {/* Filters button */}
        <div className="ml-auto">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:border-gray-800 hover:shadow-sm"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current">
              <path d="M5 8a3 3 0 0 1 5.83 1H14v2H10.83A3 3 0 0 1 5 8zm3-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM1 9h4V7H1v2zm0-6h8V1H1v2zm10.17 0H14V1h-2.83A3 3 0 0 0 6 3a3 3 0 0 0 5.17 0zM12 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM1 15h8v-2H1v2zm10.17 0H14v-2h-2.83a3 3 0 0 0-5.34 0H1v2h4.83a3 3 0 0 0 5.34 0zM8 14a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-xs text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expanded filters panel */}
      {showFilters && (
        <div className="border-t border-gray-100 bg-white">
          <div className="mx-auto max-w-[1760px] px-6 py-6 md:px-10 xl:px-20">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Price Range */}
              <div>
                <h3 className="mb-3 text-base font-semibold text-gray-800">Price range</h3>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                      $
                    </span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 py-2.5 pl-7 pr-3 text-sm outline-none transition focus:border-gray-800 focus:ring-1 focus:ring-gray-800"
                    />
                  </div>
                  <span className="text-gray-300">—</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                      $
                    </span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 py-2.5 pl-7 pr-3 text-sm outline-none transition focus:border-gray-800 focus:ring-1 focus:ring-gray-800"
                    />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="mb-3 text-base font-semibold text-gray-800">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity) => (
                    <button
                      key={amenity.id}
                      onClick={() => toggleAmenity(amenity.id)}
                      className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                        selectedAmenities.includes(amenity.id)
                          ? "border-gray-800 bg-gray-800 text-white"
                          : "border-gray-200 text-gray-600 hover:border-gray-800"
                      }`}
                    >
                      {amenity.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
              <button
                onClick={handleClearFilters}
                className="text-sm font-medium text-gray-600 underline transition hover:text-gray-800"
              >
                Clear all
              </button>
              <button
                onClick={handleApplyFilters}
                className="rounded-lg bg-gray-800 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-gray-900"
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
