import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Cpu, Database, Presentation } from 'lucide-react';

interface LandingProps {
  onGetStarted: () => void;
}

export default function Landing({ onGetStarted }: LandingProps) {
  return (
    <div className="min-h-screen bg-darkBg text-gray-100 flex flex-col justify-between selection:bg-blue-600">
      
      {/* GLOWING AMBIENCE BLURS */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* TOP NAVIGATION BAR */}
      <header className="max-w-7xl mx-auto w-full px-8 h-24 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/10 border border-blue-500/30 rounded-xl glow-cobalt text-blue-500">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <span className="font-outfit font-bold text-xl text-white tracking-tight">Antigravity</span>
        </div>
        <button
          onClick={onGetStarted}
          className="px-5 py-2.5 rounded-xl border border-darkBorder hover:border-blue-500/30 text-sm font-semibold hover:text-white transition-all duration-200"
        >
          Access Portal
        </button>
      </header>

      {/* HERO SECTION */}
      <main className="max-w-6xl mx-auto w-full px-8 py-20 text-center relative z-10 flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-6">
          <Cpu className="w-3.5 h-3.5" />
          <span>AI-Powered Financial Orchestration</span>
        </div>

        <h1 className="font-outfit font-extrabold text-5xl md:text-6xl text-white tracking-tight leading-[1.1] mb-6 max-w-4xl mx-auto">
          Predictive Decision Intelligence for <span className="bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">Enterprise Compliance</span>
        </h1>

        <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Clean transaction logs, construct machine learning revenue forecasts, identify cost outliers with Isolation Forests, and converse with a source-grounded AI Financial Officer.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all duration-200 flex items-center justify-center gap-2 group shadow-xl shadow-blue-500/15 glow-cobalt"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
          <a 
            href="#features" 
            className="w-full sm:w-auto px-8 py-4 rounded-xl border border-darkBorder hover:border-blue-500/30 text-gray-400 hover:text-white font-semibold text-sm transition-all duration-200"
          >
            Explore Platform Features
          </a>
        </div>

        {/* CORE FEATURE CARDS SECTION */}
        <section id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 text-left">
          
          <div className="p-8 rounded-2xl bg-darkPanel/40 border border-darkBorder/40 shadow-xl backdrop-blur-md">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 w-fit mb-6">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-3">ETL Ingestion Pipeline</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Auto-profiling of structured CSV and Excel ledgers, featuring column type identification, missing record handling, and statistical bounds validation.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-darkPanel/40 border border-darkBorder/40 shadow-xl backdrop-blur-md">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 w-fit mb-6">
              <Presentation className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-3">Forecasting Simulators</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Generate 12-month projections utilizing ARIMA modeling or multivariate lag-engineered Random Forest engines, calculating full confidence bounds.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-darkPanel/40 border border-darkBorder/40 shadow-xl backdrop-blur-md">
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 w-fit mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-3">AI Fraud Outliers</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Scan accounts ledgers using unsupervised Isolation Forests and density Outlier Factors to flag immediate transaction anomalies and expenditure spikes.
            </p>
          </div>

        </section>
      </main>

      {/* FOOTER */}
      <footer className="h-20 border-t border-darkBorder flex items-center justify-between px-12 relative z-10 max-w-7xl mx-auto w-full text-xs text-gray-500 font-semibold uppercase tracking-wider">
        <span>© 2026 Antigravity Inc. All rights reserved.</span>
        <span>Enterprise Decision Platform</span>
      </footer>

    </div>
  );
}
