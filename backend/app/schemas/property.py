from datetime import datetime
from decimal import Decimal
from typing import Generic, Self, TypeVar

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.enums import (
    OperationType,
    PropertyCurrency,
    PropertyStatus,
    PropertyType,
)
from app.schemas.fields import AddressStr, DescriptionStr, NeighborhoodStr, TitleStr

T = TypeVar("T")


class PropertyImageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    url: str
    orden: int
    is_primary: bool


class OwnerBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: str
    last_name: str


class PropertyCardOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    price: Decimal
    currency: PropertyCurrency
    operation_type: OperationType
    property_type: PropertyType
    status: PropertyStatus
    neighborhood: str
    surface_m2: Decimal | None
    bedrooms: int | None
    bathrooms: int | None
    primary_image_url: str | None
    owner_id: int
    created_at: datetime


class PropertyDirectOut(BaseModel):
    """Propiedad sin datos de contacto (visitante anónimo)."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_id: int
    owner: OwnerBrief
    operation_type: OperationType
    property_type: PropertyType
    status: PropertyStatus
    title: str
    description: str
    price: Decimal
    currency: PropertyCurrency
    monthly_fees: Decimal | None
    bedrooms: int | None
    bathrooms: int | None
    surface_m2: Decimal | None
    neighborhood: str
    address: str
    latitude: Decimal | None
    longitude: Decimal | None
    has_water: bool
    has_electricity: bool
    has_sewage: bool
    has_gas: bool
    has_internet: bool
    images: list[PropertyImageOut]
    created_at: datetime | None = None
    updated_at: datetime | None = None


class PropertyContactOut(BaseModel):
    email: str
    phone: str | None = None
    whatsapp: str | None = None
    allow_whatsapp: bool


class PropertyDetailedOut(PropertyDirectOut):
    contact: PropertyContactOut | None = None


class PropertyCreate(BaseModel):
    operation_type: OperationType
    property_type: PropertyType
    title: TitleStr
    description: DescriptionStr
    price: Decimal = Field(ge=0, max_digits=12, decimal_places=2)
    currency: PropertyCurrency = PropertyCurrency.ARS
    monthly_fees: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    bedrooms: int | None = Field(default=0, ge=0)
    bathrooms: int | None = Field(default=0, ge=0)
    surface_m2: Decimal | None = Field(default=None, gt=0, max_digits=10, decimal_places=2)
    neighborhood: NeighborhoodStr
    address: AddressStr
    latitude: Decimal | None = Field(default=None, ge=-90, le=90, max_digits=9, decimal_places=6)
    longitude: Decimal | None = Field(default=None, ge=-180, le=180, max_digits=9, decimal_places=6)
    has_water: bool = False
    has_electricity: bool = False
    has_sewage: bool = False
    has_gas: bool = False
    has_internet: bool = False
    contact_whatsapp: str | None = Field(default=None, max_length=30)
    allow_whatsapp: bool = False


NULLABLE_UPDATE_FIELDS = {
    "monthly_fees",
    "bedrooms",
    "bathrooms",
    "surface_m2",
    "latitude",
    "longitude",
    "contact_whatsapp",
}


class PropertyUpdate(BaseModel):
    operation_type: OperationType | None = None
    property_type: PropertyType | None = None
    title: TitleStr | None = None
    description: DescriptionStr | None = None
    price: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    currency: PropertyCurrency | None = None
    monthly_fees: Decimal | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    bedrooms: int | None = Field(default=None, ge=0)
    bathrooms: int | None = Field(default=None, ge=0)
    surface_m2: Decimal | None = Field(default=None, gt=0, max_digits=10, decimal_places=2)
    neighborhood: NeighborhoodStr | None = None
    address: AddressStr | None = None
    latitude: Decimal | None = Field(default=None, ge=-90, le=90, max_digits=9, decimal_places=6)
    longitude: Decimal | None = Field(default=None, ge=-180, le=180, max_digits=9, decimal_places=6)
    has_water: bool | None = None
    has_electricity: bool | None = None
    has_sewage: bool | None = None
    has_gas: bool | None = None
    has_internet: bool | None = None
    status: PropertyStatus | None = None
    contact_whatsapp: str | None = Field(default=None, max_length=30)
    allow_whatsapp: bool | None = None

    @model_validator(mode="after")
    def _reject_explicit_nulls(self) -> Self:
        for name in self.model_fields_set:
            value = getattr(self, name)
            if value is None and name not in NULLABLE_UPDATE_FIELDS:
                raise ValueError(f"El campo '{name}' no puede ser nulo.")
        return self


class StatusUpdate(BaseModel):
    status: PropertyStatus


class Paginated(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    limit: int
    total_pages: int