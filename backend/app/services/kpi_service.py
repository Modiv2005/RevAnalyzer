from sqlalchemy.orm import Session
from backend.app.models import KPIMetric, Dataset

class KPIService:
    @staticmethod
    def get_dataset_kpis(db: Session, dataset_id: str) -> list[KPIMetric]:
        return db.query(KPIMetric).filter(KPIMetric.dataset_id == dataset_id).all()

    @staticmethod
    def create_custom_kpi(db: Session, dataset_id: str, name: str, current: float, prev: float = None) -> KPIMetric:
        change = None
        if prev is not None and prev != 0:
            change = ((current - prev) / prev) * 100
            
        health = "stable"
        if change is not None:
            if change > 5:
                health = "good"
            elif change < -5:
                health = "critical"
                
        kpi = KPIMetric(
            dataset_id=dataset_id,
            metric_name=name,
            current_value=current,
            previous_value=prev,
            percentage_change=change,
            health_status=health
        )
        db.add(kpi)
        db.commit()
        db.refresh(kpi)
        return kpi
