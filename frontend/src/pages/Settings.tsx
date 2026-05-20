import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Settings, Cpu, HardDrive, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <div className="max-w-3xl space-y-8 animate-fade-in select-none">
      
      {/* SUCCESS POPUP */}
      {success && (
        <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-400 font-semibold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>Local configuration saved successfully!</span>
        </div>
      )}

      {/* CORE CONFIG CARD */}
      <div className="p-6 bg-darkPanel/20 border border-darkBorder/40 rounded-3xl shadow-xl space-y-6">
        
        <div className="flex items-center gap-3 border-b border-darkBorder pb-4">
          <Settings className="w-5 h-5 text-blue-400 animate-spin-slow" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider leading-none">Global Configurations</h3>
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-1">Configure endpoints and engines</p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">FastAPI Gateway URL</label>
            <input 
              type="text" 
              value="http://localhost:8000/api/v1" 
              disabled 
              className="w-full bg-darkBg border border-darkBorder rounded-xl py-3 px-4 text-xs text-gray-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">RAG Context Grounding Strategy</label>
            <div className="p-4 bg-darkBg/20 border border-darkBorder rounded-xl flex items-center justify-between">
              <span className="text-gray-400">Lightweight Keyword Vector Search</span>
              <span className="text-[9px] px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold uppercase rounded">Standard</span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Local Analyst Heuristics Engine</label>
            <div className="p-4 bg-darkBg/20 border border-darkBorder rounded-xl flex items-center justify-between">
              <span className="text-gray-400">Inspecting database bounds, trends, and severity coefficients</span>
              <span className="text-[9px] px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold uppercase rounded">Grounded</span>
            </div>
          </div>

        </div>

        <button
          onClick={handleSave}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-xs uppercase tracking-wider transition-all duration-200 glow-cobalt"
        >
          Save Configuration
        </button>

      </div>

    </div>
  );
}
