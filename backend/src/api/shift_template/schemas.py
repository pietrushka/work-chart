from typing import List, Optional
from sqlmodel import SQLModel


class CreateShiftTemplateSchema(SQLModel):
    name: str
    position: str
    startTime: str
    endTime: str
    days: Optional[List[int]] = None

class EditShiftTemplateSchema(SQLModel):
    name: Optional[str] = None
    position: Optional[str] = None
    startTime: Optional[str] = None
    endTime: Optional[str] = None
    days: Optional[List[int]] = None
    