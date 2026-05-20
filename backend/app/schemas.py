from pydantic import BaseModel, EmailStr, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

# --- AUTH SCHEMAS ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: str = "analyst"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    email: str
    role: str
    full_name: Optional[str] = None

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class UserResponse(UserBase):
    id: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- DATASET SCHEMAS ---
class DatasetResponse(BaseModel):
    id: str
    filename: str
    file_size: int
    file_type: str
    status: str
    row_count: int
    col_count: int
    columns_json: List[str]
    created_at: datetime

    class Config:
        from_attributes = True

class ColumnMetadataResponse(BaseModel):
    col_name: str
    data_type: str
    missing_count: int
    mean: Optional[float] = None
    std: Optional[float] = None
    min: Optional[float] = None
    max: Optional[float] = None
    unique_count: int

    class Config:
        from_attributes = True

# --- ANALYTICS SCHEMAS ---
class AnalyticsResultResponse(BaseModel):
    id: str
    dataset_id: str
    correlation_matrix_json: Dict[str, Any]
    descriptive_stats_json: Dict[str, Any]
    outlier_indices_json: List[int]
    created_at: datetime

    class Config:
        from_attributes = True

# --- FORECASTING SCHEMAS ---
class ForecastRequest(BaseModel):
    dataset_id: str
    target_column: str
    date_column: str
    model_name: str = "ARIMA"  # ARIMA, Random Forest, Linear Regression, etc.
    forecast_horizon: int = 12

class ForecastValue(BaseModel):
    date: str
    actual: Optional[float] = None
    predicted: Optional[float] = None
    lower_ci: Optional[float] = None
    upper_ci: Optional[float] = None

class ForecastResponse(BaseModel):
    model_name: str
    target_column: str
    date_column: str
    metrics: Dict[str, float]  # RMSE, MAE, MAPE, R2
    forecast_values: List[ForecastValue]

# --- ANOMALY SCHEMAS ---
class AnomalyRequest(BaseModel):
    dataset_id: str
    target_column: str
    date_column: Optional[str] = None
    method_used: str = "Isolation Forest"  # Isolation Forest, LOF, One-Class SVM
    contamination: float = 0.05

class AnomalyEventResponse(BaseModel):
    id: str
    dataset_id: str
    index: int
    date: Optional[str] = None
    target_value: float
    anomaly_score: float
    method_used: str
    is_resolved: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- KPI SCHEMAS ---
class KPIResponse(BaseModel):
    id: str
    dataset_id: str
    metric_name: str
    current_value: float
    previous_value: Optional[float] = None
    percentage_change: Optional[float] = None
    health_status: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- CHAT SCHEMAS ---
class ChatRequest(BaseModel):
    message: str
    session_id: str = "default_session"
    dataset_id: Optional[str] = None

class ChatMessageResponse(BaseModel):
    id: str
    session_id: str
    message: str
    sender: str  # user, ai
    context_used_json: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- NOTIFICATION SCHEMAS ---
class NotificationResponse(BaseModel):
    id: str
    type: str
    title: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- ADMIN PANEL SCHEMAS ---
class AdminLogResponse(BaseModel):
    id: str
    user_id: str
    action: str
    details: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class SystemStatsResponse(BaseModel):
    total_users: int
    total_datasets: int
    total_forecasts: int
    total_anomalies: int
    total_queries: int
