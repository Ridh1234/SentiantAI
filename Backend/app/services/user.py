from app.utils.Supabase_client import get_supabase_client
from supabase import Client, AuthApiError
from typing import Optional
from uuid import uuid4
from datetime import datetime


def register_user(email: str, password: str, full_name: Optional[str] = None) -> dict:
    supabase: Client = get_supabase_client()
    try:
        response = supabase.auth.sign_up({"email": email, "password": password})
        user = response.user
        session = getattr(response, "session", None)
        # Insert into custom User table if registration succeeded
        if user:
            created_at = getattr(user, "created_at", None)
            if isinstance(created_at, datetime):
                created_at = created_at.isoformat()
            elif created_at is not None:
                created_at = str(created_at)
            else:
                created_at = datetime.utcnow().isoformat()
            user_data = {
                "id": user.id,
                "email": user.email,
                "full_name": full_name,
                "created_at": created_at
            }
            supabase.table("User").insert(user_data).execute()
        return {"user": user, "session": session}
    except AuthApiError as e:
        return {"error": str(e)}


def login_user(email: str, password: str) -> dict:
    supabase: Client = get_supabase_client()
    try:
        response = supabase.auth.sign_in_with_password({"email": email, "password": password})
        return {"user": response.user, "session": response.session}
    except AuthApiError as e:
        return {"error": str(e)} 