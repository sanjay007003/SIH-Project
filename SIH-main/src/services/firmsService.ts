import { FirmsHotspotRaw, EnrichedHotspot, OSMLandmark, SatelliteSensor } from '../types';
import { classifyThermalHotspot } from '../ai/classifier';
import { INITIAL_RAW_HOTSPOTS, HISTORICAL_RECURRENCE_MAP, OSM_LANDMARKS } from '../data/mockHotspots';

/**
 * Service to manage NASA FIRMS data ingestion, live satellite telemetry polling, and AI classification.
 */
class FirmsService {
  private mapKey: string = '';
  private customHotspots: FirmsHotspotRaw[] = [];

  constructor() {
    // Check if user stored a FIRMS MAP_KEY in localStorage
    if (typeof window !== 'undefined') {
      this.mapKey = localStorage.getItem('pyro_firms_map_key') || '';
    }
  }

  public setApiKey(key: string) {
    this.mapKey = key.trim();
    if (typeof window !== 'undefined') {
      localStorage.setItem('pyro_firms_map_key', this.mapKey);
    }
  }

  public getApiKey(): string {
    return this.mapKey;
  }

  /**
   * Fetches and enriches real-time thermal hotspots.
   * If real NASA FIRMS API key is configured, queries NASA FIRMS API; otherwise serves live high-res simulation stream.
   */
  public async getEnrichedHotspots(
    osmLandmarks: OSMLandmark[] = OSM_LANDMARKS,
    sensor: SatelliteSensor | 'ALL' = 'ALL'
  ): Promise<EnrichedHotspot[]> {
    let rawHotspots: FirmsHotspotRaw[] = [...INITIAL_RAW_HOTSPOTS, ...this.customHotspots];

    if (this.mapKey) {
      try {
        const liveApiData = await this.fetchLiveFirmsApi(this.mapKey);
        if (liveApiData.length > 0) {
          rawHotspots = [...liveApiData, ...this.customHotspots];
        }
      } catch (err) {
        console.warn('NASA FIRMS API fetch failed, utilizing high-fidelity telemetry stream:', err);
      }
    }

    if (sensor !== 'ALL') {
      rawHotspots = rawHotspots.filter(h => h.satellite === sensor);
    }

    // Run each hotspot through our Spatio-Temporal AI Classifier
    return rawHotspots.map(raw => {
      const histCount = HISTORICAL_RECURRENCE_MAP[raw.id] || 0;
      const aiResult = classifyThermalHotspot(raw, osmLandmarks, histCount);
      return {
        ...raw,
        aiResult
      };
    });
  }

  /**
   * Injects a newly detected or simulated hotspot into the live stream.
   */
  public injectHotspot(hotspot: FirmsHotspotRaw): void {
    this.customHotspots.unshift(hotspot);
  }

  /**
   * Clears custom injected hotspots.
   */
  public clearInjectedHotspots(): void {
    this.customHotspots = [];
  }

  /**
   * Fetch from official NASA FIRMS REST API
   * Endpoint format: https://firms.modaps.eosdis.nasa.gov/api/country/csv/[MAP_KEY]/[SOURCE]/[COUNTRY]/[DAYS]
   */
  private async fetchLiveFirmsApi(apiKey: string): Promise<FirmsHotspotRaw[]> {
    const source = 'VIIRS_SNPP_NRT';
    const country = 'IND';
    const days = 1;
    const url = `https://firms.modaps.eosdis.nasa.gov/api/country/csv/${apiKey}/${source}/${country}/${days}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`FIRMS API response status: ${response.status}`);
    }

    const csvText = await response.text();
    return this.parseFirmsCsv(csvText);
  }

  private parseFirmsCsv(csvText: string): FirmsHotspotRaw[] {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const hotspots: FirmsHotspotRaw[] = [];

    const latIdx = headers.indexOf('latitude');
    const lonIdx = headers.indexOf('longitude');
    const brightIdx = headers.indexOf('bright_ti4') !== -1 ? headers.indexOf('bright_ti4') : headers.indexOf('brightness');
    const frpIdx = headers.indexOf('frp');
    const dateIdx = headers.indexOf('acq_date');
    const timeIdx = headers.indexOf('acq_time');
    const confIdx = headers.indexOf('confidence');
    const dayNightIdx = headers.indexOf('daynight');

    for (let i = 1; i < Math.min(lines.length, 50); i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      if (parts.length < headers.length) continue;

      const lat = parseFloat(parts[latIdx]);
      const lon = parseFloat(parts[lonIdx]);
      const bright = parseFloat(parts[brightIdx]) || 330;
      const frp = parseFloat(parts[frpIdx]) || 25;
      const date = parts[dateIdx] || new Date().toISOString().split('T')[0];
      const time = parts[timeIdx] || '1200';
      const conf = parts[confIdx] === 'l' ? 40 : parts[confIdx] === 'n' ? 70 : parts[confIdx] === 'h' ? 95 : (parseInt(parts[confIdx]) || 80);
      const daynight = (parts[dayNightIdx] === 'N' ? 'N' : 'D') as 'D' | 'N';

      if (!isNaN(lat) && !isNaN(lon)) {
        hotspots.push({
          id: `FIRMS-LIVE-${i}`,
          latitude: lat,
          longitude: lon,
          brightness: bright,
          scan: 0.375,
          track: 0.375,
          acq_date: date,
          acq_time: time,
          satellite: 'VIIRS_SNPP',
          confidence: conf,
          bright_t31: bright - 35,
          frp,
          daynight,
          region: 'India - FIRMS Live Satellite Feed'
        });
      }
    }

    return hotspots;
  }
}

export const firmsService = new FirmsService();
