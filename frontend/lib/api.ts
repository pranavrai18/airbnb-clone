import {
  PaginatedListings,
  ListingDetail,
  Booking,
  BookingCreatePayload,
  Favorite,
  SearchParams,
  User,
  Amenity,
  UnavailableDateRange,
  ListingCard,
} from "@/types";

const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "") +
  "/api";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "An error occurred" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

// --- Listings ---
export async function getListings(params: SearchParams = {}): Promise<PaginatedListings> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });
  return request<PaginatedListings>(`${API_BASE}/listings?${searchParams.toString()}`);
}

export async function getListingDetail(id: number): Promise<ListingDetail> {
  return request<ListingDetail>(`${API_BASE}/listings/${id}`);
}

export async function getListingAvailability(id: number): Promise<UnavailableDateRange[]> {
  return request<UnavailableDateRange[]>(`${API_BASE}/listings/${id}/availability`);
}

export async function createListing(data: {
  host_id: number;
  title: string;
  description: string;
  location: string;
  price_per_night: number;
  property_type: string;
  max_guests: number;
  image_urls: string[];
  amenity_ids: number[];
}): Promise<ListingDetail> {
  return request<ListingDetail>(`${API_BASE}/listings`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateListing(
  id: number,
  data: {
    host_id: number;
    title?: string;
    description?: string;
    location?: string;
    price_per_night?: number;
    property_type?: string;
    max_guests?: number;
    image_urls?: string[];
    amenity_ids?: number[];
  }
): Promise<ListingDetail> {
  return request<ListingDetail>(`${API_BASE}/listings/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteListing(id: number, hostId: number): Promise<void> {
  await request<{ message: string }>(`${API_BASE}/listings/${id}?host_id=${hostId}`, {
    method: "DELETE",
  });
}

// --- Bookings ---
export async function createBooking(data: BookingCreatePayload): Promise<Booking> {
  return request<Booking>(`${API_BASE}/bookings`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getUserBookings(userId: number): Promise<Booking[]> {
  return request<Booking[]>(`${API_BASE}/users/${userId}/bookings`);
}

// --- Host ---
export async function getHostListings(hostId: number): Promise<ListingCard[]> {
  return request<ListingCard[]>(`${API_BASE}/hosts/${hostId}/listings`);
}

export async function getHostBookings(hostId: number): Promise<Booking[]> {
  return request<Booking[]>(`${API_BASE}/hosts/${hostId}/bookings`);
}

// --- Users ---
export async function getUsers(): Promise<User[]> {
  return request<User[]>(`${API_BASE}/users`);
}

// --- Amenities ---
export async function getAmenities(): Promise<Amenity[]> {
  return request<Amenity[]>(`${API_BASE}/amenities`);
}

// --- Favorites ---
export async function getUserFavorites(userId: number): Promise<Favorite[]> {
  return request<Favorite[]>(`${API_BASE}/favorites?user_id=${userId}`);
}

export async function addFavorite(userId: number, listingId: number): Promise<Favorite> {
  return request<Favorite>(`${API_BASE}/favorites`, {
    method: "POST",
    body: JSON.stringify({ user_id: userId, listing_id: listingId }),
  });
}

export async function removeFavorite(listingId: number, userId: number): Promise<void> {
  await request<{ message: string }>(`${API_BASE}/favorites/${listingId}?user_id=${userId}`, {
    method: "DELETE",
  });
}
