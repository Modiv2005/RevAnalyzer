import datetime
import uuid
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(String(50), default="analyst")  # admin, analyst, user
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    datasets = relationship("Dataset", back_populates="user", cascade="all, delete-orphan")
    chat_histories = relationship("ChatHistory", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class Dataset(Base):
    __tablename__ = "datasets"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False)  # in bytes
    file_type = Column(String(50), nullable=False)  # csv, xlsx, json
    status = Column(String(50), default="uploaded")  # uploaded, processing, ready, error
    error_message = Column(Text, nullable=True)
    row_count = Column(Integer, default=0)
    col_count = Column(Integer, default=0)
    columns_json = Column(JSON, default=list)  # list of column names
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="datasets")
    metadata_records = relationship("DatasetMetadata", back_populates="dataset", cascade="all, delete-orphan")
    analytics_records = relationship("AnalyticsResult", back_populates="dataset", cascade="all, delete-orphan")
    forecast_records = relationship("ForecastResult", back_populates="dataset", cascade="all, delete-orphan")
    anomaly_events = relationship("AnomalyEvent", back_populates="dataset", cascade="all, delete-orphan")
    kpis = relationship("KPIMetric", back_populates="dataset", cascade="all, delete-orphan")

class DatasetMetadata(Base):
    __tablename__ = "dataset_metadata"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    dataset_id = Column(String(36), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False)
    col_name = Column(String(255), nullable=False)
    data_type = Column(String(50), nullable=False)
    missing_count = Column(Integer, default=0)
    mean = Column(Float, nullable=True)
    std = Column(Float, nullable=True)
    min = Column(Float, nullable=True)
    max = Column(Float, nullable=True)
    unique_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    dataset = relationship("Dataset", back_populates="metadata_records")

class AnalyticsResult(Base):
    __tablename__ = "analytics_results"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    dataset_id = Column(String(36), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False)
    correlation_matrix_json = Column(JSON, default=dict)
    descriptive_stats_json = Column(JSON, default=dict)
    outlier_indices_json = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    dataset = relationship("Dataset", back_populates="analytics_records")

class ForecastResult(Base):
    __tablename__ = "forecast_results"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    dataset_id = Column(String(36), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False)
    model_name = Column(String(50), nullable=False)  # ARIMA, Random Forest, XGBoost, etc.
    target_column = Column(String(255), nullable=False)
    date_column = Column(String(255), nullable=False)
    train_metrics_json = Column(JSON, default=dict)  # RMSE, MAE, MAPE, R2
    forecast_values_json = Column(JSON, default=list)  # list of {date, actual, predicted, lower_ci, upper_ci}
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    dataset = relationship("Dataset", back_populates="forecast_records")

class AnomalyEvent(Base):
    __tablename__ = "anomaly_events"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    dataset_id = Column(String(36), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False)
    index = Column(Integer, nullable=False)
    date = Column(String(100), nullable=True)
    target_value = Column(Float, nullable=False)
    anomaly_score = Column(Float, nullable=False)
    method_used = Column(String(50), nullable=False)  # Isolation Forest, LOF, One-Class SVM
    is_resolved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    dataset = relationship("Dataset", back_populates="anomaly_events")

class KPIMetric(Base):
    __tablename__ = "kpi_metrics"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    dataset_id = Column(String(36), ForeignKey("datasets.id", ondelete="CASCADE"), nullable=False)
    metric_name = Column(String(100), nullable=False)
    current_value = Column(Float, nullable=False)
    previous_value = Column(Float, nullable=True)
    percentage_change = Column(Float, nullable=True)
    health_status = Column(String(50), default="stable")  # good, stable, critical
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    dataset = relationship("Dataset", back_populates="kpis")

class ChatHistory(Base):
    __tablename__ = "chat_history"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    session_id = Column(String(100), index=True, nullable=False)
    message = Column(Text, nullable=False)
    sender = Column(String(50), nullable=False)  # user, ai
    context_used_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="chat_histories")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(100), nullable=False)  # anomaly, forecast_deviation, kpi_threshold
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="notifications")

class AdminLog(Base):
    __tablename__ = "admin_logs"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), nullable=False)
    action = Column(String(255), nullable=False)
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
