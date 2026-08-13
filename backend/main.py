from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routers import listings, bookings, users, favorites


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(title="Airbnb Clone API", lifespan=lifespan)

# Allow CORS for Next.js frontend on local and Vercel deployments
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(listings.router)
app.include_router(bookings.router)
app.include_router(users.router)
app.include_router(favorites.router)


@app.get("/")
def root():
    return {"message": "Airbnb Clone API is running"}