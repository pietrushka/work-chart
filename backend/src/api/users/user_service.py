from sqlmodel import Session, select
from uuid import UUID

from api.auth.auth_service import get_password_hash
from api.users.schemas import CreateUserSchema, EditWorkerPayloadSchema
from db.models import UserModel
from sqlalchemy.orm import selectinload


def create_user(data: CreateUserSchema, session: Session):
    new_user = UserModel.model_validate(data)
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    return new_user


def update_user_password(user_id: UUID, password: str, session: Session):
    user = find_user_by_id(user_id, session)
    hashed_password = get_password_hash(password)
    user.password = hashed_password
    session.commit()


def find_user_by_email(email: str, session: Session):
    return session.exec(select(UserModel).where(UserModel.email == email)).first()


def find_user_by_id(user_id: UUID, session: Session, populate: bool = False):
    query = select(UserModel).where(UserModel.id == user_id)
    if populate:
        query = query.options(selectinload(UserModel.company))
    return session.exec(query).first()


def find_users_by_company_id(company_id: UUID, session: Session):
    quer = select(UserModel).where(UserModel.company_id == company_id)
    return session.exec(quer).all()


def edit_user(user: UserModel, payload: EditWorkerPayloadSchema, session: Session):
    update_data = payload.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(user, field, value)

    session.commit()


def delete_user(user: UserModel, session: Session):
    session.delete(user)
    session.commit()
