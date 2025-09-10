from fastapi import Depends, Request, HTTPException
from sqlmodel import Session
from uuid import UUID

from db.session import get_session
from api.auth.auth_service import verify_token
from api.users.user_service import find_user_by_id
from db.models import UserModel


def authenticate_user(request: Request, session: Session = Depends(get_session)) -> UserModel:
    auth_cookie = request.cookies.get("access_token")

    if not auth_cookie:
        raise HTTPException(status_code=401, detail="Auth cookie missing")

    result = verify_token(auth_cookie)

    if not result:
        raise HTTPException(status_code=401, detail="Invalid auth cookie")

    user_id = UUID(result["user_id"])
    user = find_user_by_id(user_id, session)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid auth cookie")

    return user 