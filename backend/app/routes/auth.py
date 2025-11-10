from fastapi import APIRouter, HTTPException
from google.oauth2 import id_token
from google.auth.transport import requests
import os
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

@router.post("/auth/google")
def verify_google_token(token: str):
    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        # Example fields: idinfo["email"], idinfo["name"], idinfo["picture"]
        return {
            "status": "success",
            "user": {
                "name": idinfo.get("name"),
                "email": idinfo.get("email"),
                "picture": idinfo.get("picture")
            }
        }
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Google token")
