import { FirmsHotspotRaw } from '../types';

/**
 * Calculates Great-Circle distance between two coordinates in meters using the Haversine formula.
 */
export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface ClusterResult {
  clusterId: number;
  centerLat: number;
  centerLon: number;
  points: FirmsHotspotRaw[];
  averageFRP: number;
  maxFRP: number;
  temporalSpreadDays: number;
  isPersistentCluster: boolean;
}

/**
 * Spatial DBSCAN clustering implementation specifically tuned for NASA FIRMS thermal anomaly coordinates.
 * @param points Array of raw FIRMS hotspots
 * @param epsMeters Maximum radius in meters to consider points in the same neighborhood (default: 800m)
 * @param minPts Minimum number of points to form a dense cluster (default: 3)
 */
export function clusterHotspotsDBSCAN(
  points: FirmsHotspotRaw[],
  epsMeters: number = 800,
  minPts: number = 2
): ClusterResult[] {
  const visited = new Set<string>();
  const clustered = new Set<string>();
  const clusters: ClusterResult[] = [];
  let clusterCount = 0;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (visited.has(p.id)) continue;
    visited.add(p.id);

    const neighbors = getNeighbors(p, points, epsMeters);

    if (neighbors.length < minPts) {
      // Noise or solitary point
      continue;
    }

    clusterCount++;
    const currentClusterPoints: FirmsHotspotRaw[] = [p];
    clustered.add(p.id);

    const queue = [...neighbors];
    while (queue.length > 0) {
      const neighbor = queue.shift()!;
      if (!visited.has(neighbor.id)) {
        visited.add(neighbor.id);
        const neighborNeighbors = getNeighbors(neighbor, points, epsMeters);
        if (neighborNeighbors.length >= minPts) {
          queue.push(...neighborNeighbors.filter(n => !visited.has(n.id)));
        }
      }
      if (!clustered.has(neighbor.id)) {
        clustered.add(neighbor.id);
        currentClusterPoints.push(neighbor);
      }
    }

    // Compute cluster center & stats
    const avgLat = currentClusterPoints.reduce((sum, pt) => sum + pt.latitude, 0) / currentClusterPoints.length;
    const avgLon = currentClusterPoints.reduce((sum, pt) => sum + pt.longitude, 0) / currentClusterPoints.length;
    const totalFRP = currentClusterPoints.reduce((sum, pt) => sum + pt.frp, 0);
    const maxFRP = Math.max(...currentClusterPoints.map(pt => pt.frp));

    // Calculate temporal spread (days difference between oldest and newest point)
    const dates = currentClusterPoints.map(pt => new Date(pt.acq_date).getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const temporalSpreadDays = Math.round((maxDate - minDate) / (1000 * 60 * 60 * 24));

    clusters.push({
      clusterId: clusterCount,
      centerLat: avgLat,
      centerLon: avgLon,
      points: currentClusterPoints,
      averageFRP: +(totalFRP / currentClusterPoints.length).toFixed(1),
      maxFRP: +maxFRP.toFixed(1),
      temporalSpreadDays: Math.max(1, temporalSpreadDays),
      isPersistentCluster: currentClusterPoints.length >= 3 && temporalSpreadDays >= 7,
    });
  }

  return clusters;
}

function getNeighbors(
  target: FirmsHotspotRaw,
  allPoints: FirmsHotspotRaw[],
  epsMeters: number
): FirmsHotspotRaw[] {
  return allPoints.filter(
    p => p.id !== target.id && haversineDistanceMeters(target.latitude, target.longitude, p.latitude, p.longitude) <= epsMeters
  );
}
