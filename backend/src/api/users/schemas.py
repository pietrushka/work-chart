from typing import List, Optional
from pydantic import BaseModel
from db.models import UserModel, UserRole


class AddWorkerPayloadSchema(BaseModel):
    email: str
    first_name: str
    last_name: str
    position: str


class CreateUserSchema(BaseModel):
    email: str
    first_name: str
    last_name: str
    company_id: str
    role: UserRole
    position: Optional[str] = None


class UserUpdateSchema(BaseModel):
    name: Optional[str]
    role: Optional[str]
    position: Optional[str]


class UserListSchema(BaseModel):
    results: List[UserModel]


class EditWorkerPayloadSchema(BaseModel):
    email: Optional[str]
    first_name: Optional[str]
    last_name: Optional[str]
    position: Optional[str]
