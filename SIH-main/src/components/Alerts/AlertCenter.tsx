import React, { useState } from 'react';
import { EnrichedHotspot, ThreatLevel } from '../../types';
import { 
  Bell, 
  AlertTriangle, 
  AlertOctagon, 
  ShieldAlert, 
  Flame, 
  Send, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  FileText, 
  Eye, 
  Clock 
} from 'lucide-react';
import { generateIntelligenceDossierPDF } from '../../services/reportGenerator';

interface AlertCenterProps {
  hotspots: EnrichedHotspot[];
  onSelectHotspot: (hotspot: EnrichedHotspot) => void;
  onNavigateToMap: () => void;
}

export const AlertCenter: React.FC<AlertCenterProps> = ({
  hotspots,
  onSelectHotspot,
  onNavigateToMap,
}) => {
  const [selectedThreatFilter, setSelectedThreatFilter] = useState<ThreatLevel | 'ALL'>('ALL');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [dispatchedMap, setDispatchedMap] = useState<Record<string, boolean>>({});

  const filteredHotspots = hotspots.filter(h => {
    if (selectedThreatFilter === 'ALL') return true;
    return h.aiResult.threatLevel === selectedThreatFilter;
  });

  const playTacticalBeep = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  };

  const handleDispatch = (hotspot: EnrichedHotspot) => {
    playTacticalBeep();
    setDispatchedMap(prev => ({ ...prev, [hotspot.id]: true }));
  };

  const handleInspect = (hotspot: EnrichedHotspot) => {
    onSelectHotspot(hotspot);
    onNavigateToMap();
  };

  return (
    <div className="h-full overflow-y-auto bg-tactical-950 p-6 text-slate-100 font-sans space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-tactical-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center">
              <ShieldAlert className="w-5 h-5 text-rose-500 mr-2 animate-pulse" />
              NTRO REAL-TIME THREAT ALERT STREAM
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold">
              LIVE DISPATCH FEED
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Automated AI Incident Escalations & Emergency Interdiction Feeds for Hazardous Industrial & Forest Events
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
              soundEnabled
                ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                : 'bg-tactical-900 border-tactical-700 text-slate-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            <span>{soundEnabled ? 'ALERT SOUND: ON' : 'ALERT SOUND: MUTED'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 font-mono text-xs">
        {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'NOMINAL'] as const).map(level => {
          const count = level === 'ALL' ? hotspots.length : hotspots.filter(h => h.aiResult.threatLevel === level).length;
          return (
            <button
              key={level}
              onClick={() => setSelectedThreatFilter(level)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedThreatFilter === level
                  ? 'bg-tactical-800 text-white border border-cyan-500/60 font-bold shadow-md'
                  : 'bg-tactical-900/60 text-slate-400 border border-tactical-800 hover:text-slate-200'
              }`}
            >
              {level} <span className="text-[10px] text-slate-500 ml-1">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Alert Feed Cards List */}
      <div className="space-y-3">
        {filteredHotspots.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-mono bg-tactical-900/40 rounded-xl border border-tactical-800">
            <Bell className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="text-sm">NO THREAT ALERTS MATCHING FILTER</p>
          </div>
        ) : (
          filteredHotspots.map(hotspot => {
            const { aiResult } = hotspot;
            const isCritical = aiResult.threatLevel === 'CRITICAL';
            const isHigh = aiResult.threatLevel === 'HIGH';
            const isDispatched = dispatchedMap[hotspot.id];

            return (
              <div
                key={hotspot.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCritical
                    ? 'bg-tactical-900/90 border-rose-500/50 shadow-lg shadow-rose-950/50 hover:border-rose-400'
                    : isHigh
                    ? 'bg-tactical-900/80 border-amber-500/40 hover:border-amber-400'
                    : 'bg-tactical-900/60 border-tactical-800 hover:border-tactical-700'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Alert Details */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono text-xs font-bold text-cyan-400">
                        {hotspot.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isCritical ? 'bg-rose-600 text-white animate-pulse' :
                        isHigh ? 'bg-amber-600 text-white' :
                        'bg-slate-700 text-slate-200'
                      }`}>
                        {aiResult.threatLevel} PRIORITY
                      </span>
                      <span className="text-xs text-slate-400 font-mono flex items-center">
                        <Clock className="w-3 h-3 mr-1 text-slate-500" />
                        {hotspot.acq_date} {hotspot.acq_time} UTC
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-100">
                      {aiResult.categoryName}
                    </h3>

                    <p className="text-xs text-slate-300 font-mono">
                      📍 {hotspot.region || 'India Sector'} • FRP: <strong className="text-amber-400">{hotspot.frp.toFixed(1)} MW</strong> • Brightness: <strong className="text-slate-200">{hotspot.brightness.toFixed(1)} K</strong> • AI Conf: <strong className="text-cyan-300">{aiResult.confidence}%</strong>
                    </p>

                    <p className="text-xs text-slate-400 italic">
                      Directive: "{aiResult.containmentProtocol}"
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 self-end md:self-center">
                    <button
                      onClick={() => handleInspect(hotspot)}
                      className="flex items-center space-x-1 px-3 py-2 bg-tactical-800 hover:bg-tactical-700 text-cyan-300 text-xs font-mono font-semibold rounded-lg border border-cyan-500/40 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>INSPECT ON MAP</span>
                    </button>

                    <button
                      onClick={() => generateIntelligenceDossierPDF(hotspot)}
                      className="flex items-center space-x-1 px-3 py-2 bg-tactical-800 hover:bg-tactical-700 text-slate-200 text-xs font-mono font-semibold rounded-lg border border-tactical-700 transition-all"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span>PDF DOSSIER</span>
                    </button>

                    <button
                      onClick={() => handleDispatch(hotspot)}
                      disabled={isDispatched}
                      className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-mono font-semibold rounded-lg transition-all shadow-md ${
                        isDispatched
                          ? 'bg-emerald-700 text-white cursor-default'
                          : isCritical
                          ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                          : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 shadow-cyan-600/20'
                      }`}
                    >
                      {isDispatched ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>DISPATCHED</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>DISPATCH UNITS</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
