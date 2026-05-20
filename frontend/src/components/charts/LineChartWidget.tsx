import React from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

interface ForecastValue {
  date: string;
  actual?: number | null;
  predicted?: number | null;
  lower_ci?: number | null;
  upper_ci?: number | null;
}

interface LineChartWidgetProps {
  data: ForecastValue[];
  targetColumn: string;
  height?: number;
}

export default function LineChartWidget({ data, targetColumn, height = 360 }: LineChartWidgetProps) {
  // Format long tooltip labels
  const formatYAxis = (tick: number) => {
    if (tick >= 1000000) return `$${(tick / 1000000).toFixed(1)}M`;
    if (tick >= 1000) return `$${(tick / 1000).toFixed(0)}k`;
    return `$${tick}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-darkPanel border border-darkBorder p-4 rounded-xl shadow-2xl backdrop-blur-md">
          <p className="text-xs text-gray-400 font-bold mb-2 uppercase tracking-wide">{label}</p>
          <div className="space-y-1.5 text-xs">
            {payload[0] && payload[0].value !== undefined && payload[0].value !== null && (
              <p className="text-blue-400 font-semibold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                Actual: <span className="text-white font-bold">${payload[0].value.toLocaleString()}</span>
              </p>
            )}
            {payload[1] && payload[1].value !== undefined && payload[1].value !== null && (
              <p className="text-emerald-400 font-semibold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Forecast: <span className="text-white font-bold">${payload[1].value.toLocaleString()}</span>
              </p>
            )}
            {payload[2] && payload[2].value !== undefined && payload[2].value[0] !== undefined && (
              <p className="text-gray-400 font-medium flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-500"></span>
                95% CI Range: <span className="text-white font-bold">${payload[2].value[0].toLocaleString()} - ${payload[2].value[1].toLocaleString()}</span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Restructure data for area range [lower_ci, upper_ci]
  const processedData = data.map(item => ({
    ...item,
    confidence_interval: (item.lower_ci !== null && item.upper_ci !== null) 
      ? [item.lower_ci, item.upper_ci] 
      : null
  }));

  return (
    <div className="w-full bg-darkPanel/20 border border-darkBorder/40 p-6 rounded-2xl shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Predictive Trend Chart</h3>
          <p className="text-[10px] text-gray-400">Forecasting target column: <span className="text-blue-400 font-semibold">{targetColumn}</span></p>
        </div>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-gray-400 font-medium">
            <span className="w-3 h-1 bg-blue-500 rounded"></span> Actuals
          </span>
          <span className="flex items-center gap-1.5 text-gray-400 font-medium">
            <span className="w-3 h-1 border-t-2 border-dashed border-emerald-500"></span> AI Forecast
          </span>
          <span className="flex items-center gap-1.5 text-gray-400 font-medium">
            <span className="w-3 h-2 bg-emerald-500/10 border border-emerald-500/20 rounded"></span> Confidence Interval
          </span>
        </div>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <ComposedChart data={processedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="ciGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.05}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#4b5563" 
              fontSize={10}
              tickLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#4b5563" 
              fontSize={10}
              tickLine={false}
              tickFormatter={formatYAxis}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Confidence Interval band */}
            <Area 
              type="monotone" 
              dataKey="confidence_interval" 
              stroke="none" 
              fill="url(#ciGradient)" 
              fillOpacity={1}
            />

            {/* Historical actual value area */}
            <Area 
              type="monotone" 
              dataKey="actual" 
              stroke="none" 
              fill="url(#actualGradient)"
            />

            {/* Actual value solid line */}
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke="#2563eb" 
              strokeWidth={3} 
              dot={false}
              activeDot={{ r: 6, stroke: '#0b0f19', strokeWidth: 2 }}
            />

            {/* Forecasted predicted dashed line */}
            <Line 
              type="monotone" 
              dataKey="predicted" 
              stroke="#059669" 
              strokeWidth={2} 
              strokeDasharray="5 5" 
              dot={{ r: 3, fill: '#059669', stroke: '#0b0f19', strokeWidth: 1 }}
              activeDot={{ r: 6, stroke: '#0b0f19', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
