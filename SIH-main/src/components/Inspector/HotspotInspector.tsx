import React, { useState } from 'react';
import { 
  EnrichedHotspot, 
  ClassificationType 
} from '../../types';
import { 
  ShieldAlert, 
  Flame, 
  Satellite, 
  Building2, 
  Wind, 
  Clock, 
  Activity, 
  FileDown, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Layers, 
  Radio,
  Compass,
  X
} from 'lucide-react';
import { generateIntelligenceDossierPDF } from '../../services/reportGenerator';
import confetti from 'canvas-confetti';

interface HotspotInspectorProps {
  hotspot: EnrichedHotspot | null;
  onClose: () => void;
  onDispatchAction?: (hotspot: EnrichedHotspot) => void;
}

export const HotspotInspector: React.FC<HotspotInspectorProps> = ({
  hotspot,
  onClose,
  onDispatchAction
}) => {
  const [activeBandView, setActiveBandView] = useState<'swir' | 'rgb'>('swir');
  const [isDispatched, setIsDispatched] = useState<boolean>(false);

  if (!hotspot) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-500 font-mono">
        <Satellite className="w-12 h-12 mb-3 text-slate-600 animate-pulse" />
        <p className="text-sm font-semibold text-slate-400">NO TARGET SELECTED</p>
        <p className="text-xs text-slate-600 mt-1 max-w-xs">
          Click any thermal hotspot on the tactical map or select an alert from the threat stream to initiate deep-dive intelligence inspection.
        </p>
      </div>
    );
  }

  const { aiResult } = hotspot;
  const isDisaster = aiResult.category === 'INDUSTRIAL_DISASTER';
  const isPersistent = aiResult.category === 'PERSISTENT_INDUSTRIAL';
  const isForest = aiResult.category === 'FOREST_WILDFIRE';
  const isAgri = aiResult.category === 'AGRICULTURAL_STUBBLE';

  const handleDispatch = () => {
    setIsDispatched(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#00f0ff', '#ff0055', '#ffb703']
    });
    if (onDispatchAction) {
      onDispatchAction(hotspot);
    }
  };

  const handleDownloadPDF = () => {
    generateIntelligenceDossierPDF(hotspot);
  };

  return (
    <div className="h-full flex flex-col bg-tactical-950/95 border-l border-tactical-800 text-slate-200 overflow-y-auto font-sans shadow-2xl">
      {/* Target Header Banner */}
      <div className="p-4 border-b border-tactical-800 bg-tactical-900/90 backdrop-blur sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40">
              TARGET #{hotspot.id}
            </span>
            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
              aiResult.threatLevel === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-500/50 animate-pulse' :
              aiResult.threatLevel === 'HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-500/50' :
              'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
            }`}>
              {aiResult.threatLevel} THREAT
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-tactical-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Classification Title */}
        <div className="mt-2.5">
          <h2 className="text-sm font-bold text-slate-100 leading-tight">
            {aiResult.categoryName}
          </h2>
          <div className="flex items-center space-x-3 mt-1 text-xs text-slate-400 font-mono">
            <span>📍 {hotspot.region || 'India Sector'}</span>
            <span>•</span>
            <span className="text-cyan-400 font-semibold">AI Confidence: {aiResult.confidence}%</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* 1. Multi-Spectral Satellite Imagery Viewer (Sentinel-2 Simulation) */}
        <div className="bg-tactical-900 rounded-lg border border-tactical-800 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5 text-xs font-mono text-cyan-400 font-semibold">
              <Satellite className="w-3.5 h-3.5" />
              <span>SENTINEL-2 MULTI-SPECTRAL COMPOSITE</span>
            </div>
            
            {/* Band switch buttons */}
            <div className="flex bg-tactical-950 p-0.5 rounded border border-tactical-800 text-[10px] font-mono">
              <button
                onClick={() => setActiveBandView('swir')}
                className={`px-2 py-0.5 rounded transition-all ${
                  activeBandView === 'swir'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                SWIR (B12/B11/B8A)
              </button>
              <button
                onClick={() => setActiveBandView('rgb')}
                className={`px-2 py-0.5 rounded transition-all ${
                  activeBandView === 'rgb'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Natural RGB (B4/B3/B2)
              </button>
            </div>
          </div>

          {/* Interactive Satellite Imagery Canvas / Graphic */}
          <div className="relative w-full h-44 rounded-md overflow-hidden border border-tactical-700/80 bg-tactical-950 flex items-center justify-center">
            {activeBandView === 'swir' ? (
              // SWIR False Color View
              <div className="relative w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
                {/* Simulated SWIR False Color Surface Patterns */}
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px]"></div>

                {isForest && (
                  <div className="absolute inset-0 bg-emerald-950/40 flex items-center justify-center">
                    <div className="w-28 h-28 rounded-full bg-amber-500/30 blur-md border border-orange-500/60 animate-pulse"></div>
                    <div className="w-12 h-12 rounded-full bg-rose-600/70 blur-sm"></div>
                  </div>
                )}

                {isPersistent && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Industrial metal grid */}
                    <div className="w-32 h-24 border border-cyan-500/30 rounded bg-cyan-950/20 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_15px_#00f0ff] animate-ping"></div>
                    </div>
                  </div>
                )}

                {isDisaster && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-36 h-28 border border-rose-500/50 rounded bg-rose-950/30 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-rose-500/50 blur-lg animate-pulse"></div>
                      <div className="w-8 h-8 rounded-full bg-white shadow-[0_0_25px_#ff0055]"></div>
                    </div>
                  </div>
                )}

                {isAgri && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 border border-amber-500/30 bg-amber-950/20 rotate-12 flex items-center justify-center">
                      <div className="w-6 h-6 rounded bg-amber-500/60 blur-xs"></div>
                    </div>
                  </div>
                )}

                {/* Reticle / Crosshair */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-24 h-24 border border-dashed border-cyan-400/40 rounded-full animate-spin [animation-duration:15s]"></div>
                  <div className="absolute w-32 h-[1px] bg-cyan-400/30"></div>
                  <div className="absolute h-32 w-[1px] bg-cyan-400/30"></div>
                </div>

                {/* Overlaid Spectral Data HUD */}
                <div className="absolute bottom-2 left-2 bg-tactical-950/90 backdrop-blur px-2 py-1 rounded border border-tactical-700 text-[10px] font-mono">
                  <span className="text-cyan-400">NBR: {aiResult.spectralData.nbr}</span> | <span className="text-emerald-400">NDVI: {aiResult.spectralData.ndvi}</span>
                </div>

                <div className="absolute top-2 right-2 bg-tactical-950/90 backdrop-blur px-2 py-1 rounded border border-tactical-700 text-[9px] font-mono text-amber-400">
                  SWIR 2.2µm HIGH FLUX
                </div>
              </div>
            ) : (
              // True Color RGB View
              <div className="relative w-full h-full bg-gradient-to-br from-emerald-950 via-slate-900 to-amber-950 flex items-center justify-center">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                
                {/* Visual terrain features */}
                <div className="text-center p-4">
                  <p className="text-xs font-mono text-slate-300 font-semibold">
                    {aiResult.osmMatchedZone ? aiResult.osmMatchedZone.name : 'Remote Natural Landscape'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    Lat: {hotspot.latitude.toFixed(4)}° | Lon: {hotspot.longitude.toFixed(4)}°
                  </p>
                </div>

                <div className="absolute bottom-2 left-2 bg-tactical-950/90 px-2 py-1 rounded border border-tactical-700 text-[10px] font-mono text-slate-300">
                  Optical Resolution: 10m / Pixel
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. Primary Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="bg-tactical-900 p-2.5 rounded-lg border border-tactical-800">
            <span className="text-[10px] text-slate-400 flex items-center">
              <Flame className="w-3 h-3 text-amber-400 mr-1" /> RADIATIVE POWER (FRP)
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-lg font-bold text-amber-400">{hotspot.frp.toFixed(1)}</span>
              <span className="text-xs text-slate-400">MW</span>
            </div>
            {/* Mini Progress Bar */}
            <div className="w-full bg-tactical-950 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  hotspot.frp > 200 ? 'bg-rose-500' : hotspot.frp > 80 ? 'bg-amber-500' : 'bg-cyan-500'
                }`}
                style={{ width: `${Math.min(100, (hotspot.frp / 350) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-tactical-900 p-2.5 rounded-lg border border-tactical-800">
            <span className="text-[10px] text-slate-400 flex items-center">
              <Activity className="w-3 h-3 text-cyan-400 mr-1" /> BRIGHTNESS TEMP
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-lg font-bold text-slate-100">{hotspot.brightness.toFixed(1)}</span>
              <span className="text-xs text-slate-400">Kelvin</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Channel T31: {hotspot.bright_t31 || 'N/A'} K
            </div>
          </div>

          <div className="bg-tactical-900 p-2.5 rounded-lg border border-tactical-800">
            <span className="text-[10px] text-slate-400 flex items-center">
              <Radio className="w-3 h-3 text-purple-400 mr-1" /> RECURRENCE / TRS
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-lg font-bold text-purple-300">{aiResult.persistenceScore}%</span>
              <span className="text-[10px] text-slate-400">{aiResult.historicalRecurrenceCount} hits / 90d</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {aiResult.persistenceScore > 40 ? 'High Persistence Baseline' : 'Transient / Ephemeral'}
            </div>
          </div>

          <div className="bg-tactical-900 p-2.5 rounded-lg border border-tactical-800">
            <span className="text-[10px] text-slate-400 flex items-center">
              <Clock className="w-3 h-3 text-emerald-400 mr-1" /> SATELLITE PASS
            </span>
            <div className="mt-1 text-xs font-bold text-slate-200 truncate">
              {hotspot.satellite}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {hotspot.acq_date} {hotspot.acq_time} UTC ({hotspot.daynight === 'D' ? 'Day' : 'Night'})
            </div>
          </div>
        </div>

        {/* 3. OpenStreetMap Infrastructure Correlation */}
        <div className="bg-tactical-900 rounded-lg border border-tactical-800 p-3">
          <div className="flex items-center space-x-1.5 text-xs font-mono text-cyan-400 font-semibold mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>OPENSTREETMAP INFRASTRUCTURE MATCH</span>
          </div>

          {aiResult.osmMatchedZone ? (
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex items-start justify-between">
                <span className="text-slate-400">Target Asset:</span>
                <span className="text-right font-bold text-slate-200 max-w-[200px]">
                  {aiResult.osmMatchedZone.name}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Land Use / Type:</span>
                <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[10px]">
                  {aiResult.osmMatchedZone.categoryLabel}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Proximity Distance:</span>
                <span className={`font-bold ${aiResult.osmProximityMeters < 500 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {aiResult.osmProximityMeters} meters
                </span>
              </div>

              {aiResult.osmMatchedZone.operator && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Operator:</span>
                  <span className="text-slate-300 text-[11px]">{aiResult.osmMatchedZone.operator}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs font-mono text-slate-400">
              No industrial structures tagged in OSM database within 2000m buffer zone.
            </p>
          )}
        </div>

        {/* 4. Explainable AI (XAI) Feature Importance */}
        <div className="bg-tactical-900 rounded-lg border border-tactical-800 p-3">
          <div className="flex items-center space-x-1.5 text-xs font-mono text-cyan-400 font-semibold mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>EXPLAINABLE AI (XAI) ATTRIBUTION MATRIX</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                <span>Spatio-Temporal Persistence Score</span>
                <span className="text-purple-300">{aiResult.featureWeights.spatialPersistence * 100}%</span>
              </div>
              <div className="w-full bg-tactical-950 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full" style={{ width: `${aiResult.featureWeights.spatialPersistence * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                <span>OSM Industrial Proximity Weight</span>
                <span className="text-cyan-300">{aiResult.featureWeights.osmLanduseProximity * 100}%</span>
              </div>
              <div className="w-full bg-tactical-950 h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${aiResult.featureWeights.osmLanduseProximity * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                <span>Thermal Radiance Magnitude (FRP Delta)</span>
                <span className="text-amber-300">{aiResult.featureWeights.frpMagnitude * 100}%</span>
              </div>
              <div className="w-full bg-tactical-950 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${aiResult.featureWeights.frpMagnitude * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                <span>Multi-Spectral Burn-Scar Severity (NBR/NDVI)</span>
                <span className="text-rose-300">{aiResult.featureWeights.spectralBurnScar * 100}%</span>
              </div>
              <div className="w-full bg-tactical-950 h-1.5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${aiResult.featureWeights.spectralBurnScar * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. AI Reasoning Breakdown */}
        <div className="bg-tactical-900 rounded-lg border border-tactical-800 p-3">
          <div className="flex items-center space-x-1.5 text-xs font-mono text-cyan-400 font-semibold mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>AI DECISION LOGIC & RATIONALE</span>
          </div>

          <ul className="space-y-1.5 text-xs text-slate-300 font-sans">
            {aiResult.reasoningBreakdown.map((r, i) => (
              <li key={i} className="flex items-start space-x-2">
                <span className="text-cyan-400 font-mono mt-0.5">›</span>
                <span className="leading-tight">{r}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 6. Plume Dispersion & Downwind Hazard Vector */}
        <div className="bg-tactical-900 rounded-lg border border-tactical-800 p-3">
          <div className="flex items-center space-x-1.5 text-xs font-mono text-rose-400 font-semibold mb-2">
            <Wind className="w-3.5 h-3.5" />
            <span>ATMOSPHERIC DISPERSION & IMPACT CONE</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="bg-tactical-950 p-2 rounded border border-tactical-800">
              <span className="text-[10px] text-slate-400">WIND VECTOR:</span>
              <p className="font-bold text-slate-200 mt-0.5">
                {aiResult.dispersion.windSpeedKmh} km/h @ {aiResult.dispersion.windDirectionDeg}°
              </p>
            </div>

            <div className="bg-tactical-950 p-2 rounded border border-tactical-800">
              <span className="text-[10px] text-slate-400">DOWNWIND PLUME:</span>
              <p className="font-bold text-amber-400 mt-0.5">
                {aiResult.dispersion.plumeLengthKm} km length
              </p>
            </div>

            <div className="bg-tactical-950 p-2 rounded border border-tactical-800">
              <span className="text-[10px] text-slate-400">EVACUATION RADIUS:</span>
              <p className="font-bold text-rose-400 mt-0.5">
                {aiResult.evacuationRadiusKm} km zone
              </p>
            </div>

            <div className="bg-tactical-950 p-2 rounded border border-tactical-800">
              <span className="text-[10px] text-slate-400">EST. POPULATION:</span>
              <p className="font-bold text-slate-200 mt-0.5">
                {aiResult.dispersion.affectedPopulationEstimate.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* 7. Action Directive & Containment Protocol */}
        <div className="bg-gradient-to-r from-tactical-900 to-slate-900 rounded-lg border border-cyan-500/30 p-3">
          <span className="text-[10px] font-mono font-bold text-cyan-400 block mb-1">
            TACTICAL CONTAINMENT DIRECTIVE:
          </span>
          <p className="text-xs text-slate-200 italic leading-relaxed">
            "{aiResult.containmentProtocol}"
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2 pb-6">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-tactical-800 hover:bg-tactical-700 text-slate-200 text-xs font-mono font-semibold rounded-lg border border-tactical-600 transition-all shadow-md"
          >
            <FileDown className="w-4 h-4 text-cyan-400" />
            <span>EXPORT DOSSIER PDF</span>
          </button>

          <button
            onClick={handleDispatch}
            disabled={isDispatched}
            className={`flex items-center justify-center space-x-1.5 py-2 px-3 text-xs font-mono font-semibold rounded-lg transition-all shadow-lg ${
              isDispatched
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-rose-600/30'
            }`}
          >
            {isDispatched ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>UNITS DISPATCHED</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>DISPATCH INTERVENTION</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
