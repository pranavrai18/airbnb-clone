from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models import Favorite, Listing, User, Review
from schemas import FavoriteCreate, FavoriteOut

router = APIRouter(prefix="/api/favorites", tags=["favorites"])


@router.get("")
def get_user_favorites(user_id: int = Query(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    favorites = (
        db.query(Favorite)
        .filter(Favorite.user_id == user_id)
        .options(joinedload(Favorite.listing).joinedload(Listing.images))
        .all()
    )

    result = []
    for fav in favorites:
        listing = fav.listing
        reviews = db.query(Review).filter(Review.listing_id == listing.id).all() if listing else []
        avg_rating = round(sum(r.rating for r in reviews) / len(reviews), 2) if reviews else None

        result.append({
            "id": fav.id,
            "user_id": fav.user_id,
            "listing_id": fav.listing_id,
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
        })

    return result


@router.post("", status_code=201)
def add_favorite(data: FavoriteCreate, db: Session = Depends(get_db)):
    # Check user exists
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check listing exists
    listing = db.query(Listing).filter(Listing.id == data.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")

    # Check if already favorited
    existing = (
        db.query(Favorite)
        .filter(Favorite.user_id == data.user_id, Favorite.listing_id == data.listing_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Listing already favorited")

    fav = Favorite(user_id=data.user_id, listing_id=data.listing_id)
    db.add(fav)
    db.commit()
    db.refresh(fav)
    return {"id": fav.id, "user_id": fav.user_id, "listing_id": fav.listing_id}


@router.delete("/{listing_id}")
def remove_favorite(listing_id: int, user_id: int = Query(...), db: Session = Depends(get_db)):
    fav = (
        db.query(Favorite)
        .filter(Favorite.user_id == user_id, Favorite.listing_id == listing_id)
        .first()
    )
    if not fav:
        raise HTTPException(status_code=404, detail="Favorite not found")

    db.delete(fav)
    db.commit()
    return {"message": "Favorite removed successfully"}
