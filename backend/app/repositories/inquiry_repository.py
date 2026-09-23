from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.models import Inquiry, Property


class InquiryRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, sender_id: int, property_id: int, message: str) -> Inquiry:
        inquiry = Inquiry(sender_id=sender_id, property_id=property_id, message=message)
        self.db.add(inquiry)
        self.db.commit()
        self.db.refresh(inquiry)
        return inquiry

    def get(self, inquiry_id: int) -> Inquiry | None:
        return self.db.get(Inquiry, inquiry_id)

    def inbox(self, owner_id: int, page: int, limit: int) -> tuple[list[Inquiry], int]:
        """Consultas sobre las propiedades del dueño."""
        stmt = (
            select(Inquiry)
            .join(Property, Property.id == Inquiry.property_id)
            .where(Property.owner_id == owner_id)
        )
        total = self.db.scalar(select(func.count()).select_from(Inquiry).join(Property).where(Property.owner_id == owner_id))
        items = list(
            self.db.scalars(
                stmt.options(
                    joinedload(Inquiry.property).joinedload(Property.owner),
                    joinedload(Inquiry.sender),
                )
                .order_by(Inquiry.created_at.desc(), Inquiry.id.desc())
                .offset((page - 1) * limit)
                .limit(limit)
            )
        )
        return items, total or 0

    def sent(self, sender_id: int, page: int, limit: int) -> tuple[list[Inquiry], int]:
        stmt = select(Inquiry).where(Inquiry.sender_id == sender_id)
        total = self.db.scalar(
            select(func.count()).select_from(Inquiry).where(Inquiry.sender_id == sender_id)
        )
        items = list(
            self.db.scalars(
                stmt.options(
                    joinedload(Inquiry.property).joinedload(Property.owner),
                    joinedload(Inquiry.sender),
                )
                .order_by(Inquiry.created_at.desc(), Inquiry.id.desc())
                .offset((page - 1) * limit)
                .limit(limit)
            )
        )
        return items, total or 0

    def unread_count(self, owner_id: int) -> int:
        count = self.db.scalar(
            select(func.count())
            .select_from(Inquiry)
            .join(Property, Property.id == Inquiry.property_id)
            .where(Property.owner_id == owner_id, Inquiry.is_read.is_(False))
        )
        return count or 0

    def mark_as_read(self, inquiry: Inquiry) -> Inquiry:
        inquiry.is_read = True
        self.db.commit()
        self.db.refresh(inquiry)
        return inquiry