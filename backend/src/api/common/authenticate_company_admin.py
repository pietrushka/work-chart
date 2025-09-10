from fastapi import HTTPException

from db.models import UserModel, UserRole


def authenticate_company_admin(company_id: str, current_user: UserModel):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail='User must be ADMIN.')

    if current_user.company_id != company_id:
        raise HTTPException(status_code=403, detail='User does not belong to this company.')
