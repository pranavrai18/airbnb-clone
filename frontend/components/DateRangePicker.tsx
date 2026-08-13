"use client";

import React, { useMemo } from "react";
import { UnavailableDateRange } from "@/types";

interface DateRangePickerProps {
  checkIn: string;
  checkOut: string;
  onCheckInChange: (date: string) => void;
  onCheckOutChange: (date: string) => void;
  unavailableDates: UnavailableDateRange[];
}

export default function DateRangePicker({
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
  unavailableDates,
}: DateRangePickerProps) {
  const today = new Date().toISOString().split("T")[0];

  // Build a Set of all unavailable date strings for quick lookup
  const unavailableSet = useMemo(() => {
    const set = new Set<string>();
    unavailableDates.forEach(({ check_in, check_out }) => {
      const start = new Date(check_in);
      const end = new Date(check_out);
      const current = new Date(start);
      while (current < end) {
        set.add(current.toISOString().split("T")[0]);
        current.setDate(current.getDate() + 1);
      }
    });
    return set;
  }, [unavailableDates]);

  const handleCheckInChange = (value: string) => {
    if (unavailableSet.has(value)) return;
    onCheckInChange(value);
    // Clear check-out if it's before new check-in
    if (checkOut && checkOut <= value) {
      onCheckOutChange("");
    }
  };

  const handleCheckOutChange = (value: string) => {
    if (unavailableSet.has(value)) return;
    // Check if any unavailable dates fall between check-in and check-out
    if (checkIn) {
      const start = new Date(checkIn);
      const end = new Date(value);
      const current = new Date(start);
      current.setDate(current.getDate() + 1);
      while (current < end) {
        if (unavailableSet.has(current.toISOString().split("T")[0])) {
          return; // Don't allow range spanning unavailable dates
        }
        current.setDate(current.getDate() + 1);
      }
    }
    onCheckOutChange(value);
  };

  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-gray-300">
      <div className="border-r border-gray-300 p-3">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-800">
          Check-in
        </label>
        <input
          type="date"
          value={checkIn}
          min={today}
          onChange={(e) => handleCheckInChange(e.target.value)}
          className="mt-0.5 w-full bg-transparent text-sm text-gray-600 outline-none"
        />
      </div>
      <div className="p-3">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-800">
          Checkout
        </label>
        <input
          type="date"
          value={checkOut}
          min={checkIn || today}
          onChange={(e) => handleCheckOutChange(e.target.value)}
          className="mt-0.5 w-full bg-transparent text-sm text-gray-600 outline-none"
        />
      </div>
    </div>
  );
}
