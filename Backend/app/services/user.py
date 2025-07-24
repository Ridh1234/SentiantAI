from app.utils.Supabase_client import get_supabase_client
from supabase import Client, AuthApiError
from typing import Optional


def register_user(email: str, password: str, full_name: Optional[str] = None) -> dict:
    supabase: Client = get_supabase_client()
    try:
        response = supabase.auth.sign_up({"email": email, "password": password})
        user = response.user
        if user and full_name:
            # Optionally update user metadata
            supabase.auth.update(user.id, {"data": {"full_name": full_name}})
        return {"user": user, "session": response.session}
    except AuthApiError as e:
        return {"error": str(e)}


def login_user(email: str, password: str) -> dict:
    supabase: Client = get_supabase_client()
    try:
        response = supabase.auth.sign_in_with_password({"email": email, "password": password})
        return {"user": response.user, "session": response.session}
    except AuthApiError as e:
        return {"error": str(e)} 