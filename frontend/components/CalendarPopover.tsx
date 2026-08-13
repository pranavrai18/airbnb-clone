"use client";

import React, { useState } from "react";

interface CalendarPopoverProps {
  checkIn: string;
  checkOut: string;
  onSelectDates: (checkIn: string, checkOut: string) => void;
  onClose: () => void;
}

export default function CalendarPopover({
  checkIn,
  checkOut,
  onSelectDates,
  onClose,
}: CalendarPopoverProps) {
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());

  // Parse YYYY-MM-DD
  const parseDateStr = (str: string) => {
    if (!str) return null;
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d);
  };

  const checkInDate = parseDateStr(checkIn);
  const checkOutDate = parseDateStr(checkOut);

  const month1 = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1);
  const month2 = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1);

  const prevMonth = () => {
    const today = new Date();
    const currentFirst = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1);
    const thisMonthFirst = new Date(today.getFullYear(), today.getMonth(), 1);
    if (currentFirst > thisMonthFirst) {
      setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
    }
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));
  };

  const handleDayClick = (dateStr: string) => {
    if (!checkIn || (checkIn && checkOut)) {
      // Set Check-in first
      onSelectDates(dateStr, "");
    } else if (checkIn && !checkOut) {
      if (dateStr < checkIn) {
        // Reset check-in to this earlier date
        onSelectDates(dateStr, "");
      } else if (dateStr === checkIn) {
        onSelectDates("", "");
      } else {
        // Set Check-out
        onSelectDates(checkIn, dateStr);
      }
    }
  };

  const formatDateStr = (year: number, month: number, day: number) => {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  };

  const renderMonth = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const monthName = monthDate.toLocaleString("en-US", { month: "long" });
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const todayStr = new Date().toISOString().split("T")[0];

    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDateStr(year, month, day);
      const isPast = dateStr < todayStr;
      const isCheckIn = checkIn === dateStr;
      const isCheckOut = checkOut === dateStr;

      let isInRange = false;
      if (checkInDate && checkOutDate) {
        const currentD = parseDateStr(dateStr);
        if (currentD && currentD > checkInDate && currentD < checkOutDate) {
          isInRange = true;
        }
      } else if (checkInDate && !checkOutDate && hoverDate) {
        const currentD = parseDateStr(dateStr);
        const hoverD = parseDateStr(hoverDate);
        if (currentD && hoverD && currentD > checkInDate && currentD <= hoverD) {
          isInRange = true;
        }
      }

      const isSelected = isCheckIn || isCheckOut;

      days.push(
        <button
          key={dateStr}
          disabled={isPast}
          onClick={() => handleDayClick(dateStr)}
          onMouseEnter={() => setHoverDate(dateStr)}
          onMouseLeave={() => setHoverDate(null)}
          className={`h-10 w-10 rounded-full text-xs font-semibold transition-all relative flex items-center justify-center cursor-pointer ${
            isPast
              ? "text-gray-300 cursor-not-allowed"
              : isSelected
              ? "bg-[#222222] text-white shadow-md z-10"
              : isInRange
              ? "bg-gray-100 text-gray-900 rounded-none"
              : "text-gray-800 hover:bg-gray-100"
          }`}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="w-[300px]">
        <h4 className="mb-4 text-center text-sm font-bold text-[#222222]">
          {monthName} {year}
        </h4>
        <div className="grid grid-cols-7 gap-y-1 text-center mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <span key={d} className="text-[11px] font-semibold text-gray-400">
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1 justify-items-center">{days}</div>
      </div>
    );
  };

  return (
    <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 z-50 overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 shadow-2xl animate-scale-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#222222]">
            {checkIn && checkOut
              ? `${checkIn} → ${checkOut}`
              : checkIn
              ? `Check-in: ${checkIn}`
              : "Select check-in date"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition"
          >
            ›
          </button>
        </div>
      </div>

      {/* Dual Month View */}
      <div className="flex gap-12">
        {renderMonth(month1)}
        {renderMonth(month2)}
      </div>

      {/* Footer bar */}
      <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={() => onSelectDates("", "")}
          className="text-xs font-semibold text-gray-600 underline hover:text-black"
        >
          Clear dates
        </button>
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
