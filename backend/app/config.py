import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Revenue Forecasting & Business Intelligence Dashboard"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey_change_me_in_production_123456789")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    # Databases
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./bi_dashboard.db")
    
    # Cache / Redis
    REDIS_URL: Optional[str] = os.getenv("REDIS_URL", None)
    
    # LLM & AI
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o")
    
    class Config:
        case_sensitive = True

settings = Settings()
