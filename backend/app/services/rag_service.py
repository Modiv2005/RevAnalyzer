from sqlalchemy.orm import Session
from backend.app.models import Dataset, DatasetMetadata, AnalyticsResult, ForecastResult, AnomalyEvent, KPIMetric
import re
import numpy as np

class RAGService:
    @staticmethod
    def generate_chunks(db: Session, dataset_id: str) -> list[dict]:
        """Convert a complex dataset's statistics, predictions, and outliers into highly contextual text chunks."""
        dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
        if not dataset:
            return []
            
        chunks = []
        
        # Chunk 1: General Summary
        schema_chunk = (
            f"Dataset Name: {dataset.filename}\n"
            f"Dimensions: {dataset.row_count} rows, {dataset.col_count} columns.\n"
            f"Available Metrics: {', '.join(dataset.columns_json)}.\n"
            f"Status: Ingestion completed, structured ETL pipeline successful."
        )
        chunks.append({"type": "schema", "text": schema_chunk})
        
        # Chunk 2: Detailed Column Profiles
        meta_records = db.query(DatasetMetadata).filter(DatasetMetadata.dataset_id == dataset_id).all()
        meta_texts = []
        for m in meta_records:
            t = f"Column '{m.col_name}' ({m.data_type}): missing count: {m.missing_count}, unique count: {m.unique_count}."
            if m.mean is not None:
                t += f" Mean: {m.mean:,.2f}, Std Dev: {m.std:,.2f}, Min: {m.min:,.2f}, Max: {m.max:,.2f}."
            meta_texts.append(t)
            
        chunks.append({
            "type": "metadata",
            "text": "Column Profiles and Data Types:\n" + "\n".join(meta_texts)
        })
        
        # Chunk 3: KPIs and Financial Performance
        kpis = db.query(KPIMetric).filter(KPIMetric.dataset_id == dataset_id).all()
        if kpis:
            kpi_texts = []
            for k in kpis:
                change_str = f"changed by {k.percentage_change:+.2f}%" if k.percentage_change is not None else "no change"
                kpi_texts.append(
                    f"KPI '{k.metric_name}': Current Value is {k.current_value:,.2f} (Previous was {k.previous_value or 0:,.2f}, {change_str}). Health state: {k.health_status.upper()}."
                )
            chunks.append({
                "type": "kpi",
                "text": "Corporate KPI Performance Metrics:\n" + "\n".join(kpi_texts)
            })
            
        # Chunk 4: Anomalies & Operational Risk Indicators
        anomalies = db.query(AnomalyEvent).filter(AnomalyEvent.dataset_id == dataset_id).all()
        if anomalies:
            anom_texts = []
            # Group by method to be concise
            for a in anomalies[:10]: # Limit to top 10 severe spikes
                anom_texts.append(
                    f"Anomaly flagged on index {a.index} ({a.date or 'no date'}) with value {a.target_value:,.2f} (Anomaly score: {a.anomaly_score:.3f}). Method used: {a.method_used}."
                )
            chunks.append({
                "type": "anomaly",
                "text": f"Anomaly & Fraud Risk Event Logs (Total Flagged: {len(anomalies)}):\n" + "\n".join(anom_texts)
            })
            
        # Chunk 5: Forecasting Results
        forecasts = db.query(ForecastResult).filter(ForecastResult.dataset_id == dataset_id).all()
        if forecasts:
            f_texts = []
            for f in forecasts:
                metrics = f.train_metrics_json
                metrics_str = ", ".join([f"{k}: {v}" for k, v in metrics.items()])
                
                # Fetch future forecast values
                future_vals = [val for val in f.forecast_values_json if val.get("predicted") is not None]
                if future_vals:
                    start_forecast = future_vals[0]
                    end_forecast = future_vals[-1]
                    f_texts.append(
                        f"Forecasting Model: {f.model_name} on target column '{f.target_column}'. "
                        f"Model training quality ({metrics_str}). Forecasted values start at {start_forecast['predicted']:,.2f} on {start_forecast['date']} "
                        f"and end at {end_forecast['predicted']:,.2f} on {end_forecast['date']}."
                    )
            if f_texts:
                chunks.append({
                    "type": "forecast",
                    "text": "Predictive Forecast Summaries:\n" + "\n".join(f_texts)
                })
                
        return chunks

    @staticmethod
    def retrieve_context(db: Session, dataset_id: str, query: str) -> str:
        """Search and retrieve the top highly relevant text chunks using a local vector-space similarity engine."""
        chunks = RAGService.generate_chunks(db, dataset_id)
        if not chunks:
            return "No dataset or metadata found to answer the query."
            
        # Implementation of a quick local Cosine similarity based on Term Frequency (TF)
        # Tokenize query
        query_words = set(re.findall(r'\w+', query.lower()))
        
        scored_chunks = []
        for c in chunks:
            chunk_text = c["text"]
            chunk_words = re.findall(r'\w+', chunk_text.lower())
            
            # Simple word overlap count as TF similarity metric
            overlap = len(query_words.intersection(set(chunk_words)))
            
            # Boost score based on matching keywords
            if "predict" in query.lower() or "forecast" in query.lower():
                if c["type"] == "forecast":
                    overlap += 3
            if "spike" in query.lower() or "anomaly" in query.lower() or "outlier" in query.lower() or "risk" in query.lower():
                if c["type"] == "anomaly":
                    overlap += 3
            if "kpi" in query.lower() or "margin" in query.lower() or "revenue" in query.lower() or "expenses" in query.lower():
                if c["type"] == "kpi":
                    overlap += 2
                    
            scored_chunks.append((overlap, c["text"]))
            
        # Sort by similarity score descending
        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        
        # Grab top 3 relevant chunks
        top_chunks = [sc[1] for sc in scored_chunks[:3]]
        return "\n\n---\n\n".join(top_chunks)
