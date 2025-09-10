from fastapi import APIRouter, Depends, Request, HTTPException
from sqlmodel import Session
from fastapi.responses import JSONResponse
from uuid import UUID

from api.auth import auth_service
from api.auth.auth_service import (
    create_access_token,
    delete_token,
    get_password_hash,
    verify_password,
    verify_token,
)
from api.companies.company_service import create_company
from api.users.user_service import (
    create_user,
    find_user_by_email,
    find_user_by_id,
    update_user_password,
)
from constants import ACCESS_TOKEN_EXPIRE_MINUTES
from db.models import TokenType, UserRole
from db.session import get_session
from .schemas import ActivateAccountSchema, LoginSchema, RegisterSchema, UserMeResponse

router = APIRouter(tags=["auth"])


@router.post("/register")
def register(payload: RegisterSchema, session: Session = Depends(get_session)):
    data = payload.model_dump()
    existing_user = find_user_by_email(data["email"], session)

    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    if data["role"] == UserRole.ADMIN:
        from api.companies.schemas import CompanyCreateSchema

        company_data = CompanyCreateSchema(name="Your company")
        company = create_company(company_data, session)

    hashed_password = get_password_hash(data["password"])
    user_data = {
        "first_name": data["first_name"],
        "last_name": data["last_name"],
        "role": data["role"],
        "email": data["email"],
        "password": hashed_password,
        "company_id": company.id,
    }
    new_user = create_user(user_data, session)

    access_token = create_access_token(
        data={"user_id": str(new_user.id)},
    )
    response_obj = JSONResponse(content={"status": "success"})
    response_obj.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    return response_obj


@router.post("/login")
def login(payload: LoginSchema, session: Session = Depends(get_session)):
    data = payload.model_dump()
    user = find_user_by_email(data["email"], session)

    if not user or not verify_password(data["password"], user.password):
        raise HTTPException(status_code=400, detail="Wrong credentials")

    access_token = create_access_token(
        data={"user_id": str(user.id)},
    )

    response_obj = JSONResponse(content={"status": "success"})
    response_obj.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )

    return response_obj


@router.get("/me")
def me(request: Request, session: Session = Depends(get_session)):
    auth_cookie = request.cookies.get("access_token")

    if not auth_cookie:
        raise HTTPException(status_code=401, detail="Auth cookie missing")

    result = verify_token(auth_cookie)

    if not result:
        raise HTTPException(status_code=401, detail="Invalid auth cookie")

    user_id = UUID(result["user_id"])
    user = find_user_by_id(user_id, session, populate=True)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid auth cookie")

    return UserMeResponse(
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role,
        company=user.company,
    )


@router.post("/activate-account")
def activate_account(
    payload: ActivateAccountSchema, session: Session = Depends(get_session)
):
    data = payload.model_dump()

    token = auth_service.validate_db_token(
        data["token"], TokenType.ACTIVATE_ACCOUNT, session
    )

    if not token:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = find_user_by_id(token.user_id, session)
    if not user:
        print("[activate_account] user not found")
        raise HTTPException(status_code=500, detail="Server error, plase try again")

    update_user_password(user.id, data["password"], session)

    delete_token(token.id, session)

    return {"status": "success"}


@router.post("/logout")
def logout():
    response_obj = JSONResponse(content={"status": "success"})
    response_obj.set_cookie(
        key="access_token",
        value="",
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=0,
        path="/",
    )
    return response_obj
