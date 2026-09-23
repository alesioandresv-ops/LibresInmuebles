from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_staff
from app.core.database import get_db
from app.models import Report, User
from app.models.enums import ReportStatus
from app.schemas.moderation import ReportAdminOut, ReportStatusUpdate
from app.schemas.property import Paginated
from app.services.moderation_service import ModerationService

router = APIRouter(prefix="/moderation", tags=["moderation"])


def _admin_out(report: Report) -> ReportAdminOut:
    return ReportAdminOut(
        id=report.id,
        property_id=report.property_id,
        reason=report.reason,
        details=report.details,
        status=report.status,
        created_at=report.created_at,
        property_title=report.property.title,
        property_neighborhood=report.property.neighborhood,
        property_owner_id=report.property.owner_id,
        property_owner_name=f"{report.property.owner.first_name} {report.property.owner.last_name}",
        reporter_name=f"{report.reporter.first_name} {report.reporter.last_name}",
        reporter_email=report.reporter.email,
    )


def _paginated(items, total, page, limit) -> Paginated:
    return Paginated(
        items=items,
        total=total,
        page=page,
        limit=limit,
        total_pages=(total + limit - 1) // limit if total else 0,
    )


@router.get("/reports", response_model=Paginated[ReportAdminOut], summary="Cola de reportes de moderación")
def list_reports(
    status: ReportStatus | None = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=50),
    _: User = Depends(get_current_staff),
    db: Session = Depends(get_db),
) -> Paginated[ReportAdminOut]:
    items, total = ModerationService(db).list_reports(status, page, limit)
    return _paginated([_admin_out(r) for r in items], total, page, limit)


@router.patch("/reports/{report_id}/status", response_model=ReportAdminOut, summary="Cambiar estado de un reporte")
def set_report_status(
    report_id: int,
    data: ReportStatusUpdate,
    _: User = Depends(get_current_staff),
    db: Session = Depends(get_db),
) -> ReportAdminOut:
    report = ModerationService(db).set_report_status(report_id, data.status)
    return _admin_out(report)