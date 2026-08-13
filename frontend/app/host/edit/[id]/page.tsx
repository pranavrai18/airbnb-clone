"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { getListingDetail, updateListing } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/components/Toast";
import { ListingDetail } from "@/types";
import ListingForm from "@/components/ListingForm";

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { currentUser } = useUser();
  const { showToast } = useToast();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getListingDetail(Number(id))
      .then(setListing)
      .catch(() => showToast("Failed to load listing", "error"))
      .finally(() => setLoading(false));
  }, [id, showToast]);

  if (!currentUser || currentUser.role !== "host") {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Edit Listing</h1>
        <p className="mt-4 text-gray-500">Switch to a host account to edit listings.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-1/3 rounded bg-gray-200" />
          <div className="h-64 rounded-xl bg-gray-200" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Listing not found</h1>
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
    setSaving(true);
    try {
      await updateListing(Number(id), {
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

      localStorage.setItem(
        `host_meta_${id}`,
        JSON.stringify({
          work: data.host_work || "Event Designer & Stylist",
          born: data.host_born || "Born in the 90s",
          coHostName: data.co_host_name || "Lakshit",
          hostingSince: data.hosting_start_year || "2026",
        })
      );

      showToast("Listing updated successfully!");
      router.push(`/listings/${id}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update listing", "error");
    } finally {
      setSaving(false);
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

      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">Edit Your Listing</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-slate-300">Update property details, amenities, or pricing for your guests</p>

      <div className="mt-8">
        <ListingForm
          initialData={listing}
          onSubmit={handleSubmit}
          loading={saving}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}
