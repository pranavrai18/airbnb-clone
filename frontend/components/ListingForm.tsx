"use client";

import React, { useState, useEffect, useRef } from "react";
import { Amenity, ListingDetail } from "@/types";
import { getAmenities } from "@/lib/api";

interface ListingFormProps {
  initialData?: ListingDetail;
  onSubmit: (data: {
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
  }) => void;
  loading: boolean;
  submitLabel: string;
}

const PROPERTY_TYPES = [
  { type: "Apartment", icon: "🏢", desc: "A place in a multi-unit building" },
  { type: "House", icon: "🏡", desc: "A standalone residential property" },
  { type: "Villa", icon: "🏰", desc: "A luxury home with private grounds" },
  { type: "Treehouse", icon: "🌲", desc: "A unique stay elevated in nature" },
];

const DEFAULT_AMENITIES: Amenity[] = [
  { id: 1, name: "Fast Wifi ⚡" },
  { id: 2, name: "Free Parking 🅿️" },
  { id: 3, name: "Private Pool 🏊" },
  { id: 4, name: "Air Conditioning ❄️" },
  { id: 5, name: "Kitchen 🍳" },
  { id: 6, name: "Washer & Dryer 🧺" },
  { id: 7, name: "Dedicated Workspace 💻" },
  { id: 8, name: "HDTV 📺" },
  { id: 9, name: "Hot Tub / Jacuzzi 🛁" },
  { id: 10, name: "BBQ Grill 🍖" },
  { id: 11, name: "Beach Access 🏖️" },
  { id: 12, name: "EV Charger 🔌" },
];

