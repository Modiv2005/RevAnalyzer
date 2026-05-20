import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

interface BarChartWidgetProps {
  data: any[];
  xKey: string;
  yKey: string;
  title: string;
  height?: number;
}

export default function BarChartWidget({ data, xKey, yKey, title, height = 300 }: BarChartWidgetProps) {
  const formatYAxis = (tick: number) => {
    if (tick >= 1000000) return `$${(tick / 1000000).toFixed(1)}M`;
    if (tick >= 1000) return `$${(tick / 1000).toFixed(0)}k`;
    return `$${tick}`;
  };

  return (
    <div className="w-full bg-darkPanel/20 border border-darkBorder/40 p-6 rounded-2xl shadow-xl">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">{title}</h3>
      
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey={xKey} 
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
            <Tooltip 
              cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
              content={({ active, payload, label }: any) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-darkPanel border border-darkBorder p-3 rounded-xl shadow-2xl">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{label}</p>
                      <p className="text-xs text-blue-400 font-bold">
                        {yKey}: <span className="text-white">${payload[0].value.toLocaleString()}</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey={yKey} 
              fill="url(#barGradient)" 
              radius={[4, 4, 0, 0]}
              maxBarSize={45}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
