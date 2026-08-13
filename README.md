# Airbnb Clone

A full-stack Airbnb-style vacation rental marketplace built with Next.js, FastAPI, and SQLite.

## Features

- **Browse Listings** — Photo-forward grid with ratings, prices, and wishlist buttons
- **Search & Filter** — Search by location, dates, guests; filter by price range, property type, amenities
- **Listing Details** — Photo gallery, amenities, host info, reviews, and booking card
- **Date Availability** — Unavailable dates are blocked; overlapping bookings are rejected
- **Booking Flow** — Select dates → guests → reserve → mock checkout → confirmation
- **My Trips** — View all bookings with listing details, dates, and pricing
- **Host Dashboard** — Create, edit, and delete listings; view reservations for owned properties
- **Favorites** — Add/remove listings from your wishlist with persistent storage
- **Toast Notifications** — Confirmation messages for all key actions
- **Mock User System** — Switch between guest and host users via navbar dropdown
- **Pagination** — Server-side paginated listing results

## Tech Stack

| Layer    | Technology                 |
|----------|----------------------------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS, App Router |
| Backend  | Python, FastAPI, Uvicorn   |
| Database | SQLite via SQLAlchemy      |

## Project Structure

```
airbnb-clone/
├── frontend/                   # Next.js application
│   ├── app/                    # Pages (App Router)
│   │   ├── page.tsx            # Home / Explore
│   │   ├── listings/[id]/      # Listing detail
│   │   ├── checkout/           # Mock checkout
│   │   ├── trips/              # My Trips
│   │   └── host/               # Host dashboard, create, edit
│   ├── components/             # Reusable UI components
│   ├── context/                # UserContext (mock auth)
│   ├── lib/                    # API client
│   └── types/                  # TypeScript interfaces
│
├── backend/                    # FastAPI application
│   ├── main.py                 # App entry point, CORS, router registration
│   ├── database.py             # SQLAlchemy engine, session, init_db
│   ├── models.py               # ORM models (User, Listing, Booking, etc.)
│   ├── schemas.py              # Pydantic request/response schemas
│   ├── seed.py                 # Sample data seeding
│   └── routers/                # API route handlers
│       ├── listings.py         # Listing CRUD, search, filter, availability
│       ├── bookings.py         # Booking creation with validation
│       ├── users.py            # Users, user bookings, host endpoints
│       └── favorites.py        # Favorites CRUD
│
├── README.md
└── notes.md
```

## Setup Instructions

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm

### Backend Setup

```bash
cd backend

# Create virtual environment (if not already created)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn sqlalchemy

# Start the server (database is created and seeded automatically)
uvicorn main:app --reload --port 8000
```

The backend runs at `http://localhost:8000`. The database (`airbnb.db`) is created automatically on first start with sample data.

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend runs at `http://localhost:3000`.

## Architecture Overview

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/listings` | Paginated listings with search/filter |
| GET | `/api/listings/{id}` | Listing detail with host, images, reviews |
| GET | `/api/listings/{id}/availability` | Unavailable date ranges |
| POST | `/api/listings` | Create listing (host) |
| PUT | `/api/listings/{id}` | Update listing (owner only) |
| DELETE | `/api/listings/{id}` | Delete listing (owner only) |
| POST | `/api/bookings` | Create booking with validation |
| GET | `/api/users/{id}/bookings` | User's bookings (My Trips) |
| GET | `/api/hosts/{id}/listings` | Host's owned listings |
| GET | `/api/hosts/{id}/bookings` | Bookings for host's properties |
| GET | `/api/favorites?user_id=` | User's favorites |
| POST | `/api/favorites` | Add favorite |
| DELETE | `/api/favorites/{listing_id}` | Remove favorite |
| GET | `/api/users` | All users |
| GET | `/api/amenities` | All amenities |

### Database Schema

- **Users** — id, name, email, role (guest/host), avatar_url
- **Listings** — id, host_id, title, description, location, price_per_night, property_type, max_guests
- **ListingImages** — id, listing_id, image_url
- **Amenities** — id, name (many-to-many with listings)
- **Bookings** — id, listing_id, guest_id, check_in, check_out, guests, nightly_price, service_fee, total_price, status
- **Reviews** — id, listing_id, user_id, rating, comment
- **Favorites** — id, user_id, listing_id

## Mocked Features

- **Authentication** — Simplified user switching via navbar dropdown (no JWT/OAuth)
- **Payment** — Mock checkout with fake VISA card display (no real charges)
- **Maps** — Not implemented (not required)
- **Messaging** — Not implemented (not required)
- **Identity Verification** — Not implemented (not required)

## Sample Data

The database is seeded with:
- 5 users (2 guests, 3 hosts)
- 10 varied listings across US locations
- 12 amenities
- 40 listing images
- 20 reviews
- 6 existing bookings (demonstrating unavailable dates)
- 5 favorites
