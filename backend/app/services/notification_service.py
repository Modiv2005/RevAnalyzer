from sqlalchemy.orm import Session
from backend.app.models import Notification

class NotificationService:
    @staticmethod
    def get_user_notifications(db: Session, user_id: str) -> list[Notification]:
        return db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()

    @staticmethod
    def mark_as_read(db: Session, notification_id: str) -> bool:
        notification = db.query(Notification).filter(Notification.id == notification_id).first()
        if notification:
            notification.is_read = True
            db.commit()
            return True
        return False

    @staticmethod
    def mark_all_as_read(db: Session, user_id: str) -> bool:
        db.query(Notification).filter(Notification.user_id == user_id, Notification.is_read == False).update({"is_read": True})
        db.commit()
        return True
