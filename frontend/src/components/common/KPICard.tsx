import React from 'react';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: number | string;
  previousValue?: number | string;
  change?: number;
  health: 'good' | 'stable' | 'critical';
  prefix?: string;
  suffix?: string;
}

export default function KPICard({ title, value, previousValue, change, health, prefix = '', suffix = '' }: KPICardProps) {
  const isPositive = change !== undefined ? change >= 0 : true;
  
  // Format numeric values
  const formatVal = (val: number | string) => {
    if (typeof val === 'number') {
      return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return val;
  };

  const healthClasses = {
    good: 'border-emerald-500/20 hover:border-emerald-500/40 shadow-emerald-500/5 text-emerald-400',
    stable: 'border-blue-500/20 hover:border-blue-500/40 shadow-blue-500/5 text-blue-400',
    critical: 'border-rose-500/20 hover:border-rose-500/40 shadow-rose-500/5 text-rose-400 animate-pulse-slow',
  };

  const badgeColors = {
    good: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    stable: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    critical: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  return (
    <div className={`p-6 rounded-2xl bg-darkPanel/50 border transition-all duration-300 shadow-xl glass-panel-hover ${healthClasses[health]}`}>
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs uppercase tracking-wider font-semibold text-gray-400">{title}</span>
        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md border uppercase ${badgeColors[health]}`}>
          {health}
        </span>
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-bold font-outfit text-white">
          {prefix}{formatVal(value)}{suffix}
        </span>
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-1.5 text-xs">
          <div className={`flex items-center gap-0.5 font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{isPositive ? '+' : ''}{change.toFixed(2)}%</span>
          </div>
          {previousValue !== undefined && (
            <span className="text-gray-500 font-medium">
              vs {prefix}{formatVal(previousValue)}{suffix} last period
            </span>
          )}
        </div>
      )}

      {change === undefined && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
          <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          <span>Active telemetry monitoring online</span>
        </div>
      )}
    </div>
  );
}
