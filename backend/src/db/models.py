from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID, uuid4
from sqlmodel import Field, Relationship, SQLModel
from enum import Enum
from sqlalchemy import Column, ARRAY, Integer, DateTime


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    WORKER = "WORKER"


class TokenType(str, Enum):
    ACTIVATE_ACCOUNT = "ACTIVATE_ACCOUNT"


class UserModel(SQLModel, table=True):
    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str
    first_name: str
    last_name: str
    role: UserRole
    password: Optional[str] = Field(default=None)
    position: Optional[str] = Field(default=None)

    company_id: Optional[UUID] = Field(default=None, foreign_key="companies.id")
    company: Optional["CompanyModel"] = Relationship(back_populates="users")


class CompanyModel(SQLModel, table=True):
    __tablename__ = "companies"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str

    # Relationship to users
    users: List[UserModel] = Relationship(back_populates="company")

    # Property methods to filter users
    @property
    def admins(self):
        return [user for user in self.users if user.role == UserRole.ADMIN]

    @property
    def workers(self):
        return [user for user in self.users if user.role == UserRole.WORKER]


class WorkerShiftModel(SQLModel, table=True):
    __tablename__ = "worker_shifts"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    worker_id: UUID = Field(foreign_key="users.id", ondelete="CASCADE")
    company_id: UUID = Field(foreign_key="companies.id")
    start_date: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True)),
    )
    end_date: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True)),
    )

    template_id: Optional[UUID] = Field(default=None, foreign_key="shift_templates.id")
    template: Optional["ShiftTemplateModel"] = Relationship(back_populates="shifts")


class ShiftTemplateModel(SQLModel, table=True):
    __tablename__ = "shift_templates"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    company_id: UUID = Field(foreign_key="companies.id")
    name: str
    position: str
    startTime: str
    endTime: str
    days: Optional[list[int]] = Field(sa_column=Column(ARRAY(Integer)), default=None)

    shifts: List[WorkerShiftModel] = Relationship(back_populates="template")


class TokenModel(SQLModel, table=True):
    __tablename__ = "tokens"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", ondelete="CASCADE")
    type: TokenType
    expired_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True)),
    )


class LeaveModel(SQLModel, table=True):
    __tablename__ = "leaves"
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", ondelete="CASCADE")
    company_id: UUID = Field(foreign_key="companies.id")
    start_date: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True)),
    )
    end_date: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True)),
    )
