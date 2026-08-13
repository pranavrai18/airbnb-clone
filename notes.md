# Airbnb Clone — Technical Notes

This document explains how every part of the application works, from architecture through each user flow.

---

## 1. Overall Architecture

The application follows a client-server architecture:

```
[Browser] ←→ [Next.js Frontend :3000] ←→ [FastAPI Backend :8000] ←→ [SQLite DB]
```

- **Frontend** (Next.js + TypeScript + Tailwind CSS): Handles all UI rendering, client-side state, and user interactions. Communicates with the backend via a centralized API client (`lib/api.ts`).
- **Backend** (FastAPI + SQLAlchemy): Provides a REST API with full CRUD operations, search/filter logic, booking validation, and price calculation. All business logic lives here.
- **Database** (SQLite): Single-file database (`airbnb.db`) managed by SQLAlchemy ORM. Created and seeded automatically on first startup.

---

## 2. Frontend Codeflow

### Entry Point
`app/layout.tsx` wraps the entire app with:
1. `UserProvider` — provides mock current user context to all pages
2. `ToastProvider` — provides toast notification functionality
3. `Navbar` — persistent navigation across all pages

### Page Routing (App Router)
| Route | Page | Component |
|-------|------|-----------|
| `/` | Home / Explore | `app/page.tsx` |
| `/listings/[id]` | Listing Detail | `app/listings/[id]/page.tsx` |
| `/checkout` | Mock Checkout | `app/checkout/page.tsx` |
| `/trips` | My Trips | `app/trips/page.tsx` |
| `/host` | Host Dashboard | `app/host/page.tsx` |
| `/host/create` | Create Listing | `app/host/create/page.tsx` |
| `/host/edit/[id]` | Edit Listing | `app/host/edit/[id]/page.tsx` |

### API Client
All API calls go through `lib/api.ts`, which provides typed functions for every endpoint. The `request<T>()` helper handles JSON serialization, error extraction from `detail` field, and type safety.

### Type System
All shared TypeScript interfaces live in `types/index.ts`, mirroring the backend Pydantic schemas: `User`, `ListingCard`, `ListingDetail`, `Booking`, `Favorite`, `Amenity`, `Review`, `SearchParams`, etc.

---

## 3. Backend Codeflow

### Startup
`main.py` creates the FastAPI app, configures CORS for the frontend, registers all routers, and calls `init_db()` on startup.

`database.py:init_db()` runs `Base.metadata.create_all()` to create tables if they don't exist, then calls `seed.py:seed_data()` which checks if data already exists before seeding (idempotent).

### Router Organization
| Router | Prefix | Responsibilities |
|--------|--------|-----------------|
| `listings.py` | `/api/listings` | Listing CRUD, search, filter, pagination, availability |
| `bookings.py` | `/api/bookings` | Booking creation with full validation |
| `users.py` | `/api` | Users, user bookings, host listings/bookings, amenities |
| `favorites.py` | `/api/favorites` | Favorites CRUD |

### Request → Response Flow
1. Client sends HTTP request
2. FastAPI routes to the appropriate handler
3. Handler receives Pydantic-validated input + SQLAlchemy `db` session via dependency injection
4. Handler queries/mutates the database
5. Response is serialized back to JSON via Pydantic schemas

---

## 4. Database Design

### Entity Relationship Diagram

```
User (id, name, email, role, avatar_url)
  │
  ├── [host] owns → Listing (id, host_id, title, description, location, 
  │                           price_per_night, property_type, max_guests, created_at)
  │                    │
  │                    ├── has → ListingImage (id, listing_id, image_url)
  │                    │
  │                    ├── has ←→ Amenity (id, name)   [many-to-many via listing_amenities]
  │                    │
  │                    ├── has → Booking (id, listing_id, guest_id, check_in, check_out,
  │                    │                  guests, nightly_price, service_fee, total_price, status)
  │                    │
  │                    ├── has → Review (id, listing_id, user_id, rating, comment, created_at)
  │                    │
  │                    └── can be → Favorite (id, user_id, listing_id)
  │
  ├── [guest] creates → Booking
  ├── [guest] creates → Review
  └── [user] saves → Favorite
```