export default function ListingForm({
  initialData,
  onSubmit,
  loading,
  submitLabel,
}: ListingFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [pricePerNight, setPricePerNight] = useState(initialData?.price_per_night?.toString() || "");
  const [propertyType, setPropertyType] = useState(initialData?.property_type || "Apartment");
  const [maxGuests, setMaxGuests] = useState(initialData?.max_guests?.toString() || "2");
  const [imageUrls, setImageUrls] = useState<string[]>(
    initialData?.images?.map((img) => img.image_url) || [""]
  );
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>(
    initialData?.amenities?.map((a) => a.id) || []
  );
  const [amenities, setAmenities] = useState<Amenity[]>(DEFAULT_AMENITIES);

  // Custom Host Metadata
  const getInitialHostMeta = () => {
    if (initialData?.id && typeof window !== "undefined") {
      const stored = localStorage.getItem(`host_meta_${initialData.id}`);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {}
      }
    }
    return null;
  };

  const initialMeta = getInitialHostMeta();
  const [hostWork, setHostWork] = useState(initialMeta?.work || "Event Designer & Stylist");
  const [hostBorn, setHostBorn] = useState(initialMeta?.born || "Born in the 90s");
  const [coHostName, setCoHostName] = useState(initialMeta?.coHostName || "Lakshit");
  const [hostingStartYear, setHostingStartYear] = useState(initialMeta?.hostingSince || "2026");

  useEffect(() => {
    getAmenities()
      .then((data) => {
        if (data && data.length > 0) {
          setAmenities(data);
        } else {
          setAmenities(DEFAULT_AMENITIES);
        }
      })
      .catch(() => {
        setAmenities(DEFAULT_AMENITIES);
      });
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    fileArray.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result) {
            setImageUrls((prev) => {
              const filtered = prev.filter((url) => url.trim());
              return [...filtered, result];
            });
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };

  const addImageUrl = () => setImageUrls([...imageUrls, ""]);
  const removeImageUrl = (index: number) => setImageUrls(imageUrls.filter((_, i) => i !== index));

  const toggleAmenity = (id: number) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((aId) => aId !== id) : [...prev, id]
    );
  };

  const priceNum = parseFloat(pricePerNight) || 100;
  const sampleNights = 3;
  const staySubtotal = priceNum * sampleNights;
  const cleaningFee = 50;
  const serviceFee = Math.round(staySubtotal * 0.12);
  const totalPrice = staySubtotal + cleaningFee + serviceFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validUrls = imageUrls.filter((url) => url.trim() !== "");
    const finalImages =
      validUrls.length > 0
        ? validUrls
        : ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"];

    onSubmit({
      title,
      description,
      location,
      price_per_night: priceNum,
      property_type: propertyType,
      max_guests: parseInt(maxGuests, 10) || 2,
      image_urls: finalImages,
      amenity_ids: selectedAmenities,
      host_work: hostWork,
      host_born: hostBorn,
      co_host_name: coHostName,
      hosting_start_year: hostingStartYear,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-3xl mx-auto">
      {/* 1. Property Type Selector */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Which of these best describes your place?</h2>
          <p className="text-sm text-gray-500 dark:text-slate-300 mt-1">Choose a property type to help guests find your listing</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {PROPERTY_TYPES.map(({ type, icon, desc }) => {
            const isSelected = propertyType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setPropertyType(type)}
                className={`flex flex-col items-start justify-between rounded-2xl border p-5 text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-gray-900 bg-gray-900 text-white dark:border-rose-500 dark:bg-rose-600 dark:text-white shadow-xs"
                    : "border-gray-200 bg-white text-gray-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white hover:border-gray-400 dark:hover:border-slate-500"
                }`}
              >
                <span className="text-3xl">{icon}</span>
                <div className="mt-4">
                  <p className={`text-base font-bold ${isSelected ? "text-white" : "text-gray-900 dark:text-white"}`}>{type}</p>
                  <p className={`text-[11px] mt-0.5 leading-tight ${isSelected ? "text-gray-200 dark:text-rose-100" : "text-gray-500 dark:text-slate-400"}`}>{desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Listing Title & Description */}
      <section className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 md:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Tell guests about your place</h3>
          <p className="text-xs text-gray-500 dark:text-slate-300 mt-0.5">Share what makes your space special and welcoming</p>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-200 mb-2">Listing Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Spacious beachfront villa with sunset view"
            className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3.5 text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 outline-none transition focus:border-gray-900 dark:focus:border-rose-500 focus:ring-1 focus:ring-gray-900 dark:focus:ring-rose-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-200 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe the atmosphere, unique design features, nearby spots, or amenities available to guests..."
            className="w-full resize-none rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3.5 text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 outline-none transition focus:border-gray-900 dark:focus:border-rose-500 focus:ring-1 focus:ring-gray-900 dark:focus:ring-rose-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-200 mb-2">Location / Address</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            placeholder="e.g. Miami Beach, Florida"
            className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3.5 text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 outline-none transition focus:border-gray-900 dark:focus:border-rose-500 focus:ring-1 focus:ring-gray-900 dark:focus:ring-rose-500"
          />
        </div>
      </section>

      {/* 3. Pricing & Guest Capacity */}
      <section className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 md:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Pricing & Capacity</h3>
          <p className="text-xs text-gray-500 dark:text-slate-300 mt-0.5">Set your nightly base price and maximum guest allowance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-200 mb-2">Nightly Rate ($ USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-base font-bold text-gray-500 dark:text-slate-400">$</span>
              <input
                type="number"
                value={pricePerNight}
                onChange={(e) => setPricePerNight(e.target.value)}
                required
                min={1}
                placeholder="150"
                className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-8 pr-4 py-3.5 text-base font-bold text-gray-900 dark:text-white outline-none transition focus:border-gray-900 dark:focus:border-rose-500 focus:ring-1 focus:ring-gray-900 dark:focus:ring-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-200 mb-2">Maximum Guests</label>
            <input
              type="number"
              value={maxGuests}
              onChange={(e) => setMaxGuests(e.target.value)}
              required
              min={1}
              max={16}
              className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3.5 text-base font-bold text-gray-900 dark:text-white outline-none transition focus:border-gray-900 dark:focus:border-rose-500 focus:ring-1 focus:ring-gray-900 dark:focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Dynamic Estimated Earnings Preview */}
        <div className="rounded-xl bg-gray-50 dark:bg-slate-900/80 p-4 border border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-600 dark:text-slate-300">Estimated 3-night guest total:</span>
          <span className="text-base font-extrabold text-[#E00B41]">${totalPrice.toLocaleString()}</span>
        </div>
      </section>

      {/* 4. Photo Gallery & Upload */}
      <section className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 md:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Add photos to your listing</h3>
          <p className="text-xs text-gray-500 dark:text-slate-300 mt-0.5">High quality photos increase bookings by up to 40%</p>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
            isDragging
              ? "border-[#FF385C] bg-rose-50/60 dark:bg-rose-950/30 scale-[1.01]"
              : "border-gray-300 dark:border-slate-600 bg-gray-50/60 dark:bg-slate-900/50 hover:border-gray-800 dark:hover:border-slate-400"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950 text-[#FF385C]">
              <svg viewBox="0 0 32 32" className="h-6 w-6 fill-current">
                <path d="M28 6H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm0 18H4V8h24v16zm-10-7l-4 4-2-2-4 5h16l-6-7z" />
              </svg>
            </div>
            <div>
              <p className="text-base font-bold text-gray-900 dark:text-white">
                Drag and drop your photos here
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-300 mt-1">
                or <span className="text-[#FF385C] font-bold underline">browse files from device</span>
              </p>
            </div>
          </div>
        </div>

        {/* Uploaded Thumbnails Grid */}
        {imageUrls.filter((url) => url.trim()).length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {imageUrls
              .filter((url) => url.trim())
              .map((url, i) => (
                <div key={i} className="group relative aspect-4/3 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-xs">
                  <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImageUrl(i);
                    }}
                    className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/75 text-white opacity-0 transition group-hover:opacity-100 hover:bg-black cursor-pointer shadow-md"
                    title="Remove photo"
                  >
                    ✕
                  </button>
                  <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">
                    {i === 0 ? "Cover Photo" : `Photo ${i + 1}`}
                  </span>
                </div>
              ))}
          </div>
        )}

        <details className="text-xs text-gray-500 dark:text-slate-400">
          <summary className="cursor-pointer font-semibold hover:text-gray-900 dark:hover:text-white transition">
            + Or add web image URLs
          </summary>
          <div className="mt-3 space-y-2">
            {imageUrls.map((url, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => handleImageUrlChange(i, e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-xs text-gray-900 dark:text-white outline-none"
                />
                {imageUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageUrl(i)}
                    className="rounded-lg border border-gray-200 dark:border-slate-700 px-3 py-1.5 text-xs text-gray-500 hover:text-red-500"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addImageUrl}
              className="text-xs font-bold text-[#FF385C] hover:underline"
            >
              + Add URL line
            </button>
          </div>
        </details>
      </section>

      {/* 5. Amenities Grid */}
      <section className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 md:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">What amenities do you offer?</h3>
          <p className="text-xs text-gray-500 dark:text-slate-300 mt-0.5">Select amenities guests can enjoy during their stay</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {amenities.map((amenity) => {
            const isSelected = selectedAmenities.includes(amenity.id);
            return (
              <button
                key={amenity.id}
                type="button"
                onClick={() => toggleAmenity(amenity.id)}
                className={`flex items-center justify-between rounded-xl p-3.5 text-left text-xs font-bold transition cursor-pointer border ${
                  isSelected
                    ? "border-gray-900 bg-gray-900 text-white dark:border-rose-500 dark:bg-rose-600 dark:text-white shadow-xs"
                    : "border-gray-200 bg-gray-50 text-gray-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 hover:border-gray-400 dark:hover:border-slate-500"
                }`}
              >
                <span className={isSelected ? "text-white" : "text-gray-800 dark:text-slate-200"}>{amenity.name}</span>
                {isSelected && <span className="text-sm text-white font-bold">✓</span>}
              </button>
            );
          })}
        </div>
      </section>

      {/* 6. Host Profile Details */}
      <section className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 md:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Host Profile & Co-Host Details</h3>
          <p className="text-xs text-gray-500 dark:text-slate-300 mt-0.5">Displayed on your listing page under "Meet your Host"</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-200 mb-2">Host Profession</label>
            <input
              type="text"
              value={hostWork}
              onChange={(e) => setHostWork(e.target.value)}
              placeholder="e.g. Architect & Interior Designer"
              className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-gray-900 dark:focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-200 mb-2">Birth Era</label>
            <select
              value={hostBorn}
              onChange={(e) => setHostBorn(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-gray-900 dark:focus:border-rose-500"
            >
              <option value="Born in the 90s">Born in the 90s</option>
              <option value="Born in the 00s">Born in the 00s</option>
              <option value="Born in the 80s">Born in the 80s</option>
              <option value="Born in the 70s">Born in the 70s</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-200 mb-2">Co-Host Name</label>
            <input
              type="text"
              value={coHostName}
              onChange={(e) => setCoHostName(e.target.value)}
              placeholder="e.g. Lakshit"
              className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-gray-900 dark:focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-200 mb-2">Hosting Since Year</label>
            <input
              type="text"
              value={hostingStartYear}
              onChange={(e) => setHostingStartYear(e.target.value)}
              placeholder="2026"
              className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-gray-900 dark:text-white outline-none focus:border-gray-900 dark:focus:border-rose-500"
            />
          </div>
        </div>
      </section>

      {/* 7. Submit Action Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] py-4 text-base font-extrabold text-white transition hover:opacity-95 disabled:opacity-50 shadow-md cursor-pointer"
        >
          {loading ? "Publishing listing..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
