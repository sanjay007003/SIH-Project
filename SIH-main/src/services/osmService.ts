import { OSMLandmark } from '../types';
import { OSM_LANDMARKS } from '../data/mockHotspots';

class OSMService {
  private landmarks: OSMLandmark[] = [...OSM_LANDMARKS];

  public getLandmarks(): OSMLandmark[] {
    return this.landmarks;
  }

  /**
   * Queries OpenStreetMap Overpass API for live industrial, refinery, and power plant infrastructure.
   */
  public async queryOverpassIndustrial(
    minLat: number,
    minLon: number,
    maxLat: number,
    maxLon: number
  ): Promise<OSMLandmark[]> {
    const overpassQuery = `
      [out:json][timeout:15];
      (
        node["landuse"="industrial"](${minLat},${minLon},${maxLat},${maxLon});
        node["man_made"="works"](${minLat},${minLon},${maxLat},${maxLon});
        node["power"="plant"](${minLat},${minLon},${maxLat},${maxLon});
        way["landuse"="industrial"](${minLat},${minLon},${maxLat},${maxLon});
        way["man_made"="works"](${minLat},${minLon},${maxLat},${maxLon});
      );
      out center 30;
    `;

    try {
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: overpassQuery,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (!response.ok) throw new Error(`Overpass API status: ${response.status}`);
      const data = await response.json();

      const newLandmarks: OSMLandmark[] = [];
      if (data.elements && Array.isArray(data.elements)) {
        for (const el of data.elements) {
          const lat = el.lat || el.center?.lat;
          const lon = el.lon || el.center?.lon;
          if (!lat || !lon) continue;

          const name = el.tags?.name || el.tags?.operator || el.tags?.['man_made'] || 'Industrial Complex';
          const type = el.tags?.['power'] === 'plant' ? 'thermal_power' :
                       el.tags?.['petroleum'] || el.tags?.['industrial'] === 'oil_refinery' ? 'refinery' :
                       el.tags?.['industrial'] === 'steel_works' ? 'steel_plant' : 'industrial_park';

          newLandmarks.push({
            id: `osm-live-${el.id}`,
            name: `${name} (OSM Verified)`,
            type,
            categoryLabel: `OSM ${type.toUpperCase()}`,
            lat,
            lon,
            distanceMeters: 0,
            radiusMeters: 2000,
            tags: el.tags,
          });
        }
      }

      if (newLandmarks.length > 0) {
        // Merge without duplicating
        const existingIds = new Set(this.landmarks.map(l => l.id));
        for (const nl of newLandmarks) {
          if (!existingIds.has(nl.id)) {
            this.landmarks.push(nl);
          }
        }
      }

      return this.landmarks;
    } catch (err) {
      console.warn('Live Overpass query returned error, using verified baseline database:', err);
      return this.landmarks;
    }
  }
}

export const osmService = new OSMService();
