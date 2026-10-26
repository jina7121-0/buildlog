from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.core.config import get_settings


settings = get_settings()

app = FastAPI(
    title="BuildLog API",
    version="0.1.0",
    description="BuildLog 프론트엔드가 사용하는 FastAPI 백엔드입니다.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class HealthResponse(BaseModel):
    status: str
    service: str
    timezone: str


@app.get("/api/health", response_model=HealthResponse, tags=["system"])
def health_check() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="BuildLog API",
        timezone=settings.app_timezone,
    )
