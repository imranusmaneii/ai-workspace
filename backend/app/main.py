import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import get_settings
from app.core.database import engine
from app.api.v1.router import api_router
from app.models.user import Base
from app.models import workspace, chat, message, document, memory, verification
import sqlalchemy

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)
logger = logging.getLogger("noir_ai")

settings = get_settings()


async def _migrate_columns(conn):
    try:
        await conn.execute(sqlalchemy.text(
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE"
        ))
    except Exception:
        pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Noir AI backend...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await _migrate_columns(conn)
    logger.info("Database initialized")

    from app.llm.registry import get_provider
    for name in ["gemini", "openai", "openrouter"]:
        try:
            get_provider(name)
            logger.info(f"Provider '{name}' initialized OK")
        except Exception as e:
            logger.warning(f"Provider '{name}' unavailable: {e}")

    yield
    logger.info("Shutting down Noir AI backend")


app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.APP_CORS_ORIGINS.split(",") + [
        "https://ai-workspace-green.vercel.app",
        "https://ai-workspace.vercel.app",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "ok"}
