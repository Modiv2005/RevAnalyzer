from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas import ForecastRequest, ForecastResponse
from backend.app.services.forecasting_service import ForecastingService
from backend.app.services.dataset_service import DatasetService
from backend.app.auth import get_current_active_user
from backend.app.models import User

router = APIRouter(prefix="/forecasting", tags=["Predictive Analytics"])

@router.post("/run", response_model=ForecastResponse)
def run_prediction(req: ForecastRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    # Verify dataset ownership
    dataset = DatasetService.get_dataset(db, req.dataset_id)
    if not dataset or dataset.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Dataset not found or access denied")
        
    try:
        res = ForecastingService.run_forecast(
            db=db,
            dataset_id=req.dataset_id,
            date_col=req.date_column,
            target_col=req.target_column,
            model_name=req.model_name,
            horizon=req.forecast_horizon
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecasting pipeline error: {str(e)}")

@router.get("/history/{dataset_id}")
def get_forecast_history(dataset_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    dataset = DatasetService.get_dataset(db, dataset_id)
    if not dataset or dataset.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Dataset not found or access denied")
        
    return ForecastingService.get_forecasts(db, dataset_id)
