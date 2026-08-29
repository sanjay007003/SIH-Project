import { SimulationScenario } from '../types';
import { OSM_LANDMARKS } from './mockHotspots';

export const SIMULATION_SCENARIOS: SimulationScenario[] = [
  {
    id: 'scen-refinery-explosion',
    title: '🚨 Industrial Disaster: Jamnagar Flare Blowout & Petro Tank Fire',
    description: 'Catastrophic thermal spike (420 MW) over petrochemical processing unit with active smoke plume toward populated SEZ corridor.',
    locationName: 'Jamnagar Petrochemical Zone, Gujarat',
    lat: 22.3560,
    lon: 69.8670,
    frp: 420.5,
    brightness: 462.8,
    daynight: 'N',
    satellite: 'VIIRS_NOAA20',
    targetCategory: 'INDUSTRIAL_DISASTER',
    osmContext: OSM_LANDMARKS[0],
    windSpeedKmh: 24.5,
    windDirectionDeg: 65,
    historicalDetections: 84, // Even though site has history, the 420MW spike triggers Disaster!
    tacticalBrief: 'CRITICAL ALERT: Satellite infrared sensors indicate catastrophic thermal runaway. Emergency containment protocols and HazMat dispatch required immediately.'
  },
  {
    id: 'scen-wildfire-canopy',
    title: '🌲 Forest Disaster: Simlipal Biosphere Canopy Firestorm',
    description: 'Rapidly spreading multi-kilometer forest blaze in dense sal and teak canopy with severe NBR drop (-0.48) and high dispersion.',
    locationName: 'Simlipal Tiger Reserve, Odisha',
    lat: 21.6550,
    lon: 86.3580,
    frp: 210.0,
    brightness: 395.4,
    daynight: 'D',
    satellite: 'MODIS_TERRA',
    targetCategory: 'FOREST_WILDFIRE',
    osmContext: OSM_LANDMARKS[6],
    windSpeedKmh: 31.0,
    windDirectionDeg: 195,
    historicalDetections: 0,
    tacticalBrief: 'High canopy moisture depletion detected. Spread velocity estimated at 2.4 km/h towards core wildlife sanctuary.'
  },
  {
    id: 'scen-persistent-smelter',
    title: '🏭 Operational Baseline: Bhilai Steel Blast Furnace Cycle',
    description: 'Standard operational thermal emissions from active blast furnaces and coke ovens matching long-term spatio-temporal baseline.',
    locationName: 'SAIL Bhilai Steel Complex, Chhattisgarh',
    lat: 21.1870,
    lon: 81.4075,
    frp: 88.5,
    brightness: 358.2,
    daynight: 'N',
    satellite: 'VIIRS_NOAA21',
    targetCategory: 'PERSISTENT_INDUSTRIAL',
    osmContext: OSM_LANDMARKS[2],
    windSpeedKmh: 14.0,
    windDirectionDeg: 280,
    historicalDetections: 76,
    tacticalBrief: 'Routine industrial thermal signature verified against 90-day persistence baseline. No emergency intervention required.'
  },
  {
    id: 'scen-punjab-stubble',
    title: '🌾 Agricultural Event: Sangrur Post-Harvest Paddy Fire',
    description: 'Daytime open-field crop residue burning with low thermal intensity (24 MW) in designated agricultural zoning.',
    locationName: 'Sangrur Agricultural District, Punjab',
    lat: 30.2470,
    lon: 75.8480,
    frp: 24.5,
    brightness: 326.8,
    daynight: 'D',
    satellite: 'VIIRS_SNPP',
    targetCategory: 'AGRICULTURAL_STUBBLE',
    osmContext: OSM_LANDMARKS[8],
    windSpeedKmh: 11.0,
    windDirectionDeg: 120,
    historicalDetections: 2,
    tacticalBrief: 'Transient seasonal emission detected. State Pollution Control Board automated notification generated.'
  }
];
