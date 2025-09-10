from uuid import UUID
from sqlmodel import Session
from .schemas import CompanyCreateSchema
from db.models import CompanyModel, UserModel, UserRole


def create_company(data: CompanyCreateSchema, session: Session):
    new_company = CompanyModel.model_validate(data)

    session.add(new_company)
    session.commit()
    session.refresh(new_company)
    return new_company


def add_admin(company_id: UUID, user_id: UUID, session: Session):
    user = session.get(UserModel, user_id)
    company = session.get(CompanyModel, company_id)

    if not user or not company:
        raise ValueError("User or company not found")

    user.role = UserRole.ADMIN
    user.company_id = company.id

    session.add(user)
    session.commit()

