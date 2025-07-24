from fastapi import APIRouter
from pydantic import BaseModel, EmailStr
from app.services.user import register_user, login_user
from typing import Optional

router = APIRouter()

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/register")
def register(request: RegisterRequest):
    result = register_user(request.email, request.password, request.full_name)
    return result

@router.post("/login")
def login(request: LoginRequest):
    result = login_user(request.email, request.password)
    return result 