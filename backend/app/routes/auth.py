from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests
from app.core.config import settings

router = APIRouter()

# Define request schema
class TokenRequest(BaseModel):
    token: str

@router.post("/auth/google")
def verify_google_token(request: TokenRequest):
    """Verify Google ID token sent from frontend"""
    try:
        # Extract token from body
        token = request.token

        # Verify token using Google's public keys
        id_info = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )

        # Extract user info
        user = {
            "name": id_info.get("name"),
            "email": id_info.get("email"),
            "picture": id_info.get("picture"),
        }

        return {"status": "success", "user": user}

    except Exception as e:
        print("Google token error:", e)
        raise HTTPException(status_code=401, detail="Invalid Google token")