### Key Relationships
- `listing_amenities` is a many-to-many association table linking `listings.id` ↔ `amenities.id`
- All foreign keys use `ondelete="CASCADE"` so deleting a listing removes its images, bookings, reviews, and favorites
- SQLAlchemy `relationship()` provides bidirectional access (e.g., `listing.reviews`, `review.listing`)

---

## 5. Home Page Flow

1. Page loads → calls `getListings()` with default params (page=1, limit=12)
2. Simultaneously calls `getUserFavorites()` for the current user
3. Backend queries `listings` table with `joinedload(Listing.images)`, calculates avg rating per listing from `reviews` table
4. Returns paginated response: `{ listings, total, page, limit, total_pages }`
5. Frontend renders `SearchBar`, `FilterBar`, `ListingGrid`, and `Pagination`
6. Each `ListingCard` shows first image, title, location, price, rating, and a wishlist heart button

---

## 6. Search Flow

1. User clicks the compact search bar → it expands to show location, check-in, check-out, guests fields
2. User fills in search criteria and clicks the search button
3. `handleSearch()` updates `searchParams` state with location, check_in, check_out, guests
4. Effect re-triggers `fetchListings()` with new params
5. Backend receives query params:
   - `location` → `WHERE location ILIKE '%{location}%'`
   - `check_in` + `check_out` → excludes listings with overlapping confirmed bookings
   - `guests` → `WHERE max_guests >= {guests}`
6. Filtered, paginated results replace the listing grid

---

## 7. Filter Flow

1. User clicks property type icon in the category row → immediate filter applied
2. User clicks "Filters" button → expanded panel shows price range inputs and amenity pills
3. Price range: `WHERE price_per_night >= min_price AND price_per_night <= max_price`
4. Amenities: for each selected amenity ID, filters listings that have that amenity in the `listing_amenities` join table (AND logic — listing must have ALL selected amenities)
5. Property type: `WHERE property_type ILIKE {type}`
6. "Clear all" resets all filters; "Show results" applies and closes the panel

---

## 8. Pagination Flow

1. Backend returns `total_pages` based on `ceil(total / limit)`
2. Frontend `Pagination` component renders numbered page buttons
3. For large page counts, uses ellipsis (`…`) truncation showing first, last, and surrounding pages
4. Clicking a page button calls `onPageChange(page)` → updates `page` state → re-fetches listings with `page` param
5. Current page is highlighted with a dark circle

---

## 9. Listing Detail Flow

1. URL: `/listings/[id]` → page extracts `id` from route params
2. Calls `getListingDetail(id)` → backend loads listing with `joinedload` for images, amenities, host, reviews (with review users)
3. Backend also queries confirmed bookings for this listing to build `unavailable_dates` array
4. Frontend renders:
   - Title, location, rating, review count
   - `PhotoGallery` — grid with main image + side images, fullscreen modal
   - Host info section with avatar and name
   - Description text
   - `Amenities` — two-column grid with emoji icons
   - `Reviews` — two-column grid with avatars, star ratings, comments
   - `BookingCard` (sticky, right column) — price, date picker, guest selector, price breakdown

---

## 10. Availability Flow

1. Listing detail page includes `unavailable_dates` in the response: `[{check_in, check_out}, ...]`
2. `DateRangePicker` component builds a `Set<string>` of all individual unavailable dates
3. When user selects a check-in date, it's validated against the unavailable set
4. When user selects a check-out date:
   - Validated against the unavailable set
   - Also checks that no unavailable dates fall between check-in and check-out
5. Invalid selections are silently blocked (input is not updated)
6. Backend also validates availability when the booking is created (double validation)

Additionally, the search endpoint supports date availability filtering:
- `GET /api/listings?check_in=X&check_out=Y` excludes listings with overlapping confirmed bookings

---

## 11. Booking Validation Logic

When `POST /api/bookings` is called, the backend validates in order:

1. **Listing exists** → 404 if not
2. **Guest exists** → 404 if not
3. **Dates present** → 400 if missing
4. **Date format** → 400 if not YYYY-MM-DD
5. **Date order** → 400 if check_out <= check_in
6. **Guest count** → 400 if < 1 or > listing.max_guests
7. **No overlap** → 409 if any confirmed booking overlaps

---

## 12. Booking Overlap Logic

The overlap check uses:

