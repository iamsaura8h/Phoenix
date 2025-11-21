from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests
from app.core.config import settings
from app.db.db import users_collection  

router = APIRouter()

class TokenRequest(BaseModel):
    token: str

@router.post("/auth/google")
def verify_google_token(request: TokenRequest):
    """Verify Google ID token and store user in MongoDB"""
    try:
        token = request.token

        # Verify token using Google's public keys
        id_info = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )

        # Extract user info
        user_data = {
            "sub": id_info.get("sub"),       # unique Google ID
            "name": id_info.get("name"),
            "email": id_info.get("email"),
            "picture": id_info.get("picture"),
        }

        # Upsert (insert if new, update if exists)
        users_collection.update_one(
            {"sub": user_data["sub"]},
            {"$set": user_data},
            upsert=True
        )

        return {"status": "success", "user": user_data}

    except Exception as e:
        print("Google token error:", e)
        raise HTTPException(status_code=401, detail="Invalid Google token")


@router.get("/users")
def get_all_users():
    """Fetch all users and total count"""
    users = list(users_collection.find({}, {"_id": 0}))
    return {"count": len(users), "users": users}
