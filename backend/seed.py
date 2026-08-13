from sqlalchemy.orm import Session
from models import User, Listing, ListingImage, Amenity, Booking, Review, Favorite, listing_amenities
from datetime import datetime, timezone


def seed_data(db: Session):
    # Check if data already seeded
    if db.query(User).first():
        return

    # --- Users ---
    users = [
        User(id=1, name="Alice Johnson", email="alice@example.com", role="guest",
             avatar_url="https://ui-avatars.com/api/?name=Alice+Johnson&background=FF5A5F&color=fff&size=128"),
        User(id=2, name="Bob Smith", email="bob@example.com", role="host",
             avatar_url="https://ui-avatars.com/api/?name=Bob+Smith&background=00A699&color=fff&size=128"),
        User(id=3, name="Carol Davis", email="carol@example.com", role="host",
             avatar_url="https://ui-avatars.com/api/?name=Carol+Davis&background=FC642D&color=fff&size=128"),
        User(id=4, name="David Lee", email="david@example.com", role="guest",
             avatar_url="https://ui-avatars.com/api/?name=David+Lee&background=484848&color=fff&size=128"),
        User(id=5, name="Emma Wilson", email="emma@example.com", role="host",
             avatar_url="https://ui-avatars.com/api/?name=Emma+Wilson&background=767676&color=fff&size=128"),
    ]
    db.add_all(users)
    db.flush()

    # --- Amenities ---
    amenities = [
        Amenity(id=1, name="WiFi"),
        Amenity(id=2, name="Kitchen"),
        Amenity(id=3, name="Pool"),
        Amenity(id=4, name="Parking"),
        Amenity(id=5, name="Air Conditioning"),
        Amenity(id=6, name="Washer"),
        Amenity(id=7, name="Dryer"),
        Amenity(id=8, name="Heating"),
        Amenity(id=9, name="TV"),
        Amenity(id=10, name="Hot Tub"),
        Amenity(id=11, name="Gym"),
        Amenity(id=12, name="BBQ Grill"),
    ]
    db.add_all(amenities)
    db.flush()

    # --- Listings ---
    listings_data = [
        {
            "id": 1, "host_id": 2,
            "title": "Cozy Beachfront Cottage in Malibu",
            "description": "Wake up to the sound of waves in this charming beachfront cottage. Features stunning ocean views, a private deck, and direct beach access. Perfect for a romantic getaway or a peaceful retreat.",
            "location": "Malibu, California",
            "price_per_night": 185.0,
            "property_type": "House",
            "max_guests": 4,
            "images": [
                "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800",
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
            ],
            "amenity_ids": [1, 2, 4, 5, 9],
        },
        {
            "id": 2, "host_id": 2,
            "title": "Modern Loft in Downtown Manhattan",
            "description": "Stylish, sun-drenched loft in the heart of Manhattan. Walk to world-class dining, Broadway shows, and Central Park. Features exposed brick, high ceilings, and designer furnishings.",
            "location": "New York, New York",
            "price_per_night": 250.0,
            "property_type": "Apartment",
            "max_guests": 2,
            "images": [
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
                "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
                "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800",
            ],
            "amenity_ids": [1, 2, 5, 6, 7, 8, 9],
        },
        {
            "id": 3, "host_id": 3,
            "title": "Rustic Mountain Cabin in Aspen",
            "description": "Escape to the mountains in this cozy log cabin. Surrounded by pine forests with ski-in/ski-out access. Features a stone fireplace, hot tub, and panoramic mountain views.",
            "location": "Aspen, Colorado",
            "price_per_night": 320.0,
            "property_type": "House",
            "max_guests": 6,
            "images": [
                "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800",
                "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800",
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
            ],
            "amenity_ids": [1, 2, 4, 8, 9, 10],
        },
        {
            "id": 4, "host_id": 3,
            "title": "Luxury Villa with Infinity Pool in Miami",
            "description": "Stunning waterfront villa with a private infinity pool overlooking Biscayne Bay. This ultra-modern home features floor-to-ceiling windows, a chef's kitchen, and a private dock.",
            "location": "Miami, Florida",
            "price_per_night": 450.0,
            "property_type": "Villa",
            "max_guests": 8,
            "images": [
                "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
                "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
            ],
            "amenity_ids": [1, 2, 3, 4, 5, 6, 7, 9, 10, 11],
        },
        {
            "id": 5, "host_id": 5,
            "title": "Charming Studio near Golden Gate Bridge",
            "description": "Bright and airy studio with stunning views of the Golden Gate Bridge. Located in the Marina District with easy access to Fisherman's Wharf, Ghirardelli Square, and Union Street shops.",
            "location": "San Francisco, California",
            "price_per_night": 165.0,
            "property_type": "Apartment",
            "max_guests": 2,
            "images": [
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
                "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800",
            ],
            "amenity_ids": [1, 2, 5, 6, 8, 9],
        },
        {
            "id": 6, "host_id": 5,
            "title": "Desert Oasis Retreat in Scottsdale",
            "description": "A serene desert retreat surrounded by saguaro cacti and stunning sunsets. Features a saltwater pool, outdoor shower, and modern Southwestern design throughout.",
            "location": "Scottsdale, Arizona",
            "price_per_night": 210.0,
            "property_type": "House",
            "max_guests": 5,
            "images": [
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
                "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
                "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
            ],
            "amenity_ids": [1, 2, 3, 4, 5, 9, 12],
        },
        {
            "id": 7, "host_id": 2,
            "title": "Treehouse Getaway in the Pacific Northwest",
            "description": "Live among the treetops in this unique treehouse nestled in old-growth forest. Features a wraparound deck, skylights for stargazing, and a wood-fired hot tub on the ground level.",
            "location": "Portland, Oregon",
            "price_per_night": 175.0,
            "property_type": "Treehouse",
            "max_guests": 2,
            "images": [
                "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800",
                "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800",
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
                "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800",
            ],
            "amenity_ids": [1, 8, 10],
        },
        {
            "id": 8, "host_id": 3,
            "title": "Historic Brownstone in Boston's Back Bay",
            "description": "Elegant brownstone apartment in one of Boston's most prestigious neighborhoods. Walk to Newbury Street shopping, the Charles River Esplanade, and world-class restaurants.",
            "location": "Boston, Massachusetts",
            "price_per_night": 195.0,
            "property_type": "Apartment",
            "max_guests": 4,
            "images": [
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
                "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
                "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800",
            ],
            "amenity_ids": [1, 2, 4, 5, 6, 7, 8, 9],
        },
        {
            "id": 9, "host_id": 5,
            "title": "Lakefront Cabin in Lake Tahoe",
            "description": "Peaceful lakefront cabin with a private dock and kayaks. Enjoy breathtaking lake views from the wrap-around porch. Minutes from ski resorts and hiking trails.",
            "location": "Lake Tahoe, California",
            "price_per_night": 275.0,
            "property_type": "House",
            "max_guests": 6,
            "images": [
                "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800",
                "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800",
                "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
                "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
            ],
            "amenity_ids": [1, 2, 4, 8, 9, 10, 12],
        },
        {
            "id": 10, "host_id": 2,
            "title": "Penthouse Suite in Downtown Chicago",
            "description": "Spectacular penthouse with panoramic views of Lake Michigan and the Chicago skyline. Features a private rooftop terrace, floor-to-ceiling windows, and luxury finishes throughout.",
            "location": "Chicago, Illinois",
            "price_per_night": 380.0,
            "property_type": "Apartment",
            "max_guests": 4,
            "images": [
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
                "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
                "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
            ],
            "amenity_ids": [1, 2, 4, 5, 6, 7, 8, 9, 11],
        },
        {
            "id": 11, "host_id": 2,
            "title": "Private Surfing Lesson with Malibu Pro",
            "description": "Learn to surf with an experienced professional instructor on the iconic beaches of Malibu. Suitable for all skill levels. Boards and wetsuits included.",
            "location": "Malibu, California",
            "price_per_night": 85.0,
            "property_type": "Experiences",
            "max_guests": 6,
            "images": [
                "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800"
            ],
            "amenity_ids": [1],
        },
        {
            "id": 12, "host_id": 3,
            "title": "Guided Vineyard Tour & Wine Tasting",
            "description": "An exclusive tour of a family-owned vineyard followed by a guided tasting of reserve wines paired with local artisanal cheeses.",
            "location": "Napa Valley, California",
            "price_per_night": 125.0,
            "property_type": "Experiences",
            "max_guests": 8,
            "images": [
                "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800"
            ],
            "amenity_ids": [1],
        },
        {
            "id": 13, "host_id": 5,
            "title": "Private Gourmet Chef Dining Experience",
            "description": "Enjoy a customized multi-course meal prepared in your vacation rental by a top local chef. Includes wine pairing, table service, and full kitchen cleanup.",
            "location": "Miami, Florida",
            "price_per_night": 150.0,
            "property_type": "Services",
            "max_guests": 12,
            "images": [
                "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800"
            ],
            "amenity_ids": [2],
        },
    ]

    for ld in listings_data:
        listing = Listing(
            id=ld["id"],
            host_id=ld["host_id"],
            title=ld["title"],
            description=ld["description"],
            location=ld["location"],
            price_per_night=ld["price_per_night"],
            property_type=ld["property_type"],
            max_guests=ld["max_guests"],
            created_at=datetime.now(timezone.utc),
        )
        db.add(listing)
        db.flush()

        for url in ld["images"]:
            db.add(ListingImage(listing_id=listing.id, image_url=url))

        for aid in ld["amenity_ids"]:
            db.execute(listing_amenities.insert().values(listing_id=listing.id, amenity_id=aid))

    db.flush()

    # --- Bookings (existing bookings to demonstrate unavailable dates) ---
    # Service fee = 12% of subtotal (matching the booking API calculation)
    bookings = [
        Booking(listing_id=1, guest_id=1, check_in="2026-08-20", check_out="2026-08-25",
                guests=2, nightly_price=185.0, service_fee=111.0,
                total_price=185.0 * 5 + 111.0, status="confirmed"),
        Booking(listing_id=1, guest_id=4, check_in="2026-09-01", check_out="2026-09-05",
                guests=3, nightly_price=185.0, service_fee=88.8,
                total_price=185.0 * 4 + 88.8, status="confirmed"),
        Booking(listing_id=2, guest_id=1, check_in="2026-08-18", check_out="2026-08-22",
                guests=2, nightly_price=250.0, service_fee=120.0,
                total_price=250.0 * 4 + 120.0, status="confirmed"),
        Booking(listing_id=3, guest_id=4, check_in="2026-09-10", check_out="2026-09-15",
                guests=4, nightly_price=320.0, service_fee=192.0,
                total_price=320.0 * 5 + 192.0, status="confirmed"),
        Booking(listing_id=4, guest_id=1, check_in="2026-08-25", check_out="2026-08-30",
                guests=6, nightly_price=450.0, service_fee=270.0,
                total_price=450.0 * 5 + 270.0, status="confirmed"),
        Booking(listing_id=5, guest_id=4, check_in="2026-09-05", check_out="2026-09-08",
                guests=2, nightly_price=165.0, service_fee=59.4,
                total_price=165.0 * 3 + 59.4, status="confirmed"),
    ]
    db.add_all(bookings)
    db.flush()

    # --- Reviews ---
    reviews = [
        Review(listing_id=1, user_id=1, rating=5, comment="Absolutely stunning beachfront location! The cottage was immaculate and the ocean views were breathtaking."),
        Review(listing_id=1, user_id=4, rating=4, comment="Beautiful property, great location. Kitchen could use some updating but overall a wonderful stay."),
        Review(listing_id=2, user_id=1, rating=5, comment="Perfect Manhattan loft! Loved the exposed brick and the neighborhood was incredible."),
        Review(listing_id=2, user_id=4, rating=4, comment="Great location and stylish apartment. A bit noisy at night but that's Manhattan for you!"),
        Review(listing_id=3, user_id=1, rating=5, comment="The mountain cabin exceeded all expectations. The hot tub under the stars was magical."),
        Review(listing_id=3, user_id=4, rating=5, comment="Best ski trip ever! The cabin was warm, cozy, and perfectly located near the slopes."),
        Review(listing_id=4, user_id=1, rating=5, comment="This villa is pure luxury. The infinity pool with bay views is worth every penny."),
        Review(listing_id=4, user_id=4, rating=4, comment="Incredible property. The kitchen was amazing for cooking. Would definitely return."),
        Review(listing_id=5, user_id=1, rating=4, comment="Cute studio with amazing Golden Gate views. Compact but has everything you need."),
        Review(listing_id=5, user_id=4, rating=4, comment="Great location in the Marina District. Easy access to everything. Loved it!"),
        Review(listing_id=6, user_id=1, rating=5, comment="The desert retreat was absolutely magical. Sunsets from the pool were unforgettable."),
        Review(listing_id=6, user_id=4, rating=4, comment="Beautiful property with great desert vibes. The outdoor shower was a unique touch."),
        Review(listing_id=7, user_id=1, rating=5, comment="Sleeping in a treehouse was a dream come true! So peaceful and the hot tub was a bonus."),
        Review(listing_id=7, user_id=4, rating=5, comment="Truly unique experience. The stargazing through the skylights was incredible."),
        Review(listing_id=8, user_id=1, rating=4, comment="Elegant brownstone in a perfect Back Bay location. Very walkable neighborhood."),
        Review(listing_id=8, user_id=4, rating=4, comment="Loved the historic charm and modern amenities. Newbury Street is just steps away."),
        Review(listing_id=9, user_id=1, rating=5, comment="Lake Tahoe cabin was perfect. The private dock and kayaks made the trip special."),
        Review(listing_id=9, user_id=4, rating=5, comment="Stunning lakefront location. We spent every morning on the porch with coffee and lake views."),
        Review(listing_id=10, user_id=1, rating=5, comment="The penthouse views of Lake Michigan are unbelievable. Top-notch luxury in every detail."),
        Review(listing_id=10, user_id=4, rating=4, comment="Amazing skyline views and great rooftop terrace. Would have loved a hot tub up there!"),
    ]
    db.add_all(reviews)
    db.flush()

    # --- Favorites ---
    favorites = [
        Favorite(user_id=1, listing_id=3),
        Favorite(user_id=1, listing_id=4),
        Favorite(user_id=1, listing_id=7),
        Favorite(user_id=4, listing_id=1),
        Favorite(user_id=4, listing_id=9),
    ]
    db.add_all(favorites)

    db.commit()
    print("[OK] Database seeded successfully!")
