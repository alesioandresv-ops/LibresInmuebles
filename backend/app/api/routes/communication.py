from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models import Inquiry, User
from app.schemas.communication import (
    InquiryCreate,
    InquiryOut,
    InquiryOwnerOut,
    ReportCreate,
    ReportOut,
)
from app.schemas.property import Paginated
from app.services.communication_service import CommunicationService

router = APIRouter(tags=["communication"])


def _inquiry_out(inquiry: Inquiry) -> InquiryOut:
    image = next((img for img in inquiry.property.images if img.is_primary), None)
    owner = inquiry.property.owner
    return InquiryOut(
        id=inquiry.id,
        property_id=inquiry.property_id,
        property_title=inquiry.property.title,
        property_image=image.url if image else None,
        sender_id=inquiry.sender_id,
        sender=inquiry.sender,
        message=inquiry.message,
        is_read=inquiry.is_read,
        created_at=inquiry.created_at,
        recipient_email=owner.email,
        recipient_phone=owner.phone,
        recipient_first_name=owner.first_name,
        recipient_last_name=owner.last_name,
    )


def _inquiry_owner_out(inquiry: Inquiry) -> InquiryOwnerOut:
    out = _inquiry_out(inquiry).model_dump()
    return InquiryOwnerOut(
        **out,
        sender_email=inquiry.sender.email,
        sender_phone=inquiry.sender.phone,
    )


def _paginated(items, total, page, limit) -> Paginated:
    return Paginated(
        items=items,
        total=total,
        page=page,
        limit=limit,
        total_pages=(total + limit - 1) // limit if total else 0,
    )


@router.post("/inquiries", response_model=InquiryOut, status_code=status.HTTP_201_CREATED, summary="Enviar consulta al dueño")
def create_inquiry(
    data: InquiryCreate,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> InquiryOut:
    inquiry = CommunicationService(db).create_inquiry(current, data)
    return _inquiry_out(inquiry)


@router.get("/inquiries/inbox", response_model=Paginated[InquiryOwnerOut], summary="Consultas recibidas (dueño)")
def inquiry_inbox(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=50),
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Paginated[InquiryOwnerOut]:
    items, total = CommunicationService(db).inbox(current, page, limit)
    return _paginated([_inquiry_owner_out(i) for i in items], total, page, limit)


@router.get("/inquiries/sent", response_model=Paginated[InquiryOut], summary="Consultas que envié")
def inquiry_sent(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=50),
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Paginated[InquiryOut]:
    items, total = CommunicationService(db).sent(current, page, limit)
    return _paginated([_inquiry_out(i) for i in items], total, page, limit)


@router.get("/inquiries/unread-count", summary="Cantidad de consultas sin leer (dueño)")
def inquiry_unread_count(
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    return {"count": CommunicationService(db).unread_count(current)}


@router.patch("/inquiries/{inquiry_id}/read", response_model=InquiryOwnerOut, summary="Marcar consulta como leída")
def mark_inquiry_read(
    inquiry_id: int,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> InquiryOwnerOut:
    inquiry = CommunicationService(db).mark_read(current, inquiry_id)
    return _inquiry_owner_out(inquiry)


@router.post("/reports", response_model=ReportOut, status_code=status.HTTP_201_CREATED, summary="Reportar publicación")
def create_report(
    data: ReportCreate,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ReportOut:
    return CommunicationService(db).create_report(current, data)