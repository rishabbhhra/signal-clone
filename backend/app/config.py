import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseSettings):
    PROJECT_NAME: str = "Signal Clone API"
    SECRET_KEY: str = "signal-super-secure-secret-key-2026-very-confidential"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    DATABASE_URL: str = f"sqlite+aiosqlite:///{BASE_DIR}/signal.db"
    UPLOAD_DIR: Path = UPLOAD_DIR
    FIXED_OTP: str = "123456"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
