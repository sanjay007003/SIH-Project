import { FirmsHotspotRaw, OSMLandmark } from '../types';

export const OSM_LANDMARKS: OSMLandmark[] = [
  {
    id: 'osm-jamnagar-refinery',
    name: 'Reliance Jamnagar Mega Refinery & Petrochemical Complex',
    type: 'refinery',
    categoryLabel: 'Petroleum Refinery & Flare Stacks',
    lat: 22.3552,
    lon: 69.8665,
    distanceMeters: 0,
    radiusMeters: 4500,
    operator: 'Reliance Industries Ltd / Nayara Energy',
    state: 'Gujarat',
    tags: { 'landuse': 'industrial', 'man_made': 'works', 'petroleum': 'refinery', 'hazard_level': 'critical' },
    polygon: [
      [22.3800, 69.8300],
      [22.3850, 69.8950],
      [22.3300, 69.9100],
      [22.3200, 69.8450],
      [22.3800, 69.8300]
    ]
  },
  {
    id: 'osm-singrauli-thermal',
    name: 'Singrauli Super Thermal Power Station & Coal Belt',
    type: 'thermal_power',
    categoryLabel: 'Coal Thermal Power & Smelters',
    lat: 24.1030,
    lon: 82.6840,
    distanceMeters: 0,
    radiusMeters: 3800,
    operator: 'NTPC / Northern Coalfields',
    state: 'Madhya Pradesh / UP',
    tags: { 'power': 'plant', 'plant:source': 'coal', 'industrial': 'power' },
    polygon: [
      [24.1300, 82.6500],
      [24.1350, 82.7200],
      [24.0750, 82.7150],
      [24.0800, 82.6450],
      [24.1300, 82.6500]
    ]
  },
  {
    id: 'osm-bhilai-steel',
    name: 'SAIL Bhilai Integrated Steel Plant & Blast Furnaces',
    type: 'steel_plant',
    categoryLabel: 'Integrated Steel Plant & Blast Furnaces',
    lat: 21.1850,
    lon: 81.4050,
    distanceMeters: 0,
    radiusMeters: 3500,
    operator: 'Steel Authority of India Ltd (SAIL)',
    state: 'Chhattisgarh',
    tags: { 'landuse': 'industrial', 'industrial': 'steel_works', 'man_made': 'works' },
    polygon: [
      [21.2100, 81.3800],
      [21.2150, 81.4300],
      [21.1600, 81.4350],
      [21.1550, 81.3850],
      [21.2100, 81.3800]
    ]
  },
  {
    id: 'osm-angul-industrial',
    name: 'Jindal Steel & Angul Heavy Industrial Complex',
    type: 'steel_plant',
    categoryLabel: 'Heavy Metallurgy & Aluminum Smelter',
    lat: 20.8350,
    lon: 85.1250,
    distanceMeters: 0,
    radiusMeters: 3200,
    operator: 'JSPL / NALCO',
    state: 'Odisha',
    tags: { 'landuse': 'industrial', 'industrial': 'metallurgy' },
    polygon: [
      [20.8600, 85.0900],
      [20.8650, 85.1550],
      [20.8050, 85.1500],
      [20.8100, 85.0950],
      [20.8600, 85.0900]
    ]
  },
  {
    id: 'osm-haldia-petro',
    name: 'Haldia Petrochemicals & IOCL Coastal Refinery',
    type: 'refinery',
    categoryLabel: 'Petrochemical Cracker & Refinery',
    lat: 22.0550,
    lon: 88.0850,
    distanceMeters: 0,
    radiusMeters: 3000,
    operator: 'Haldia Petrochemicals Ltd / IOCL',
    state: 'West Bengal',
    tags: { 'landuse': 'industrial', 'man_made': 'petroleum_works' },
    polygon: [
      [22.0800, 88.0600],
      [22.0850, 88.1150],
      [22.0300, 88.1100],
      [22.0250, 88.0650],
      [22.0800, 88.0600]
    ]
  },
  {
    id: 'osm-digboi-refinery',
    name: 'IOCL Digboi Heritage Oil Refinery',
    type: 'refinery',
    categoryLabel: 'Oil Refinery & Flare Stack',
    lat: 27.3850,
    lon: 95.6350,
    distanceMeters: 0,
    radiusMeters: 2000,
    operator: 'Indian Oil Corporation Ltd',
    state: 'Assam',
    tags: { 'landuse': 'industrial', 'industrial': 'oil_refinery' }
  },
  {
    id: 'osm-simlipal-forest',
    name: 'Simlipal Biosphere Reserve & Tiger Reserve',
    type: 'forest_reserve',
    categoryLabel: 'Protected Forest Reserve & Dense Canopy',
    lat: 21.6500,
    lon: 86.3500,
    distanceMeters: 0,
    radiusMeters: 25000,
    operator: 'Ministry of Environment, Forest and Climate Change',
    state: 'Odisha',
    tags: { 'boundary': 'protected_area', 'leisure': 'nature_reserve', 'landuse': 'forest' },
    polygon: [
      [21.8500, 86.1500],
      [21.8800, 86.5500],
      [21.4500, 86.6000],
      [21.4000, 86.2000],
      [21.8500, 86.1500]
    ]
  },
  {
    id: 'osm-bandipur-forest',
    name: 'Bandipur & Western Ghats Dense Forest Belt',
    type: 'forest_reserve',
    categoryLabel: 'Tropical Rainforest & Wildlife Sanctuary',
    lat: 11.6650,
    lon: 76.6350,
    distanceMeters: 0,
    radiusMeters: 18000,
    operator: 'Karnataka Forest Department',
    state: 'Karnataka / Tamil Nadu',
    tags: { 'leisure': 'nature_reserve', 'landuse': 'forest' }
  },
  {
    id: 'osm-punjab-agri',
    name: 'Sangrur-Patiala Intensive Agricultural Basin',
    type: 'cropland',
    categoryLabel: 'Intensive Agricultural & Paddy Crop Belt',
    lat: 30.2450,
    lon: 75.8450,
    distanceMeters: 0,
    radiusMeters: 30000,
    operator: 'State Agricultural Arable Land',
    state: 'Punjab',
    tags: { 'landuse': 'farmland', 'crop': 'paddy_wheat' }
  }
];

