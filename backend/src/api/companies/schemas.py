from typing import List
from sqlmodel import SQLModel
from db.models import CompanyModel


class CompanyCreateSchema(SQLModel):
    name: str


class CompanyUpdateSchema(SQLModel):
    name: str


class CompanyListSchema(SQLModel):
    results: List[CompanyModel]
