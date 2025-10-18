from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from sqlmodel import SQLModel

from db.models import ShiftTemplateModel


class AddWorkerShiftPayloadSchema(BaseModel):
    template_id: str
    worker_id: str
    start_date: str
    end_date: str


class MyShiftsResponse(SQLModel):
    id: str
    worker_id: str
    company_id: str
    start_date: datetime
    end_date: datetime
    template: Optional[ShiftTemplateModel] = None


class Range(BaseModel):
    range_start: str
    range_end: str


class AutoAssignPayloadSchema(BaseModel):
    range_start: str
    range_end: str
    overwrite_shifts: bool
