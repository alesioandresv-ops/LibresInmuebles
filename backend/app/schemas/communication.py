from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import ReportReason, ReportStatus
from app.schemas.fields import InquiryMessageStr


class InquiryCreate(BaseModel):
    property_id: int
    message: InquiryMessageStr


class SenderBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: str
    last_name: str


class InquiryReplyCreate(BaseModel):
    message: InquiryMessageStr


class InquiryReplyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sender_id: int
    sender: SenderBrief
    message: str
    created_at: datetime


class InquiryOut(BaseModel):
    id: int
    property_id: int
    property_title: str
    property_image: str | None = None
    sender_id: int
    sender: SenderBrief
    message: str
    replies: list[InquiryReplyOut] = []
    is_read: bool
    created_at: datetime
    recipient_email: str | None = None
    recipient_phone: str | None = None
    recipient_first_name: str | None = None
    recipient_last_name: str | None = None


class InquiryOwnerOut(InquiryOut):
    sender_email: str | None = None
    sender_phone: str | None = None


class ReportCreate(BaseModel):
    property_id: int
    reason: ReportReason
    details: str | None = Field(default=None, max_length=1000)


class ReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    property_id: int
    reason: ReportReason
    details: str | None
    status: ReportStatus
    created_at: datetime