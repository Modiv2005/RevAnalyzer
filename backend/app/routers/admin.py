from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas import SystemStatsResponse
from backend.app.services.admin_service import AdminService
from backend.app.auth import RoleChecker, get_current_active_user
from backend.app.models import User

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

# Allow only Admins and Analysts to view aggregate statistics, keeping it secure!
@router.get("/stats", response_model=SystemStatsResponse)
def get_stats(db: Session = Depends(get_db), current_user: User = Depends(RoleChecker(["admin", "analyst"]))):
    return AdminService.get_system_stats(db)
