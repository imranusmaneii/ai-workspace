from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    APP_NAME: str = "AI Workspace"
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    APP_CORS_ORIGINS: str = "http://localhost:3000"

    DATABASE_URL: str

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""
    OLLAMA_BASE_URL: str = "http://localhost:11434"

    CHROMA_HOST: str = ""
    CHROMA_PORT: int = 8001
    CHROMA_COLLECTION: str = "ai_workspace"

    RESEND_API_KEY: str = ""
    EMAIL_FROM: str = "Noir AI <onboarding@resend.dev>"

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache
def get_settings() -> Settings:
    return Settings()
