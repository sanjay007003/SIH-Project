import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  EnrichedHotspot, 
  OSMLandmark, 
  FilterState, 
  DashboardStats,
  FirmsHotspotRaw 
} from './types';
import { MapLayerState } from './components/Map/LayerControls';
import { firmsService } from './services/firmsService';
import { osmService } from './services/osmService';
import { clusterHotspotsDBSCAN, ClusterResult } from './ai/dbscan';
import { Navbar } from './components/Navbar';
import { TacticalMap } from './components/Map/TacticalMap';
import { FilterSidebar } from './components/Map/FilterSidebar';
import { LayerControls } from './components/Map/LayerControls';
import { HotspotInspector } from './components/Inspector/HotspotInspector';
import { AnalyticsPanel } from './components/Analytics/AnalyticsPanel';
import { AlertCenter } from './components/Alerts/AlertCenter';
import { SimulationSandbox } from './components/Simulation/SimulationSandbox';
import { ApiKeyModal } from './components/Modals/ApiKeyModal';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'map' | 'analytics' | 'alerts' | 'simulation'>('map');
  const [allHotspots, setAllHotspots] = useState<EnrichedHotspot[]>([]);
  const [selectedHotspot, setSelectedHotspot] = useState<EnrichedHotspot | null>(null);
  const [osmLandmarks, setOsmLandmarks] = useState<OSMLandmark[]>([]);
  const [dbscanClusters, setDbscanClusters] = useState<ClusterResult[]>([]);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Map Layer States
  const [layerState, setLayerState] = useState<MapLayerState>({
    baseMap: 'dark',
    showFirmsHotspots: true,
    showHeatmap: false,
    showOsmPolygons: true,
    showDispersionPlumes: true,
    showDbscanClusters: true,
    showSatelliteTrack: true,
  });

  // Filter States
  const [filters, setFilters] = useState<FilterState>({
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load Hotspots & Run Classification
  const loadData = useCallback(async () => {
    try {
      const landmarks = osmService.getLandmarks();
      setOsmLandmarks(landmarks);

      const enriched = await firmsService.getEnrichedHotspots(landmarks);
      setAllHotspots(enriched);

      // Run DBSCAN spatial persistence clustering
      const clusters = clusterHotspotsDBSCAN(enriched, 1200, 2);
      setDbscanClusters(clusters);
    } catch (err) {
      console.error('Data load failed:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compute filtered hotspots
  const filteredHotspots = useMemo(() => {
    return allHotspots.filter(h => {
      // 1. Search Query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesId = h.id.toLowerCase().includes(query);
        const matchesRegion = (h.region || '').toLowerCase().includes(query);
        const matchesCategory = h.aiResult.categoryName.toLowerCase().includes(query);
        const matchesLandmark = h.aiResult.osmMatchedZone?.name.toLowerCase().includes(query);
        if (!matchesId && !matchesRegion && !matchesCategory && !matchesLandmark) {
          return false;
        }
      }

      // 2. Categories
      if (!filters.categories.includes(h.aiResult.category)) return false;

      // 3. Satellites
      if (!filters.satellites.includes(h.satellite)) return false;

      // 4. FRP Range
      if (h.frp < filters.minFRP) return false;

      // 5. Day / Night
      if (filters.dayNight !== 'ALL' && h.daynight !== filters.dayNight) return false;

      return true;
    });
  }, [allHotspots, filters]);

  // Compute Real-Time Dashboard Statistics
  const dashboardStats: DashboardStats = useMemo(() => {
    const totalDetections = allHotspots.length;
    const persistentIndustrialCount = allHotspots.filter(h => h.aiResult.category === 'PERSISTENT_INDUSTRIAL').length;
    const industrialDisastersCount = allHotspots.filter(h => h.aiResult.category === 'INDUSTRIAL_DISASTER').length;
    const forestFiresCount = allHotspots.filter(h => h.aiResult.category === 'FOREST_WILDFIRE').length;
    const agriStubbleCount = allHotspots.filter(h => h.aiResult.category === 'AGRICULTURAL_STUBBLE').length;
    const criticalThreatsCount = allHotspots.filter(h => h.aiResult.threatLevel === 'CRITICAL').length;
    const totalRadiativePowerMW = allHotspots.reduce((sum, h) => sum + h.frp, 0);
    const activeSensorsCount = new Set(allHotspots.map(h => h.satellite)).size;

    return {
      totalDetections,
      persistentIndustrialCount,
      industrialDisastersCount,
      forestFiresCount,
      agriStubbleCount,
      criticalThreatsCount,
      totalRadiativePowerMW,
      activeSensorsCount
    };
  }, [allHotspots]);

  // Hotspot selection handler
  const handleSelectHotspot = (hotspot: EnrichedHotspot) => {
    setSelectedHotspot(hotspot);
    setIsInspectorOpen(true);
  };

  // Inject from simulation sandbox
  const handleInjectHotspot = (raw: FirmsHotspotRaw) => {
    firmsService.injectHotspot(raw);
    loadData();
    showToast(`Thermal Target ${raw.id} injected into live FIRMS telemetry stream!`);
  };

  const handleNavigateToMapWithHotspot = (hotspot: EnrichedHotspot) => {
    setSelectedHotspot(hotspot);
    setIsInspectorOpen(true);
    setActiveTab('map');
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-tactical-950 text-slate-100 overflow-hidden select-none">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={dashboardStats}
        onRefresh={() => {
          loadData();
          showToast('NASA FIRMS Stream & AI Classifiers Synchronized!');
        }}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        hasCustomKey={Boolean(firmsService.getApiKey())}
        alertCount={dashboardStats.criticalThreatsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex">
        {activeTab === 'map' && (
          <div className="relative w-full h-full flex overflow-hidden">
            {/* Left Filter Sidebar */}
            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              hotspots={filteredHotspots}
              onSelectHotspot={handleSelectHotspot}
              selectedHotspot={selectedHotspot}
            />

            {/* Tactical GIS Map Canvas */}
            <div className="flex-1 relative h-full">
              <TacticalMap
                hotspots={filteredHotspots}
                selectedHotspot={selectedHotspot}
                onSelectHotspot={handleSelectHotspot}
                osmLandmarks={osmLandmarks}
                dbscanClusters={dbscanClusters}
                layerState={layerState}
              />

              {/* Floating Layer Controls (Top Right) */}
              <div className="absolute top-4 right-4 z-[400]">
                <LayerControls layerState={layerState} setLayerState={setLayerState} />
              </div>

              {/* Quick Status Legend (Bottom Left) */}
              <div className="absolute bottom-4 left-4 z-[400] bg-tactical-900/90 backdrop-blur px-3 py-2 rounded-lg border border-tactical-700 text-[10px] font-mono text-slate-300 flex items-center space-x-3 shadow-xl">
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block shadow-[0_0_8px_#00f0ff]"></span>
                  <span>Industrial Baseline</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow-[0_0_8px_#ff0055]"></span>
                  <span>Industrial Disaster</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block shadow-[0_0_8px_#ff5400]"></span>
                  <span>Forest Wildfire</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-[0_0_8px_#ffb703]"></span>
                  <span>Agri Stubble</span>
                </span>
              </div>
            </div>

            {/* Right Hotspot Inspector Panel */}
            {isInspectorOpen && (
              <div className="w-96 h-full z-[500] shrink-0">
                <HotspotInspector
                  hotspot={selectedHotspot}
                  onClose={() => setIsInspectorOpen(false)}
                  onDispatchAction={h => showToast(`Tactical NDRF/HazMat units dispatched for Target #${h.id}`)}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="w-full h-full">
            <AnalyticsPanel
              hotspots={allHotspots}
              stats={dashboardStats}
              onSelectHotspot={handleNavigateToMapWithHotspot}
            />
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="w-full h-full">
            <AlertCenter
              hotspots={allHotspots}
              onSelectHotspot={setSelectedHotspot}
              onNavigateToMap={() => {
                setIsInspectorOpen(true);
                setActiveTab('map');
              }}
            />
          </div>
        )}

        {activeTab === 'simulation' && (
          <div className="w-full h-full">
            <SimulationSandbox
              onInjectHotspot={handleInjectHotspot}
              onNavigateToMapWithHotspot={handleNavigateToMapWithHotspot}
            />
          </div>
        )}
      </main>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeyUpdated={() => {
          loadData();
          showToast('NASA FIRMS MAP_KEY configured and live feed queried.');
        }}
      />

      {/* Global Toast Notice */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-cyan-950/95 border border-cyan-400 text-cyan-200 px-4 py-2.5 rounded-lg shadow-2xl font-mono text-xs flex items-center space-x-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default App;
