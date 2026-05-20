from sqlalchemy.orm import Session
from backend.app.models import User
from backend.app.schemas import UserCreate, UserLogin
from backend.app.auth import hash_password, verify_password, create_access_token

class AuthService:
    @staticmethod
    def register_user(db: Session, user_in: UserCreate) -> User:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_in.email).first()
        if existing_user:
            return None
        
        # Create user
        new_user = User(
            email=user_in.email,
            hashed_password=hash_password(user_in.password),
            full_name=user_in.full_name,
            role=user_in.role
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user

    @staticmethod
    def authenticate_user(db: Session, user_login: UserLogin) -> dict:
        user = db.query(User).filter(User.email == user_login.email).first()
        if not user or not verify_password(user_login.password, user.hashed_password):
            return None
        
        # Generate token
        access_token = create_access_token(
            data={"sub": user.email, "role": user.role}
        )
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": user.id,
            "email": user.email,
            "role": user.role,
            "full_name": user.full_name
        }
