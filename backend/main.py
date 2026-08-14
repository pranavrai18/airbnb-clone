import os
import asyncio
import httpx
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routers import listings, bookings, users, favorites


async def keep_alive():
    """Self-ping every 14 minutes to prevent Render free tier from sleeping."""
    render_url = os.getenv("RENDER_EXTERNAL_URL")
    if not render_url:
        return  # Skip on local development
    ping_url = f"{render_url}/health"
    async with httpx.AsyncClient() as client:
        while True:
            await asyncio.sleep(840)  # 14 minutes
            try:
                await client.get(ping_url, timeout=10)
                print(f"[keep-alive] pinged {ping_url}")
            except Exception as e:
                print(f"[keep-alive] ping failed: {e}")


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    task = asyncio.create_task(keep_alive())
    yield
    task.cancel()


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


@app.get("/health")
def health():
    return {"status": "ok"}