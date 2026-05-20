import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore, Notification } from '../store/notificationStore';
import { useDatasetStore } from '../store/datasetStore';
import { 
  TrendingUp, 
  BarChart3, 
  AlertTriangle, 
  MessageSquareCode, 
  ShieldAlert, 
  Settings, 
  LogOut, 
  UploadCloud, 
  LayoutDashboard, 
  User, 
  Bell,
  Sparkles,
  Database
} from 'lucide-react';

interface ShellProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Shell({ children, activeTab, setActiveTab }: ShellProps) {
  const { user, logout } = useAuthStore();
  const { selectedDataset, datasets, selectDataset } = useDatasetStore();
  const { notifications, setNotifications, markAsRead } = useNotificationStore();
  const [showNotifications, setShowNotifications] = useState(false);

  // Poll notifications & datasets
  useEffect(() => {
    const token = localStorage.getItem('bi_token');
    if (!token) return;

    const fetchData = async () => {
      try {
        // Fetch datasets
        const dRes = await fetch('http://localhost:8000/api/v1/datasets', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (dRes.ok) {
          const dData = await dRes.json();
          useDatasetStore.getState().setDatasets(dData);
          
          // Auto select first dataset if none selected
          if (dData.length > 0 && !selectedDataset) {
            useDatasetStore.getState().selectDataset(dData[0]);
          }
        }

        // Fetch notifications
        const nRes = await fetch('http://localhost:8000/api/v1/notifications', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (nRes.ok) {
          const nData = await nRes.json();
          setNotifications(nData);
        }
      } catch (err) {
        console.error("Error polling system records:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 8000); // Poll every 8s
    return () => clearInterval(interval);
  }, [selectedDataset]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkRead = async (id: string) => {
    const token = localStorage.getItem('bi_token');
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        markAsRead(id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const menuItems = [
    { id: 'dashboard', name: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'upload', name: 'Ingestion Workspace', icon: UploadCloud },
    { id: 'analytics', name: 'Analytics & EDA', icon: BarChart3 },
    { id: 'forecasting', name: 'Predictive Forecasts', icon: TrendingUp },
    { id: 'anomalies', name: 'Anomaly Explorer', icon: AlertTriangle },
    { id: 'assistant', name: 'Conversational BI', icon: MessageSquareCode, badge: "AI" },
  ];

  // Include admin panel if role is admin or analyst
  if (user?.role === 'admin' || user?.role === 'analyst') {
    menuItems.push({ id: 'admin', name: 'System Portal', icon: ShieldAlert });
  }

  menuItems.push({ id: 'settings', name: 'System Config', icon: Settings });

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-darkBg text-gray-200">
      
      {/* SIDEBAR */}
      <aside className="w-72 flex-shrink-0 bg-darkPanel/80 border-r border-darkBorder flex flex-col justify-between backdrop-blur-md">
        
        {/* TOP BRAND HEADER */}
        <div>
          <div className="p-6 border-b border-darkBorder flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/10 border border-blue-500/30 rounded-xl glow-cobalt text-blue-500">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="font-outfit font-bold text-lg text-white leading-tight">Antigravity</h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold font-outfit">Decision Intelligence</p>
            </div>
          </div>

          {/* ACTIVE DATASET TICKER */}
          <div className="mx-4 my-4 p-3.5 bg-darkBg/50 border border-darkBorder rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <Database className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div className="overflow-hidden">
                <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">Active Workspace</p>
                <p className="text-xs font-semibold text-white truncate">
                  {selectedDataset ? selectedDataset.filename : "No dataset loaded"}
                </p>
              </div>
            </div>
            {datasets.length > 1 && (
              <select 
                className="bg-transparent border-0 text-[11px] text-blue-400 cursor-pointer focus:ring-0 max-w-[80px]"
                value={selectedDataset?.id || ''}
                onChange={(e) => {
                  const ds = datasets.find(d => d.id === e.target.value);
                  if (ds) selectDataset(ds);
                }}
              >
                {datasets.map(d => (
                  <option key={d.id} value={d.id} className="bg-darkPanel text-white">{d.filename}</option>
                ))}
              </select>
            )}
          </div>

          {/* MENU ITEMS */}
          <nav className="px-3 space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-600/15 text-white border-l-4 border-blue-500 font-semibold' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-gray-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 animate-bounce">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM USER PROFILE */}
        <div className="p-4 border-t border-darkBorder bg-darkBg/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0 font-bold font-outfit">
                {user?.full_name?.substring(0, 2).toUpperCase() || "US"}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">{user?.full_name || "Analyst Profile"}</p>
                <p className="text-xs text-gray-400 capitalize truncate">{user?.role || "analyst"}</p>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-darkBorder hover:border-red-500/30 hover:bg-red-500/10 text-gray-400 hover:text-red-400 text-xs font-semibold transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </button>
        </div>

      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* HEADER BAR */}
        <header className="h-20 bg-darkPanel/30 border-b border-darkBorder flex items-center justify-between px-8 backdrop-blur-md z-20">
          <div>
            <h2 className="text-xl font-bold text-white font-outfit capitalize">{activeTab} workspace</h2>
            <p className="text-xs text-gray-400">Ground truth business data modeling workspace</p>
          </div>

          <div className="flex items-center gap-4 relative">
            
            {/* ALERTS BELL POPUP */}
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 bg-darkPanel border border-darkBorder rounded-xl hover:border-blue-500/30 text-gray-400 hover:text-white transition-all duration-200 relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 border border-darkBg rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-14 w-96 max-h-[480px] bg-darkPanel border border-darkBorder rounded-2xl shadow-2xl glow-cobalt overflow-hidden flex flex-col z-50">
                <div className="p-4 border-b border-darkBorder bg-darkBg/50 flex justify-between items-center">
                  <h3 className="font-semibold text-white text-sm font-outfit">Risk Alerts & Notifications</h3>
                  <span className="text-[10px] text-gray-400 uppercase font-bold">{unreadCount} Unread</span>
                </div>
                <div className="overflow-y-auto max-h-[360px] divide-y divide-darkBorder">
                  {notifications.length === 0 ? (
                    <p className="p-6 text-center text-xs text-gray-400">No anomalous risk notifications recorded.</p>
                  ) : (
                    notifications.map((n: Notification) => (
                      <div key={n.id} className={`p-4 transition-all duration-150 ${n.is_read ? 'opacity-60 bg-transparent' : 'bg-blue-600/5'}`}>
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            n.type === 'anomaly' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {n.type.toUpperCase()}
                          </span>
                          <span className="text-[9px] text-gray-500">{new Date(n.created_at).toLocaleTimeString()}</span>
                        </div>
                        <h4 className="text-xs font-semibold text-white mb-1">{n.title}</h4>
                        <p className="text-[11px] text-gray-400 leading-normal mb-2">{n.message}</p>
                        {!n.is_read && (
                          <button 
                            onClick={() => handleMarkRead(n.id)}
                            className="text-[10px] text-blue-400 font-bold hover:underline"
                          >
                            Mark as reviewed
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* WORKSPACE VIEW CONTENT */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          {children}
        </main>
      </div>

    </div>
  );
}
