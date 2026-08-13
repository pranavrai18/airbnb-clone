// Shared TypeScript types for the Airbnb Clone frontend

export interface User {
  id: number;
  name: string;
  email: string;
  role: "guest" | "host";
  avatar_url?: string;
}

export interface ListingImage {
  id: number;
  listing_id: number;
  image_url: string;
}

export interface Amenity {
  id: number;
  name: string;
}

export interface ListingCard {
  id: number;
  title: string;
  location: string;
  price_per_night: number;
  property_type: string;
  max_guests: number;
  images: ListingImage[];
  avg_rating: number | null;
  review_count: number;
}

export interface Review {
  id: number;
  listing_id: number;
  user_id: number;
  rating: number;
  comment: string | null;
  created_at: string | null;
  user?: User;
}

export interface ListingDetail {
  id: number;
  host_id: number;
  title: string;
  description: string | null;
  location: string;
  price_per_night: number;
  property_type: string;
  max_guests: number;
  created_at: string | null;
  host: User | null;
  images: ListingImage[];
  amenities: Amenity[];
  reviews: Review[];
  avg_rating: number | null;
  review_count: number;
  unavailable_dates: UnavailableDateRange[];
}

export interface UnavailableDateRange {
  check_in: string;
  check_out: string;
}

export interface PaginatedListings {
  listings: ListingCard[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface Booking {
  id: number;
  listing_id: number;
  guest_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  nightly_price: number;
  service_fee: number;
  total_price: number;
  status: string;
  created_at: string | null;
  listing?: ListingCard;
  guest?: User;
}

export interface BookingCreatePayload {
  listing_id: number;
  guest_id: number;
  check_in: string;
  check_out: string;
  guests: number;
}

export interface Favorite {
  id: number;
  user_id: number;
  listing_id: number;
  listing?: ListingCard;
}

export interface SearchParams {
  location?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
  min_price?: number;
  max_price?: number;
  property_type?: string;
  amenities?: string;
  page?: number;
  limit?: number;
}
