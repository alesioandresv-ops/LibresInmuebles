from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.enums import UserRole
from app.schemas.fields import NameStr, NormalizedEmailStr, PhoneStr


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: NormalizedEmailStr
    first_name: str
    last_name: str
    phone: str | None = None
    whatsapp: str | None = None
    role: UserRole
    declaration_titular: bool
    is_active: bool
    is_staff: bool = False
    created_at: datetime


class UserRegister(BaseModel):
    email: NormalizedEmailStr
    password: str = Field(min_length=8, max_length=128)
    first_name: NameStr
    last_name: NameStr
    phone: PhoneStr = None
    whatsapp: PhoneStr = None
    role: UserRole = UserRole.SEEKER
    declaration_titular: bool | None = None

    @field_validator("password")
    @classmethod
    def _password_max_bytes(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("La contraseña no puede superar los 72 bytes (≈72 caracteres).")
        return value


class UserLogin(BaseModel):
    email: NormalizedEmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: NormalizedEmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=1)
    new_password: str = Field(min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def _password_max_bytes(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("La contraseña no puede superar los 72 bytes (≈72 caracteres).")
        return value


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut