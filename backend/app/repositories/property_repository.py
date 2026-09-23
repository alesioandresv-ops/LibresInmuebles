from decimal import Decimal

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models import Property, PropertyImage, PropertyStatus
from app.models.enums import OperationType, PropertyType


class PropertySearchParams:
    def __init__(
        self,
        operation_type: OperationType | None = None,
        property_type: PropertyType | None = None,
        neighborhood: str | None = None,
        status: PropertyStatus | None = None,
        price_min: Decimal | None = None,
        price_max: Decimal | None = None,
        currency: str | None = None,
        bedrooms: int | None = None,
        bathrooms: int | None = None,
        has_water: bool | None = None,
        has_electricity: bool | None = None,
        has_sewage: bool | None = None,
        has_gas: bool | None = None,
        has_internet: bool | None = None,
        sort: str = "newest",
        page: int = 1,
        limit: int = 20,
    ):
        self.operation_type = operation_type
        self.property_type = property_type
        self.neighborhood = neighborhood
        self.status = status
        self.price_min = price_min
        self.price_max = price_max
        self.currency = currency
        self.bedrooms = bedrooms
        self.bathrooms = bathrooms
        self.has_water = has_water
        self.has_electricity = has_electricity
        self.has_sewage = has_sewage
        self.has_gas = has_gas
        self.has_internet = has_internet
        self.sort = sort
        self.page = page
        self.limit = limit


class PropertyRepository:
    def __init__(self, db: Session):
        self.db = db

    @staticmethod
    def _apply_filters(stmt, p: PropertySearchParams):
        if p.operation_type:
            stmt = stmt.where(Property.operation_type == p.operation_type)
        if p.property_type:
            stmt = stmt.where(Property.property_type == p.property_type)
        if p.neighborhood:
            stmt = stmt.where(Property.neighborhood == p.neighborhood)
        if p.status:
            stmt = stmt.where(Property.status == p.status)
        elif p.status is None:
            stmt = stmt.where(Property.status != PropertyStatus.FINISHED)
        if p.price_min is not None:
            stmt = stmt.where(Property.price >= p.price_min)
        if p.price_max is not None:
            stmt = stmt.where(Property.price <= p.price_max)
        if p.currency:
            stmt = stmt.where(Property.currency == p.currency)
        if p.bedrooms is not None:
            if p.bedrooms == 0:
                stmt = stmt.where(or_(Property.bedrooms.is_(None), Property.bedrooms == 0))
            else:
                stmt = stmt.where(Property.bedrooms >= p.bedrooms)
        if p.bathrooms is not None:
            if p.bathrooms == 0:
                stmt = stmt.where(or_(Property.bathrooms.is_(None), Property.bathrooms == 0))
            else:
                stmt = stmt.where(Property.bathrooms >= p.bathrooms)
        if p.has_water is not None:
            stmt = stmt.where(Property.has_water == p.has_water)
        if p.has_electricity is not None:
            stmt = stmt.where(Property.has_electricity == p.has_electricity)
        if p.has_sewage is not None:
            stmt = stmt.where(Property.has_sewage == p.has_sewage)
        if p.has_gas is not None:
            stmt = stmt.where(Property.has_gas == p.has_gas)
        if p.has_internet is not None:
            stmt = stmt.where(Property.has_internet == p.has_internet)
        return stmt

    def search(self, p: PropertySearchParams) -> tuple[list[Property], int]:
        base = select(Property)
        base = self._apply_filters(base, p)
        total = self.db.execute(select(func.count()).select_from(base.subquery())).scalar_one()
        order_by = {
            "newest": (Property.created_at.desc(), Property.id.desc()),
            "price_asc": (Property.price.asc(), Property.id.desc()),
            "price_desc": (Property.price.desc(), Property.id.desc()),
        }
        order = order_by.get(p.sort, (Property.created_at.desc(), Property.id.desc()))
        stmt = (
            base.options(selectinload(Property.images))
            .order_by(*order)
            .offset((p.page - 1) * p.limit)
            .limit(p.limit)
        )
        items = list(self.db.execute(stmt).scalars().unique())
        return items, total

    def get_by_id(self, property_id: int, with_contact: bool = False):
        options = [joinedload(Property.owner), selectinload(Property.images)]
        return self.db.execute(
            select(Property).where(Property.id == property_id).options(*options)
        ).scalar_one_or_none()

    def get_image(self, property_id: int, image_id: int) -> PropertyImage | None:
        return self.db.execute(
            select(PropertyImage).where(
                PropertyImage.id == image_id, PropertyImage.property_id == property_id
            )
        ).scalar_one_or_none()

    def by_owner(self, owner_id: int) -> list[Property]:
        return list(
            self.db.execute(
                select(Property)
                .options(joinedload(Property.owner), selectinload(Property.images))
                .where(Property.owner_id == owner_id)
                .order_by(Property.created_at.desc(), Property.id.desc())
            ).scalars().unique()
        )

    def create(self, owner_id: int, payload: dict) -> Property:
        prop = Property(owner_id=owner_id, **payload)
        self.db.add(prop)
        self.db.commit()
        self.db.refresh(prop)
        return prop

    def update(self, prop: Property, payload: dict) -> Property:
        for key, value in payload.items():
            setattr(prop, key, value)
        self.db.commit()
        self.db.refresh(prop)
        return prop

    def delete(self, prop: Property) -> None:
        self.db.delete(prop)
        self.db.commit()