export const INITIAL_RAW_HOTSPOTS: FirmsHotspotRaw[] = [
  // 1. Jamnagar Flare Stack (Persistent Industrial)
  {
    id: 'FIRMS-IN-JAM-01',
    latitude: 22.3568,
    longitude: 69.8682,
    brightness: 348.4,
    scan: 0.38,
    track: 0.36,
    acq_date: '2026-08-24',
    acq_time: '1845',
    satellite: 'VIIRS_NOAA20',
    confidence: 94,
    bright_t31: 298.2,
    frp: 74.2,
    daynight: 'N',
    region: 'Gujarat - Jamnagar'
  },
  {
    id: 'FIRMS-IN-JAM-02',
    latitude: 22.3595,
    longitude: 69.8640,
    brightness: 339.1,
    scan: 0.40,
    track: 0.37,
    acq_date: '2026-08-24',
    acq_time: '0830',
    satellite: 'VIIRS_SNPP',
    confidence: 88,
    bright_t31: 302.5,
    frp: 52.8,
    daynight: 'D',
    region: 'Gujarat - Jamnagar'
  },
  // 2. Bhilai Steel Plant Blast Furnaces (Persistent Industrial)
  {
    id: 'FIRMS-IN-BHI-01',
    latitude: 21.1865,
    longitude: 81.4068,
    brightness: 362.5,
    scan: 0.39,
    track: 0.36,
    acq_date: '2026-08-24',
    acq_time: '1910',
    satellite: 'VIIRS_NOAA21',
    confidence: 96,
    bright_t31: 295.4,
    frp: 98.6,
    daynight: 'N',
    region: 'Chhattisgarh - Bhilai'
  },
  // 3. Singrauli Super Thermal Coal Plant (Persistent Industrial)
  {
    id: 'FIRMS-IN-SNG-01',
    latitude: 24.1042,
    longitude: 82.6855,
    brightness: 342.1,
    scan: 0.42,
    track: 0.38,
    acq_date: '2026-08-24',
    acq_time: '1855',
    satellite: 'VIIRS_SNPP',
    confidence: 91,
    bright_t31: 299.1,
    frp: 64.5,
    daynight: 'N',
    region: 'Madhya Pradesh - Singrauli'
  },
  // 4. CRITICAL DISASTER: Haldia Petrochemical Storage Tank Fire (Industrial Disaster)
  {
    id: 'FIRMS-IN-HLD-99',
    latitude: 22.0562,
    longitude: 88.0872,
    brightness: 448.7,
    scan: 0.37,
    track: 0.35,
    acq_date: '2026-08-24',
    acq_time: '1415',
    satellite: 'VIIRS_NOAA20',
    confidence: 99,
    bright_t31: 334.8,
    frp: 385.4, // Massive radiative explosion
    daynight: 'D',
    region: 'West Bengal - Haldia'
  },
  // 5. Simlipal Canopy Forest Blaze (Forest Wildfire)
  {
    id: 'FIRMS-IN-SML-01',
    latitude: 21.6520,
    longitude: 86.3530,
    brightness: 378.2,
    scan: 0.51,
    track: 0.44,
    acq_date: '2026-08-24',
    acq_time: '0815',
    satellite: 'MODIS_TERRA',
    confidence: 95,
    bright_t31: 308.2,
    frp: 182.3,
    daynight: 'D',
    region: 'Odisha - Simlipal National Park'
  },
  {
    id: 'FIRMS-IN-SML-02',
    latitude: 21.6440,
    longitude: 86.3680,
    brightness: 365.4,
    scan: 0.48,
    track: 0.42,
    acq_date: '2026-08-24',
    acq_time: '0815',
    satellite: 'MODIS_TERRA',
    confidence: 89,
    bright_t31: 304.1,
    frp: 114.7,
    daynight: 'D',
    region: 'Odisha - Simlipal National Park'
  },
  // 6. Western Ghats Wildlife Sanctuary Forest Fire
  {
    id: 'FIRMS-IN-WGH-01',
    latitude: 11.6680,
    longitude: 76.6380,
    brightness: 351.2,
    scan: 0.38,
    track: 0.36,
    acq_date: '2026-08-24',
    acq_time: '0905',
    satellite: 'VIIRS_NOAA21',
    confidence: 87,
    bright_t31: 301.6,
    frp: 78.4,
    daynight: 'D',
    region: 'Karnataka - Bandipur Western Ghats'
  },
  // 7. Punjab Paddy Crop Stubble Burning (Agricultural)
  {
    id: 'FIRMS-IN-PJB-01',
    latitude: 30.2465,
    longitude: 75.8475,
    brightness: 328.6,
    scan: 0.41,
    track: 0.38,
    acq_date: '2026-08-24',
    acq_time: '1330',
    satellite: 'VIIRS_SNPP',
    confidence: 82,
    bright_t31: 305.1,
    frp: 28.5,
    daynight: 'D',
    region: 'Punjab - Sangrur'
  },
  {
    id: 'FIRMS-IN-PJB-02',
    latitude: 30.2620,
    longitude: 75.8810,
    brightness: 324.2,
    scan: 0.43,
    track: 0.39,
    acq_date: '2026-08-24',
    acq_time: '1330',
    satellite: 'VIIRS_SNPP',
    confidence: 76,
    bright_t31: 303.4,
    frp: 21.2,
    daynight: 'D',
    region: 'Punjab - Patiala'
  },
  // 8. Angul Industrial Smelter (Persistent Industrial)
  {
    id: 'FIRMS-IN-ANG-01',
    latitude: 20.8368,
    longitude: 85.1265,
    brightness: 355.0,
    scan: 0.38,
    track: 0.36,
    acq_date: '2026-08-24',
    acq_time: '1940',
    satellite: 'VIIRS_NOAA20',
    confidence: 93,
    bright_t31: 297.8,
    frp: 86.4,
    daynight: 'N',
    region: 'Odisha - Angul'
  },
  // 9. Digboi Heritage Refinery Flare (Persistent Industrial)
  {
    id: 'FIRMS-IN-DGB-01',
    latitude: 27.3862,
    longitude: 95.6364,
    brightness: 341.3,
    scan: 0.39,
    track: 0.37,
    acq_date: '2026-08-24',
    acq_time: '1810',
    satellite: 'VIIRS_NOAA21',
    confidence: 89,
    bright_t31: 296.2,
    frp: 48.9,
    daynight: 'N',
    region: 'Assam - Digboi'
  }
];

// Historical recurrence lookup (how many times detected in past 90 days)
export const HISTORICAL_RECURRENCE_MAP: Record<string, number> = {
  'FIRMS-IN-JAM-01': 84, // Jamnagar flare detected 84 times in 90 days!
  'FIRMS-IN-JAM-02': 82,
  'FIRMS-IN-BHI-01': 76, // Bhilai blast furnaces detected 76 times
  'FIRMS-IN-SNG-01': 68, // Singrauli coal plant
  'FIRMS-IN-HLD-99': 1,  // Haldia disaster is NEW (unprecedented explosion!)
  'FIRMS-IN-SML-01': 2,  // Simlipal forest fire is transient
  'FIRMS-IN-SML-02': 2,
  'FIRMS-IN-WGH-01': 1,
  'FIRMS-IN-PJB-01': 3,  // Seasonal stubble
  'FIRMS-IN-PJB-02': 2,
  'FIRMS-IN-ANG-01': 71, // Angul smelter
  'FIRMS-IN-DGB-01': 65, // Digboi flare
};
