from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas import AnomalyRequest, AnomalyEventResponse
from backend.app.services.anomaly_service import AnomalyService
from backend.app.services.dataset_service import DatasetService
from backend.app.auth import get_current_active_user
from backend.app.models import User

router = APIRouter(prefix="/anomalies", tags=["Anomaly Detection"])

@router.post("/run", response_model=list[AnomalyEventResponse])
def run_anomaly_check(req: AnomalyRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    dataset = DatasetService.get_dataset(db, req.dataset_id)
    if not dataset or dataset.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Dataset not found or access denied")
        
    date_col = req.date_column or "Date"
    try:
        res = AnomalyService.detect_anomalies(
            db=db,
            dataset_id=req.dataset_id,
            target_col=req.target_column,
            date_col=date_col,
            method_used=req.method_used,
            contamination=req.contamination
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anomaly detection failed: {str(e)}")

@router.get("/history/{dataset_id}", response_model=list[AnomalyEventResponse])
def get_anomaly_history(dataset_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    dataset = DatasetService.get_dataset(db, dataset_id)
    if not dataset or dataset.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Dataset not found or access denied")
        
    return AnomalyService.get_anomalies(db, dataset_id)

@router.put("/{anomaly_id}/resolve", status_code=status.HTTP_200_OK)
def resolve_anomaly(anomaly_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    success = AnomalyService.resolve_anomaly(db, anomaly_id)
    if not success:
        raise HTTPException(status_code=404, detail="Anomaly event not found")
    return {"status": "success", "message": "Anomaly event successfully resolved by analyst."}
