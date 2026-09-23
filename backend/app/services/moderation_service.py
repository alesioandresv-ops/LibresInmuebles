from sqlalchemy.orm import Session

from app.core.exceptions import ResourceNotFoundError
from app.models import Report
from app.models.enums import ReportStatus
from app.repositories.report_repository import ReportRepository


class ModerationService:
    def __init__(self, db: Session):
        self.db = db
        self.reports = ReportRepository(db)

    def list_reports(
        self, status: ReportStatus | None, page: int, limit: int
    ) -> tuple[list[Report], int]:
        return self.reports.list_for_moderation(status, page, limit)

    def set_report_status(self, report_id: int, status: ReportStatus) -> Report:
        report = self.db.get(Report, report_id)
        if report is None:
            raise ResourceNotFoundError("Reporte no encontrado.")
        return self.reports.set_status(report, status)