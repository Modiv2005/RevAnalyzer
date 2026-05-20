import React from 'react';

interface CorrelationMatrixProps {
  matrix: { [key: string]: { [key: string]: number | null } };
  title: string;
}

export default function CorrelationMatrix({ matrix, title }: CorrelationMatrixProps) {
  const columns = Object.keys(matrix);
  
  if (columns.length === 0) {
    return (
      <div className="w-full bg-darkPanel/20 border border-darkBorder p-6 rounded-2xl shadow-xl flex items-center justify-center min-h-[200px]">
        <p className="text-xs text-gray-500">Insufficient numerical columns to calculate correlation coefficients.</p>
      </div>
    );
  }

  // Get background color dynamically based on correlation value (-1 to +1)
  const getCellBg = (val: number | null) => {
    if (val === null) return 'rgba(31, 41, 55, 0.3)'; // Slate background
    
    // Positive correlation (Blue)
    if (val >= 0) {
      return `rgba(37, 99, 235, ${val * 0.9})`; // Up to 90% opacity blue
    }
    // Negative correlation (Rose/Red)
    return `rgba(220, 38, 38, ${Math.abs(val) * 0.9})`; // Up to 90% opacity red
  };

  return (
    <div className="w-full bg-darkPanel/20 border border-darkBorder/40 p-6 rounded-2xl shadow-xl">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">{title}</h3>

      <div className="overflow-x-auto">
        <div className="min-w-[480px]">
          {/* HEADER ROW */}
          <div className="flex">
            <div className="w-24 flex-shrink-0"></div>
            {columns.map(col => (
              <div key={col} className="flex-1 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider p-2 truncate">
                {col}
              </div>
            ))}
          </div>

          {/* VALUES ROWS */}
          <div className="space-y-1 mt-1">
            {columns.map(rowCol => (
              <div key={rowCol} className="flex items-center">
                {/* Row Label */}
                <div className="w-24 flex-shrink-0 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider pr-2 truncate">
                  {rowCol}
                </div>

                {/* Heatmap cells */}
                {columns.map(col => {
                  const val = matrix[rowCol][col];
                  return (
                    <div 
                      key={col} 
                      style={{ backgroundColor: getCellBg(val) }}
                      className="flex-1 border border-darkBg p-3 rounded-lg text-center text-xs font-bold text-white shadow-inner transition-all duration-200 hover:scale-105 hover:z-10 cursor-help"
                      title={`Correlation between ${rowCol} and ${col}: ${val !== null ? val.toFixed(3) : 'N/A'}`}
                    >
                      {val !== null ? val.toFixed(2) : '-'}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

        </div>
      </div>
      
      {/* LEGEND BAR */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-darkBorder/40 text-[9px] text-gray-500 font-bold uppercase tracking-wider">
        <span>🔴 Negative Correlation (-1.0)</span>
        <span>⚪ Neutral (0.0)</span>
        <span>🔵 Positive Correlation (+1.0)</span>
      </div>
    </div>
  );
}
