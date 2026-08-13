import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Fallback to /tmp/airbnb.db on Vercel serverless read-only filesystem
DEFAULT_DB = "/tmp/airbnb.db" if os.getenv("VERCEL") else "./airbnb.db"
DB_URL_ENV = os.getenv("DATABASE_URL", DEFAULT_DB)

if DB_URL_ENV.startswith("postgres"):
    SQLALCHEMY_DATABASE_URL = DB_URL_ENV.replace("postgres://", "postgresql://", 1)
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
else:
    if not DB_URL_ENV.startswith("sqlite"):
        SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_URL_ENV}"
    else:
        SQLALCHEMY_DATABASE_URL = DB_URL_ENV
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    from models import Base as ModelsBase
    ModelsBase.metadata.create_all(bind=engine)
    from seed import seed_data
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
