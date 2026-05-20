from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas import UserCreate, UserLogin, UserResponse, Token
from backend.app.services.auth_service import AuthService
from backend.app.auth import get_current_active_user
from backend.app.models import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    user = AuthService.register_user(db, user_in)
    if not user:
        raise HTTPException(status_code=400, detail="A user with this email already exists.")
    return user

@router.post("/login", response_model=Token)
def login(user_login: UserLogin, db: Session = Depends(get_db)):
    token_res = AuthService.authenticate_user(db, user_login)
    if not token_res:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token_res

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_active_user)):
    return current_user
