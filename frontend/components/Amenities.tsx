"use client";

import React from "react";
import { Amenity } from "@/types";

const AMENITY_DETAILS: Record<string, { icon: string; title: string; description: string }> = {
  "Air Conditioning": {
    icon: "❄️",
    title: "Designed for staying cool",
    description: "Beat the heat with the A/C and climate control.",
  },
  "Parking": {
    icon: "🅿️",
    title: "Park for free",
    description: "This is one of the few places in the area with free parking on premises.",
  },
  "WiFi": {
    icon: "📶",
    title: "Fast WiFi",
    description: "250 Mbps speed for seamless video calls and 4K streaming.",
  },
  "Kitchen": {
    icon: "🍳",
    title: "Chef's kitchen",
    description: "Space where guests can cook their own meals with full cookware.",
  },
  "Pool": {
    icon: "🏊",
    title: "Private pool",
    description: "Relax and swim in the clean private pool area.",
  },
  "Washer": {
    icon: "🧺",
    title: "In-unit washer",
    description: "Free washer available inside the accommodation.",
  },
  "Dryer": {
    icon: "👕",
    title: "Tumble dryer",
    description: "Dry your clothes easily during your stay.",
  },
  "Heating": {
    icon: "🔥",
    title: "Central heating",
    description: "Keep warm and cozy during chilly evenings.",
  },
  "TV": {
    icon: "📺",
    title: "HD Smart TV",
    description: "Enjoy movies and shows on Netflix, Prime, and YouTube.",
  },
  "Hot Tub": {
    icon: "♨️",
    title: "Hot tub spa",
    description: "Soak and relax in the outdoor heated hot tub.",
  },
  "Gym": {
    icon: "💪",
    title: "Fitness center",
    description: "Access to free weights and cardio equipment.",
  },
  "BBQ Grill": {
    icon: "🍖",
    title: "Outdoor BBQ grill",
    description: "Perfect for grilling and outdoor patio dining.",
  },
};

interface AmenitiesProps {
  amenities: Amenity[];
}

export default function Amenities({ amenities }: AmenitiesProps) {
  if (amenities.length === 0) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-[22px] font-bold text-gray-900 dark:text-white">What this place offers</h2>
      <div className="space-y-5">
        {amenities.map((amenity) => {
          const info = AMENITY_DETAILS[amenity.name] || {
            icon: "✨",
            title: amenity.name,
            description: "Included with your stay for maximum comfort.",
          };
          return (
            <div key={amenity.id} className="flex items-start gap-4">
              <span className="text-2xl shrink-0 mt-0.5">{info.icon}</span>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">{info.title}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">{info.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
