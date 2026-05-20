from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas import NotificationResponse
from backend.app.services.notification_service import NotificationService
from backend.app.auth import get_current_active_user
from backend.app.models import User

router = APIRouter(prefix="/notifications", tags=["System Alerts"])

@router.get("", response_model=list[NotificationResponse])
def get_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return NotificationService.get_user_notifications(db, current_user.id)

@router.put("/{notification_id}/read", status_code=status.HTTP_200_OK)
def mark_read(notification_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    success = NotificationService.mark_as_read(db, notification_id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"status": "success", "message": "Notification marked as read."}

@router.put("/read-all", status_code=status.HTTP_200_OK)
def mark_all_read(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    NotificationService.mark_all_as_read(db, current_user.id)
    return {"status": "success", "message": "All notifications marked as read."}
