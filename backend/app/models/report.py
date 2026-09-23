from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Index, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import ReportReason, ReportStatus


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(primary_key=True)
    property_id: Mapped[int] = mapped_column(
        ForeignKey("properties.id", ondelete="CASCADE"), nullable=False, index=True
    )
    reporter_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    reason: Mapped[ReportReason] = mapped_column(
        Enum(ReportReason, values_callable=lambda e: [m.value for m in e], name="report_reason"), nullable=False
    )
    details: Mapped[str | None] = mapped_column(Text)
    status: Mapped[ReportStatus] = mapped_column(
        Enum(ReportStatus, values_callable=lambda e: [m.value for m in e], name="report_status"),
        nullable=False,
        default=ReportStatus.PENDING,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    property: Mapped["Property"] = relationship(back_populates="reports")
    reporter: Mapped["User"] = relationship(back_populates="reports_made")

    __table_args__ = (
        Index("ix_reports_status", "status"),
        UniqueConstraint("reporter_id", "property_id", name="uq_reports_reporter_property"),
    )