from pydantic import BaseModel

from app.models.enums import ReportStatus
from app.schemas.communication import ReportOut


class ReportAdminOut(ReportOut):
    property_title: str
    property_neighborhood: str
    property_owner_id: int
    property_owner_name: str
    reporter_name: str
    reporter_email: str


class ReportStatusUpdate(BaseModel):
    status: ReportStatus