import React, { useState, useMemo } from 'react';
import { 
  SimulationScenario, 
  FirmsHotspotRaw, 
  EnrichedHotspot,
  ClassificationType,
  OSMLandmark
} from '../../types';
import { SIMULATION_SCENARIOS } from '../../data/simulationScenarios';
import { classifyThermalHotspot } from '../../ai/classifier';
import { OSM_LANDMARKS } from '../../data/mockHotspots';
import { 
  Sliders, 
  Flame, 
  Play, 
  CheckCircle, 
  Satellite, 
  Wind, 
  Building2, 
  Activity, 
  Sparkles, 
  Layers, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SimulationSandboxProps {
  onInjectHotspot: (hotspot: FirmsHotspotRaw) => void;
  onNavigateToMapWithHotspot: (hotspot: EnrichedHotspot) => void;
}

export const SimulationSandbox: React.FC<SimulationSandboxProps> = ({
  onInjectHotspot,
  onNavigateToMapWithHotspot
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(SIMULATION_SCENARIOS[0].id);

  // Custom adjustable parameters
  const [frp, setFrp] = useState<number>(420);
  const [brightness, setBrightness] = useState<number>(460);
  const [recurrenceCount, setRecurrenceCount] = useState<number>(84);
  const [dayNight, setDayNight] = useState<'D' | 'N'>('N');
  const [osmDistanceMeters, setOsmDistanceMeters] = useState<number>(0);
  const [windSpeed, setWindSpeed] = useState<number>(24);
  const [windDirection, setWindDirection] = useState<number>(65);

  const activeScenario = SIMULATION_SCENARIOS.find(s => s.id === selectedScenarioId) || SIMULATION_SCENARIOS[0];

  const handleSelectScenario = (scenario: SimulationScenario) => {
    setSelectedScenarioId(scenario.id);
    setFrp(scenario.frp);
    setBrightness(scenario.brightness);
    setDayNight(scenario.daynight);
    setRecurrenceCount(scenario.historicalDetections);
    setWindSpeed(scenario.windSpeedKmh);
    setWindDirection(scenario.windDirectionDeg);
    setOsmDistanceMeters(scenario.targetCategory === 'FOREST_WILDFIRE' ? 8500 : 0);
  };

  // Run real-time AI Classification on the fly
  const simulatedAiResult = useMemo(() => {
    const rawSimHotspot: FirmsHotspotRaw = {
      id: `SIM-${Date.now().toString().slice(-4)}`,
      latitude: activeScenario.lat,
      longitude: activeScenario.lon,
      brightness,
      scan: 0.375,
      track: 0.375,
      acq_date: new Date().toISOString().split('T')[0],
      acq_time: '1200',
      satellite: activeScenario.satellite,
      confidence: 96,
      bright_t31: brightness - 40,
      frp,
      daynight: dayNight,
      region: activeScenario.locationName
    };

    // Synthesize modified OSM list with custom distance
    const modifiedLandmarks: OSMLandmark[] = OSM_LANDMARKS.map(l => {
      if (l.id === activeScenario.osmContext.id) {
        return {
          ...l,
          lat: activeScenario.lat + (osmDistanceMeters / 111000), // Offset
          lon: activeScenario.lon
        };
      }
      return l;
    });

    return {
      rawHotspot: rawSimHotspot,
      aiResult: classifyThermalHotspot(rawSimHotspot, modifiedLandmarks, recurrenceCount)
    };
  }, [activeScenario, frp, brightness, recurrenceCount, dayNight, osmDistanceMeters]);

  const handleInjectAndDeploy = () => {
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.7 }
    });

    const enriched: EnrichedHotspot = {
      ...simulatedAiResult.rawHotspot,
      aiResult: simulatedAiResult.aiResult
    };

    onInjectHotspot(simulatedAiResult.rawHotspot);
    onNavigateToMapWithHotspot(enriched);
  };

  return (
    <div className="h-full overflow-y-auto bg-tactical-950 p-6 text-slate-100 font-sans space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-tactical-800 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center">
              <Sliders className="w-5 h-5 text-amber-400 mr-2" />
              AI THERMAL CLASSIFIER SIMULATION SANDBOX
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold">
              JUDGE TEST-BED
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Dynamically adjust satellite telemetry, OSM infrastructure proximity, and temporal persistence to test AI classification boundaries in real time.
          </p>
        </div>
      </div>

      {/* Preset Scenario Selector */}
      <div>
        <span className="text-xs font-mono text-cyan-400 font-bold block mb-2">
          1. CHOOSE STRATEGIC PRESET SCENARIO:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {SIMULATION_SCENARIOS.map(scen => (
            <button
              key={scen.id}
              onClick={() => handleSelectScenario(scen)}
              className={`p-3 rounded-xl text-left border transition-all ${
                selectedScenarioId === scen.id
                  ? 'bg-tactical-900 border-cyan-500 shadow-lg shadow-cyan-950/50'
                  : 'bg-tactical-900/60 border-tactical-800 hover:border-tactical-700'
              }`}
            >
              <h4 className="text-xs font-bold text-slate-100 mb-1 leading-snug">
                {scen.title}
              </h4>
              <p className="text-[10px] text-slate-400 line-clamp-2">
                {scen.description}
              </p>
              <div className="mt-2 text-[10px] font-mono text-cyan-400 flex items-center justify-between">
                <span>FRP: {scen.frp} MW</span>
                <span className="text-slate-500">› Select</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Controls & Real-Time AI Inference Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Sliders & Parameter Tuning (7 cols) */}
        <div className="lg:col-span-7 bg-tactical-900 p-5 rounded-xl border border-tactical-800 space-y-5 shadow-xl font-mono text-xs">
          <div className="flex items-center justify-between border-b border-tactical-800 pb-2">
            <span className="font-bold text-slate-200 flex items-center">
              <Activity className="w-4 h-4 text-cyan-400 mr-2" />
              2. INJECT TELEMETRY & SPATIAL VECTORS
            </span>
            <span className="text-[10px] text-slate-400">Live AI Inference Engine Active</span>
          </div>

          {/* Slider 1: Fire Radiative Power (FRP) */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Fire Radiative Power (FRP in MW):</span>
              <strong className="text-amber-400 font-bold">{frp} MW</strong>
            </div>
            <input
              type="range"
              min="5"
              max="600"
              step="5"
              value={frp}
              onChange={e => setFrp(parseFloat(e.target.value))}
              className="w-full h-2 bg-tactical-950 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Low (Stubble / Kiln: 5-40 MW)</span>
              <span>Baseline Flare (50-120 MW)</span>
              <span>Disaster Explosion (&gt;200 MW)</span>
            </div>
          </div>

          {/* Slider 2: Brightness Temperature (Kelvin) */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Brightness Temperature (I4 Channel):</span>
              <strong className="text-slate-200 font-bold">{brightness} K ({Math.round(brightness - 273.15)}°C)</strong>
            </div>
            <input
              type="range"
              min="310"
              max="500"
              step="2"
              value={brightness}
              onChange={e => setBrightness(parseFloat(e.target.value))}
              className="w-full h-2 bg-tactical-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Slider 3: Temporal Recurrence Count (TRS Persistence) */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">90-Day Satellite Pass Recurrence Count:</span>
              <strong className="text-purple-300 font-bold">{recurrenceCount} passes ({Math.min(100, Math.round((recurrenceCount / 25) * 100))}% TRS)</strong>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="1"
              value={recurrenceCount}
              onChange={e => setRecurrenceCount(parseInt(e.target.value))}
              className="w-full h-2 bg-tactical-950 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0 (New / Transient Fire)</span>
              <span>30 (Industrial Baseline)</span>
              <span>90 (Permanent Continuous Flare)</span>
            </div>
          </div>

          {/* Slider 4: OSM Infrastructure Proximity */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Distance to Nearest OSM Industrial Asset:</span>
              <strong className="text-cyan-300 font-bold">{osmDistanceMeters} meters</strong>
            </div>
            <input
              type="range"
              min="0"
              max="10000"
              step="100"
              value={osmDistanceMeters}
              onChange={e => setOsmDistanceMeters(parseInt(e.target.value))}
              className="w-full h-2 bg-tactical-950 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0m (Inside Facility)</span>
              <span>1,500m (Buffer Edge)</span>
              <span>10,000m (Remote Wilderness)</span>
            </div>
          </div>

          {/* Radio / Toggles: Day vs Night */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <span className="text-slate-400 block mb-1">Orbital Pass Cycle:</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setDayNight('N')}
                  className={`flex-1 py-1.5 rounded text-center font-bold border transition-all ${
                    dayNight === 'N' ? 'bg-cyan-950 text-cyan-300 border-cyan-500' : 'bg-tactical-950 text-slate-400 border-tactical-800'
                  }`}
                >
                  🌙 Nighttime Pass
                </button>
                <button
                  onClick={() => setDayNight('D')}
                  className={`flex-1 py-1.5 rounded text-center font-bold border transition-all ${
                    dayNight === 'D' ? 'bg-amber-950 text-amber-300 border-amber-500' : 'bg-tactical-950 text-slate-400 border-tactical-800'
                  }`}
                >
                  ☀️ Daytime Pass
                </button>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-1">Wind Speed: {windSpeed} km/h</span>
              <input
                type="range"
                min="5"
                max="60"
                value={windSpeed}
                onChange={e => setWindSpeed(parseInt(e.target.value))}
                className="w-full h-2 bg-tactical-950 rounded-lg appearance-none cursor-pointer accent-rose-400 mt-2"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time AI Classifier Output (5 cols) */}
        <div className="lg:col-span-5 bg-tactical-900 p-5 rounded-xl border border-tactical-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-tactical-800 pb-2">
            <span className="font-mono text-xs font-bold text-cyan-400 flex items-center">
              <Sparkles className="w-4 h-4 mr-1.5 text-cyan-400" />
              3. REAL-TIME AI INFERENCE OUTPUT
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              simulatedAiResult.aiResult.threatLevel === 'CRITICAL' ? 'bg-rose-600 text-white animate-pulse' :
              simulatedAiResult.aiResult.threatLevel === 'HIGH' ? 'bg-amber-600 text-white' :
              'bg-emerald-600 text-white'
            }`}>
              {simulatedAiResult.aiResult.threatLevel} THREAT
            </span>
          </div>

          {/* Classification Banner */}
          <div className="p-3 rounded-lg bg-tactical-950 border border-tactical-700">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">
              AI MODEL CLASSIFICATION:
            </span>
            <h3 className="text-sm font-bold text-white mt-1">
              {simulatedAiResult.aiResult.categoryName}
            </h3>
            <div className="mt-2 flex items-center justify-between font-mono text-xs">
              <span className="text-slate-400">Confidence:</span>
              <span className="text-cyan-400 font-bold">{simulatedAiResult.aiResult.confidence}%</span>
            </div>
            <div className="mt-1 flex items-center justify-between font-mono text-xs">
              <span className="text-slate-400">Persistence (TRS):</span>
              <span className="text-purple-300 font-bold">{simulatedAiResult.aiResult.persistenceScore}%</span>
            </div>
          </div>

          {/* Simulated Decision Rationale */}
          <div className="space-y-1.5 text-xs">
            <span className="font-mono text-[10px] text-slate-400 block font-bold">
              AI DECISION CHAIN:
            </span>
            {simulatedAiResult.aiResult.reasoningBreakdown.map((r, i) => (
              <div key={i} className="flex items-start space-x-1.5 text-slate-300">
                <span className="text-cyan-400 font-mono">›</span>
                <span className="text-xs">{r}</span>
              </div>
            ))}
          </div>

          {/* Impact Cone Specs */}
          <div className="bg-tactical-950 p-2.5 rounded border border-tactical-800 font-mono text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Smoke Plume Length:</span>
              <span className="text-amber-400 font-bold">{simulatedAiResult.aiResult.dispersion.plumeLengthKm} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Air Quality Impact:</span>
              <span className="text-rose-400 font-bold">AQI {simulatedAiResult.aiResult.dispersion.airQualityImpactAqi}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Evacuation Radius:</span>
              <span className="text-slate-200 font-bold">{simulatedAiResult.aiResult.evacuationRadiusKm} km</span>
            </div>
          </div>

          {/* Deploy to Map Button */}
          <button
            onClick={handleInjectAndDeploy}
            className="w-full py-3 bg-gradient-to-r from-cyan-600 via-teal-500 to-cyan-600 hover:from-cyan-500 hover:to-teal-400 text-slate-950 font-bold rounded-lg font-mono text-xs flex items-center justify-center space-x-2 transition-all shadow-lg shadow-cyan-500/20"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>INJECT INTO LIVE FIRMS STREAM & VIEW ON MAP</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
