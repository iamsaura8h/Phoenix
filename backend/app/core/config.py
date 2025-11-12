import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL")
    BINANCE_API_BASE: str = os.getenv("BINANCE_API_BASE")

settings = Settings()
