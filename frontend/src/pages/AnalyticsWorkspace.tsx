import React, { useEffect, useState } from 'react';
import { useDatasetStore, ColumnMetadata } from '../store/datasetStore';
import CorrelationMatrix from '../components/charts/CorrelationMatrix';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { 
  BarChart3, 
  HelpCircle, 
  Percent, 
  TrendingUp, 
  Hash, 
  Loader2, 
  AlertTriangle 
} from 'lucide-react';

export default function AnalyticsWorkspace() {
  const { selectedDataset } = useDatasetStore();
  const [columnsMeta, setColumnsMeta] = useState<ColumnMetadata[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [activeCol, setActiveCol] = useState<string>('');
  const [distribution, setDistribution] = useState<any[]>([]);
  const [outliers, setOutliers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!selectedDataset) return;
    const token = localStorage.getItem('bi_token');
    if (!token) return;

    const fetchEDAData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch column metadata
        const mRes = await fetch(`http://localhost:8000/api/v1/datasets/${selectedDataset.id}/metadata`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (mRes.ok) {
          const mData = await mRes.json();
          setColumnsMeta(mData);
          
          // Auto select first numeric column
          const firstNumeric = mData.find((m: ColumnMetadata) => m.data_type === 'numeric');
          if (firstNumeric) setActiveCol(firstNumeric.col_name);
        }

        // 2. Fetch descriptive stats & correlation
        const sRes = await fetch(`http://localhost:8000/api/v1/analytics/${selectedDataset.id}/summary`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (sRes.ok) {
          const sData = await sRes.json();
          setSummary(sData);
        }
      } catch (err) {
        console.error("Error loading EDA metrics:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEDAData();
  }, [selectedDataset]);

  // Load column distribution and outliers when activeCol changes
  useEffect(() => {
    if (!selectedDataset || !activeCol) return;
    const token = localStorage.getItem('bi_token');
    
    const fetchColMetrics = async () => {
      try {
        // Distribution bins
        const dRes = await fetch(`http://localhost:8000/api/v1/analytics/${selectedDataset.id}/distribution/${activeCol}?bins=10`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (dRes.ok) {
          const dData = await dRes.json();
          setDistribution(dData);
        }

        // IQR outliers
        const oRes = await fetch(`http://localhost:8000/api/v1/analytics/${selectedDataset.id}/outliers/${activeCol}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (oRes.ok) {
          const oData = await oRes.json();
          setOutliers(oData);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchColMetrics();
  }, [selectedDataset, activeCol]);

  if (!selectedDataset) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-center glass-panel p-8 rounded-3xl border border-darkBorder">
        <BarChart3 className="w-12 h-12 text-blue-500 mb-4 animate-pulse" />
        <h3 className="text-base font-bold text-white font-outfit uppercase mb-2">No Active Ledger Loaded</h3>
        <p className="text-xs text-gray-400 max-w-sm mb-6">
          To run correlation profiling or distributions histograms, please select a workspace dataset in the Ingestion Center first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in select-none">
      
      {/* 2 PANELS GRID: COLUMN METADATA SUMMARY & CORRELATION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* COLUMN PROFILES TABLE */}
        <div className="md:col-span-1 bg-darkPanel/20 border border-darkBorder/40 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Workspace Schema Profiles</h3>
            <p className="text-[10px] text-gray-400 mb-6">Complete descriptive metrics of columns</p>
          </div>

          <div className="overflow-y-auto max-h-[360px] pr-2 space-y-3">
            {columnsMeta.map((m: ColumnMetadata) => {
              const isActive = activeCol === m.col_name;
              return (
                <div 
                  key={m.col_name}
                  onClick={() => m.data_type === 'numeric' && setActiveCol(m.col_name)}
                  className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isActive 
                      ? 'border-blue-500 bg-blue-600/5 glow-cobalt' 
                      : 'border-darkBorder hover:border-gray-700 bg-darkBg/10'
                  } ${m.data_type !== 'numeric' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-xs text-white truncate max-w-[140px]">{m.col_name}</span>
                    <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider flex items-center gap-1">
                      {m.data_type === 'numeric' ? <Hash className="w-3 h-3 text-blue-400" /> : <Percent className="w-3 h-3 text-purple-400" />}
                      {m.data_type}
                    </span>
                  </div>
                  
                  {m.data_type === 'numeric' && m.mean !== undefined && (
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 font-semibold uppercase">
                      <div>Mean: <span className="text-gray-300 font-bold">${m.mean.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span></div>
                      <div>Unique: <span className="text-gray-300 font-bold">{m.unique_count}</span></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CORRELATION MATRIX HEATMAP */}
        <div className="md:col-span-2">
          {summary?.correlation_matrix ? (
            <CorrelationMatrix 
              matrix={summary.correlation_matrix} 
              title="Metric Interdependency Heatmap" 
            />
          ) : (
            <div className="w-full bg-darkPanel/20 border border-darkBorder p-6 rounded-2xl shadow-xl flex items-center justify-center min-h-[300px]">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          )}
        </div>

      </div>

      {/* DYNAMIC EXPLORATION GRID FOR SELECTED COLUMN */}
      {activeCol && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* DISTRIBUTION BAR CHART */}
          <div className="md:col-span-2 bg-darkPanel/20 border border-darkBorder/40 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Frequency Density Histogram</h3>
              <p className="text-[10px] text-gray-400 mb-6">Distribution count of values across bins for column <span className="text-blue-400 font-semibold">{activeCol}</span></p>
            </div>

            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="bin_range" stroke="#4b5563" fontSize={9} tickLine={false} dy={8} />
                  <YAxis stroke="#4b5563" fontSize={9} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    content={({ active, payload, label }: any) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-darkPanel border border-darkBorder p-3 rounded-xl shadow-2xl">
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1">{label}</p>
                            <p className="text-xs text-blue-400 font-bold">
                              Count: <span className="text-white">{payload[0].value} rows</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" opacity={0.85} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* OUTLIERS LIST FOR THIS COLUMN */}
          <div className="bg-darkPanel/20 border border-darkBorder/40 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">IQR Outliers Checklist</h3>
              <p className="text-[10px] text-gray-400 mb-6">Row indices flagged using 1.5x IQR boundaries</p>
            </div>

            <div className="overflow-y-auto max-h-[220px] pr-2 space-y-2 flex-1">
              {outliers.length === 0 ? (
                <p className="text-center text-xs text-gray-500 font-medium py-12">No statistical outliers found in this column.</p>
              ) : (
                outliers.map((o: any) => (
                  <div key={o.index} className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wide">Index {o.index}</p>
                      <p className="text-xs font-semibold text-white">{o.date || `Row ${o.index}`}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-red-400">${o.value.toLocaleString()}</p>
                      <span className="text-[8px] px-1.5 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded font-semibold tracking-wider">Out of Bounds</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
