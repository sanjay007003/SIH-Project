import React from 'react';
import { 
  FilterState, 
  ClassificationType, 
  SatelliteSensor, 
  EnrichedHotspot 
} from '../../types';
import { 
  Search, 
  Flame, 
  Building2, 
  AlertOctagon, 
  TreePine, 
  Wheat, 
  SlidersHorizontal, 
  RotateCcw,
  Compass
} from 'lucide-react';

interface FilterSidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  hotspots: EnrichedHotspot[];
  onSelectHotspot: (hotspot: EnrichedHotspot) => void;
  selectedHotspot: EnrichedHotspot | null;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  setFilters,
  hotspots,
  onSelectHotspot,
  selectedHotspot
}) => {
  const toggleCategory = (cat: ClassificationType) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }));
  };

  const toggleSatellite = (sat: SatelliteSensor) => {
    setFilters(prev => ({
      ...prev,
      satellites: prev.satellites.includes(sat)
        ? prev.satellites.filter(s => s !== sat)
        : [...prev.satellites, sat]
    }));
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      categories: ['PERSISTENT_INDUSTRIAL', 'INDUSTRIAL_DISASTER', 'FOREST_WILDFIRE', 'AGRICULTURAL_STUBBLE', 'URBAN_WASTE'],
      threatLevels: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NOMINAL'],
      satellites: ['VIIRS_SNPP', 'VIIRS_NOAA20', 'VIIRS_NOAA21', 'MODIS_TERRA', 'MODIS_AQUA'],
      minFRP: 0,
      maxFRP: 600,
      minConfidence: 0,
      dayNight: 'ALL',
      region: 'ALL',
      timeRangeHours: 72
    });
  };

  // Strategic Jump Hotspots
  const strategicJumps = [
    { label: 'Jamnagar Refineries', id: 'FIRMS-IN-JAM-01' },
    { label: 'Bhilai Steel Plant', id: 'FIRMS-IN-BHI-01' },
    { label: 'Singrauli Thermal Hub', id: 'FIRMS-IN-SNG-01' },
    { label: 'Haldia Petro Disaster', id: 'FIRMS-IN-HLD-99' },
    { label: 'Simlipal Forest Blaze', id: 'FIRMS-IN-SML-01' },
    { label: 'Punjab Stubble Belt', id: 'FIRMS-IN-PJB-01' },
  ];

  return (
    <div className="w-72 h-full bg-tactical-950/95 border-r border-tactical-800 text-slate-200 flex flex-col font-mono text-xs shadow-2xl">
      {/* Search Header */}
      <div className="p-3 border-b border-tactical-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-cyan-400 flex items-center">
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
            FILTER & QUERY MATRIX
          </span>
          <button
            onClick={resetFilters}
            className="text-[10px] text-slate-400 hover:text-cyan-300 flex items-center"
            title="Reset all filters"
          >
            <RotateCcw className="w-3 h-3 mr-0.5" /> Reset
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={e => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            placeholder="Search ID, Region, Facility..."
            className="w-full pl-8 pr-3 py-1.5 bg-tactical-900 border border-tactical-700 rounded text-slate-100 placeholder-slate-500 text-[11px] focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Scrollable Filters */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Strategic Quick Jump */}
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5 flex items-center">
            <Compass className="w-3 h-3 text-cyan-400 mr-1" />
            STRATEGIC CORRIDORS
          </span>
          <div className="grid grid-cols-2 gap-1">
            {strategicJumps.map(jump => {
              const target = hotspots.find(h => h.id === jump.id);
              return (
                <button
                  key={jump.id}
                  onClick={() => target && onSelectHotspot(target)}
                  className="p-1.5 rounded bg-tactical-900 hover:bg-tactical-800 border border-tactical-800 text-[10px] text-left text-slate-300 truncate hover:text-cyan-300 transition-colors"
                >
                  › {jump.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Classification Filters */}
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
            AI CLASSIFICATION CATEGORY
          </span>
          <div className="space-y-1">
            <label className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-tactical-900">
              <input
                type="checkbox"
                checked={filters.categories.includes('PERSISTENT_INDUSTRIAL')}
                onChange={() => toggleCategory('PERSISTENT_INDUSTRIAL')}
                className="rounded bg-tactical-900 border-tactical-700 text-cyan-500"
              />
              <span className="text-cyan-400 flex items-center text-[11px]">
                🏭 Persistent Industrial
              </span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-tactical-900">
              <input
                type="checkbox"
                checked={filters.categories.includes('INDUSTRIAL_DISASTER')}
                onChange={() => toggleCategory('INDUSTRIAL_DISASTER')}
                className="rounded bg-tactical-900 border-tactical-700 text-rose-500"
              />
              <span className="text-rose-400 flex items-center text-[11px]">
                🚨 Industrial Disaster
              </span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-tactical-900">
              <input
                type="checkbox"
                checked={filters.categories.includes('FOREST_WILDFIRE')}
                onChange={() => toggleCategory('FOREST_WILDFIRE')}
                className="rounded bg-tactical-900 border-tactical-700 text-orange-500"
              />
              <span className="text-orange-400 flex items-center text-[11px]">
                🌲 Forest / Canopy Wildfire
              </span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-tactical-900">
              <input
                type="checkbox"
                checked={filters.categories.includes('AGRICULTURAL_STUBBLE')}
                onChange={() => toggleCategory('AGRICULTURAL_STUBBLE')}
                className="rounded bg-tactical-900 border-tactical-700 text-amber-500"
              />
              <span className="text-amber-400 flex items-center text-[11px]">
                🌾 Agricultural Stubble
              </span>
            </label>
          </div>
        </div>

        {/* Min FRP Range Slider */}
        <div>
          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
            <span>MIN RADIATIVE POWER (FRP):</span>
            <strong className="text-amber-400">{filters.minFRP} MW</strong>
          </div>
          <input
            type="range"
            min="0"
            max="300"
            step="10"
            value={filters.minFRP}
            onChange={e => setFilters(prev => ({ ...prev, minFRP: parseInt(e.target.value) }))}
            className="w-full h-1.5 bg-tactical-900 rounded appearance-none cursor-pointer accent-amber-400"
          />
        </div>

        {/* Day / Night Filter */}
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
            DIURNAL ORBITAL PASS
          </span>
          <div className="grid grid-cols-3 gap-1">
            {(['ALL', 'D', 'N'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setFilters(prev => ({ ...prev, dayNight: mode }))}
                className={`py-1 rounded text-center text-[10px] border transition-all ${
                  filters.dayNight === mode
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500 font-bold'
                    : 'bg-tactical-900 text-slate-400 border-tactical-800 hover:text-slate-200'
                }`}
              >
                {mode === 'ALL' ? 'All Passes' : mode === 'D' ? '☀️ Day' : '🌙 Night'}
              </button>
            ))}
          </div>
        </div>

        {/* Satellite Sensors */}
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
            SATELLITE SENSORS
          </span>
          <div className="space-y-1 text-[10px]">
            {[
              { id: 'VIIRS_NOAA20', label: 'VIIRS (NOAA-20 / 375m)' },
              { id: 'VIIRS_NOAA21', label: 'VIIRS (NOAA-21 / 375m)' },
              { id: 'VIIRS_SNPP', label: 'VIIRS (Suomi NPP / 375m)' },
              { id: 'MODIS_TERRA', label: 'MODIS (Terra / 1km)' },
            ].map(sat => (
              <label key={sat.id} className="flex items-center space-x-2 cursor-pointer p-0.5">
                <input
                  type="checkbox"
                  checked={filters.satellites.includes(sat.id as SatelliteSensor)}
                  onChange={() => toggleSatellite(sat.id as SatelliteSensor)}
                  className="rounded bg-tactical-900 border-tactical-700 text-cyan-500"
                />
                <span className="text-slate-300">{sat.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Target Hotspots Quick List Footer */}
      <div className="p-3 border-t border-tactical-800 bg-tactical-900/90 text-[10px]">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span>MATCHING HOTSPOTS:</span>
          <strong className="text-cyan-400 font-bold">{hotspots.length} targets</strong>
        </div>
      </div>
    </div>
  );
};
