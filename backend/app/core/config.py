from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


REPOSITORY_ROOT = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    app_env: str = "development"
    app_secret_key: str = "development-only-change-me"
    database_url: str = "sqlite+pysqlite:///./database/buildlog.sqlite3"
    frontend_origin: str = "http://127.0.0.1:5173"
    app_timezone: str = "Asia/Seoul"
    cookie_secure: bool = False

    model_config = SettingsConfigDict(
        env_file=REPOSITORY_ROOT / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
