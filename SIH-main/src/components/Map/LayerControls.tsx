import React from 'react';
import { 
  Layers, 
  Flame, 
  Building2, 
  Wind, 
  Radio, 
  Map as MapIcon, 
  Globe, 
  Sparkles,
  TreePine,
  Factory
} from 'lucide-react';

export interface MapLayerState {
  baseMap: 'dark' | 'satellite' | 'terrain';
  showFirmsHotspots: boolean;
  showHeatmap: boolean;
  showOsmPolygons: boolean;
  showDispersionPlumes: boolean;
  showDbscanClusters: boolean;
  showSatelliteTrack: boolean;
}

interface LayerControlsProps {
  layerState: MapLayerState;
  setLayerState: React.Dispatch<React.SetStateAction<MapLayerState>>;
}

export const LayerControls: React.FC<LayerControlsProps> = ({ layerState, setLayerState }) => {
  const toggle = (key: keyof MapLayerState) => {
    setLayerState(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const setBaseMap = (base: 'dark' | 'satellite' | 'terrain') => {
    setLayerState(prev => ({ ...prev, baseMap: base }));
  };

  return (
    <div className="bg-tactical-900/90 backdrop-blur-md border border-tactical-700/70 rounded-lg p-2.5 text-xs text-slate-200 shadow-xl w-60">
      <div className="flex items-center space-x-1.5 pb-2 mb-2 border-b border-tactical-800 font-mono font-semibold text-cyan-400">
        <Layers className="w-3.5 h-3.5" />
        <span>GIS TACTICAL LAYERS</span>
      </div>

      {/* Base Map Switcher */}
      <div className="mb-3">
        <span className="text-[10px] text-slate-400 font-mono block mb-1.5">BASE CARTOGRAPHY</span>
        <div className="grid grid-cols-3 gap-1 bg-tactical-950 p-1 rounded border border-tactical-800">
          <button
            onClick={() => setBaseMap('dark')}
            className={`py-1 text-center rounded text-[11px] font-mono transition-all ${
              layerState.baseMap === 'dark'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tactical
          </button>
          <button
            onClick={() => setBaseMap('satellite')}
            className={`py-1 text-center rounded text-[11px] font-mono transition-all ${
              layerState.baseMap === 'satellite'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setBaseMap('terrain')}
            className={`py-1 text-center rounded text-[11px] font-mono transition-all ${
              layerState.baseMap === 'terrain'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Terrain
          </button>
        </div>
      </div>

      {/* Intelligence & Data Overlays */}
      <div className="space-y-1.5">
        <span className="text-[10px] text-slate-400 font-mono block mb-1">INTEL OVERLAYS</span>

        <label className="flex items-center justify-between p-1.5 rounded hover:bg-tactical-800/60 cursor-pointer">
          <span className="flex items-center space-x-2">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>FIRMS Hotspots (AI Classified)</span>
          </span>
          <input
            type="checkbox"
            checked={layerState.showFirmsHotspots}
            onChange={() => toggle('showFirmsHotspots')}
            className="rounded bg-tactical-950 border-tactical-700 text-cyan-500 focus:ring-0"
          />
        </label>

        <label className="flex items-center justify-between p-1.5 rounded hover:bg-tactical-800/60 cursor-pointer">
          <span className="flex items-center space-x-2">
            <Factory className="w-3.5 h-3.5 text-cyan-400" />
            <span>OSM Industrial Polygons</span>
          </span>
          <input
            type="checkbox"
            checked={layerState.showOsmPolygons}
            onChange={() => toggle('showOsmPolygons')}
            className="rounded bg-tactical-950 border-tactical-700 text-cyan-500 focus:ring-0"
          />
        </label>

        <label className="flex items-center justify-between p-1.5 rounded hover:bg-tactical-800/60 cursor-pointer">
          <span className="flex items-center space-x-2">
            <Wind className="w-3.5 h-3.5 text-rose-400" />
            <span>Smoke Dispersion Cones</span>
          </span>
          <input
            type="checkbox"
            checked={layerState.showDispersionPlumes}
            onChange={() => toggle('showDispersionPlumes')}
            className="rounded bg-tactical-950 border-tactical-700 text-cyan-500 focus:ring-0"
          />
        </label>

        <label className="flex items-center justify-between p-1.5 rounded hover:bg-tactical-800/60 cursor-pointer">
          <span className="flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>FRP Radiative Heatmap</span>
          </span>
          <input
            type="checkbox"
            checked={layerState.showHeatmap}
            onChange={() => toggle('showHeatmap')}
            className="rounded bg-tactical-950 border-tactical-700 text-cyan-500 focus:ring-0"
          />
        </label>

        <label className="flex items-center justify-between p-1.5 rounded hover:bg-tactical-800/60 cursor-pointer">
          <span className="flex items-center space-x-2">
            <Radio className="w-3.5 h-3.5 text-purple-400" />
            <span>DBSCAN Persistence Centroids</span>
          </span>
          <input
            type="checkbox"
            checked={layerState.showDbscanClusters}
            onChange={() => toggle('showDbscanClusters')}
            className="rounded bg-tactical-950 border-tactical-700 text-cyan-500 focus:ring-0"
          />
        </label>
      </div>
    </div>
  );
};
