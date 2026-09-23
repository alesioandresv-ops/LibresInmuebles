from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, DateTime, Enum, false, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import UserRole


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(30))
    whatsapp: Mapped[str | None] = mapped_column(String(30))
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, values_callable=lambda e: [m.value for m in e], name="user_role"),
        nullable=False,
        default=UserRole.SEEKER,
    )
    declaration_titular: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, doc="Declaración jurada de titular/poseedor directo (anti-agencia)"
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    is_staff: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default=false(),
        doc="Moderador del sistema (revisa reportes).",
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    properties: Mapped[list["Property"]] = relationship(back_populates="owner")
    sent_inquiries: Mapped[list["Inquiry"]] = relationship(back_populates="sender")
    reports_made: Mapped[list["Report"]] = relationship(back_populates="reporter")

    __table_args__ = (
        CheckConstraint("length(email) > 3", name="ck_users_email_min_length"),
        CheckConstraint("length(first_name) > 0", name="ck_users_first_name_not_empty"),
        CheckConstraint("length(last_name) > 0", name="ck_users_last_name_not_empty"),
    )