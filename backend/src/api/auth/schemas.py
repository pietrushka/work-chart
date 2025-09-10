from sqlmodel import SQLModel
from typing import Optional

from db.models import UserRole, CompanyModel


class RegisterSchema(SQLModel):
    first_name: str
    last_name: str
    email: str
    password: str
    role: UserRole


class LoginSchema(SQLModel):
    email: str
    password: str


class UserMeResponse(SQLModel):
    email: str
    first_name: str
    last_name: str
    role: UserRole
    company: Optional[CompanyModel] = None


class ActivateAccountSchema(SQLModel):
    token: str
    password: str
