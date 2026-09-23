from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent

DEFAULT_SECRET = "change-me"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
    )

    app_env: Literal["dev", "prod"] = "dev"
    app_name: str = "LibreInmuebles"

    database_url: str = "sqlite:///./libreinmuebles.db"

    secret_key: str = DEFAULT_SECRET
    jwt_algorithm: Literal["HS256"] = "HS256"
    access_token_expire_minutes: int = 720

    cors_origins: str = "http://localhost:5173"

    upload_dir: str = "uploads"
    max_upload_mb: int = 8
    max_image_pixels_side: int = 8000

    staff_emails: str = ""
    frontend_url: str = "http://localhost:5173"

    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = ""
    smtp_tls: bool = True

    rate_limit_enabled: bool = False
    rate_limit_login_per_minute: int = 10
    rate_limit_register_per_minute: int = 5

    log_level: str = "INFO"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def staff_emails_list(self) -> list[str]:
        return [email.strip().lower() for email in self.staff_emails.split(",") if email.strip()]

    @property
    def database_url_resolved(self) -> str:
        """SQLite relativo -> absoluto respecto de backend/; Postgres pasa igual."""
        url = self.database_url
        if url.startswith("sqlite:///"):
            relative = url.removeprefix("sqlite:///")
            if not Path(relative).is_absolute():
                return f"sqlite:///{(BACKEND_DIR / relative).as_posix()}"
            return url
        if url.startswith("postgresql://"):
            # Railway expone 'postgresql://...' pero SQLAlchemy necesita el driver psycopg explícito.
            return url.replace("postgresql://", "postgresql+psycopg://", 1)
        return url

    @property
    def upload_dir_resolved(self) -> Path:
        path = Path(self.upload_dir)
        return path if path.is_absolute() else BACKEND_DIR / path

    @model_validator(mode="after")
    def _validate_production_security(self) -> "Settings":
        if self.app_env == "prod":
            if not self.secret_key or self.secret_key == DEFAULT_SECRET or len(self.secret_key) < 32:
                raise ValueError(
                    "SECRET_KEY no es segura. En producción usá una clave de al menos 32 caracteres "
                    "(generala con: python -c \"import secrets; print(secrets.token_urlsafe(64))\")."
                )
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()