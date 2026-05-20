import pandas as pd
import numpy as np
import io
import json
import datetime
from sqlalchemy.orm import Session
from backend.app.models import Dataset, DatasetMetadata, AnalyticsResult, KPIMetric, AnomalyEvent
from fastapi import UploadFile

class DatasetService:
    @staticmethod
    def get_user_datasets(db: Session, user_id: str) -> list[Dataset]:
        return db.query(Dataset).filter(Dataset.user_id == user_id).order_by(Dataset.created_at.desc()).all()

    @staticmethod
    def get_dataset(db: Session, dataset_id: str) -> Dataset:
        return db.query(Dataset).filter(Dataset.id == dataset_id).first()

    @staticmethod
    def delete_dataset(db: Session, dataset_id: str) -> bool:
        dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
        if dataset:
            db.delete(dataset)
            db.commit()
            return True
        return False

    @staticmethod
    def upload_dataset(db: Session, file: UploadFile, user_id: str) -> Dataset:
        content = file.file.read()
        file_size = len(content)
        filename = file.filename
        
        # Detect type
        file_type = "csv"
        if filename.endswith(".xlsx") or filename.endswith(".xls"):
            file_type = "xlsx"
        elif filename.endswith(".json"):
            file_type = "json"
            
        # Create dataset record
        dataset = Dataset(
            user_id=user_id,
            filename=filename,
            file_size=file_size,
            file_type=file_type,
            status="processing"
        )
        db.add(dataset)
        db.commit()
        db.refresh(dataset)
        
        # We can parse the file and store metadata in a background task
        # But for direct synchronous response or easy multi-threading, we will invoke the parser
        try:
            df = DatasetService._parse_to_dataframe(content, file_type)
            DatasetService.process_dataframe(db, dataset, df)
        except Exception as e:
            dataset.status = "error"
            dataset.error_message = f"Ingestion error: {str(e)}"
            db.add(dataset)
            db.commit()
            
        return dataset

    @staticmethod
    def generate_demo_dataset(db: Session, user_id: str) -> Dataset:
        """Create a stunning corporate business dataset filled with revenue, expenses, trends, and built-in anomalies."""
        # Generate 36 months of data
        dates = pd.date_range(start="2023-01-01", end="2025-12-01", freq="MS")
        n_months = len(dates)
        
        # Revenue with clear upwards trend and seasonality (spikes in Dec, dips in Jan)
        trend = np.linspace(100000, 220000, n_months)
        seasonality = 30000 * np.sin(2 * np.pi * dates.month / 12)
        noise = np.random.normal(0, 8000, n_months)
        revenue = np.array(trend + seasonality + noise)
        
        # Expense with an upwards trend and a sudden outlier spike in Oct 2024 (e.g. compliance lawsuit or tax audit penalty)
        expenses = np.array(0.65 * trend + 15000 * np.cos(2 * np.pi * dates.month / 12) + np.random.normal(0, 5000, n_months))
        
        # Inject explicit anomalies
        # Spike in October 2024 (expenses)
        oct_24_idx = list(dates).index(pd.Timestamp("2024-10-01"))
        expenses[oct_24_idx] += 85000  # Large anomalous expense spike!
        
        # Dip in December 2024 (revenue - unexpected supply chain bottleneck)
        dec_24_idx = list(dates).index(pd.Timestamp("2024-12-01"))
        revenue[dec_24_idx] -= 70000  # Large revenue anomaly!
        
        data = {
            "Date": [d.strftime("%Y-%m-%d") for d in dates],
            "Revenue": np.round(revenue, 2),
            "Expenses": np.round(expenses, 2),
            "Net_Profit": np.round(revenue - expenses, 2),
            "Active_Customers": np.round(np.linspace(1200, 2900, n_months) + 100 * np.sin(2 * np.pi * dates.month / 12)).astype(int),
            "Operational_Cost": np.round(expenses * 0.4 + np.random.normal(0, 2000, n_months), 2)
        }
        
        df = pd.DataFrame(data)
        
        dataset = Dataset(
            user_id=user_id,
            filename="Enterprise_Revenue_Ledger.csv",
            file_size=len(df.to_csv().encode('utf-8')),
            file_type="csv",
            status="processing"
        )
        db.add(dataset)
        db.commit()
        db.refresh(dataset)
        
        try:
            DatasetService.process_dataframe(db, dataset, df)
        except Exception as e:
            dataset.status = "error"
            dataset.error_message = f"Demo generation error: {str(e)}"
            db.add(dataset)
            db.commit()
            
        return dataset

    @staticmethod
    def _parse_to_dataframe(content: bytes, file_type: str) -> pd.DataFrame:
        if file_type == "csv":
            return pd.read_csv(io.BytesIO(content))
        elif file_type == "xlsx":
            return pd.read_excel(io.BytesIO(content))
        elif file_type == "json":
            return pd.read_json(io.BytesIO(content))
        else:
            raise ValueError(f"Unsupported file format: {file_type}")

    @staticmethod
    def process_dataframe(db: Session, dataset: Dataset, df: pd.DataFrame):
        # 1. Basic Cleaning
        df = df.loc[:, ~df.columns.str.contains('^Unnamed')] # Remove unnamed cols
        df = df.dropna(how='all') # Remove entirely blank rows
        
        # Update dataset stats
        dataset.row_count = len(df)
        dataset.col_count = len(df.columns)
        dataset.columns_json = list(df.columns)
        
        # 2. Extract column metadata
        for col in df.columns:
            series = df[col]
            missing_count = int(series.isna().sum())
            unique_count = int(series.nunique())
            
            # Detect data types
            if pd.api.types.is_numeric_dtype(series):
                data_type = "numeric"
                mean = float(series.mean()) if not np.isnan(series.mean()) else None
                std = float(series.std()) if not np.isnan(series.std()) else None
                min_val = float(series.min()) if not np.isnan(series.min()) else None
                max_val = float(series.max()) if not np.isnan(series.max()) else None
            elif pd.api.types.is_datetime64_any_dtype(series) or col.lower() in ['date', 'timestamp', 'month', 'year']:
                data_type = "date"
                mean, std, min_val, max_val = None, None, None, None
            else:
                data_type = "categorical"
                mean, std, min_val, max_val = None, None, None, None
                
            meta = DatasetMetadata(
                dataset_id=dataset.id,
                col_name=col,
                data_type=data_type,
                missing_count=missing_count,
                mean=mean,
                std=std,
                min=min_val,
                max=max_val,
                unique_count=unique_count
            )
            db.add(meta)
            
        # 3. Create descriptive stats and basic analytics record
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        desc_stats = {}
        for col in numeric_cols:
            desc_stats[col] = df[col].describe().to_dict()
            # Replace NaNs with None for JSON compliance
            desc_stats[col] = {k: (None if np.isnan(v) else v) for k, v in desc_stats[col].items()}
            
        # Correlation Matrix
        corr_matrix = {}
        if len(numeric_cols) > 1:
            corr_df = df[numeric_cols].corr()
            for col in corr_df.columns:
                corr_matrix[col] = corr_df[col].to_dict()
                corr_matrix[col] = {k: (None if np.isnan(v) else v) for k, v in corr_matrix[col].items()}
                
        # Simple outlier indices (e.g. Z-Score > 2.5)
        outliers = []
        for col in numeric_cols:
            mean = df[col].mean()
            std = df[col].std()
            if std > 0:
                z_scores = (df[col] - mean) / std
                outlier_indices = np.where(np.abs(z_scores) > 2.5)[0].tolist()
                outliers.extend(outlier_indices)
        outliers = list(set(outliers))
        
        analytics = AnalyticsResult(
            dataset_id=dataset.id,
            descriptive_stats_json=desc_stats,
            correlation_matrix_json=corr_matrix,
            outlier_indices_json=outliers
        )
        db.add(analytics)
        
        # 4. Generate core KPIs
        DatasetService._compute_and_save_kpis(db, dataset, df)
        
        # Mark dataset ready
        dataset.status = "ready"
        db.add(dataset)
        db.commit()

    @staticmethod
    def _compute_and_save_kpis(db: Session, dataset: Dataset, df: pd.DataFrame):
        """Deduce key standard corporate KPIs from the uploaded dataframe automatically."""
        # Find column mappings
        revenue_col = next((c for c in df.columns if c.lower() in ['revenue', 'sales', 'turnover', 'income']), None)
        expense_col = next((c for c in df.columns if c.lower() in ['expense', 'expenses', 'cost', 'spend']), None)
        date_col = next((c for c in df.columns if c.lower() in ['date', 'timestamp', 'month']), None)
        
        if revenue_col and pd.api.types.is_numeric_dtype(df[revenue_col]):
            # Revenue KPI
            current_rev = float(df[revenue_col].iloc[-1])
            prev_rev = float(df[revenue_col].iloc[-2]) if len(df) > 1 else None
            change = ((current_rev - prev_rev) / prev_rev * 100) if prev_rev else None
            health = "good" if (change is None or change >= 0) else "critical"
            
            kpi_rev = KPIMetric(
                dataset_id=dataset.id,
                metric_name="Total Revenue (Current Period)",
                current_value=current_rev,
                previous_value=prev_rev,
                percentage_change=change,
                health_status=health
            )
            db.add(kpi_rev)
            
        if expense_col and pd.api.types.is_numeric_dtype(df[expense_col]):
            # Expense KPI
            current_exp = float(df[expense_col].iloc[-1])
            prev_exp = float(df[expense_col].iloc[-2]) if len(df) > 1 else None
            change = ((current_exp - prev_exp) / prev_exp * 100) if prev_exp else None
            health = "critical" if (change and change > 10) else "good" # Spikes in expense is critical
            
            kpi_exp = KPIMetric(
                dataset_id=dataset.id,
                metric_name="Operating Expenses (Current Period)",
                current_value=current_exp,
                previous_value=prev_exp,
                percentage_change=change,
                health_status=health
            )
            db.add(kpi_exp)
            
        if revenue_col and expense_col:
            # Profit Margin KPI
            df['Profit'] = df[revenue_col] - df[expense_col]
            df['Margin'] = (df['Profit'] / df[revenue_col]) * 100
            current_margin = float(df['Margin'].iloc[-1])
            prev_margin = float(df['Margin'].iloc[-2]) if len(df) > 1 else None
            change = current_margin - prev_margin if prev_margin is not None else None
            health = "good" if current_margin >= 25 else ("stable" if current_margin >= 10 else "critical")
            
            kpi_margin = KPIMetric(
                dataset_id=dataset.id,
                metric_name="Net Profit Margin (%)",
                current_value=current_margin,
                previous_value=prev_margin,
                percentage_change=change,
                health_status=health
            )
            db.add(kpi_margin)
            
            # Cumulative Net Profit
            total_profit = float(df['Profit'].sum())
            kpi_total_profit = KPIMetric(
                dataset_id=dataset.id,
                metric_name="Cumulative Net Profit",
                current_value=total_profit,
                previous_value=None,
                percentage_change=None,
                health_status="good" if total_profit > 0 else "critical"
            )
            db.add(kpi_total_profit)
