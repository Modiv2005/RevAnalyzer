import React, { useState } from 'react';
import { useAuthStore } from './store/authStore';
import Shell from './components/Shell';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import UploadCenter from './pages/UploadCenter';
import AnalyticsWorkspace from './pages/AnalyticsWorkspace';
import ForecastingDashboard from './pages/ForecastingDashboard';
import AnomalyExplorer from './pages/AnomalyExplorer';
import AIAssistant from './pages/AIAssistant';
import AdminPanel from './pages/AdminPanel';
import SettingsPage from './pages/Settings';

export default function App() {
  const { isAuthenticated } = useAuthStore();
  
  // Navigation State
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'signup' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Handle routing if user is logged in
  if (isAuthenticated) {
    return (
      <Shell activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'upload' && <UploadCenter />}
        {activeTab === 'analytics' && <AnalyticsWorkspace />}
        {activeTab === 'forecasting' && <ForecastingDashboard />}
        {activeTab === 'anomalies' && <AnomalyExplorer />}
        {activeTab === 'assistant' && <AIAssistant />}
        {activeTab === 'admin' && <AdminPanel />}
        {activeTab === 'settings' && <SettingsPage />}
      </Shell>
    );
  }

  // Renders login/signup views if unauthenticated
  return (
    <>
      {currentView === 'landing' && (
        <Landing onGetStarted={() => setCurrentView('login')} />
      )}
      {currentView === 'login' && (
        <Login 
          onSwitchToSignup={() => setCurrentView('signup')} 
          onLoginSuccess={() => setCurrentView('app')}
        />
      )}
      {currentView === 'signup' && (
        <Signup onSwitchToLogin={() => setCurrentView('login')} />
      )}
    </>
  );
}
