import React, { useEffect, useState } from 'react';
import { ShieldCheck, Database, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';

interface AdminStats {
  total_users: number;
  total_datasets: number;
  total_forecasts: number;
  total_anomalies: number;
  total_chat_sessions: number;
}

export default function AdminPanel() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('bi_token');
    if (!token) return;

    const fetchAdminStats = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('http://localhost:8000/api/v1/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in select-none">
      
      {/* 4 COUNTER CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        <div className="p-6 rounded-2xl bg-darkPanel/50 border border-darkBorder flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Enrolled Users</p>
            <p className="text-2xl font-bold text-white font-outfit">{stats?.total_users || 1}</p>
          </div>
          <ShieldCheck className="w-8 h-8 text-blue-400" />
        </div>

        <div className="p-6 rounded-2xl bg-darkPanel/50 border border-darkBorder flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Ingested Ledgers</p>
            <p className="text-2xl font-bold text-white font-outfit">{stats?.total_datasets || 0}</p>
          </div>
          <Database className="w-8 h-8 text-emerald-400" />
        </div>

        <div className="p-6 rounded-2xl bg-darkPanel/50 border border-darkBorder flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">AI Chat Sessions</p>
            <p className="text-2xl font-bold text-white font-outfit">{stats?.total_chat_sessions || 0}</p>
          </div>
          <MessageSquare className="w-8 h-8 text-purple-400" />
        </div>

        <div className="p-6 rounded-2xl bg-darkPanel/50 border border-darkBorder flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Anomalies Detected</p>
            <p className="text-2xl font-bold text-white font-outfit">{stats?.total_anomalies || 0}</p>
          </div>
          <AlertCircle className="w-8 h-8 text-rose-400 animate-pulse" />
        </div>

      </div>

      {/* DETAILED STATS LIST */}
      <div className="bg-darkPanel/20 border border-darkBorder/40 p-6 rounded-3xl shadow-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Database Model Allocations</h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-darkBg/20 border border-darkBorder rounded-2xl flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-400">Total Registered Predictions Run</span>
            <span className="font-bold text-white bg-darkPanel px-3 py-1 rounded-xl">{stats?.total_forecasts || 0} runs</span>
          </div>

          <div className="p-4 bg-darkBg/20 border border-darkBorder rounded-2xl flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-400">Enterprise Vector Chunk Embeddings</span>
            <span className="font-bold text-white bg-darkPanel px-3 py-1 rounded-xl">Auto-generated</span>
          </div>

          <div className="p-4 bg-darkBg/20 border border-darkBorder rounded-2xl flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-400">System Storage Strategy</span>
            <span className="font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-xl uppercase text-[10px]">sqlite3 / Thread-Safe Connection</span>
          </div>
        </div>
      </div>

    </div>
  );
}
