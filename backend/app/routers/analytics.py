from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.services.analytics_service import AnalyticsService
from backend.app.services.dataset_service import DatasetService
from backend.app.auth import get_current_active_user
from backend.app.models import User
import pandas as pd
from backend.app.services.forecasting_service import ForecastingService

router = APIRouter(prefix="/analytics", tags=["Analytics & EDA"])

@router.get("/{dataset_id}/summary")
def get_analytics_summary(dataset_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    dataset = DatasetService.get_dataset(db, dataset_id)
    if not dataset or dataset.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Dataset not found or access denied")
        
    return AnalyticsService.get_analytics(db, dataset_id)

@router.get("/{dataset_id}/distribution/{col_name}")
def get_column_distribution(dataset_id: str, col_name: str, bins: int = Query(10, ge=3, le=50), db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    dataset = DatasetService.get_dataset(db, dataset_id)
    if not dataset or dataset.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Dataset not found or access denied")
        
    df = ForecastingService._load_dataset_dataframe(db, dataset)
    return AnalyticsService.get_column_distribution(df, col_name, bins)

@router.get("/{dataset_id}/outliers/{col_name}")
def get_outliers(dataset_id: str, col_name: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    dataset = DatasetService.get_dataset(db, dataset_id)
    if not dataset or dataset.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Dataset not found or access denied")
        
    df = ForecastingService._load_dataset_dataframe(db, dataset)
    return AnalyticsService.detect_outliers_iqr(df, col_name)
