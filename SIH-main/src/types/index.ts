export type SatelliteSensor = 'VIIRS_SNPP' | 'VIIRS_NOAA20' | 'VIIRS_NOAA21' | 'MODIS_TERRA' | 'MODIS_AQUA';

export type ClassificationType = 
  | 'PERSISTENT_INDUSTRIAL' 
  | 'INDUSTRIAL_DISASTER' 
  | 'FOREST_WILDFIRE' 
  | 'AGRICULTURAL_STUBBLE' 
  | 'URBAN_WASTE';

export type ThreatLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NOMINAL';

export interface FirmsHotspotRaw {
  id: string;
  latitude: number;
  longitude: number;
  brightness: number; // Kelvin (e.g. 340.5 K)
  scan?: number;
  track?: number;
  acq_date: string; // YYYY-MM-DD
  acq_time: string; // HHMM UTC
  satellite: SatelliteSensor;
  confidence: number; // 0 - 100
  version?: string;
  bright_t31?: number; // Channel 31/I5 Brightness Kelvin
  frp: number; // Fire Radiative Power in MW
  daynight: 'D' | 'N';
  region?: string;
}

export interface OSMLandmark {
  id: string;
  name: string;
  type: 'refinery' | 'steel_plant' | 'thermal_power' | 'chemical_works' | 'brick_kiln' | 'forest_reserve' | 'cropland' | 'industrial_park';
  categoryLabel: string;
  lat: number;
  lon: number;
  distanceMeters: number;
  radiusMeters?: number;
  operator?: string;
  state?: string;
  tags?: Record<string, string>;
  polygon?: [number, number][]; // Coordinates for polygon overlay
}

export interface SpectralAnalysis {
  ndvi: number; // -1 to +1 (Vegetation index)
  nbr: number;  // -1 to +1 (Normalized Burn Ratio)
  swirRatio: number; // B12/B11 shortwave thermal ratio
  thermalAnomalyIndex: number; // 0 - 100
  canopyLossPct: number; // 0 - 100
  swirReflectanceUrl?: string;
  opticalRgbUrl?: string;
}

export interface DispersionVector {
  windSpeedKmh: number;
  windDirectionDeg: number; // 0-360 deg
  plumeLengthKm: number;
  hazardConeAngle: number;
  airQualityImpactAqi: number;
  affectedPopulationEstimate: number;
}

export interface AIClassificationResult {
  category: ClassificationType;
  categoryName: string;
  confidence: number; // 0 - 100%
  persistenceScore: number; // 0 - 100% (TRS - Temporal Recurrence Score)
  historicalRecurrenceCount: number; // Detections in past 90 days
  osmMatchedZone: OSMLandmark | null;
  osmProximityMeters: number;
  spectralData: SpectralAnalysis;
  threatLevel: ThreatLevel;
  dispersion: DispersionVector;
  featureWeights: {
    spatialPersistence: number;
    osmLanduseProximity: number;
    frpMagnitude: number;
    diurnalConsistency: number;
    spectralBurnScar: number;
  };
  reasoningBreakdown: string[];
  containmentProtocol: string;
  evacuationRadiusKm: number;
}

export interface EnrichedHotspot extends FirmsHotspotRaw {
  aiResult: AIClassificationResult;
  isSelected?: boolean;
}

export interface FilterState {
  searchQuery: string;
  categories: ClassificationType[];
  threatLevels: ThreatLevel[];
  satellites: SatelliteSensor[];
  minFRP: number;
  maxFRP: number;
  minConfidence: number;
  dayNight: 'ALL' | 'D' | 'N';
  region: string;
  timeRangeHours: number;
}

export interface SimulationScenario {
  id: string;
  title: string;
  description: string;
  locationName: string;
  lat: number;
  lon: number;
  frp: number;
  brightness: number;
  daynight: 'D' | 'N';
  satellite: SatelliteSensor;
  targetCategory: ClassificationType;
  osmContext: OSMLandmark;
  windSpeedKmh: number;
  windDirectionDeg: number;
  historicalDetections: number;
  tacticalBrief: string;
}

export interface DashboardStats {
  totalDetections: number;
  persistentIndustrialCount: number;
  industrialDisastersCount: number;
  forestFiresCount: number;
  agriStubbleCount: number;
  criticalThreatsCount: number;
  totalRadiativePowerMW: number;
  activeSensorsCount: number;
}
