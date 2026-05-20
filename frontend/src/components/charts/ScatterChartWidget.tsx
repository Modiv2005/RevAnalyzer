import React from 'react';
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ZAxis 
} from 'recharts';

interface ScatterPoint {
  index: number;
  date?: string;
  value: number;
  isAnomaly: boolean;
}

interface ScatterChartWidgetProps {
  data: ScatterPoint[];
  title: string;
  height?: number;
}

export default function ScatterChartWidget({ data, title, height = 300 }: ScatterChartWidgetProps) {
  // Separate into normal and anomalous points for custom coloring
  const normalPoints = data.filter(p => !p.isAnomaly);
  const anomalyPoints = data.filter(p => p.isAnomaly);

  const formatYAxis = (tick: number) => {
    if (tick >= 1000000) return `$${(tick / 1000000).toFixed(1)}M`;
    if (tick >= 1000) return `$${(tick / 1000).toFixed(0)}k`;
    return `$${tick}`;
  };

  return (
    <div className="w-full bg-darkPanel/20 border border-darkBorder/40 p-6 rounded-2xl shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
        <div className="flex gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-gray-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Standard Inliers
          </span>
          <span className="flex items-center gap-1.5 text-gray-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span> Risk Anomalies
          </span>
        </div>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              dataKey="index" 
              name="Sequence Index" 
              stroke="#4b5563" 
              fontSize={10}
              tickLine={false}
            />
            <YAxis 
              type="number" 
              dataKey="value" 
              name="Amount" 
              stroke="#4b5563" 
              fontSize={10}
              tickLine={false}
              tickFormatter={formatYAxis}
            />
            <ZAxis type="number" range={[50, 200]} />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }: any) => {
                if (active && payload && payload.length) {
                  const pt = payload[0].payload;
                  return (
                    <div className="bg-darkPanel border border-darkBorder p-3 rounded-xl shadow-2xl">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                        Index {pt.index} ({pt.date || 'no date'})
                      </p>
                      <p className={`text-xs font-bold ${pt.isAnomaly ? 'text-red-400' : 'text-blue-400'}`}>
                        {pt.isAnomaly ? '🚨 Anomaly Spurt: ' : 'Standard Amount: '}
                        <span className="text-white">${pt.value.toLocaleString()}</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Standard nodes */}
            <Scatter name="Standard Inliers" data={normalPoints} fill="#3b82f6" opacity={0.6} />
            {/* Anomalous outlier nodes */}
            <Scatter name="Risk Outliers" data={anomalyPoints} fill="#ef4444" shape="circle" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