```sql
SELECT * FROM bookings
WHERE listing_id = {listing_id}
  AND status = 'confirmed'
  AND check_in < {new_check_out}
  AND check_out > {new_check_in}
```

This correctly detects all overlap cases:
- New booking fully inside existing
- New booking fully contains existing
- New booking overlaps start of existing
- New booking overlaps end of existing

---

## 13. Price Calculation

Prices are calculated **server-side** to prevent client manipulation:

```
num_nights = (check_out_date - check_in_date).days
nightly_price = listing.price_per_night
subtotal = nightly_price × num_nights
service_fee = round(subtotal × 0.12, 2)    # 12% mocked fee
total_price = round(subtotal + service_fee, 2)
```

The frontend displays a matching calculation for the UI preview, but the backend is the source of truth for the stored `total_price`.

---

## 14. Complete Booking Flow

```
1. Open listing detail page
2. Select check-in date (unavailable dates blocked)
3. Select check-out date (validates against unavailable ranges)
4. Adjust guest count (1 to max_guests)
5. BookingCard shows dynamic price breakdown
6. Click "Reserve"
7. Navigate to /checkout with query params (listing_id, check_in, check_out, guests)
8. Checkout page loads listing details, shows:
   - Trip summary (dates, guests)
   - Mock VISA payment card
   - Price breakdown
   - "Confirm booking" button
9. Click "Confirm booking"
10. POST /api/bookings → backend validates → calculates price → stores in SQLite
11. On success: show confirmation screen with green checkmark
12. User can navigate to "My Trips" or "Explore"
13. Booking persists across page refreshes (stored in SQLite)
14. Those dates are now unavailable for future bookings
```

---

## 15. My Trips Flow

1. Route: `/trips`
2. On mount: calls `getUserBookings(currentUser.id)` → `GET /api/users/{id}/bookings`
3. Backend loads bookings with `joinedload(Booking.listing.images)`, ordered by `created_at DESC`
4. Each booking card shows:
   - Listing image, title, location
   - Check-in and checkout dates
   - Guest count
   - Total price
   - Status badge ("confirmed" in green)
5. Empty state shows "No trips booked... yet!" with a link to explore

---

## 16. Host Dashboard Flow

1. Route: `/host`
2. Requires host role — shows "Switch to host" message for guests
3. On mount: parallel fetches `getHostListings()` and `getHostBookings()`
4. **Listings Tab**: Lists all owned properties with image, title, location, price, type, and action buttons (View, Edit, Delete)
5. **Reservations Tab**: Table showing bookings for owned properties with property name, guest name, dates, guest count, total price, status

---

## 17. Create Listing Flow

1. Route: `/host/create`
2. `ListingForm` component renders fields: title, description, location, price, property type (select), max guests, photo URLs (dynamic list), amenities (pill toggles)
3. Amenities are loaded from `GET /api/amenities` on mount
4. On submit: `POST /api/listings` with `host_id` from current user
5. Backend creates the listing, adds images and amenity associations
6. Success: toast notification + redirect to host dashboard
7. New listing appears immediately in dashboard and explore page

---

## 18. Edit Listing Flow

1. Route: `/host/edit/[id]`
2. On mount: loads listing detail via `getListingDetail(id)`
3. `ListingForm` pre-fills all fields from the existing listing
4. On submit: `PUT /api/listings/{id}` with `host_id` for ownership validation
5. Backend verifies `listing.host_id == data.host_id` (returns 403 if mismatch)
6. Updates fields, replaces images and amenities if provided
7. Success: toast notification + redirect to dashboard

---

## 19. Delete Listing Flow

1. Host clicks "Delete" button on a listing in the dashboard
2. Confirmation modal appears: "This action cannot be undone"
3. On confirm: `DELETE /api/listings/{id}?host_id={currentUser.id}`
4. Backend validates ownership → deletes listing (CASCADE removes images, bookings, reviews, favorites)
5. Success: listing removed from dashboard state, toast notification shown

---

## 20. Favorites Flow

