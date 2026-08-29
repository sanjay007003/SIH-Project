import React from 'react';
import { 
  EnrichedHotspot, 
  DashboardStats 
} from '../../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  CartesianGrid,
  Legend
} from 'recharts';
import { 
  Flame, 
  Building2, 
  AlertOctagon, 
  TreePine, 
  Wheat, 
  Activity, 
  TrendingUp, 
  Layers, 
  ShieldCheck 
} from 'lucide-react';

interface AnalyticsPanelProps {
  hotspots: EnrichedHotspot[];
  stats: DashboardStats;
  onSelectHotspot: (hotspot: EnrichedHotspot) => void;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  hotspots,
  stats,
  onSelectHotspot,
}) => {
  // 1. Classification Breakdown Pie Data
  const pieData = [
    { name: 'Persistent Industrial', value: stats.persistentIndustrialCount, color: '#00f0ff' },
    { name: 'Industrial Disasters', value: stats.industrialDisastersCount, color: '#ff0055' },
    { name: 'Forest / Canopy Wildfires', value: stats.forestFiresCount, color: '#ff5400' },
    { name: 'Agricultural Stubble', value: stats.agriStubbleCount, color: '#ffb703' },
  ].filter(d => d.value > 0);

  // 2. FRP by Region / Landmark Bar Data
  const barData = hotspots.slice(0, 8).map(h => ({
    name: h.region?.split('-')[1]?.trim() || h.id,
    frp: h.frp,
    temp: h.brightness - 273.15, // Celsius
    category: h.aiResult.category,
  }));

  // 3. Diurnal 24-Hour Profile Simulation Data (Industrial vs Agri vs Forest)
  const diurnalData = [
    { hour: '00:00', industrial: 65, forest: 45, agri: 5 },
    { hour: '03:00', industrial: 68, forest: 40, agri: 4 },
    { hour: '06:00', industrial: 64, forest: 35, agri: 8 },
    { hour: '09:00', industrial: 70, forest: 55, agri: 35 },
    { hour: '12:00', industrial: 72, forest: 90, agri: 140 }, // Solar + Agri peak
    { hour: '15:00', industrial: 69, forest: 110, agri: 165 }, // Afternoon peak
    { hour: '18:00', industrial: 74, forest: 85, agri: 70 },
    { hour: '21:00', industrial: 71, forest: 60, agri: 20 },
  ];

  return (
    <div className="h-full overflow-y-auto bg-tactical-950 p-6 text-slate-100 font-sans space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-tactical-800 gap-2">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center">
            <TrendingUp className="w-5 h-5 text-cyan-400 mr-2" />
            NTRO GEOINT THERMAL INTELLIGENCE & ANALYTICS
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time Spatio-Temporal Persistence, Radiative Power Flux & Infrastructure Anomaly Dashboard
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-tactical-900 border border-tactical-700 text-slate-300">
            TOTAL DETECTIONS: <strong className="text-cyan-400">{stats.totalDetections}</strong>
          </span>
          <span className="px-2.5 py-1 rounded bg-tactical-900 border border-tactical-700 text-slate-300">
            TOTAL FRP: <strong className="text-amber-400">{stats.totalRadiativePowerMW.toFixed(1)} MW</strong>
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
        <div className="bg-tactical-900 p-4 rounded-xl border border-cyan-500/30 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 p-3 opacity-15">
            <Building2 className="w-12 h-12 text-cyan-400" />
          </div>
          <span className="text-[11px] text-cyan-400 font-bold uppercase tracking-wider block">
            PERSISTENT INDUSTRIAL
          </span>
          <div className="text-2xl font-black text-white mt-1">
            {stats.persistentIndustrialCount} <span className="text-xs font-normal text-slate-400">sites</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            Refineries, steel plants, kilns with &gt;40% temporal recurrence index.
          </p>
        </div>

        <div className="bg-tactical-900 p-4 rounded-xl border border-rose-500/30 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 p-3 opacity-15">
            <AlertOctagon className="w-12 h-12 text-rose-500" />
          </div>
          <span className="text-[11px] text-rose-400 font-bold uppercase tracking-wider block">
            INDUSTRIAL DISASTERS
          </span>
          <div className="text-2xl font-black text-rose-400 mt-1">
            {stats.industrialDisastersCount} <span className="text-xs font-normal text-slate-400">events</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            Severe thermal radiative flares exceeding safe baseline thresholds.
          </p>
        </div>

        <div className="bg-tactical-900 p-4 rounded-xl border border-orange-500/30 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 p-3 opacity-15">
            <TreePine className="w-12 h-12 text-orange-500" />
          </div>
          <span className="text-[11px] text-orange-400 font-bold uppercase tracking-wider block">
            FOREST & CANOPY WILDFIRES
          </span>
          <div className="text-2xl font-black text-orange-400 mt-1">
            {stats.forestFiresCount} <span className="text-xs font-normal text-slate-400">blazes</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            High biomass burn-scar NBR depletion in protected forestry zones.
          </p>
        </div>

        <div className="bg-tactical-900 p-4 rounded-xl border border-amber-500/30 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 p-3 opacity-15">
            <Wheat className="w-12 h-12 text-amber-500" />
          </div>
          <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider block">
            AGRICULTURAL STUBBLE
          </span>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {stats.agriStubbleCount} <span className="text-xs font-normal text-slate-400">fields</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            Transient post-harvest open burning with diurnal midday peaks.
          </p>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: AI Classification Distribution */}
        <div className="bg-tactical-900 p-4 rounded-xl border border-tactical-800 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center font-mono">
              <Layers className="w-4 h-4 text-cyan-400 mr-1.5" />
              AI THERMAL CLASSIFICATION RATIO
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Real-time breakdown</span>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#07090e', borderColor: '#314463', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#00f0ff' }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', color: '#94a3b8' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Fire Radiative Power (FRP) Comparison by Corridor */}
        <div className="bg-tactical-900 p-4 rounded-xl border border-tactical-800 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center font-mono">
              <Flame className="w-4 h-4 text-amber-400 mr-1.5" />
              TOP STRATEGIC CORRIDORS BY FRP (MW)
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Radiative energy</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#161f2e" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} interval={0} angle={-25} textAnchor="end" />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#07090e', borderColor: '#314463', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Bar dataKey="frp" name="FRP (MW)" fill="#ffb703" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 3: Diurnal 24-Hour Temporal Curve */}
      <div className="bg-tactical-900 p-4 rounded-xl border border-tactical-800 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center font-mono">
              <Activity className="w-4 h-4 text-emerald-400 mr-1.5" />
              24-HOUR DIURNAL EMISSION PROFILE (TEMPORAL DISCRIMINATOR)
            </h3>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Industrial flares emit continuously through night (flat curve) vs. Agricultural/Forest fires which peak during afternoon solar heating.
            </p>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={diurnalData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIndustrial" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorForest" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff5400" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ff5400" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorAgri" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffb703" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ffb703" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#161f2e" />
              <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#07090e', borderColor: '#314463', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
              <Area type="monotone" dataKey="industrial" name="Industrial Baseline (Continuous)" stroke="#00f0ff" fillOpacity={1} fill="url(#colorIndustrial)" />
              <Area type="monotone" dataKey="forest" name="Forest Wildfire (Multi-day)" stroke="#ff5400" fillOpacity={1} fill="url(#colorForest)" />
              <Area type="monotone" dataKey="agri" name="Agricultural Stubble (Diurnal Peak)" stroke="#ffb703" fillOpacity={1} fill="url(#colorAgri)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strategic Emitter Hotspots Table */}
      <div className="bg-tactical-900 rounded-xl border border-tactical-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-tactical-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 flex items-center font-mono">
            <ShieldCheck className="w-4 h-4 text-cyan-400 mr-1.5" />
            ACTIVE THERMAL EMITTERS & INTELLIGENCE AUDIT TABLE
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Click row to inspect on GIS map</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-tactical-950 text-slate-400 border-b border-tactical-800 text-[10px] uppercase">
              <tr>
                <th className="p-3">Target ID</th>
                <th className="p-3">Classification</th>
                <th className="p-3">Region / Location</th>
                <th className="p-3">FRP (MW)</th>
                <th className="p-3">Brightness (K)</th>
                <th className="p-3">Persistence / TRS</th>
                <th className="p-3">OSM Proximity</th>
                <th className="p-3">Threat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tactical-800">
              {hotspots.map(h => (
                <tr
                  key={h.id}
                  onClick={() => onSelectHotspot(h)}
                  className="hover:bg-tactical-800/80 cursor-pointer transition-colors"
                >
                  <td className="p-3 text-cyan-400 font-bold">{h.id}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      h.aiResult.category === 'PERSISTENT_INDUSTRIAL' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30' :
                      h.aiResult.category === 'INDUSTRIAL_DISASTER' ? 'bg-rose-950 text-rose-300 border border-rose-500/30' :
                      h.aiResult.category === 'FOREST_WILDFIRE' ? 'bg-orange-950 text-orange-300 border border-orange-500/30' :
                      'bg-amber-950 text-amber-300 border border-amber-500/30'
                    }`}>
                      {h.aiResult.category}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{h.region || 'India Sector'}</td>
                  <td className="p-3 text-amber-400 font-bold">{h.frp.toFixed(1)} MW</td>
                  <td className="p-3 text-slate-300">{h.brightness.toFixed(1)} K</td>
                  <td className="p-3 text-purple-300 font-bold">{h.aiResult.persistenceScore}%</td>
                  <td className="p-3 text-slate-400">
                    {h.aiResult.osmMatchedZone ? `${h.aiResult.osmProximityMeters}m (${h.aiResult.osmMatchedZone.type})` : 'None (>2000m)'}
                  </td>
                  <td className="p-3">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      h.aiResult.threatLevel === 'CRITICAL' ? 'bg-rose-600 text-white animate-pulse' :
                      h.aiResult.threatLevel === 'HIGH' ? 'bg-amber-600 text-white' :
                      'bg-emerald-700 text-white'
                    }`}>
                      {h.aiResult.threatLevel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
