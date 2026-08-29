import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Satellite, 
  Flame, 
  Layers, 
  Activity, 
  Radio, 
  Sliders, 
  BarChart3, 
  FileText, 
  Key, 
  Bell, 
  RefreshCw,
  Eye
} from 'lucide-react';
import { DashboardStats, ThreatLevel } from '../types';

interface NavbarProps {
  activeTab: 'map' | 'analytics' | 'alerts' | 'simulation';
  setActiveTab: (tab: 'map' | 'analytics' | 'alerts' | 'simulation') => void;
  stats: DashboardStats;
  onRefresh: () => void;
  onOpenApiKeyModal: () => void;
  hasCustomKey: boolean;
  alertCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  stats,
  onRefresh,
  onOpenApiKeyModal,
  hasCustomKey,
  alertCount
}) => {
  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-tactical-900/95 backdrop-blur-md border-b border-tactical-700/60 text-slate-100 z-50 select-none shadow-2xl">
      {/* Top Classification Bar */}
      <div className="bg-tactical-950 px-4 py-1 flex items-center justify-between text-[11px] font-mono border-b border-tactical-800">
        <div className="flex items-center space-x-3">
          <span className="flex items-center text-cyan-400 font-semibold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping mr-1.5 inline-block"></span>
            GOVERNMENT OF INDIA • NTRO GEOSPATIAL INTELLIGENCE DIVISION
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-amber-400/90 font-medium">
            MISSION: SIH26162 (AI THERMAL & INDUSTRIAL CLASSIFIER)
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-slate-400 flex items-center">
            <Radio className="w-3 h-3 mr-1 text-emerald-400 animate-pulse" />
            VIIRS/MODIS ORBITAL PASS: <strong className="text-slate-200 ml-1">NOMINAL (4 SATS ACTIVE)</strong>
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-cyan-300 font-mono">{utcTime}</span>
        </div>
      </div>

      {/* Main Navigation Row */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        {/* Logo & System Title */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-rose-600 to-amber-600 shadow-lg shadow-rose-500/20 border border-rose-400/30">
            <Flame className="w-6 h-6 text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 animate-ping"></div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                PYRO-SENTRY <span className="text-cyan-400 font-mono text-sm px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40">NTRO AI</span>
              </h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                GEOINT COMMAND
              </span>
            </div>
            <p className="text-[11px] text-slate-400 tracking-wide font-mono">
              AI Industrial Fire & Persistent Thermal Source Classifier
            </p>
          </div>
        </div>

        {/* Tactical Navigation Tabs */}
        <div className="flex items-center bg-tactical-950/90 p-1 rounded-lg border border-tactical-700/80 shadow-inner">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'map'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-tactical-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tactical GIS Map</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'analytics'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-tactical-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Thermal Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`relative flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'alerts'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-tactical-800'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Threat Stream</span>
            {stats.criticalThreatsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-mono text-[10px] animate-pulse">
                {stats.criticalThreatsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('simulation')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'simulation'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-tactical-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>AI Simulation Sandbox</span>
          </button>
        </div>

        {/* Quick Stats & Action Controls */}
        <div className="flex items-center space-x-3">
          {/* Quick FRP Metric */}
          <div className="hidden lg:flex flex-col items-end px-3 py-1 bg-tactical-950/70 rounded border border-tactical-800 font-mono">
            <span className="text-[10px] text-slate-400">TOTAL RADIATIVE POWER</span>
            <span className="text-xs font-bold text-amber-400">
              {stats.totalRadiativePowerMW.toFixed(1)} <span className="text-[10px] text-slate-400">MW</span>
            </span>
          </div>

          {/* NASA FIRMS API Key status */}
          <button
            onClick={onOpenApiKeyModal}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded border text-xs font-mono transition-all ${
              hasCustomKey
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                : 'bg-tactical-800/80 border-tactical-700 text-slate-300 hover:border-cyan-500/50'
            }`}
            title="Configure NASA FIRMS API MAP_KEY"
          >
            <Key className="w-3.5 h-3.5 text-cyan-400" />
            <span>{hasCustomKey ? 'FIRMS LIVE: CONNECTED' : 'NASA API KEY'}</span>
          </button>

          {/* Refresh / Ingest stream button */}
          <button
            onClick={onRefresh}
            className="flex items-center space-x-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold rounded text-xs font-mono transition-all shadow-md shadow-cyan-600/20"
            title="Poll NASA FIRMS telemetry and rerun AI classifier"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>SYNC FIRMS</span>
          </button>
        </div>
      </div>
    </header>
  );
};
