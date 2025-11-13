from pydantic import BaseModel, constr
from fastapi import APIRouter, HTTPException
from core.config import supabase_clt
from core.security import hash_password, verify_password
from datetime import datetime


class UserRegister(BaseModel):
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str  # constr(min_length=6, max_length=72)


router = APIRouter()


@router.get("/test-db")
def test_db():
    try:
        response = supabase_clt.table("users").select("*").limit(1).execute()
        return {"success": True, "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/register")
def register(user: UserRegister):
    hashed = hash_password(user.password)
    now = datetime.utcnow().isoformat()

    try:
        response = supabase_clt.table("users").insert({
            "email": user.email,
            "password_hash": hashed,
            "is_active": True,
            "created_at": now,
            "updated_at": now
        }).execute()

        # response.data is a list of inserted rows, usually length 1
        if not response.data:
            raise HTTPException(status_code=400, detail="User not inserted")

        # remove password before returning
        user_data = response.data[0]
        user_data.pop("password_hash", None)

        return {"status": "success", "user": user_data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/login")
def login(user: UserLogin):
    # Get the user by email
    response = supabase_clt.table("users").select(
        "*").eq("email", user.email).execute()

    if not response.data or len(response.data) == 0:
        raise HTTPException(status_code=404, detail="User not found")

    db_user = response.data[0]

    # Verify password
    if not verify_password(user.password, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid password")

    # Optionally remove sensitive info before returning
    db_user.pop("password_hash", None)

    return {"status": "success", "message": "Login successful", "user": db_user}


class PasswordResetConfirmWithEmail(BaseModel):
    email: str
    new_password: str


@router.post("/reset-password")
def reset_password(data: PasswordResetConfirmWithEmail):
    try:
        # 1. Check if user exists
        print("Resetting password for:", data.email)
        res = supabase_clt.table("users").select(
            "*").eq("email", data.email).execute()
        if not res.data or len(res.data) == 0:
            raise HTTPException(status_code=404, detail="User not found")

        # 2. Hash and update new password
        hashed_pw = hash_password(data.new_password)
        supabase_clt.table("users").update({"password_hash": hashed_pw, "updated_at": datetime.utcnow(
        ).isoformat()}).eq("email", data.email).execute()

        return {"status": "success", "message": "Password successfully reset"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
