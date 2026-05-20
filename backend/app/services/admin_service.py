from sqlalchemy.orm import Session
from backend.app.models import User, Dataset, ForecastResult, AnomalyEvent, ChatHistory

class AdminService:
    @staticmethod
    def get_system_stats(db: Session) -> dict:
        total_users = db.query(User).count()
        total_datasets = db.query(Dataset).count()
        total_forecasts = db.query(ForecastResult).count()
        total_anomalies = db.query(AnomalyEvent).count()
        total_queries = db.query(ChatHistory).filter(ChatHistory.sender == "user").count()
        
        return {
            "total_users": total_users,
            "total_datasets": total_datasets,
            "total_forecasts": total_forecasts,
            "total_anomalies": total_anomalies,
            "total_queries": total_queries
        }
