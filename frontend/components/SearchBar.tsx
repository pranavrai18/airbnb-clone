"use client";

import { useState, useEffect, useRef } from "react";
import { Amenity } from "@/types";
import { getAmenities } from "@/lib/api";
import CalendarPopover from "./CalendarPopover";
import GuestListPopover, { GuestCounts } from "./GuestListPopover";
import WhereSuggestionsPopover from "./WhereSuggestionsPopover";

interface SearchBarProps {
  onSearch: (params: {
    location: string;
    check_in: string;
    check_out: string;
    guests: number;
    min_price?: number;
    max_price?: number;
    amenities?: string;
  }) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const [guestCounts, setGuestCounts] = useState<GuestCounts>({
    adults: 0,
    children: 0,
    infants: 0,
    pets: 0,
  });

  const [activeSection, setActiveSection] = useState<"where" | "when" | "who" | null>(null);

  // Filters Modal State
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);

  const searchBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getAmenities().then(setAmenities).catch(console.error);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchBarRef.current && !searchBarRef.current.contains(e.target as Node)) {
        setActiveSection(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalGuests = guestCounts.adults + guestCounts.children;

  const handleSearch = () => {
    setActiveSection(null);
    onSearch({
      location,
      check_in: checkIn,
      check_out: checkOut,
      guests: totalGuests,
      min_price: minPrice ? Number(minPrice) : undefined,
      max_price: maxPrice ? Number(maxPrice) : undefined,
      amenities: selectedAmenities.length ? selectedAmenities.join(",") : undefined,
    });
  };

  const handleApplyFilters = () => {
    handleSearch();
    setShowFilterModal(false);
  };

  const handleClearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setSelectedAmenities([]);
    onSearch({
      location,
      check_in: checkIn,
      check_out: checkOut,
      guests: totalGuests,
    });
    setShowFilterModal(false);
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

  // Format date range for button text
  const formatDateDisplay = () => {
    if (!checkIn) return "Add dates";
    const d1 = new Date(checkIn).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (!checkOut) return d1;
    const d2 = new Date(checkOut).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${d1} – ${d2}`;
  };

  // Format guest summary text
  const formatGuestDisplay = () => {
    if (totalGuests === 0 && guestCounts.infants === 0 && guestCounts.pets === 0) {
      return "Add guests";
    }
    const parts = [];
    if (totalGuests > 0) parts.push(`${totalGuests} guest${totalGuests > 1 ? "s" : ""}`);
    if (guestCounts.infants > 0) parts.push(`${guestCounts.infants} infant${guestCounts.infants > 1 ? "s" : ""}`);
    if (guestCounts.pets > 0) parts.push(`${guestCounts.pets} pet${guestCounts.pets > 1 ? "s" : ""}`);
    return parts.join(", ");
  };

  return (
    <div className="relative mx-auto w-full max-w-[840px]" ref={searchBarRef}>
      <div className="flex h-[62px] w-full items-center rounded-full border border-[#dddddd] bg-white p-1.5 shadow-[0_3px_12px_rgba(0,0,0,0.08)] transition hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)]">
        {/* Where Section */}
        <div
          onClick={() => setActiveSection("where")}
          className={`flex min-w-0 flex-1 flex-col justify-center rounded-full px-5 py-1.5 cursor-pointer transition-colors ${
            activeSection === "where" ? "bg-[#ebebeb]" : "hover:bg-[#f7f7f7]"
          }`}
        >
          <label className="text-[12px] font-bold tracking-wider text-[#222222]">
            Where
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Search destinations"
            className="w-full bg-transparent text-[14px] text-[#222222] placeholder:text-[#717171] font-normal focus:outline-none"
          />
        </div>

        {/* Divider 1 */}
        {activeSection !== "where" && activeSection !== "when" && (
          <div className="h-7 w-[1px] bg-gray-200" />
        )}

        {/* When Section */}
        <div
          onClick={() => setActiveSection("when")}
          className={`flex min-w-0 flex-1 flex-col justify-center rounded-full px-5 py-1.5 cursor-pointer transition-colors ${
            activeSection === "when" ? "bg-[#ebebeb]" : "hover:bg-[#f7f7f7]"
          }`}
        >
          <label className="text-[12px] font-bold tracking-wider text-[#222222]">
            When
          </label>
          <p className={`w-full bg-transparent text-[14px] truncate ${checkIn ? "text-[#222222] font-semibold" : "text-[#717171] font-normal"}`}>
            {formatDateDisplay()}
          </p>
        </div>

        {/* Divider 2 */}
        {activeSection !== "when" && activeSection !== "who" && (
          <div className="h-7 w-[1px] bg-gray-200" />
        )}

        {/* Who Section */}
        <div
          onClick={() => setActiveSection("who")}
          className={`flex min-w-0 flex-1 flex-col justify-center rounded-full px-5 py-1.5 cursor-pointer transition-colors ${
            activeSection === "who" ? "bg-[#ebebeb]" : "hover:bg-[#f7f7f7]"
          }`}
        >
          <label className="text-[12px] font-bold tracking-wider text-[#222222]">
            Who
          </label>
          <p className={`w-full bg-transparent text-[14px] truncate ${totalGuests > 0 || guestCounts.infants > 0 || guestCounts.pets > 0 ? "text-[#222222] font-semibold" : "text-[#717171] font-normal"}`}>
            {formatGuestDisplay()}
          </p>
        </div>

        {/* Filter Button beside Search Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowFilterModal(true);
          }}
          className="ml-1 flex h-10 items-center gap-1.5 rounded-full border border-gray-200 px-3.5 py-1.5 text-[13px] font-semibold text-gray-800 transition hover:border-gray-800 hover:bg-gray-50 cursor-pointer"
          aria-label="Open filters"
        >
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current">
            <path d="M5 8a3 3 0 0 1 5.83 1H14v2H10.83A3 3 0 0 1 5 8zm3-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM1 9h4V7H1v2zm0-6h8V1H1v2zm10.17 0H14V1h-2.83A3 3 0 0 0 6 3a3 3 0 0 0 5.17 0zM12 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM1 15h8v-2H1v2zm10.17 0H14v-2h-2.83a3 3 0 0 0-5.34 0H1v2h4.83a3 3 0 0 0 5.34 0zM8 14a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
          </svg>
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#222222] text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Red Search Button */}
        <button
          type="button"
          onClick={handleSearch}
          className="ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E00B41] text-white shadow-sm transition-transform hover:bg-[#d70466] hover:scale-105 cursor-pointer"
          aria-label="Search stays"
        >
          <svg
            viewBox="0 0 32 32"
            className="h-4 w-4 stroke-white stroke-[3.5]"
            fill="none"
          >
            <circle cx="13" cy="13" r="7.5" />
            <path d="M20 20l8 8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Popover 1: Where Suggestions */}
      {activeSection === "where" && (
        <WhereSuggestionsPopover
          query={location}
          onSelectLocation={(loc) => {
            setLocation(loc);
            setActiveSection("when");
          }}
        />
      )}

      {/* Popover 2: Calendar Picker */}
      {activeSection === "when" && (
        <CalendarPopover
          checkIn={checkIn}
          checkOut={checkOut}
          onSelectDates={(inDate, outDate) => {
            setCheckIn(inDate);
            setCheckOut(outDate);
          }}
          onClose={() => setActiveSection("who")}
        />
      )}

      {/* Popover 3: Guest Selector (Adults, Children, Infants, Pets) */}
      {activeSection === "who" && (
        <GuestListPopover
          counts={guestCounts}
          onChange={(newCounts) => setGuestCounts(newCounts)}
          onClose={() => setActiveSection(null)}
        />
      )}

      {/* Filter Modal Overlay */}
      {showFilterModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-bold text-[#222222]">Filters</h2>
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="max-h-[70vh] overflow-y-auto p-6 space-y-6">
              {/* Price Range */}
              <div>
                <h3 className="text-base font-bold text-[#222222] mb-3">Price range</h3>
                <p className="text-xs text-gray-500 mb-4">Nightly prices before fees and taxes</p>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                    <input
                      type="number"
                      placeholder="Minimum"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 py-3 pl-8 pr-4 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <span className="text-gray-400">—</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                    <input
                      type="number"
                      placeholder="Maximum"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 py-3 pl-8 pr-4 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                    />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-base font-bold text-[#222222] mb-4">Amenities</h3>
                <div className="flex flex-wrap gap-2.5">
                  {amenities.map((amenity) => {
                    const isSelected = selectedAmenities.includes(amenity.id);
                    return (
                      <button
                        key={amenity.id}
                        onClick={() => toggleAmenity(amenity.id)}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition cursor-pointer ${
                          isSelected
                            ? "border-black bg-black text-white"
                            : "border-gray-300 text-gray-700 hover:border-black"
                        }`}
                      >
                        {amenity.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 bg-gray-50">
              <button
                onClick={handleClearFilters}
                className="text-sm font-semibold text-gray-800 underline transition hover:text-black cursor-pointer"
              >
                Clear all
              </button>
              <button
                onClick={handleApplyFilters}
                className="rounded-xl bg-[#222222] px-6 py-3 text-sm font-semibold text-white transition hover:bg-black cursor-pointer"
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
