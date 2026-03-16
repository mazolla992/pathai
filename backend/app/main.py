from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import quiz, chat
from app.database import engine
from app import models

# Create tables
models.user  # noqa: F401
models.profile  # noqa: F401
from app.database import Base
Base.metadata.create_all(bind=engine)

app = FastAPI(title="PathAI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(quiz.router, prefix="/api")
app.include_router(chat.router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok"}
