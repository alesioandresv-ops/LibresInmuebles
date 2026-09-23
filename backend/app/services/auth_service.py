from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.exceptions import BadRequestError, ConflictError, PermissionDeniedError
from app.core.security import (
    create_access_token,
    create_password_reset_token,
    decode_access_token,
    hash_password,
    password_fingerprint,
    verify_password,
)
from app.models import User
from app.models.enums import UserRole
from app.repositories.user_repository import UserRepository
from app.schemas.auth import UserLogin, UserRegister
from app.services.email_service import send_email


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = UserRepository(db)

    def register(self, data: UserRegister) -> User:
        if data.role == UserRole.OWNER and not data.declaration_titular:
            raise BadRequestError(
                "Para registrarte como Dueño Directo debés declarar que sos titular o poseedor directo del inmueble "
                "(no intermediario inmobiliario)."
            )
        if self.repo.get_by_email(data.email) is not None:
            raise ConflictError("Ya existe un usuario con ese email.")
        try:
            return self.repo.create(
                email=data.email,
                password_hash=hash_password(data.password),
                first_name=data.first_name,
                last_name=data.last_name,
                role=data.role,
                declaration_titular=bool(data.declaration_titular),
                is_staff=data.email in get_settings().staff_emails_list,
                phone=data.phone,
                whatsapp=data.whatsapp,
            )
        except IntegrityError:
            self.db.rollback()
            raise ConflictError("Ya existe un usuario con ese email.")

    def login(self, data: UserLogin) -> str:
        user = self.repo.get_by_email(data.email)
        if user is None or not verify_password(data.password, user.password_hash):
            self._fail()
        if not user.is_active:
            raise PermissionDeniedError("Tu cuenta está desactivada.")
        return create_access_token(
            str(user.id), user.role.value, password_fingerprint(user.password_hash)
        )

    def request_password_reset(self, email: str) -> None:
        """Envía el enlace de recuperación. No revela si el email existe (anti-enumeración)."""
        user = self.repo.get_by_email(email)
        if user is None or not user.is_active:
            return
        token = create_password_reset_token(user.id)
        site = get_settings().frontend_url.rstrip("/")
        url = f"{site}/restablecer-clave?token={token}"
        send_email(
            to=user.email,
            subject="Restablecé tu contraseña en LibreInmuebles",
            text=(
                f"Hola {user.first_name},\n\n"
                "Recibimos una solicitud para restablecer tu contraseña.\n"
                f"Entrá a este enlace (válido por 15 minutos): {url}\n\n"
                "Si no pediste esto, ignorá este correo.\n"
                "— LibreInmuebles"
            ),
            html=(
                "<p>Hola <strong>{}</strong>,</p>"
                "<p>Recibimos una solicitud para restablecer tu contraseña.</p>"
                '<p><a href="{}">Restablecer contraseña</a> (enlace válido por 15 minutos).</p>'
                "<p>Si no pediste esto, ignorá este correo.</p>"
                "<p>— LibreInmuebles</p>"
            ).format(user.first_name, url),
        )

    def reset_password(self, token: str, new_password: str) -> User:
        try:
            payload = decode_access_token(token, expected_type="password_reset")
            user_id = int(payload.get("sub"))
        except (PermissionDeniedError, TypeError, ValueError):
            raise BadRequestError("El enlace no es válido o ya caducó. Pedí uno nuevo.")
        user = self.repo.get_by_id(user_id)
        if user is None or not user.is_active:
            raise BadRequestError("El enlace no es válido o ya caducó. Pedí uno nuevo.")
        user.password_hash = hash_password(new_password)
        self.db.commit()
        self.db.refresh(user)
        return user

    @staticmethod
    def _fail() -> None:
        raise PermissionDeniedError("Email o contraseña incorrectos.")