from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


REPOSITORY_ROOT = Path(__file__).resolve().parents[3]
DATABASE_PATH = REPOSITORY_ROOT / "database" / "buildlog.sqlite3"


class Settings(BaseSettings):
    app_env: str = "development"
    app_secret_key: str = "development-only-change-me-before-release"
    database_url: str = f"sqlite+pysqlite:///{DATABASE_PATH.as_posix()}"
    frontend_origin: str = "http://127.0.0.1:5173"
    app_timezone: str = "Asia/Seoul"
    cookie_secure: bool = False
    session_minutes: int = 480

    model_config = SettingsConfigDict(
        env_file=REPOSITORY_ROOT / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
