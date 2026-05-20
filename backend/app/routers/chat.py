from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas import ChatRequest, ChatMessageResponse
from backend.app.services.llm_service import LLMService
from backend.app.auth import get_current_active_user
from backend.app.models import User, ChatHistory

router = APIRouter(prefix="/chat", tags=["AI Conversational Assistant"])

@router.post("")
def ask_question(req: ChatRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    try:
        res = LLMService.answer_query(
            db=db,
            user_id=current_user.id,
            session_id=req.session_id,
            query=req.message,
            dataset_id=req.dataset_id
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI conversational engine error: {str(e)}")

@router.get("/history/{session_id}", response_model=list[ChatMessageResponse])
def get_chat_history(session_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    records = db.query(ChatHistory)\
        .filter(ChatHistory.user_id == current_user.id, ChatHistory.session_id == session_id)\
        .order_by(ChatHistory.created_at.asc())\
        .all()
    return records
