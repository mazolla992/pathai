from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey, func
from app.database import Base


class QuizResult(Base):
    __tablename__ = "quiz_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    session_id = Column(String, index=True, nullable=False)
    answers = Column(JSON, nullable=False)  # {question_id: answer}
    profile = Column(JSON, nullable=True)   # AI-generated profile
    careers = Column(JSON, nullable=True)   # top-5 careers from Claude
    roadmap = Column(JSON, nullable=True)   # learning roadmap
    created_at = Column(DateTime(timezone=True), server_default=func.now())
