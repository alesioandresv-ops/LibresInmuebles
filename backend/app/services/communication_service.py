from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.exceptions import BadRequestError, ConflictError, ForbiddenError, ResourceNotFoundError
from app.models import Property, User
from app.models.enums import PropertyStatus, ReportReason
from app.repositories.inquiry_repository import InquiryRepository
from app.repositories.report_repository import ReportRepository
from app.schemas.communication import InquiryCreate, ReportCreate
from app.services.email_service import send_email


class CommunicationService:
    def __init__(self, db: Session):
        self.db = db
        self.inquiries = InquiryRepository(db)
        self.reports = ReportRepository(db)

    def create_inquiry(self, user: User, data: InquiryCreate):
        prop = self.db.get(Property, data.property_id)
        if prop is None:
            raise ResourceNotFoundError("Propiedad no encontrada.")
        if prop.status == PropertyStatus.FINISHED:
            raise BadRequestError(
                "Esta publicación está finalizada, no se pueden enviar consultas."
            )
        if prop.owner_id == user.id:
            raise BadRequestError("No podés consultar sobre tu propia publicación.")
        inquiry = self.inquiries.create(user.id, data.property_id, data.message)
        self._notify_owner(prop, user, data.message)
        return inquiry

    @staticmethod
    def _notify_owner(prop: Property, sender: User, message: str) -> None:
        site = get_settings().frontend_url.rstrip("/")
        link = f"{site}/mensajes"
        sender_name = f"{sender.first_name} {sender.last_name}".strip()
        reply_email = f"mailto:{prop.owner.email}?subject=Re:%20{prop.title}"
        send_email(
            to=prop.owner.email,
            subject=f"Nueva consulta sobre «{prop.title}»",
            text=(
                f"Hola {prop.owner.first_name},\n\n"
                f"{sender_name} ({sender.email}) te escribió por tu publicación «{prop.title}»:\n\n"
                f"«{message}»\n\n"
                f"Respondé desde tu bandeja de mensajes: {link}\n"
                f"O por email: {reply_email}\n\n"
                "— LibreInmuebles"
            ),
            html=(
                "<p>Hola <strong>{}</strong>,</p>"
                "<p><strong>{}</strong> ({}) te escribió por tu publicación «{}»:</p>"
                "<blockquote>{}</blockquote>"
                '<p><a href="{}">Abrir mensajes</a></p>'
                "<p>— LibreInmuebles</p>"
            ).format(
                prop.owner.first_name,
                sender_name,
                sender.email,
                prop.title,
                message,
                link,
            ),
        )

    def inbox(self, user: User, page: int, limit: int):
        return self.inquiries.inbox(user.id, page, limit)

    def sent(self, user: User, page: int, limit: int):
        return self.inquiries.sent(user.id, page, limit)

    def unread_count(self, user: User) -> int:
        return self.inquiries.unread_count(user.id)

    def mark_read(self, user: User, inquiry_id: int):
        inquiry = self.inquiries.get(inquiry_id)
        if inquiry is None:
            raise ResourceNotFoundError("Consulta no encontrada.")
        prop = self.db.get(Property, inquiry.property_id)
        if prop is None or prop.owner_id != user.id:
            raise ForbiddenError("No tenés permisos sobre esta consulta.")
        return self.inquiries.mark_as_read(inquiry)

    def create_report(self, user: User, data: ReportCreate):
        prop = self.db.get(Property, data.property_id)
        if prop is None:
            raise ResourceNotFoundError("Propiedad no encontrada.")
        if prop.owner_id == user.id:
            raise ForbiddenError("No podés reportar tu propia publicación.")
        if self.reports.exists_same(user.id, data.property_id):
            raise ConflictError("Ya reportaste esta publicación.")
        try:
            return self.reports.create(user.id, data.property_id, data.reason, data.details)
        except IntegrityError:
            self.db.rollback()
            raise ConflictError("Ya reportaste esta publicación.")