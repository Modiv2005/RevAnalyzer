import pandas as pd
import numpy as np
import datetime
from sqlalchemy.orm import Session
from backend.app.models import Dataset, AnomalyEvent, Notification
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from backend.app.services.forecasting_service import ForecastingService

class AnomalyService:
    @staticmethod
    def get_anomalies(db: Session, dataset_id: str) -> list[AnomalyEvent]:
        return db.query(AnomalyEvent).filter(AnomalyEvent.dataset_id == dataset_id).order_by(AnomalyEvent.index.asc()).all()

    @staticmethod
    def detect_anomalies(db: Session, dataset_id: str, target_col: str, date_col: str, method_used: str = "Isolation Forest", contamination: float = 0.05) -> list[dict]:
        dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
        if not dataset:
            raise ValueError("Dataset not found")
            
        df = ForecastingService._load_dataset_dataframe(db, dataset)
        df[date_col] = pd.to_datetime(df[date_col])
        df = df.sort_values(by=date_col).reset_index(drop=True)
        
        # Extract target vector
        values = pd.to_numeric(df[target_col], errors='coerce').interpolate().bfill().values
        X = values.reshape(-1, 1)
        
        anomaly_flags = []
        anomaly_scores = []
        
        if method_used == "Isolation Forest":
            model = IsolationForest(contamination=contamination, random_state=42)
            # Returns -1 for anomalies, 1 for normal
            preds = model.fit_predict(X)
            # Decision function scores: lower means more anomalous
            scores = -model.decision_function(X) # Higher score = more anomalous
            anomaly_flags = [1 if p == -1 else 0 for p in preds]
            anomaly_scores = scores.tolist()
            
        elif method_used == "Local Outlier Factor":
            model = LocalOutlierFactor(n_neighbors=min(20, len(X)-1), contamination=contamination)
            preds = model.fit_predict(X)
            # LOF negative_outlier_factor_: larger negative number means more anomalous
            scores = -model.negative_outlier_factor_
            anomaly_flags = [1 if p == -1 else 0 for p in preds]
            anomaly_scores = scores.tolist()
            
        else:
            # Simple standard deviation fallback (Z-Score)
            mean = np.mean(values)
            std = np.std(values)
            z_scores = (values - mean) / (std if std > 0 else 1.0)
            anomaly_flags = [1 if abs(z) > 2.0 else 0 for z in z_scores]
            anomaly_scores = np.abs(z_scores).tolist()
            
        # Log findings to DB
        anomaly_events = []
        
        # Clear previous anomalies for this dataset/method to prevent duplicates
        db.query(AnomalyEvent).filter(AnomalyEvent.dataset_id == dataset_id, AnomalyEvent.method_used == method_used).delete()
        
        for idx, is_anomaly in enumerate(anomaly_flags):
            if is_anomaly:
                dt_val = df[date_col].iloc[idx]
                dt_str = dt_val.strftime("%Y-%m-%d") if isinstance(dt_val, datetime.date) or hasattr(dt_val, 'strftime') else str(dt_val)
                target_val = float(values[idx])
                
                event = AnomalyEvent(
                    dataset_id=dataset_id,
                    index=int(idx),
                    date=dt_str,
                    target_value=target_val,
                    anomaly_score=float(anomaly_scores[idx]),
                    method_used=method_used,
                    is_resolved=False
                )
                db.add(event)
                anomaly_events.append(event)
                
                # Proactively create a system-wide high priority alert!
                notification = Notification(
                    user_id=dataset.user_id,
                    type="anomaly",
                    title=f"Anomaly Alert: {target_col} Spike/Dip Detected",
                    message=f"A severe anomaly was detected in metric '{target_col}' on {dt_str} with a value of {target_val:,.2f} using {method_used} scoring.",
                    is_read=False
                )
                db.add(notification)
                
        db.commit()
        
        return [
            {
                "id": str(e.id) if hasattr(e, 'id') else "",
                "dataset_id": dataset_id,
                "index": e.index,
                "date": e.date,
                "target_value": e.target_value,
                "anomaly_score": e.anomaly_score,
                "method_used": e.method_used,
                "is_resolved": e.is_resolved,
                "created_at": e.created_at
            }
            for e in anomaly_events
        ]

    @staticmethod
    def resolve_anomaly(db: Session, anomaly_id: str) -> bool:
        event = db.query(AnomalyEvent).filter(AnomalyEvent.id == anomaly_id).first()
        if event:
            event.is_resolved = True
            db.commit()
            return True
        return False
