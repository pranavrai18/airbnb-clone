from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models import User, Booking, Listing, Review
from schemas import UserOut, BookingOut, ListingCardOut

router = APIRouter(prefix="/api", tags=["users"])


@router.get("/users", response_model=list[UserOut])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()


@router.get("/users/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/users/{user_id}/bookings")
def get_user_bookings(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    bookings = (
        db.query(Booking)
        .filter(Booking.guest_id == user_id)
        .options(joinedload(Booking.listing).joinedload(Listing.images))
        .order_by(Booking.created_at.desc())
        .all()
    )

    result = []
    for b in bookings:
        listing = b.listing
        reviews = db.query(Review).filter(Review.listing_id == listing.id).all() if listing else []
        avg_rating = round(sum(r.rating for r in reviews) / len(reviews), 2) if reviews else None

        result.append({
            "id": b.id,
            "listing_id": b.listing_id,
            "guest_id": b.guest_id,
            "check_in": b.check_in,
            "check_out": b.check_out,
            "guests": b.guests,
            "nightly_price": b.nightly_price,
            "service_fee": b.service_fee,
            "total_price": b.total_price,
            "status": b.status,
            "created_at": b.created_at,
            "listing": {
                "id": listing.id,
                "title": listing.title,
                "location": listing.location,
                "price_per_night": listing.price_per_night,
                "property_type": listing.property_type,
                "max_guests": listing.max_guests,
                "images": [{"id": img.id, "listing_id": img.listing_id, "image_url": img.image_url} for img in listing.images],
                "avg_rating": avg_rating,
                "review_count": len(reviews),
            } if listing else None,
            "guest": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "avatar_url": user.avatar_url,
            },
        })

    return result


@router.get("/hosts/{host_id}/listings")
def get_host_listings(host_id: int, db: Session = Depends(get_db)):
    host = db.query(User).filter(User.id == host_id).first()
    if not host:
        raise HTTPException(status_code=404, detail="Host not found")

    listings = (
        db.query(Listing)
        .filter(Listing.host_id == host_id)
        .options(joinedload(Listing.images))
        .all()
    )

    result = []
    for listing in listings:
        reviews = db.query(Review).filter(Review.listing_id == listing.id).all()
        avg_rating = round(sum(r.rating for r in reviews) / len(reviews), 2) if reviews else None
        result.append({
            "id": listing.id,
            "title": listing.title,
            "location": listing.location,
            "price_per_night": listing.price_per_night,
            "property_type": listing.property_type,
            "max_guests": listing.max_guests,
            "images": [{"id": img.id, "listing_id": img.listing_id, "image_url": img.image_url} for img in listing.images],
            "avg_rating": avg_rating,
            "review_count": len(reviews),
        })

    return result


@router.get("/hosts/{host_id}/bookings")
def get_host_bookings(host_id: int, db: Session = Depends(get_db)):
    host = db.query(User).filter(User.id == host_id).first()
    if not host:
        raise HTTPException(status_code=404, detail="Host not found")

    # Get all listings owned by this host
    host_listing_ids = [l.id for l in db.query(Listing).filter(Listing.host_id == host_id).all()]

    if not host_listing_ids:
        return []

    bookings = (
        db.query(Booking)
        .filter(Booking.listing_id.in_(host_listing_ids))
        .options(
            joinedload(Booking.listing).joinedload(Listing.images),
            joinedload(Booking.guest),
        )
        .order_by(Booking.created_at.desc())
        .all()
    )

    result = []
    for b in bookings:
        listing = b.listing
        guest = b.guest
        result.append({
            "id": b.id,
            "listing_id": b.listing_id,
            "guest_id": b.guest_id,
            "check_in": b.check_in,
            "check_out": b.check_out,
            "guests": b.guests,
            "nightly_price": b.nightly_price,
            "service_fee": b.service_fee,
            "total_price": b.total_price,
            "status": b.status,
            "created_at": b.created_at,
            "listing": {
                "id": listing.id,
                "title": listing.title,
                "location": listing.location,
                "price_per_night": listing.price_per_night,
                "property_type": listing.property_type,
                "max_guests": listing.max_guests,
                "images": [{"id": img.id, "listing_id": img.listing_id, "image_url": img.image_url} for img in listing.images],
                "avg_rating": None,
                "review_count": 0,
            } if listing else None,
            "guest": {
                "id": guest.id,
                "name": guest.name,
                "email": guest.email,
                "role": guest.role,
                "avatar_url": guest.avatar_url,
            } if guest else None,
        })

    return result


@router.get("/amenities")
def get_amenities(db: Session = Depends(get_db)):
    from models import Amenity
    return db.query(Amenity).all()
