from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.profile import QuizResult
from app.services.claude_service import chat_with_ai

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    session_id: str
    message: str
    history: list[dict] = []


@router.post("/")
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    quiz_result = (
        db.query(QuizResult)
        .filter(QuizResult.session_id == request.session_id)
        .first()
    )
    if not quiz_result or not quiz_result.profile:
        raise HTTPException(status_code=404, detail="Profile not found for this session")

    reply = await chat_with_ai(
        session_id=request.session_id,
        profile=quiz_result.profile,
        message=request.message,
        history=request.history,
    )

    return {"reply": reply}
