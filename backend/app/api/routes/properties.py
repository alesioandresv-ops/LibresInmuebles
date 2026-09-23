from decimal import Decimal

from fastapi import APIRouter, Depends, File, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_optional_current_user
from app.core.database import get_db
from app.models import Property, User
from app.models.enums import OperationType, PropertyStatus, PropertyType
from app.repositories.property_repository import PropertySearchParams
from app.schemas.property import (
    Paginated,
    PropertyCardOut,
    PropertyContactOut,
    PropertyCreate,
    PropertyDetailedOut,
    PropertyImageOut,
    PropertyUpdate,
    StatusUpdate,
)
from app.services.property_service import PropertyService

router = APIRouter(prefix="/properties", tags=["properties"])


def _card(item: Property) -> PropertyCardOut:
    primary = next((img for img in item.images if img.is_primary), None)
    return PropertyCardOut(
        id=item.id,
        title=item.title,
        price=item.price,
        currency=item.currency,
        operation_type=item.operation_type,
        property_type=item.property_type,
        status=item.status,
        neighborhood=item.neighborhood,
        surface_m2=item.surface_m2,
        bedrooms=item.bedrooms,
        bathrooms=item.bathrooms,
        primary_image_url=primary.url if primary else None,
        owner_id=item.owner_id,
        created_at=item.created_at,
    )


def _to_detailed(item: Property, current: User | None, include_contact: bool) -> PropertyDetailedOut:
    data = PropertyDetailedOut(
        id=item.id,
        owner_id=item.owner_id,
        owner=item.owner,
        operation_type=item.operation_type,
        property_type=item.property_type,
        status=item.status,
        title=item.title,
        description=item.description,
        price=item.price,
        currency=item.currency,
        monthly_fees=item.monthly_fees,
        bedrooms=item.bedrooms,
        bathrooms=item.bathrooms,
        surface_m2=item.surface_m2,
        neighborhood=item.neighborhood,
        address=item.address,
        latitude=item.latitude,
        longitude=item.longitude,
        has_water=item.has_water,
        has_electricity=item.has_electricity,
        has_sewage=item.has_sewage,
        has_gas=item.has_gas,
        has_internet=item.has_internet,
        images=item.images,
        created_at=item.created_at,
        updated_at=item.updated_at,
    )
    if include_contact and current is not None:
        data.contact = PropertyContactOut(
            email=item.owner.email,
            phone=item.owner.phone,
            whatsapp=item.contact_whatsapp,
            allow_whatsapp=item.allow_whatsapp,
        )
    return data


@router.get("", response_model=Paginated[PropertyCardOut], summary="Feed de propiedades con filtros")
def search_properties(
    operation_type: OperationType | None = None,
    property_type: PropertyType | None = None,
    neighborhood: str | None = None,
    status: PropertyStatus | None = None,
    price_min: Decimal | None = None,
    price_max: Decimal | None = None,
    currency: str | None = None,
    bedrooms: int | None = Query(default=None, ge=0),
    bathrooms: int | None = Query(default=None, ge=0),
    has_water: bool | None = None,
    has_electricity: bool | None = None,
    has_sewage: bool | None = None,
    has_gas: bool | None = None,
    has_internet: bool | None = None,
    sort: str = Query(default="newest", pattern="^(newest|price_asc|price_desc)$"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=50),
    db: Session = Depends(get_db),
) -> Paginated[PropertyCardOut]:
    params = PropertySearchParams(
        operation_type=operation_type,
        property_type=property_type,
        neighborhood=neighborhood,
        status=status,
        price_min=price_min,
        price_max=price_max,
        currency=currency,
        bedrooms=bedrooms,
        bathrooms=bathrooms,
        has_water=has_water,
        has_electricity=has_electricity,
        has_sewage=has_sewage,
        has_gas=has_gas,
        has_internet=has_internet,
        sort=sort,
        page=page,
        limit=limit,
    )
    items, total = PropertyService(db).search(params)
    return Paginated(
        items=[_card(i) for i in items],
        total=total,
        page=page,
        limit=limit,
        total_pages=(total + limit - 1) // limit if total else 0,
    )


@router.get("/mine", response_model=list[PropertyDetailedOut], summary="Mis publicaciones")
def my_properties(
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[PropertyDetailedOut]:
    return [
        _to_detailed(item, current, include_contact=True)
        for item in PropertyService(db).mine(current)
    ]


@router.get("/{property_id}", response_model=PropertyDetailedOut, summary="Detalle de propiedad")
def get_property(
    property_id: int,
    current: User | None = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
) -> PropertyDetailedOut:
    service = PropertyService(db)
    item = service._get_or_404(property_id)
    include_contact = current is not None
    return _to_detailed(item, current, include_contact)


@router.post("", response_model=PropertyDetailedOut, status_code=status.HTTP_201_CREATED, summary="Publicar propiedad")
def create_property(
    data: PropertyCreate,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PropertyDetailedOut:
    item = PropertyService(db).create(current, data)
    return _to_detailed(item, current, include_contact=True)


@router.put("/{property_id}", response_model=PropertyDetailedOut, summary="Editar propiedad")
def update_property(
    property_id: int,
    data: PropertyUpdate,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PropertyDetailedOut:
    item = PropertyService(db).update(current, property_id, data)
    return _to_detailed(item, current, include_contact=True)


@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Eliminar propiedad")
def delete_property(
    property_id: int,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    PropertyService(db).delete(current, property_id)


@router.patch("/{property_id}/status", response_model=PropertyDetailedOut, summary="Cambiar estado de la propiedad")
def change_status(
    property_id: int,
    data: StatusUpdate,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PropertyDetailedOut:
    item = PropertyService(db).change_status(current, property_id, data.status)
    return _to_detailed(item, current, include_contact=True)


@router.post(
    "/{property_id}/images",
    response_model=PropertyImageOut,
    status_code=status.HTTP_201_CREATED,
    summary="Subir imagen a la galería",
)
def upload_image(
    property_id: int,
    file: UploadFile = File(...),
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PropertyImageOut:
    image = PropertyService(db).add_image(current, property_id, file)
    return PropertyImageOut.model_validate(image)


@router.put(
    "/{property_id}/images/{image_id}/primary",
    response_model=PropertyImageOut,
    summary="Marcar imagen como principal",
)
def set_primary_image(
    property_id: int,
    image_id: int,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PropertyImageOut:
    image = PropertyService(db).set_primary(current, property_id, image_id)
    return PropertyImageOut.model_validate(image)


@router.delete(
    "/{property_id}/images/{image_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar imagen",
)
def delete_image(
    property_id: int,
    image_id: int,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    PropertyService(db).remove_image(current, property_id, image_id)