from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.models.profile import QuizResult
from app.services.claude_service import analyze_quiz
import uuid

router = APIRouter(prefix="/quiz", tags=["quiz"])


class SubmitQuizRequest(BaseModel):
    answers: dict[str, str]
    session_id: str | None = None


class ChatRequest(BaseModel):
    session_id: str
    message: str
    history: list[dict] = []


@router.post("/submit")
async def submit_quiz(request: SubmitQuizRequest, db: Session = Depends(get_db)):
    session_id = request.session_id or str(uuid.uuid4())

    try:
        result = await analyze_quiz(request.answers)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")

    quiz_result = QuizResult(
        session_id=session_id,
        answers=request.answers,
        profile=result,
        careers=result.get("careers"),
        roadmap=result.get("roadmap"),
    )
    db.add(quiz_result)
    db.commit()
    db.refresh(quiz_result)

    return {"session_id": session_id, "result": result}


@router.get("/result/{session_id}")
async def get_result(session_id: str, db: Session = Depends(get_db)):
    result = db.query(QuizResult).filter(QuizResult.session_id == session_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    return {"session_id": session_id, "result": result.profile}
