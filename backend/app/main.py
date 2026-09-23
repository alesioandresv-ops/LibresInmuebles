import logging
import sys
from pathlib import Path

# Permite ejecutar el proyecto desde cualquier directorio:
#   python backend/app/main.py   (o bien uvicorn app.main:app dentro de backend/)
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import auth, communication, health, legal, moderation, properties
from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers


def _configure_logging() -> None:
    settings = get_settings()
    logging.basicConfig(
        level=getattr(logging, settings.log_level.upper(), logging.INFO),
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )


def create_app() -> FastAPI:
    settings = get_settings()
    _configure_logging()

    docs_kwargs = (
        {"docs_url": None, "redoc_url": None, "openapi_url": None}
        if settings.app_env == "prod"
        else {}
    )
    app = FastAPI(
        title="LibreInmuebles API",
        description="Marketplace P2P 'Dueño Directo' — Paso de los Libres, Corrientes.",
        version="0.8.0",
        **docs_kwargs,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_exception_handlers(app)

    upload_dir = settings.upload_dir_resolved
    upload_dir.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

    app.include_router(auth.router)
    app.include_router(properties.router)
    app.include_router(communication.router)
    app.include_router(moderation.router)
    app.include_router(legal.router)
    app.include_router(health.router)

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)