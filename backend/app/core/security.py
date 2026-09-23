import bcrypt
import jwt
from datetime import datetime, timedelta, timezone

from app.core.config import get_settings
from app.core.exceptions import PermissionDeniedError

JWT_ALGORITHM = "HS256"
PASSWORD_RESET_EXPIRE_MINUTES = 15


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))


def password_fingerprint(password_hash: str) -> str:
    """Huella del hash actual: invalidar todos los JWT emitidos antes de un cambio de contraseña."""
    return password_hash[-16:]


def _create_token(subject: str, token_type: str, expires_minutes: int, **extra) -> str:
    settings = get_settings()
    now = datetime.now(timezone.utc)
    payload = {
        "sub": subject,
        "typ": token_type,
        "iat": now,
        "exp": now + timedelta(minutes=expires_minutes),
        **extra,
    }
    return jwt.encode(payload, settings.secret_key, algorithm=JWT_ALGORITHM)


def create_access_token(subject: str, role: str, fingerprint: str) -> str:
    return _create_token(
        subject,
        "access",
        get_settings().access_token_expire_minutes,
        role=role,
        pf=fingerprint,
    )


def create_password_reset_token(user_id: int) -> str:
    return _create_token(str(user_id), "password_reset", PASSWORD_RESET_EXPIRE_MINUTES)


def decode_access_token(token: str, expected_type: str | None = None) -> dict:
    if not token:
        raise PermissionDeniedError("Token inválido.")
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise PermissionDeniedError("Sesión expirada, volvé a iniciar sesión.")
    except jwt.InvalidTokenError:
        raise PermissionDeniedError("Token inválido.")
    if expected_type is not None and payload.get("typ") != expected_type:
        raise PermissionDeniedError("Token inválido.")
    return payload