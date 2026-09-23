from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.api.ratelimit import rate_allow
from app.core.config import get_settings
from app.core.database import get_db
from app.core.exceptions import RateLimitError
from app.models import User
from app.schemas.auth import (
    ForgotPasswordRequest,
    ResetPasswordRequest,
    TokenOut,
    UserLogin,
    UserOut,
    UserRegister,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


def _enforce(identity: str, limit: int) -> None:
    settings = get_settings()
    if settings.rate_limit_enabled and not rate_allow(identity, limit):
        raise RateLimitError()


@router.post(
    "/register",
    response_model=TokenOut,
    status_code=status.HTTP_201_CREATED,
    summary="Registro de usuario (Dueño Directo o Buscador)",
)
def register(
    data: UserRegister,
    request: Request,
    db: Session = Depends(get_db),
) -> TokenOut:
    ip = request.client.host if request.client else "desconocido"
    _enforce(f"register:{ip}", get_settings().rate_limit_register_per_minute)
    user = AuthService(db).register(data)
    token = AuthService(db).login(UserLogin(email=data.email, password=data.password))
    return TokenOut(access_token=token, user=UserOut.model_validate(user))


@router.post("/login", response_model=TokenOut, summary="Inicio de sesión y emisión de JWT")
def login(
    data: UserLogin,
    request: Request,
    db: Session = Depends(get_db),
) -> TokenOut:
    ip = request.client.host if request.client else "desconocido"
    settings = get_settings()
    _enforce(f"login:{ip}", settings.rate_limit_login_per_minute)
    _enforce(f"login:{ip}:{data.email}", max(1, settings.rate_limit_login_per_minute // 2))
    service = AuthService(db)
    token = service.login(data)
    user = service.repo.get_by_email(data.email)
    return TokenOut(access_token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut, summary="Datos del usuario autenticado")
def me(current: User = Depends(get_current_user)) -> UserOut:
    return UserOut.model_validate(current)


@router.post("/forgot-password", summary="Solicitar enlace de restablecimiento de contraseña")
def forgot_password(
    data: ForgotPasswordRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> dict:
    ip = request.client.host if request.client else "desconocido"
    settings = get_settings()
    _enforce(f"forgot:{ip}", max(1, settings.rate_limit_register_per_minute))
    _enforce(f"forgot:{ip}:{data.email}", 3)
    AuthService(db).request_password_reset(data.email)
    return {"detail": "Si el email está registrado, enviamos un enlace para restablecer tu contraseña."}


@router.post(
    "/reset-password",
    response_model=UserOut,
    summary="Restablecer contraseña con el enlace recibido por email",
)
def reset_password(
    data: ResetPasswordRequest,
    request: Request,
    db: Session = Depends(get_db),
) -> UserOut:
    ip = request.client.host if request.client else "desconocido"
    _enforce(f"reset:{ip}", max(1, get_settings().rate_limit_register_per_minute))
    user = AuthService(db).reset_password(data.token, data.new_password)
    return UserOut.model_validate(user)