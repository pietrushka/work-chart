from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from db.session import get_session

from api.dependencies import authenticate_user
from db.models import UserModel, UserRole
from .schemas import CreateLeaveSchema, EditLeaveSchema
from . import leave_service

router = APIRouter(tags=["leave"])


@router.post("/create")
def create(
    payload: CreateLeaveSchema,
    session: Session = Depends(get_session),
    current_user: UserModel = Depends(authenticate_user),
):
    if not current_user.company_id:
        raise HTTPException(
            status_code=400, detail="User is not associated with a company"
        )

    leave_service.create_leave(
        data=payload,
        user_id=current_user.id,
        company_id=current_user.company_id,
        session=session,
    )
    return {
        "status": "success",
    }


@router.get("/leaves")
def get_my_leaves(
    session: Session = Depends(get_session),
    current_user: UserModel = Depends(authenticate_user),
):
    leaves = leave_service.get_leaves_by_user_id(
        user_id=current_user.id, session=session
    )
    return {"status": "success", "items": leaves}


@router.patch("/{leave_id}")
def edit_leave_route(
    leave_id: str,
    payload: EditLeaveSchema,
    session: Session = Depends(get_session),
    current_user: UserModel = Depends(authenticate_user),
):
    from uuid import UUID

    try:
        leave_uuid = UUID(leave_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid leave ID format")

    updated_leave = leave_service.update_leave(
        leave_id=leave_uuid, data=payload, session=session
    )

    if not updated_leave:
        raise HTTPException(status_code=404, detail="Leave not found")

    if updated_leave.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this leave")

    return {
        "status": "success",
    }


@router.delete("/{leave_id}")
def delete_leave_route(
    leave_id: str,
    session: Session = Depends(get_session),
    current_user: UserModel = Depends(authenticate_user),
):
    from uuid import UUID

    try:
        leave_uuid = UUID(leave_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid leave ID format")

    deleted_leave = leave_service.delete_leave(leave_id=leave_uuid, session=session)

    if not deleted_leave:
        raise HTTPException(status_code=404, detail="Leave not found")

    if deleted_leave.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this leave"
        )

    return {"status": "success"}
