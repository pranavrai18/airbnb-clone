from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# --- User Schemas ---
class UserBase(BaseModel):
    name: str
    email: str
    role: str = "guest"
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    pass


class UserOut(UserBase):
    id: int

    class Config:
        from_attributes = True


# --- Amenity Schemas ---
class AmenityOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


# --- Listing Image Schemas ---
class ListingImageOut(BaseModel):
    id: int
    listing_id: int
    image_url: str

    class Config:
        from_attributes = True


class ListingImageCreate(BaseModel):
    image_url: str


# --- Review Schemas ---
class ReviewOut(BaseModel):
    id: int
    listing_id: int
    user_id: int
    rating: int
    comment: Optional[str] = None
    created_at: Optional[datetime] = None
    user: Optional[UserOut] = None

    class Config:
        from_attributes = True


# --- Listing Schemas ---
class ListingBase(BaseModel):
    title: str
    description: Optional[str] = None
    location: str
    price_per_night: float
    property_type: str = "Apartment"
    max_guests: int = 2


class ListingCreate(ListingBase):
    host_id: int
    image_urls: list[str] = []
    amenity_ids: list[int] = []


class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    price_per_night: Optional[float] = None
    property_type: Optional[str] = None
    max_guests: Optional[int] = None
    host_id: int
    image_urls: Optional[list[str]] = None
    amenity_ids: Optional[list[int]] = None


class ListingCardOut(BaseModel):
    id: int
    title: str
    location: str
    price_per_night: float
    property_type: str
    max_guests: int
    images: list[ListingImageOut] = []
    avg_rating: Optional[float] = None
    review_count: int = 0

    class Config:
        from_attributes = True


class ListingDetailOut(BaseModel):
    id: int
    host_id: int
    title: str
    description: Optional[str] = None
    location: str
    price_per_night: float
    property_type: str
    max_guests: int
    created_at: Optional[datetime] = None
    host: Optional[UserOut] = None
    images: list[ListingImageOut] = []
    amenities: list[AmenityOut] = []
    reviews: list[ReviewOut] = []
    avg_rating: Optional[float] = None
    review_count: int = 0
    unavailable_dates: list[dict] = []

    class Config:
        from_attributes = True


class PaginatedListings(BaseModel):
    listings: list[ListingCardOut]
    total: int
    page: int
    limit: int
    total_pages: int


# --- Booking Schemas ---
class BookingCreate(BaseModel):
    listing_id: int
    guest_id: int
    check_in: str
    check_out: str
    guests: int


class BookingOut(BaseModel):
    id: int
    listing_id: int
    guest_id: int
    check_in: str
    check_out: str
    guests: int
    nightly_price: float
    service_fee: float
    total_price: float
    status: str
    created_at: Optional[datetime] = None
    listing: Optional[ListingCardOut] = None
    guest: Optional[UserOut] = None

    class Config:
        from_attributes = True


# --- Availability ---
class UnavailableDateRange(BaseModel):
    check_in: str
    check_out: str


# --- Favorite Schemas ---
class FavoriteCreate(BaseModel):
    user_id: int
    listing_id: int


class FavoriteOut(BaseModel):
    id: int
    user_id: int
    listing_id: int
    listing: Optional[ListingCardOut] = None

    class Config:
        from_attributes = True
