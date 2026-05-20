import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Sparkles, KeyRound, Mail, AlertCircle, Loader } from 'lucide-react';

interface LoginProps {
  onSwitchToSignup: () => void;
  onLoginSuccess: () => void;
}

export default function Login({ onSwitchToSignup, onLoginSuccess }: LoginProps) {
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please input both login credentials.");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Authentication credentials incorrect.");
      }

      login(data);
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || "Could not connect to FastAPI server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center p-6 select-none relative">
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-darkPanel/80 border border-darkBorder/80 p-8 rounded-3xl shadow-2xl backdrop-blur-md relative z-10">
        
        {/* LOGO */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-blue-600/10 border border-blue-500/30 rounded-2xl text-blue-500 mb-4 animate-pulse">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="font-outfit font-extrabold text-2xl text-white">Welcome Back</h2>
          <p className="text-xs text-gray-400">Enter your credentials to enter the workspace</p>
        </div>

        {/* ERROR TICKER */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-xs text-rose-400 font-medium flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Corporate Email</label>
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
            <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2">Password</label>
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all duration-200 glow-cobalt flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : "Access Portal"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-darkBorder flex items-center justify-between text-xs text-gray-500 font-semibold">
          <span>Need an account?</span>
          <button 
            onClick={onSwitchToSignup}
            className="text-blue-400 hover:underline font-bold"
          >
            Sign up analyst credentials
          </button>
        </div>

      </div>
    </div>
  );
}