1. Each `ListingCard` has a heart button (`WishlistButton` component)
2. On page load: `getUserFavorites(userId)` returns user's favorited listing IDs
3. Heart is filled red for favorited listings, semi-transparent for others
4. Click heart:
   - If not favorited: `POST /api/favorites` → adds to DB → heart fills red → toast "Added to favorites"
   - If favorited: `DELETE /api/favorites/{listing_id}?user_id={userId}` → removes from DB → heart unfills → toast "Removed from favorites"
5. Favorites persist across page refreshes (stored in SQLite)

---

## 21. Mock Guest/Host System

Instead of real authentication, the app uses a `UserContext`:

1. On app load: `GET /api/users` fetches all users
2. Default user is Alice (id=1, guest)
3. Navbar shows current user avatar with a dropdown menu listing all users
4. Clicking a user switches `currentUser` in context
5. All API calls use `currentUser.id` for operations:
   - Booking creation → `guest_id`
   - Listing creation → `host_id`
   - Listing edit/delete → `host_id` for ownership check
   - Favorites → `user_id`
6. Host dashboard shows "Switch to host" if current user role is "guest"

Users:
| ID | Name | Role |
|----|------|------|
| 1 | Alice Johnson | guest |
| 2 | Bob Smith | host |
| 3 | Carol Davis | host |
| 4 | David Lee | guest |
| 5 | Emma Wilson | host |

---

## 22. Toast Notifications

The `ToastProvider` (wrapping the entire app) provides a `showToast(message, type)` function via React context.

- Types: `success` (green gradient), `error` (red gradient), `info` (blue gradient)
- Toasts appear in the bottom-right corner with a slide-in animation
- Auto-dismiss after 4 seconds
- Used for: booking confirmation, listing CRUD, favorites, errors

---

## 23. Database Persistence

- SQLite database file: `backend/airbnb.db`
- Created automatically by `database.py:init_db()` which calls `Base.metadata.create_all()`
- All data persists across server restarts
- No data is stored in frontend state alone — everything round-trips through the API

---

## 24. Seed Data

`seed.py:seed_data()` populates the database on first run:

- **5 users**: 2 guests (Alice, David), 3 hosts (Bob, Carol, Emma)
- **10 listings**: Varied property types (House, Apartment, Villa, Treehouse) across US locations (Malibu, NYC, Aspen, Miami, SF, Scottsdale, Portland, Boston, Lake Tahoe, Chicago)
- **12 amenities**: WiFi, Kitchen, Pool, Parking, AC, Washer, Dryer, Heating, TV, Hot Tub, Gym, BBQ Grill
- **40 images**: 4 Unsplash images per listing
- **20 reviews**: 2 reviews per listing with realistic comments
- **6 bookings**: Spread across listings to demonstrate unavailable dates
- **5 favorites**: Pre-existing favorites to demonstrate the feature

The seed function is **idempotent**: it checks if any users exist before seeding, preventing duplicate data on restart.

---

## 25. Complete End-to-End Application Flow

### Guest Flow
```
Open http://localhost:3000
  → See listing grid with 10 listings
  → Use search bar: type "California", set dates, set guests → filtered results
  → Click filter icons for property type → filtered results  
  → Open filter panel → set price range and amenities → apply
  → Click a listing card → listing detail page
  → View photos (click to open fullscreen gallery)
  → Read description, amenities, host info, reviews
  → Select check-in and check-out dates (unavailable dates blocked)
  → Adjust guest count (respects max_guests)
  → See price breakdown update dynamically
  → Click "Reserve" → checkout page
  → Review trip summary and mock payment card
  → Click "Confirm booking" → booking stored in SQLite
  → See confirmation screen with booking details
  → Click "View My Trips" → trips page with new booking
  → Refresh page → booking persists (from database)
  → Heart/unheart listings → favorites persist
```

### Host Flow
```
Switch to Bob Smith (host) via navbar dropdown
  → Click "Host Dashboard" → see listings and reservations tabs
  → Listings tab shows 4 owned properties with View/Edit/Delete
  → Reservations tab shows bookings table for owned properties
  → Click "+ Create listing" → fill form with title, description, photos, amenities
  → Submit → listing created in database → toast notification → redirect to dashboard
  → New listing appears in dashboard AND in explore page
  → Click "Edit" on a listing → form pre-filled → change price → save
  → Click "Delete" → confirmation modal → confirm → listing removed → toast
  → Switch back to guest → deleted listing no longer appears
```
