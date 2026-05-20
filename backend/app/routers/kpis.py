from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas import KPIResponse
from backend.app.services.kpi_service import KPIService
from backend.app.services.dataset_service import DatasetService
from backend.app.auth import get_current_active_user
from backend.app.models import User

router = APIRouter(prefix="/kpis", tags=["Corporate KPIs"])

@router.get("/{dataset_id}", response_model=list[KPIResponse])
def get_kpis(dataset_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    dataset = DatasetService.get_dataset(db, dataset_id)
    if not dataset or dataset.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Dataset not found or access denied")
        
    return KPIService.get_dataset_kpis(db, dataset_id)
