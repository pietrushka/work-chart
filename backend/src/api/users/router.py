from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from decouple import config

from api.auth import auth_service
from api.common import authenticate_company_admin
from api.dependencies import authenticate_user
from api.common import email_service
from .schemas import AddWorkerPayloadSchema, EditWorkerPayloadSchema
from db.models import TokenType, UserModel, UserRole
from db.session import get_session
from . import user_service

router = APIRouter(tags=["users"])


@router.post("/create-worker")
async def create_worker(
    payload: AddWorkerPayloadSchema,
    session: Session = Depends(get_session),
    current_user: UserModel = Depends(authenticate_user),
):
    if current_user.role != UserRole.ADMIN or not current_user.company_id:
        raise HTTPException(status_code=401, detail="Not authorized")

    data = payload.model_dump()

    existing_user = user_service.find_user_by_email(data["email"], session)
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    new_worker_data = {
        "email": data["email"],
        "first_name": data["first_name"],
        "last_name": data["last_name"],
        "role": UserRole.WORKER,
        "company_id": current_user.company_id,
        "position": data["position"],
    }

    new_worker = user_service.create_user(new_worker_data, session)

    activate_token = auth_service.create_db_token(
        new_worker.id, TokenType.ACTIVATE_ACCOUNT, session
    )

    frontend_url = config("FRONTEND_URL")
    await email_service.send_email(
        to_emails=[new_worker.email],
        subject="You have been added as a worker",
        body_text=f"Activation link: {frontend_url}/activate-account/{activate_token}",
    )

    return {"status": "success"}


@router.get("/workers")
def get_workers(
    session: Session = Depends(get_session),
    current_user: UserModel = Depends(authenticate_user),
):
    if current_user.role != UserRole.ADMIN or not current_user.company_id:
        raise HTTPException(status_code=401, detail="Not authorized")

    workers = user_service.find_workers_by_company_id(current_user.company_id, session)
    return {"items": workers}


@router.patch("/worker/{user_id}")
def edit_worker(
    user_id: str,
    payload: EditWorkerPayloadSchema,
    session: Session = Depends(get_session),
    current_user: UserModel = Depends(authenticate_user),
):
    worker = user_service.find_user_by_id(user_id, session)
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")

    authenticate_company_admin(worker.company_id, current_user)

    user_service.edit_user(worker, payload, session)

    return {"status": "success"}


@router.delete("/worker/{user_id}")
def delete_worker(
    user_id: str,
    session: Session = Depends(get_session),
    current_user: UserModel = Depends(authenticate_user),
):
    worker = user_service.find_user_by_id(user_id, session)

    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")

    authenticate_company_admin(worker.company_id, current_user)

    if worker.role == UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="User must be a worker.")

    user_service.delete_user(worker, session)
    return {"status": "success"}
