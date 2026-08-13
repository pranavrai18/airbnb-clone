from sqlalchemy import (
    Column, Integer, String, Float, Text, DateTime, ForeignKey, Table, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from database import Base

# Many-to-many association table for listings <-> amenities
listing_amenities = Table(
    "listing_amenities",
    Base.metadata,
    Column("listing_id", Integer, ForeignKey("listings.id", ondelete="CASCADE"), primary_key=True),
    Column("amenity_id", Integer, ForeignKey("amenities.id", ondelete="CASCADE"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    role = Column(SAEnum("guest", "host", name="user_role"), nullable=False, default="guest")
    avatar_url = Column(String(500), nullable=True)

    # Relationships
    listings = relationship("Listing", back_populates="host", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="guest", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")


class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    host_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String(200), nullable=False)
    price_per_night = Column(Float, nullable=False)
    property_type = Column(String(50), nullable=False, default="Apartment")
    max_guests = Column(Integer, nullable=False, default=2)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    host = relationship("User", back_populates="listings")
    images = relationship("ListingImage", back_populates="listing", cascade="all, delete-orphan")
    amenities = relationship("Amenity", secondary=listing_amenities, back_populates="listings")
    bookings = relationship("Booking", back_populates="listing", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="listing", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="listing", cascade="all, delete-orphan")


class ListingImage(Base):
    __tablename__ = "listing_images"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String(500), nullable=False)

    listing = relationship("Listing", back_populates="images")


class Amenity(Base):
    __tablename__ = "amenities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)

    listings = relationship("Listing", secondary=listing_amenities, back_populates="amenities")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    guest_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    check_in = Column(String(10), nullable=False)  # YYYY-MM-DD
    check_out = Column(String(10), nullable=False)
    guests = Column(Integer, nullable=False)
    nightly_price = Column(Float, nullable=False)
    service_fee = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    status = Column(String(20), nullable=False, default="confirmed")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    listing = relationship("Listing", back_populates="bookings")
    guest = relationship("User", back_populates="bookings")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    listing = relationship("Listing", back_populates="reviews")
    user = relationship("User", back_populates="reviews")


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)

    user = relationship("User", back_populates="favorites")
    listing = relationship("Listing", back_populates="favorites")
