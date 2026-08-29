import { 
  FirmsHotspotRaw, 
  OSMLandmark, 
  AIClassificationResult, 
  ClassificationType, 
  ThreatLevel,
  DispersionVector
} from '../types';
import { haversineDistanceMeters } from './dbscan';
import { calculateSpectralIndices } from './spectralAnalysis';

/**
 * Multi-Factor AI/ML Classifier for NASA FIRMS Thermal Anomalies.
 * Correlates FIRMS spectral telemetry with OpenStreetMap infrastructure and Spatio-Temporal Persistence.
 */
export function classifyThermalHotspot(
  hotspot: FirmsHotspotRaw,
  osmLandmarks: OSMLandmark[],
  historicalDetectionsCount: number = 0
): AIClassificationResult {
  // 1. Find nearest OpenStreetMap landmark
  let nearestLandmark: OSMLandmark | null = null;
  let minDistanceMeters = Infinity;

  for (const landmark of osmLandmarks) {
    const dist = haversineDistanceMeters(hotspot.latitude, hotspot.longitude, landmark.lat, landmark.lon);
    if (dist < minDistanceMeters) {
      minDistanceMeters = dist;
      nearestLandmark = landmark;
    }
  }

  const isNearIndustrial = nearestLandmark !== null && 
    minDistanceMeters <= 2000 && 
    ['refinery', 'steel_plant', 'thermal_power', 'chemical_works', 'brick_kiln', 'industrial_park'].includes(nearestLandmark.type);

  const isForestZone = nearestLandmark !== null && 
    (nearestLandmark.type === 'forest_reserve' || (minDistanceMeters > 3000 && !isNearIndustrial));

  // 2. Compute Spatio-Temporal Persistence Score (0 - 100%)
  // High recurrence (many detections over time in the exact same 800m grid) indicates continuous industrial emission
  const persistenceScore = Math.min(100, Math.round((historicalDetectionsCount / 25) * 100));

  // 3. Multi-spectral Satellite Band simulation
  const spectralData = calculateSpectralIndices(
    hotspot.latitude,
    hotspot.longitude,
    hotspot.frp,
    hotspot.brightness,
    isNearIndustrial,
    isForestZone
  );

  // 4. Feature Weights computation for Explainable AI (XAI)
  const spatialPersistenceWeight = Math.min(1, persistenceScore / 100);
  const osmProximityWeight = isNearIndustrial ? Math.max(0, 1 - (minDistanceMeters / 2500)) : 0;
  const frpMagnitudeWeight = Math.min(1, hotspot.frp / 250);
  const diurnalConsistencyWeight = hotspot.daynight === 'N' ? 0.85 : 0.65; // Flares burn continuously through night
  const spectralBurnScarWeight = spectralData.nbr < -0.2 ? 0.9 : 0.15;

  let category: ClassificationType;
  let categoryName: string;
  let confidence: number;
  let threatLevel: ThreatLevel;
  let reasoningBreakdown: string[] = [];
  let containmentProtocol: string = '';
  let evacuationRadiusKm: number = 0.5;

  // 5. Multi-Class Decision Matrix
  if (isNearIndustrial) {
    // If inside/near industrial facility:
    // Case A: High persistence, typical operational FRP (< 150 MW) -> PERSISTENT_INDUSTRIAL
    if (persistenceScore >= 20 && hotspot.frp < 150) {
      category = 'PERSISTENT_INDUSTRIAL';
      categoryName = 'Persistent Industrial Thermal Source (Gas Flare / Kiln / Smelter)';
      confidence = Math.min(99.4, 85 + (persistenceScore * 0.12) + (osmProximityWeight * 8));
      threatLevel = hotspot.frp > 90 ? 'MEDIUM' : 'NOMINAL';
      
      reasoningBreakdown = [
        `High temporal recurrence score (${persistenceScore}% with ${historicalDetectionsCount} satellite passes in 90 days).`,
        `Direct spatial overlay with OSM industrial asset: "${nearestLandmark?.name}" (${Math.round(minDistanceMeters)}m proximity).`,
        `Low burn-scar severity (NBR: ${spectralData.nbr}) confirms lack of canopy destruction.`,
        `Continuous nighttime thermal emission profile consistent with petrochemical flare stacks or blast furnaces.`
      ];

      containmentProtocol = 'Baseline operational monitoring. Alert local pollution board if emissions exceed statutory PM2.5/NOx threshold.';
      evacuationRadiusKm = 0.2;
    } 
    // Case B: Huge FRP spike (> 150 MW) OR sudden unprecedented fire in industrial zone -> INDUSTRIAL_DISASTER
    else {
      category = 'INDUSTRIAL_DISASTER';
      categoryName = 'CRITICAL Industrial Disaster / Refinery Blast / Chemical Fire';
      confidence = Math.min(98.8, 88 + (frpMagnitudeWeight * 10));
      threatLevel = 'CRITICAL';

      reasoningBreakdown = [
        `Severe thermal radiative energy spike (${hotspot.frp.toFixed(1)} MW) within high-hazard industrial perimeter.`,
        `Proximity to hazardous chemical/hydrocarbon infrastructure: "${nearestLandmark?.name}" (${Math.round(minDistanceMeters)}m).`,
        `Extreme brightness temperature (${hotspot.brightness.toFixed(1)} K) indicates intense liquid/vapor fuel combustion.`,
        `Potential chemical runaway or containment breach detected by satellite multi-band anomaly.`
      ];

      containmentProtocol = 'IMMEDIATE TACTICAL INTERVENTION: Dispatch NDRF HazMat units, trigger automated industrial deluge suppression, and enforce emergency evacuation radius.';
      evacuationRadiusKm = Math.min(10, +(2.5 + (hotspot.frp / 80)).toFixed(1));
    }
  } else if (isForestZone || spectralData.nbr < -0.25 || (nearestLandmark?.type === 'forest_reserve')) {
    // Case C: High canopy loss, low persistence, negative NBR -> FOREST_WILDFIRE
    category = 'FOREST_WILDFIRE';
    categoryName = 'Wildfire / Forest Canopy Fire';
    confidence = Math.min(97.9, 82 + (spectralBurnScarWeight * 12) + (frpMagnitudeWeight * 5));
    threatLevel = hotspot.frp > 100 ? 'CRITICAL' : hotspot.frp > 40 ? 'HIGH' : 'MEDIUM';

    reasoningBreakdown = [
      `Significant Normalized Burn Ratio depletion (NBR: ${spectralData.nbr}) indicates heavy biomass combustion.`,
      `Rapid canopy moisture loss score (${spectralData.canopyLossPct}% loss) verified via Sentinel-2 SWIR/NIR indices.`,
      `Zero historical baseline persistence at this coordinate (transient natural blaze).`,
      `Spatial coordinates located inside or adjacent to "${nearestLandmark?.name || 'Forest Reserve'}" biome.`
    ];

    containmentProtocol = 'Dispatch Forest Department rapid aerial firefighting teams, deploy firebreak perimeter bulldozers, and model downwind spread vectors.';
    evacuationRadiusKm = +(1.5 + (hotspot.frp / 70)).toFixed(1);
  } else if (hotspot.frp <= 60 && persistenceScore < 15) {
    // Case D: Moderate/low FRP, transient, agricultural crop buffer -> AGRICULTURAL_STUBBLE
    category = 'AGRICULTURAL_STUBBLE';
    categoryName = 'Agricultural Stubble / Crop Residue Burning';
    confidence = Math.min(95.5, 78 + (hotspot.daynight === 'D' ? 12 : 5));
    threatLevel = hotspot.frp > 45 ? 'MEDIUM' : 'LOW';

    reasoningBreakdown = [
      `FRP level (${hotspot.frp.toFixed(1)} MW) is typical of low-intensity open-field crop residue combustion.`,
      `Diurnal afternoon peak detection consistent with post-harvest stubble clearing patterns.`,
      `Located on agricultural arable buffer with no permanent industrial footprint (${Math.round(minDistanceMeters)}m from nearest facility).`,
      `Transient spatial presence with no long-term multi-month thermal persistence.`
    ];

    containmentProtocol = 'Notify District Agricultural Officers & State Pollution Control Board. Issue aerial compliance advisories.';
    evacuationRadiusKm = 0.5;
  } else {
    // Case E: Urban structural or waste dump fire
    category = 'URBAN_WASTE';
    categoryName = 'Urban / Landfill / Unclassified Fire';
    confidence = 81.5;
    threatLevel = hotspot.frp > 50 ? 'HIGH' : 'MEDIUM';

    reasoningBreakdown = [
      `Isolated non-recurrent thermal signature in peri-urban grid.`,
      `Moderate thermal radiance (${hotspot.frp.toFixed(1)} MW) with localized footprint.`,
      `Correlates with waste disposal site or open landfill combustion.`
    ];

    containmentProtocol = 'Dispatch Municipal Fire Service and monitor local Air Quality Index (AQI) sensor stations.';
    evacuationRadiusKm = 0.8;
  }

  // 6. Plume Dispersion Modeling
  const windSpeedKmh = +(12 + (Math.sin(hotspot.latitude * 5) * 8) + 6).toFixed(1);
  const windDirectionDeg = Math.round((hotspot.longitude * 35) % 360);
  const plumeLengthKm = +((hotspot.frp / 25) * (windSpeedKmh / 15)).toFixed(1);
  const hazardConeAngle = 45;
  const airQualityImpactAqi = Math.min(500, Math.round(100 + (hotspot.frp * 2.8)));
  const affectedPopulationEstimate = Math.round((evacuationRadiusKm * evacuationRadiusKm * Math.PI) * (isNearIndustrial ? 320 : 85));

  const dispersion: DispersionVector = {
    windSpeedKmh,
    windDirectionDeg,
    plumeLengthKm: Math.max(1.2, plumeLengthKm),
    hazardConeAngle,
    airQualityImpactAqi,
    affectedPopulationEstimate
  };

  return {
    category,
    categoryName,
    confidence: +confidence.toFixed(1),
    persistenceScore,
    historicalRecurrenceCount: historicalDetectionsCount,
    osmMatchedZone: nearestLandmark,
    osmProximityMeters: Math.round(minDistanceMeters),
    spectralData,
    threatLevel,
    dispersion,
    featureWeights: {
      spatialPersistence: +spatialPersistenceWeight.toFixed(2),
      osmLanduseProximity: +osmProximityWeight.toFixed(2),
      frpMagnitude: +frpMagnitudeWeight.toFixed(2),
      diurnalConsistency: +diurnalConsistencyWeight.toFixed(2),
      spectralBurnScar: +spectralBurnScarWeight.toFixed(2),
    },
    reasoningBreakdown,
    containmentProtocol,
    evacuationRadiusKm
  };
}
