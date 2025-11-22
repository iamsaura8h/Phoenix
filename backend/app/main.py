from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth
from app.core.config import settings
from app.routes import auth, binance_test, strategy
from app.routes import backtest

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:8000",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth.router, prefix="/api")
app.include_router(binance_test.router, prefix="/api")
app.include_router(strategy.router, prefix="/api")
app.include_router(backtest.router, prefix="/api")


@app.get("/")
def read_root():
    return {"status": "ok", "message": "Phoenix Backend is running 🚀"}
