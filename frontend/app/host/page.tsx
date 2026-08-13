"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getHostListings, getHostBookings, deleteListing } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import { useSearch } from "@/context/SearchContext";
import { useToast } from "@/components/Toast";
import { ListingCard, Booking } from "@/types";

export default function HostDashboard() {
  const { currentUser } = useUser();
  const { searchFilter } = useSearch();
  const { showToast } = useToast();
  const router = useRouter();
  const [listings, setListings] = useState<ListingCard[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"listings" | "bookings">("listings");

  const searchQuery = (searchFilter.location || "").toLowerCase().trim();

  const filteredListings = listings.filter(
    (l) =>
      !searchQuery ||
      l.title.toLowerCase().includes(searchQuery) ||
      l.location.toLowerCase().includes(searchQuery) ||
      l.property_type.toLowerCase().includes(searchQuery)
  );

  const filteredBookings = bookings.filter(
    (b) =>
      !searchQuery ||
      b.listing?.title?.toLowerCase().includes(searchQuery) ||
      b.guest?.name?.toLowerCase().includes(searchQuery) ||
      b.status?.toLowerCase().includes(searchQuery)
  );

  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [l, b] = await Promise.all([
        getHostListings(currentUser.id),
        getHostBookings(currentUser.id),
      ]);
      setListings(l);
      setBookings(b);
    } catch {
      showToast("Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
    }
  }, [currentUser, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (listingId: number) => {
    if (!currentUser) return;
    try {
      await deleteListing(listingId, currentUser.id);
      setListings((prev) => prev.filter((l) => l.id !== listingId));
      setDeleteModal(null);
      showToast("Listing deleted successfully");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete listing", "error");
    }
  };

  if (!currentUser || currentUser.role !== "host") {
    return (
      <div className="mx-auto max-w-5xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Host Dashboard</h1>
        <p className="mt-4 text-gray-600 dark:text-slate-300">
          Switch to a host account to access the dashboard.
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
          Use the user menu in the top right to switch users.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">Host Dashboard</h1>
          <p className="mt-1 text-sm font-medium text-gray-600 dark:text-slate-300">
            Welcome back, <span className="font-bold text-gray-900 dark:text-white">{currentUser.name}</span>
          </p>
        </div>
        <Link
          href="/host/create"
          className="rounded-xl bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] px-6 py-3 text-sm font-extrabold text-white transition hover:opacity-95 shadow-md cursor-pointer shrink-0"
        >
          + Create listing
        </Link>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-3 border-b border-gray-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setActiveTab("listings")}
          className={`px-5 py-3 text-sm font-bold transition cursor-pointer border-b-2 ${
            activeTab === "listings"
              ? "border-[#FF385C] text-[#FF385C] dark:border-[#FF385C] dark:text-[#FF385C]"
              : "border-transparent text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          My Listings ({filteredListings.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("bookings")}
          className={`px-5 py-3 text-sm font-bold transition cursor-pointer border-b-2 ${
            activeTab === "bookings"
              ? "border-[#FF385C] text-[#FF385C] dark:border-[#FF385C] dark:text-[#FF385C]"
              : "border-transparent text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Reservations ({filteredBookings.length})
        </button>
      </div>

      {loading ? (
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
              <div className="flex gap-4">
                <div className="h-24 w-36 rounded-xl bg-gray-200 dark:bg-slate-700" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-1/3 rounded bg-gray-200 dark:bg-slate-700" />
                  <div className="h-4 w-1/4 rounded bg-gray-200 dark:bg-slate-700" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === "listings" ? (
        /* Listings Tab */
        <div className="mt-6">
          {filteredListings.length === 0 ? (
            <div className="py-16 text-center rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-xs">
              <p className="text-lg font-bold text-gray-800 dark:text-white">
                {searchQuery ? `No listings matching "${searchQuery}"` : "You don't have any listings yet."}
              </p>
              {!searchQuery && (
                <Link
                  href="/host/create"
                  className="mt-4 inline-block rounded-xl bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] px-6 py-3 text-sm font-bold text-white shadow-md hover:opacity-95"
                >
                  Create your first listing
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredListings.map((listing) => (
                <div
                  key={listing.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 transition hover:shadow-md"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img
                      src={listing.images?.[0]?.image_url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"}
                      alt={listing.title}
                      className="h-24 w-36 rounded-xl object-cover shrink-0 border border-gray-100 dark:border-slate-700"
                    />
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">{listing.title}</h3>
                      <p className="text-xs font-medium text-gray-600 dark:text-slate-300">📍 {listing.location}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500 dark:text-slate-400 pt-1">
                        <span className="text-gray-900 dark:text-white font-bold">${listing.price_per_night} / night</span>
                        <span>•</span>
                        <span>{listing.property_type}</span>
                        <span>•</span>
                        <span>{listing.max_guests} guests max</span>
                        {listing.avg_rating && (
                          <>
                            <span>•</span>
                            <span className="text-amber-600 dark:text-amber-400">★ {listing.avg_rating}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-slate-700">
                    <Link
                      href={`/listings/${listing.id}`}
                      className="rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-xs font-bold text-gray-800 dark:text-white transition hover:bg-gray-100 dark:hover:bg-slate-600 cursor-pointer"
                    >
                      View
                    </Link>
                    <Link
                      href={`/host/edit/${listing.id}`}
                      className="rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 text-xs font-bold text-gray-800 dark:text-white transition hover:bg-gray-100 dark:hover:bg-slate-600 cursor-pointer"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeleteModal(listing.id)}
                      className="rounded-xl border border-red-200 dark:border-red-800/60 bg-rose-50 dark:bg-red-950/40 px-4 py-2 text-xs font-bold text-red-600 dark:text-red-300 transition hover:bg-red-100 dark:hover:bg-red-900/60 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Bookings Tab */
        <div className="mt-6">
          {filteredBookings.length === 0 ? (
            <div className="py-16 text-center rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 shadow-xs">
              <p className="text-lg font-bold text-gray-800 dark:text-white">
                {searchQuery ? `No reservations matching "${searchQuery}"` : "No reservations yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-300">Property</th>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-300">Guest</th>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-300">Check-in</th>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-300">Checkout</th>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-300">Guests</th>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-300">Total</th>
                      <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-slate-300">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="transition hover:bg-gray-50 dark:hover:bg-slate-700/60">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={booking.listing?.images?.[0]?.image_url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"}
                              alt=""
                              className="h-10 w-14 rounded-lg object-cover border border-gray-200 dark:border-slate-700 shrink-0"
                            />
                            <span className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                              {booking.listing?.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-slate-200">{booking.guest?.name}</td>
                        <td className="px-5 py-4 text-sm font-medium text-gray-600 dark:text-slate-300">
                          {new Date(booking.check_in).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-gray-600 dark:text-slate-300">
                          {new Date(booking.check_out).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-slate-200">{booking.guests}</td>
                        <td className="px-5 py-4 text-sm font-extrabold text-gray-900 dark:text-white">${booking.total_price}</td>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 capitalize border border-emerald-200 dark:border-emerald-800">
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-2xl border border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete listing?</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
              This action cannot be undone. The listing and its reservation history will be permanently removed.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
                className="rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-slate-200 transition hover:bg-gray-100 dark:hover:bg-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteModal)}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 shadow-md cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
