from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.models import Report
from app.models.enums import ReportReason, ReportStatus


class ReportRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, reporter_id: int, property_id: int, reason: ReportReason, details: str | None) -> Report:
        report = Report(reporter_id=reporter_id, property_id=property_id, reason=reason, details=details)
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        return report

    def exists_same(self, reporter_id: int, property_id: int) -> bool:
        count = self.db.scalar(
            select(func.count())
            .select_from(Report)
            .where(Report.reporter_id == reporter_id, Report.property_id == property_id)
        )
        return (count or 0) > 0

    def list_for_moderation(
        self, status: ReportStatus | None, page: int, limit: int
    ) -> tuple[list[Report], int]:
        filters = [Report.status == status] if status is not None else []
        total = self.db.scalar(select(func.count()).select_from(Report).where(*filters)) or 0
        stmt = (
            select(Report)
            .options(joinedload(Report.property), joinedload(Report.reporter))
            .where(*filters)
            .order_by(Report.created_at.desc())
            .offset((page - 1) * limit)
            .limit(limit)
        )
        return list(self.db.scalars(stmt)), total

    def set_status(self, report: Report, status) -> Report:
        report.status = status
        self.db.commit()
        self.db.refresh(report)
        return report