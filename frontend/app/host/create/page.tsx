"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createListing } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/components/Toast";
import ListingForm from "@/components/ListingForm";

export default function CreateListingPage() {
  const router = useRouter();
  const { currentUser } = useUser();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  if (!currentUser || currentUser.role !== "host") {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Create Listing</h1>
        <p className="mt-4 text-gray-500">Switch to a host account to create listings.</p>
      </div>
    );
  }

  const handleSubmit = async (data: {
    title: string;
    description: string;
    location: string;
    price_per_night: number;
    property_type: string;
    max_guests: number;
    image_urls: string[];
    amenity_ids: number[];
    host_work?: string;
    host_born?: string;
    co_host_name?: string;
    hosting_start_year?: string;
  }) => {
    setLoading(true);
    try {
      const created = await createListing({
        host_id: currentUser.id,
        title: data.title,
        description: data.description,
        location: data.location,
        price_per_night: data.price_per_night,
        property_type: data.property_type,
        max_guests: data.max_guests,
        image_urls: data.image_urls,
        amenity_ids: data.amenity_ids,
      });

      if (created && created.id) {
        localStorage.setItem(
          `host_meta_${created.id}`,
          JSON.stringify({
            work: data.host_work || "Event Designer & Stylist",
            born: data.host_born || "Born in the 90s",
            coHostName: data.co_host_name || "Lakshit",
            hostingSince: data.hosting_start_year || "2026",
          })
        );
      }

      showToast("Listing created successfully!");
      router.push(`/listings/${created.id}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to create listing", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300 transition hover:text-gray-900 dark:hover:text-white cursor-pointer"
      >
        <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current">
          <path d="M10.354 3.354 5.707 8l4.647 4.646-.708.708L4.293 8l5.353-5.354z" />
        </svg>
        Back to dashboard
      </button>

      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">Airbnb Setup</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-slate-300">Complete the details below to start welcoming guests to your space</p>

      <div className="mt-8">
        <ListingForm onSubmit={handleSubmit} loading={loading} submitLabel="Save & Publish Listing" />
      </div>
    </div>
  );
}
