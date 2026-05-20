from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas import DatasetResponse, ColumnMetadataResponse
from backend.app.services.dataset_service import DatasetService
from backend.app.auth import get_current_active_user
from backend.app.models import User, DatasetMetadata

router = APIRouter(prefix="/datasets", tags=["Datasets"])

@router.get("", response_model=list[DatasetResponse])
def list_datasets(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return DatasetService.get_user_datasets(db, current_user.id)

@router.post("/upload", response_model=DatasetResponse, status_code=status.HTTP_201_CREATED)
def upload(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return DatasetService.upload_dataset(db, file, current_user.id)

@router.post("/demo", response_model=DatasetResponse, status_code=status.HTTP_201_CREATED)
def generate_demo(db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    return DatasetService.generate_demo_dataset(db, current_user.id)

@router.delete("/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete(dataset_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    success = DatasetService.delete_dataset(db, dataset_id)
    if not success:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return None

@router.get("/{dataset_id}/metadata", response_model=list[ColumnMetadataResponse])
def get_metadata(dataset_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    # Verify dataset belongs to user
    dataset = DatasetService.get_dataset(db, dataset_id)
    if not dataset or dataset.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Dataset not found or access denied")
        
    records = db.query(DatasetMetadata).filter(DatasetMetadata.dataset_id == dataset_id).all()
    return records
