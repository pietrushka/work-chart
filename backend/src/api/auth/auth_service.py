from datetime import datetime, timedelta
from uuid import UUID
import jwt
from passlib.context import CryptContext
from decouple import config
from sqlmodel import Session

from constants import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    ALGORITHM,
    ACTIVATE_ACCOUNT_TOKEN_EXPIRE_MINUTES,
)
from db.models import TokenModel, TokenType

JWT_SECRET_KEY = config("JWT_SECRET_KEY")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_db_token(user_id: UUID, token_type: TokenType, session: Session):
    expired_at = datetime.utcnow() + timedelta(
        minutes=ACTIVATE_ACCOUNT_TOKEN_EXPIRE_MINUTES
    )
    new_token = TokenModel.model_validate(
        {"user_id": user_id, "type": token_type, "expired_at": expired_at}
    )
    session.add(new_token)
    session.commit()
    session.refresh(new_token)
    return new_token


def validate_db_token(token: str, token_type: TokenType, session: Session):
    token = session.get(TokenModel, token)
    if not token:
        return None

    if token.type != token_type:
        return None

    if token.expired_at < datetime.utcnow():
        return None

    return token


def delete_token(token: str, session: Session):
    token = session.get(TokenModel, token)
    if not token:
        return None

    session.delete(token)
    session.commit()
