import React, { useState } from 'react';
import { Sparkles, KeyRound, Mail, User, Shield, AlertCircle, CheckCircle2, Loader } from 'lucide-react';

interface SignupProps {
  onSwitchToLogin: () => void;
}

export default function Signup({ onSwitchToLogin }: SignupProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('analyst'); // analyst, admin, user
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError("Please fill in all requested fields.");
      return;
    }
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          full_name: fullName, 
          role 
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Registration failed.");
      }

      setSuccess("Account successfully registered! Proceeding to login screen...");
      setTimeout(() => {
        onSwitchToLogin();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Could not connect to FastAPI server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center p-6 select-none relative">
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-darkPanel/80 border border-darkBorder/80 p-8 rounded-3xl shadow-2xl backdrop-blur-md relative z-10">
        
        {/* LOGO */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-500 mb-4 animate-pulse">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="font-outfit font-extrabold text-2xl text-white">Create Account</h2>
          <p className="text-xs text-gray-400">Register new enterprise intelligence credentials</p>
        </div>

        {/* FEEDBACK TICKERS */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-xs text-rose-400 font-medium flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-400 font-medium flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Sarah Jenkins"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full bg-darkBg border border-darkBorder rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-600 focus:border-blue-500 focus:ring-0 focus:outline-none transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Corporate Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
              <input
                type="email"
                placeholder="analyst@firm.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-darkBg border border-darkBorder rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-600 focus:border-blue-500 focus:ring-0 focus:outline-none transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-darkBg border border-darkBorder rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-600 focus:border-blue-500 focus:ring-0 focus:outline-none transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Access Role</label>
            <div className="relative">
              <Shield className="absolute left-4 top-3.5 w-4 h-4 text-gray-500" />
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full bg-darkBg border border-darkBorder rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:border-blue-500 focus:ring-0 focus:outline-none transition-all duration-200 cursor-pointer"
              >
                <option value="analyst" className="bg-darkPanel">Analyst Role (Read / Write / Model)</option>
                <option value="admin" className="bg-darkPanel">System Admin (Full Core Access)</option>
                <option value="user" className="bg-darkPanel">Executive Viewer (Read Only)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-sm transition-all duration-200 glow-emerald flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : "Register Credentials"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-darkBorder flex items-center justify-between text-xs text-gray-500 font-semibold">
          <span>Already registered?</span>
          <button 
            onClick={onSwitchToLogin}
            className="text-blue-400 hover:underline font-bold"
          >
            Sign in analyst profile
          </button>
        </div>

      </div>
    </div>
  );
}
