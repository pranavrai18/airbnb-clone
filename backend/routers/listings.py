from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import Optional
from database import get_db
from models import Listing, ListingImage, Amenity, Booking, Review, listing_amenities
from schemas import (
    ListingCreate, ListingUpdate, ListingCardOut, ListingDetailOut,
    PaginatedListings, ListingImageOut, AmenityOut, ReviewOut, UserOut,
    UnavailableDateRange,
)

router = APIRouter(prefix="/api/listings", tags=["listings"])


def build_listing_card(listing: Listing, db: Session) -> dict:
    reviews = db.query(Review).filter(Review.listing_id == listing.id).all()
    avg_rating = None
    if reviews:
        avg_rating = round(sum(r.rating for r in reviews) / len(reviews), 2)
    return {
        "id": listing.id,
        "title": listing.title,
        "location": listing.location,
        "price_per_night": listing.price_per_night,
        "property_type": listing.property_type,
        "max_guests": listing.max_guests,
        "images": [{"id": img.id, "listing_id": img.listing_id, "image_url": img.image_url} for img in listing.images],
        "avg_rating": avg_rating,
        "review_count": len(reviews),
    }


@router.get("", response_model=PaginatedListings)
def get_listings(
    location: Optional[str] = None,
    check_in: Optional[str] = None,
    check_out: Optional[str] = None,
    guests: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    property_type: Optional[str] = None,
    amenities: Optional[str] = None,  # comma-separated amenity IDs
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db),
):
    query = db.query(Listing).options(joinedload(Listing.images))

    # Location filter (case-insensitive partial match)
    if location:
        query = query.filter(Listing.location.ilike(f"%{location}%"))

    # Guest filter
    if guests:
        query = query.filter(Listing.max_guests >= guests)

    # Price range filters
    if min_price is not None:
        query = query.filter(Listing.price_per_night >= min_price)
    if max_price is not None:
        query = query.filter(Listing.price_per_night <= max_price)

    # Property type filter
    if property_type:
        types = [t.strip() for t in property_type.split(",") if t.strip()]
        if len(types) > 1:
            query = query.filter(func.lower(Listing.property_type).in_([t.lower() for t in types]))
        else:
            query = query.filter(Listing.property_type.ilike(property_type))

    # Amenity filter
    if amenities:
        amenity_ids = [int(a.strip()) for a in amenities.split(",") if a.strip()]
        for aid in amenity_ids:
            query = query.filter(
                Listing.id.in_(
                    db.query(listing_amenities.c.listing_id).filter(
                        listing_amenities.c.amenity_id == aid
                    )
                )
            )

    # Date availability filter: exclude listings with overlapping bookings
    if check_in and check_out:
        overlapping_listing_ids = (
            db.query(Booking.listing_id)
            .filter(
                Booking.status == "confirmed",
                Booking.check_in < check_out,
                Booking.check_out > check_in,
            )
            .distinct()
            .all()
        )
        excluded_ids = [row[0] for row in overlapping_listing_ids]
        if excluded_ids:
            query = query.filter(~Listing.id.in_(excluded_ids))

    # Get total count (need unique IDs due to joinedload)
    total = query.with_entities(Listing.id).distinct().count()

    # Pagination
    offset = (page - 1) * limit
    listings = query.distinct().offset(offset).limit(limit).all()

    listing_cards = [build_listing_card(l, db) for l in listings]

    total_pages = (total + limit - 1) // limit if total > 0 else 1

    return {
        "listings": listing_cards,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
    }


