from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.exceptions import ForbiddenError, PermissionDeniedError
from app.core.security import decode_access_token, password_fingerprint
from app.models import User
from app.repositories.user_repository import UserRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


def _user_from_token(token: str, db: Session) -> User | None:
    payload = decode_access_token(token, expected_type="access")
    try:
        user_id = int(payload.get("sub"))
    except (TypeError, ValueError):
        raise PermissionDeniedError("Token inválido.")
    user = UserRepository(db).get_by_id(user_id)
    if user is None:
        raise PermissionDeniedError("Usuario inválido o desactivado.")
    if password_fingerprint(user.password_hash) != payload.get("pf"):
        raise PermissionDeniedError("Sesión expirada, volvé a iniciar sesión.")
    return user


def get_current_user(token: str | None = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    if token is None:
        raise PermissionDeniedError("No autenticado.")
    user = _user_from_token(token, db)
    if user is None or not user.is_active:
        raise PermissionDeniedError("Usuario inválido o desactivado.")
    return user


def get_optional_current_user(
    token: str | None = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User | None:
    """Para endpoints públicos que mejoran la respuesta si hay sesión activa (ej. detalle)."""
    if token is None:
        return None
    try:
        user = _user_from_token(token, db)
    except PermissionDeniedError:
        return None
    return user if user is not None and user.is_active else None


def get_current_staff(token: str | None = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    user = get_current_user(token, db)
    if not user.is_staff:
        raise ForbiddenError("Necesitás permisos de moderación.")
    return user