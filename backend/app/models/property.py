from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import (
    OperationType,
    PropertyCurrency,
    PropertyStatus,
    PropertyType,
)


class Property(Base):
    __tablename__ = "properties"

    id: Mapped[int] = mapped_column(primary_key=True)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    operation_type: Mapped[OperationType] = mapped_column(
        Enum(OperationType, values_callable=lambda e: [m.value for m in e], name="operation_type"), nullable=False
    )
    property_type: Mapped[PropertyType] = mapped_column(
        Enum(PropertyType, values_callable=lambda e: [m.value for m in e], name="property_type"), nullable=False
    )
    status: Mapped[PropertyStatus] = mapped_column(
        Enum(PropertyStatus, values_callable=lambda e: [m.value for m in e], name="property_status"),
        nullable=False,
        default=PropertyStatus.AVAILABLE,
    )

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, index=True)
    currency: Mapped[PropertyCurrency] = mapped_column(
        Enum(PropertyCurrency, values_callable=lambda e: [m.value for m in e], name="property_currency"),
        nullable=False,
        default=PropertyCurrency.ARS,
    )
    monthly_fees: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))

    bedrooms: Mapped[int | None] = mapped_column(default=0)
    bathrooms: Mapped[int | None] = mapped_column(default=0)
    surface_m2: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))

    neighborhood: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    address: Mapped[str] = mapped_column(String(255), nullable=False)
    latitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6))
    longitude: Mapped[Decimal | None] = mapped_column(Numeric(9, 6))

    has_water: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    has_electricity: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    has_sewage: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    has_gas: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    has_internet: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    contact_whatsapp: Mapped[str | None] = mapped_column(String(30))
    allow_whatsapp: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False, index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    owner: Mapped["User"] = relationship(back_populates="properties")
    images: Mapped[list["PropertyImage"]] = relationship(
        back_populates="property", cascade="all, delete-orphan", order_by="PropertyImage.orden"
    )
    reports: Mapped[list["Report"]] = relationship(back_populates="property", cascade="all, delete-orphan")
    inquiries: Mapped[list["Inquiry"]] = relationship(back_populates="property", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("price >= 0", name="ck_properties_price_non_negative"),
        CheckConstraint("monthly_fees IS NULL OR monthly_fees >= 0", name="ck_properties_fees_non_negative"),
        CheckConstraint("bedrooms >= 0", name="ck_properties_bedrooms_non_negative"),
        CheckConstraint("bathrooms >= 0", name="ck_properties_bathrooms_non_negative"),
        CheckConstraint("surface_m2 IS NULL OR surface_m2 > 0", name="ck_properties_surface_positive"),
        CheckConstraint("length(title) >= 3", name="ck_properties_title_min_length"),
        CheckConstraint("length(description) >= 10", name="ck_properties_description_min_length"),
        Index("ix_properties_search", "status", "operation_type", "property_type"),
    )