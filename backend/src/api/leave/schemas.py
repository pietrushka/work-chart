from typing import Optional
from sqlmodel import SQLModel


class CreateLeaveSchema(SQLModel):
    start_date: str
    end_date: str


class EditLeaveSchema(SQLModel):
    start_date: Optional[str] = None
    end_date: Optional[str] = None