@router.get("/{listing_id}", response_model=ListingDetailOut)
def get_listing_detail(listing_id: int, db: Session = Depends(get_db)):
    listing = (
        db.query(Listing)
        .options(
            joinedload(Listing.images),
            joinedload(Listing.amenities),
            joinedload(Listing.host),
            joinedload(Listing.reviews).joinedload(Review.user),
        )
        .filter(Listing.id == listing_id)
        .first()
    )
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    reviews = listing.reviews
    avg_rating = None
    if reviews:
        avg_rating = round(sum(r.rating for r in reviews) / len(reviews), 2)

    # Get unavailable date ranges from confirmed bookings
    bookings = db.query(Booking).filter(
        Booking.listing_id == listing_id,
        Booking.status == "confirmed",
    ).all()
    unavailable_dates = [
        {"check_in": b.check_in, "check_out": b.check_out} for b in bookings
    ]

    return {
        "id": listing.id,
        "host_id": listing.host_id,
        "title": listing.title,
        "description": listing.description,
        "location": listing.location,
        "price_per_night": listing.price_per_night,
        "property_type": listing.property_type,
        "max_guests": listing.max_guests,
        "created_at": listing.created_at,
        "host": {
            "id": listing.host.id,
            "name": listing.host.name,
            "email": listing.host.email,
            "role": listing.host.role,
            "avatar_url": listing.host.avatar_url,
        } if listing.host else None,
        "images": [{"id": img.id, "listing_id": img.listing_id, "image_url": img.image_url} for img in listing.images],
        "amenities": [{"id": a.id, "name": a.name} for a in listing.amenities],
        "reviews": [
            {
                "id": r.id,
                "listing_id": r.listing_id,
                "user_id": r.user_id,
                "rating": r.rating,
                "comment": r.comment,
                "created_at": r.created_at,
                "user": {"id": r.user.id, "name": r.user.name, "email": r.user.email, "role": r.user.role, "avatar_url": r.user.avatar_url} if r.user else None,
            }
            for r in reviews
        ],
        "avg_rating": avg_rating,
        "review_count": len(reviews),
        "unavailable_dates": unavailable_dates,
    }


@router.get("/{listing_id}/availability")
def get_availability(listing_id: int, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    bookings = db.query(Booking).filter(
        Booking.listing_id == listing_id,
        Booking.status == "confirmed",
    ).all()

    return [
        {"check_in": b.check_in, "check_out": b.check_out}
        for b in bookings
    ]


@router.post("", response_model=ListingDetailOut, status_code=201)
def create_listing(data: ListingCreate, db: Session = Depends(get_db)):
    from models import User
    host = db.query(User).filter(User.id == data.host_id).first()
    if not host:
        raise HTTPException(status_code=404, detail="Host not found")

    listing = Listing(
        host_id=data.host_id,
        title=data.title,
        description=data.description,
        location=data.location,
        price_per_night=data.price_per_night,
        property_type=data.property_type,
        max_guests=data.max_guests,
    )
    db.add(listing)
    db.flush()

    # Add images
    for url in data.image_urls:
        db.add(ListingImage(listing_id=listing.id, image_url=url))

    # Add amenities
    for aid in data.amenity_ids:
        amenity = db.query(Amenity).filter(Amenity.id == aid).first()
        if amenity:
            db.execute(listing_amenities.insert().values(listing_id=listing.id, amenity_id=aid))

    db.commit()
    db.refresh(listing)

    return get_listing_detail(listing.id, db)


@router.put("/{listing_id}", response_model=ListingDetailOut)
def update_listing(listing_id: int, data: ListingUpdate, db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    if listing.host_id != data.host_id:
        raise HTTPException(status_code=403, detail="User does not own this listing")

    if data.title is not None:
        listing.title = data.title
    if data.description is not None:
        listing.description = data.description
    if data.location is not None:
        listing.location = data.location
    if data.price_per_night is not None:
        listing.price_per_night = data.price_per_night
    if data.property_type is not None:
        listing.property_type = data.property_type
    if data.max_guests is not None:
        listing.max_guests = data.max_guests

    # Update images if provided
    if data.image_urls is not None:
        db.query(ListingImage).filter(ListingImage.listing_id == listing_id).delete()
        for url in data.image_urls:
            db.add(ListingImage(listing_id=listing_id, image_url=url))

    # Update amenities if provided
    if data.amenity_ids is not None:
        db.execute(listing_amenities.delete().where(listing_amenities.c.listing_id == listing_id))
        for aid in data.amenity_ids:
            db.execute(listing_amenities.insert().values(listing_id=listing_id, amenity_id=aid))

    db.commit()
    db.refresh(listing)

    return get_listing_detail(listing_id, db)


@router.delete("/{listing_id}")
def delete_listing(listing_id: int, host_id: int = Query(...), db: Session = Depends(get_db)):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.host_id != host_id:
        raise HTTPException(status_code=403, detail="User does not own this listing")

    db.delete(listing)
    db.commit()
    return {"message": "Listing deleted successfully"}
