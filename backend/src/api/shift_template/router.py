from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from api.shift_template import shift_template_service
from db.session import get_session
from api.shift_template.schemas import (
    CreateShiftTemplateSchema,
    EditShiftTemplateSchema,
)
from api.shift_template.shift_template_service import (
    create_shift_template,
    find_shift_template_by_id,
    find_shift_templates_by_company_id,
    edit_shift_template,
)
from api.dependencies import authenticate_user
from db.models import UserModel, UserRole
from api.common import authenticate_company_admin

router = APIRouter(tags=["shiftTemplate"])


@router.post("/create")
def create(
    payload: CreateShiftTemplateSchema,
    session: Session = Depends(get_session),
    current_user: UserModel = Depends(authenticate_user),
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="User must be ADMIN.")

    create_shift_template(payload, current_user.company_id, session)
    return {"status": "success"}


@router.get("/company")
def get_shift_templates(
    session: Session = Depends(get_session),
    current_user: UserModel = Depends(authenticate_user),
):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="User must be ADMIN.")
    shift_templates = find_shift_templates_by_company_id(
        current_user.company_id, session
    )
    return {"status": "success", "items": shift_templates}


@router.patch("/{shift_template_id}")
def edit_shift_template_route(
    shift_template_id: str,
    payload: EditShiftTemplateSchema,
    session: Session = Depends(get_session),
    current_user: UserModel = Depends(authenticate_user),
):
    shift_template = find_shift_template_by_id(shift_template_id, session)
    authenticate_company_admin(shift_template.company_id, current_user)

    if not shift_template:
        raise HTTPException(status_code=404, detail="Shift template not found")
    edit_shift_template(shift_template, payload, session)
    return {"status": "success"}


@router.delete("/{shift_template_id}")
def delete_shift_template(
    shift_template_id: str,
    session: Session = Depends(get_session),
    current_user: UserModel = Depends(authenticate_user),
):
    shift_template = find_shift_template_by_id(shift_template_id, session)

    if not shift_template:
        raise HTTPException(status_code=404, detail="Shift template not found")

    authenticate_company_admin(shift_template.company_id, current_user)

    shift_template_service.delete_shift_template(shift_template, session)
    return {"status": "success"}
