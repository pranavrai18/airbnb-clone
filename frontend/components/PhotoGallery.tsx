"use client";

import React, { useState } from "react";
import { ListingImage } from "@/types";

interface PhotoGalleryProps {
  images: ListingImage[];
  title: string;
}

export default function PhotoGallery({ images, title }: PhotoGalleryProps) {
  const [showModal, setShowModal] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  if (images.length === 0) return null;

  const mainImage = images[0]?.image_url;
  const sideImages = images.slice(1, 5);

  return (
    <>
      <div className="relative grid grid-cols-4 gap-2 overflow-hidden rounded-xl" style={{ maxHeight: "420px" }}>
        {/* Main image */}
        <div
          className="col-span-2 row-span-2 cursor-pointer overflow-hidden"
          onClick={() => { setModalIndex(0); setShowModal(true); }}
        >
          <img
            src={mainImage}
            alt={title}
            className="h-full w-full object-cover transition-opacity hover:opacity-90"
          />
        </div>

        {/* Side images */}
        {sideImages.map((img, i) => (
          <div
            key={img.id}
            className="cursor-pointer overflow-hidden"
            onClick={() => { setModalIndex(i + 1); setShowModal(true); }}
          >
            <img
              src={img.image_url}
              alt={`${title} - ${i + 2}`}
              className="h-full w-full object-cover transition-opacity hover:opacity-90"
            />
          </div>
        ))}

        {/* Show all photos button */}
        {images.length > 5 && (
          <button
            onClick={() => { setModalIndex(0); setShowModal(true); }}
            className="absolute bottom-4 right-4 rounded-lg border border-gray-800 bg-white px-4 py-1.5 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
          >
            Show all {images.length} photos
          </button>
        )}
      </div>

      {/* Fullscreen modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90">
          <button
            onClick={() => setShowModal(false)}
            className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <svg viewBox="0 0 32 32" className="h-5 w-5 fill-current">
              <path d="M24.71 8.71a1 1 0 0 0-1.42-1.42L16 14.59 8.71 7.29a1 1 0 0 0-1.42 1.42L14.59 16l-7.3 7.29a1 1 0 1 0 1.42 1.42L16 17.41l7.29 7.3a1 1 0 0 0 1.42-1.42L17.41 16z" />
            </svg>
          </button>

          <button
            onClick={() => setModalIndex((prev) => (prev - 1 + images.length) % images.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current">
              <path d="M10.354 3.354 5.707 8l4.647 4.646-.708.708L4.293 8l5.353-5.354z" />
            </svg>
          </button>

          <img
            src={images[modalIndex]?.image_url}
            alt={`${title} - ${modalIndex + 1}`}
            className="max-h-[85vh] max-w-[85vw] rounded-lg object-contain"
          />

          <button
            onClick={() => setModalIndex((prev) => (prev + 1) % images.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current">
              <path d="M5.646 3.354 10.293 8l-4.647 4.646.708.708L11.707 8 6.354 2.646z" />
            </svg>
          </button>

          <div className="absolute bottom-6 text-sm text-white/70">
            {modalIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
