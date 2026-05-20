import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from backend.app.models import Dataset, AnalyticsResult
from backend.app.services.dataset_service import DatasetService
import io

class AnalyticsService:
    @staticmethod
    def get_analytics(db: Session, dataset_id: str) -> dict:
        analytics = db.query(AnalyticsResult).filter(AnalyticsResult.dataset_id == dataset_id).first()
        if analytics:
            return {
                "id": analytics.id,
                "dataset_id": analytics.dataset_id,
                "correlation_matrix": analytics.correlation_matrix_json,
                "descriptive_stats": analytics.descriptive_stats_json,
                "outlier_indices": analytics.outlier_indices_json,
            }
        return {}

    @staticmethod
    def get_column_distribution(df: pd.DataFrame, col_name: str, bins: int = 10) -> list[dict]:
        """Generate interactive frequency histogram coordinates for Recharts."""
        if col_name not in df.columns:
            return []
        
        series = df[col_name].dropna()
        if not pd.api.types.is_numeric_dtype(series) or len(series) == 0:
            # Handle categorical distribution
            counts = series.value_counts().head(bins)
            return [{"bin_range": str(k), "count": int(v)} for k, v in counts.items()]
            
        counts, bin_edges = np.histogram(series, bins=bins)
        res = []
        for i in range(len(counts)):
            bin_range = f"{bin_edges[i]:.1f} - {bin_edges[i+1]:.1f}"
            res.append({
                "bin_range": bin_range,
                "count": int(counts[i]),
                "lower_edge": float(bin_edges[i]),
                "upper_edge": float(bin_edges[i+1])
            })
        return res

    @staticmethod
    def get_correlation_matrix(df: pd.DataFrame) -> dict:
        numeric_df = df.select_dtypes(include=[np.number])
        if numeric_df.empty:
            return {}
        corr = numeric_df.corr().round(3)
        return corr.to_dict()

    @staticmethod
    def detect_outliers_iqr(df: pd.DataFrame, col_name: str) -> list[dict]:
        """Detect outliers using the robust Interquartile Range (IQR) method."""
        if col_name not in df.columns or not pd.api.types.is_numeric_dtype(df[col_name]):
            return []
        
        series = df[col_name]
        q1 = series.quantile(0.25)
        q3 = series.quantile(0.75)
        iqr = q3 - q1
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        
        outliers = df[(series < lower_bound) | (series > upper_bound)]
        date_col = next((c for c in df.columns if c.lower() in ['date', 'timestamp', 'month']), None)
        
        result = []
        for idx, row in outliers.iterrows():
            result.append({
                "index": int(idx),
                "date": str(row[date_col]) if date_col else f"Row {idx}",
                "value": float(row[col_name]),
                "lower_bound": float(lower_bound),
                "upper_bound": float(upper_bound)
            })
        return result
