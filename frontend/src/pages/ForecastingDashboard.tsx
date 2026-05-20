import React, { useEffect, useState } from 'react';
import { useDatasetStore, ColumnMetadata } from '../store/datasetStore';
import LineChartWidget from '../components/charts/LineChartWidget';
import { 
  TrendingUp, 
  Settings2, 
  SlidersHorizontal, 
  HelpCircle, 
  Loader2, 
  Percent, 
  ArrowRight,
  TrendingDown
} from 'lucide-react';

export default function ForecastingDashboard() {
  const { selectedDataset } = useDatasetStore();
  const [columns, setColumns] = useState<ColumnMetadata[]>([]);
  
  // Form State
  const [targetCol, setTargetCol] = useState('');
  const [dateCol, setDateCol] = useState('');
  const [modelName, setModelName] = useState('ARIMA');
  const [horizon, setHorizon] = useState(12);
  
  // Result State
  const [forecastRes, setForecastRes] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDataset) return;
    const token = localStorage.getItem('bi_token');
    if (!token) return;

    const fetchSchema = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/v1/datasets/${selectedDataset.id}/metadata`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setColumns(data);
          
          // Auto select defaults
          const dateM = data.find((c: any) => c.data_type === 'date' || c.col_name.toLowerCase().includes('date'));
          if (dateM) setDateCol(dateM.col_name);
          
          const numM = data.find((c: any) => c.data_type === 'numeric' && !c.col_name.toLowerCase().includes('profit') && !c.col_name.toLowerCase().includes('cost'));
          if (numM) setTargetCol(numM.col_name);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchSchema();
    setForecastRes(null);
  }, [selectedDataset]);

  const handleRunForecast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCol || !dateCol) {
      setError("Please map the required Target and Date dimensions first.");
      return;
    }
    setError(null);
    setIsLoading(true);
    const token = localStorage.getItem('bi_token');

    try {
      const res = await fetch('http://localhost:8000/api/v1/forecasting/run', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dataset_id: selectedDataset?.id,
          target_column: targetCol,
          date_column: dateCol,
          model_name: modelName,
          forecast_horizon: horizon
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Forecasting compilation failed.");

      setForecastRes(data);
    } catch (err: any) {
      setError(err.message || "Failed to contact predictive modeling worker.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedDataset) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center glass-panel p-8 rounded-3xl border border-darkBorder">
        <TrendingUp className="w-12 h-12 text-blue-500 mb-4 animate-pulse" />
        <h3 className="text-base font-bold text-white font-outfit uppercase mb-2">No Active Dataset Loaded</h3>
        <p className="text-xs text-gray-400 max-w-sm mb-6">
          To simulate machine learning ARIMA, Holt-Winters or Gradient Boosting forecasts, select a ledger in the Ingestion Center first.
        </p>
      </div>
    );
  }

  const numericCols = columns.filter(c => c.data_type === 'numeric');
  const dateCols = columns.filter(c => c.data_type === 'date' || c.col_name.toLowerCase().includes('date') || c.col_name.toLowerCase().includes('month'));

  return (
    <div className="space-y-8 animate-fade-in select-none">
      
      {/* 2 COLUMNS PANEL: SIMULATOR SETTINGS & VALIDATION METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* SETTINGS CARD */}
        <form onSubmit={handleRunForecast} className="md:col-span-1 p-6 rounded-3xl border border-darkBorder bg-darkPanel/50 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                <Settings2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider leading-none">Simulation Parameters</h3>
                <p className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider mt-1">Configure models and dimensions</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Target Metric (Y)</label>
                <select
                  value={targetCol}
                  onChange={e => setTargetCol(e.target.value)}
                  className="w-full bg-darkBg border border-darkBorder rounded-xl py-3 px-4 text-xs text-white focus:border-blue-500 focus:outline-none transition duration-200 cursor-pointer"
                >
                  <option value="" className="bg-darkPanel">Select target column...</option>
                  {numericCols.map(c => (
                    <option key={c.col_name} value={c.col_name} className="bg-darkPanel">{c.col_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Temporal Index (X)</label>
                <select
                  value={dateCol}
                  onChange={e => setDateCol(e.target.value)}
                  className="w-full bg-darkBg border border-darkBorder rounded-xl py-3 px-4 text-xs text-white focus:border-blue-500 focus:outline-none transition duration-200 cursor-pointer"
                >
                  <option value="" className="bg-darkPanel">Select date column...</option>
                  {dateCols.map(c => (
                    <option key={c.col_name} value={c.col_name} className="bg-darkPanel">{c.col_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Forecasting Engine</label>
                <select
                  value={modelName}
                  onChange={e => setModelName(e.target.value)}
                  className="w-full bg-darkBg border border-darkBorder rounded-xl py-3 px-4 text-xs text-white focus:border-blue-500 focus:outline-none transition duration-200 cursor-pointer"
                >
                  <option value="ARIMA" className="bg-darkPanel">ARIMA (Statistical Seasonality)</option>
                  <option value="exponential_smoothing" className="bg-darkPanel">Holt-Winters (Exponential smoothing)</option>
                  <option value="linear_regression" className="bg-darkPanel">Linear Trend Baseline</option>
                  <option value="random_forest" className="bg-darkPanel">Random Forest Lag Regressor (ML)</option>
                  <option value="gradient_boosting" className="bg-darkPanel">Gradient Boosting Lag Regressor (ML)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Horizon Projection: {horizon} Months</label>
                <input
                  type="range"
                  min="3"
                  max="24"
                  value={horizon}
                  onChange={e => setHorizon(Number(e.target.value))}
                  className="w-full h-1 bg-darkBg rounded-lg appearance-none cursor-pointer focus:outline-none accent-blue-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-semibold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 glow-cobalt"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Execute Forecast Simulator"}
          </button>
        </form>

        {/* METRICS & ERROR CORNER */}
        <div className="md:col-span-2 flex flex-col justify-between space-y-6">
          
          {error && (
            <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-xs text-rose-400 font-semibold flex items-center gap-3">
              <TrendingDown className="w-5 h-5 flex-shrink-0 animate-bounce" />
              <span>{error}</span>
            </div>
          )}

          {forecastRes ? (
            <div className="p-6 rounded-3xl border border-darkBorder bg-darkPanel/30 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                    <SlidersHorizontal className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider leading-none">Model Validation Metrics</h3>
                    <p className="text-[9px] text-gray-500 font-semibold uppercase tracking-wider mt-1">Cross-validation backtest accuracy</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-darkBg/30 border border-darkBorder rounded-2xl">
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">Root Mean Squared Error (RMSE)</p>
                    <p className="text-lg font-bold text-white font-outfit">{forecastRes.metrics.RMSE.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-darkBg/30 border border-darkBorder rounded-2xl">
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">Mean Absolute Percentage Error (MAPE)</p>
                    <p className="text-lg font-bold text-white font-outfit">{forecastRes.metrics.MAPE.toFixed(2)}%</p>
                  </div>
                  <div className="p-4 bg-darkBg/30 border border-darkBorder rounded-2xl">
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">Mean Absolute Error (MAE)</p>
                    <p className="text-lg font-bold text-white font-outfit">{forecastRes.metrics.MAE.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-darkBg/30 border border-darkBorder rounded-2xl">
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">R² Coefficient of Determination</p>
                    <p className="text-lg font-bold text-white font-outfit">{forecastRes.metrics.R2.toFixed(4)}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-darkBorder/40 text-[10px] text-gray-500 font-bold uppercase flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                <span>R² close to 1.0 indicates extremely strong trend alignment.</span>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl border border-darkBorder bg-darkPanel/20 flex-1 flex flex-col justify-center items-center text-center">
              <TrendingUp className="w-10 h-10 text-gray-600 mb-4 animate-pulse" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">No Active Forecast Simulated</h4>
              <p className="text-[11px] text-gray-400 max-w-xs leading-normal">
                Map the required target column (e.g. Revenue) and hit the simulate button on the left to deploy ML model runs.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* FORECAST COMPOSED CHART PLOT */}
      {forecastRes && (
        <div className="animate-slide-up">
          <LineChartWidget 
            data={forecastRes.forecast_values} 
            targetColumn={forecastRes.target_column} 
          />
        </div>
      )}

    </div>
  );
}
