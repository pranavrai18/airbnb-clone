from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db
from models import Booking, Listing, User, Review
from schemas import BookingCreate, BookingOut

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


@router.post("", response_model=BookingOut, status_code=201)
def create_booking(data: BookingCreate, db: Session = Depends(get_db)):
    # Validate listing exists
    listing = db.query(Listing).filter(Listing.id == data.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    # Validate guest exists
    guest = db.query(User).filter(User.id == data.guest_id).first()
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")

    # Validate dates
    if not data.check_in or not data.check_out:
        raise HTTPException(status_code=400, detail="Check-in and check-out dates are required")

    try:
        check_in_date = datetime.strptime(data.check_in, "%Y-%m-%d")
        check_out_date = datetime.strptime(data.check_out, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    if check_out_date <= check_in_date:
        raise HTTPException(status_code=400, detail="Check-out must be after check-in")

    # Validate guest count
    if data.guests < 1:
        raise HTTPException(status_code=400, detail="At least 1 guest is required")
    if data.guests > listing.max_guests:
        raise HTTPException(
            status_code=400,
            detail=f"Guest count exceeds maximum of {listing.max_guests}",
        )

    # Check for overlapping bookings
    overlap = (
        db.query(Booking)
        .filter(
            Booking.listing_id == data.listing_id,
            Booking.status == "confirmed",
            Booking.check_in < data.check_out,
            Booking.check_out > data.check_in,
        )
        .first()
    )
    if overlap:
        raise HTTPException(
            status_code=409,
            detail="Selected dates overlap with an existing booking",
        )

    # Calculate pricing
    num_nights = (check_out_date - check_in_date).days
    nightly_price = listing.price_per_night
    subtotal = nightly_price * num_nights
    service_fee = round(subtotal * 0.12, 2)  # 12% mocked service fee
    total_price = round(subtotal + service_fee, 2)

    booking = Booking(
        listing_id=data.listing_id,
        guest_id=data.guest_id,
        check_in=data.check_in,
        check_out=data.check_out,
        guests=data.guests,
        nightly_price=nightly_price,
        service_fee=service_fee,
        total_price=total_price,
        status="confirmed",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    # Build response with listing info
    reviews = db.query(Review).filter(Review.listing_id == listing.id).all()
    avg_rating = round(sum(r.rating for r in reviews) / len(reviews), 2) if reviews else None

    return {
        "id": booking.id,
        "listing_id": booking.listing_id,
        "guest_id": booking.guest_id,
        "check_in": booking.check_in,
        "check_out": booking.check_out,
        "guests": booking.guests,
        "nightly_price": booking.nightly_price,
        "service_fee": booking.service_fee,
        "total_price": booking.total_price,
        "status": booking.status,
        "created_at": booking.created_at,
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
        },
        "guest": {
            "id": guest.id,
            "name": guest.name,
            "email": guest.email,
            "role": guest.role,
            "avatar_url": guest.avatar_url,
        },
    }
