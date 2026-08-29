import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { EnrichedHotspot, OSMLandmark, ClassificationType } from '../../types';
import { MapLayerState } from './LayerControls';
import { ClusterResult } from '../../ai/dbscan';

interface TacticalMapProps {
  hotspots: EnrichedHotspot[];
  selectedHotspot: EnrichedHotspot | null;
  onSelectHotspot: (hotspot: EnrichedHotspot) => void;
  osmLandmarks: OSMLandmark[];
  dbscanClusters: ClusterResult[];
  layerState: MapLayerState;
}

export const TacticalMap: React.FC<TacticalMapProps> = ({
  hotspots,
  selectedHotspot,
  onSelectHotspot,
  osmLandmarks,
  dbscanClusters,
  layerState,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  
  // Layer Groups
  const hotspotsLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const osmPolygonsLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const dispersionLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const clustersLayerGroupRef = useRef<L.LayerGroup>(L.layerGroup());

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered on Central/North India (22.5 N, 79.5 E) with zoom 5
    const map = L.map(mapContainerRef.current, {
      center: [22.5, 79.5],
      zoom: 5,
      zoomControl: false,
      attributionControl: false,
    });

    // Custom tactical zoom control on top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Add Layer Groups to Map
    hotspotsLayerGroupRef.current.addTo(map);
    osmPolygonsLayerGroupRef.current.addTo(map);
    dispersionLayerGroupRef.current.addTo(map);
    clustersLayerGroupRef.current.addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Base Tile Layer updates
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = '';
    let attribution = '';

    if (layerState.baseMap === 'satellite') {
      // Esri World Imagery (High Resolution Satellite)
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Esri, Maxar, Earthstar Geographics';
    } else if (layerState.baseMap === 'terrain') {
      // OpenTopoMap
      url = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      attribution = 'OpenTopoMap';
    } else {
      // CartoDB Dark Matter (Military / GEOINT Tactical Theme)
      url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=cb1_2f6c_1_5c0df81657f4b3fd888e90ed';
      attribution = 'CartoDB Dark Matter';
    }

    const newTile = L.tileLayer(url, {
      maxZoom: 18,
      subdomains: 'abcd',
      attribution,
    });

    newTile.addTo(map);
    tileLayerRef.current = newTile;
  }, [layerState.baseMap]);

  // 3. Render OSM Industrial & Forest Polygons
  useEffect(() => {
    const group = osmPolygonsLayerGroupRef.current;
    group.clearLayers();

    if (!layerState.showOsmPolygons) return;

    for (const landmark of osmLandmarks) {
      if (landmark.polygon && landmark.polygon.length > 2) {
        const isIndustrial = ['refinery', 'steel_plant', 'thermal_power', 'industrial_park'].includes(landmark.type);
        const color = isIndustrial ? '#00f0ff' : '#22c55e';

        const poly = L.polygon(landmark.polygon, {
          color,
          weight: 1.5,
          opacity: 0.8,
          fillColor: color,
          fillOpacity: 0.12,
          dashArray: isIndustrial ? '4, 4' : undefined,
        });

        poly.bindTooltip(
          `<div class="font-mono text-xs">
            <strong class="text-cyan-400 font-bold">${landmark.name}</strong><br/>
            <span class="text-slate-300">${landmark.categoryLabel}</span>
          </div>`,
          { className: 'tactical-tooltip', sticky: true }
        );

        poly.addTo(group);
      }
    }
  }, [osmLandmarks, layerState.showOsmPolygons]);

  // 4. Render Thermal Hotspots & Radar Markers
  useEffect(() => {
    const group = hotspotsLayerGroupRef.current;
    group.clearLayers();

    const dispGroup = dispersionLayerGroupRef.current;
    dispGroup.clearLayers();

    if (!layerState.showFirmsHotspots) return;

    for (const hotspot of hotspots) {
      const isSelected = selectedHotspot?.id === hotspot.id;
      const category = hotspot.aiResult.category;

      let color = '#00f0ff'; // Cyan (Persistent Industrial)
      let glowClass = 'pulse-cyan';
      let iconSymbol = '🏭';

      if (category === 'INDUSTRIAL_DISASTER') {
        color = '#ff0055'; // Crimson Red
        glowClass = 'pulse-red';
        iconSymbol = '🚨';
      } else if (category === 'FOREST_WILDFIRE') {
        color = '#ff5400'; // Bright Orange
        glowClass = 'pulse-orange';
        iconSymbol = '🌲';
      } else if (category === 'AGRICULTURAL_STUBBLE') {
        color = '#ffb703'; // Amber
        glowClass = 'pulse-amber';
        iconSymbol = '🌾';
      } else if (category === 'URBAN_WASTE') {
        color = '#a855f7'; // Purple
        glowClass = 'pulse-purple';
        iconSymbol = '🏙️';
      }

      // Radius scaled by Fire Radiative Power (FRP)
      const markerSize = Math.max(28, Math.min(52, 24 + Math.sqrt(hotspot.frp) * 2));

      // Custom Glowing Tactical Radar SVG Icon
      const customIcon = L.divIcon({
        className: 'tactical-radar-icon',
        html: `
          <div class="relative flex items-center justify-center ${isSelected ? 'scale-125 z-50' : ''}" style="width: ${markerSize}px; height: ${markerSize}px;">
            <div class="absolute inset-0 rounded-full animate-ping opacity-60" style="background-color: ${color};"></div>
            <div class="absolute inset-1 rounded-full border-2 border-dashed animate-spin opacity-80" style="border-color: ${color}; animation-duration: 8s;"></div>
            <div class="relative w-7 h-7 rounded-full flex items-center justify-center shadow-lg border border-white/40" style="background-color: #0c1017; box-shadow: 0 0 12px ${color};">
              <span class="text-xs">${iconSymbol}</span>
            </div>
            ${isSelected ? `<div class="absolute -bottom-4 bg-tactical-950/90 text-cyan-300 font-mono text-[9px] px-1 py-0.2 rounded border border-cyan-500 whitespace-nowrap shadow-md">${hotspot.frp.toFixed(0)} MW</div>` : ''}
          </div>
        `,
        iconSize: [markerSize, markerSize],
        iconAnchor: [markerSize / 2, markerSize / 2],
      });

      const marker = L.marker([hotspot.latitude, hotspot.longitude], { icon: customIcon });

      // Click action
      marker.on('click', () => {
        onSelectHotspot(hotspot);
      });

      // Interactive Popup
      const popupHtml = `
        <div class="p-2.5 font-mono text-slate-100 bg-tactical-950/95 rounded border border-tactical-700 shadow-2xl min-w-[240px]">
          <div class="flex items-center justify-between pb-1.5 border-b border-tactical-800">
            <span class="text-[10px] text-cyan-400 font-bold tracking-wider">${hotspot.id}</span>
            <span class="px-1.5 py-0.5 rounded text-[9px] font-bold ${
              hotspot.aiResult.threatLevel === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
              hotspot.aiResult.threatLevel === 'HIGH' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' :
              'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }">${hotspot.aiResult.threatLevel}</span>
          </div>

          <div class="mt-2 text-xs font-semibold" style="color: ${color}">
            ${hotspot.aiResult.categoryName}
          </div>

          <div class="mt-2 grid grid-cols-2 gap-1.5 text-[11px] bg-tactical-900/80 p-1.5 rounded border border-tactical-800">
            <div>
              <span class="text-slate-400 text-[10px]">FRP:</span>
              <strong class="text-amber-400 ml-1">${hotspot.frp.toFixed(1)} MW</strong>
            </div>
            <div>
              <span class="text-slate-400 text-[10px]">TEMP:</span>
              <strong class="text-slate-200 ml-1">${hotspot.brightness.toFixed(1)} K</strong>
            </div>
            <div>
              <span class="text-slate-400 text-[10px]">AI CONF:</span>
              <strong class="text-cyan-300 ml-1">${hotspot.aiResult.confidence}%</strong>
            </div>
            <div>
              <span class="text-slate-400 text-[10px]">PERSIST:</span>
              <strong class="text-purple-300 ml-1">${hotspot.aiResult.persistenceScore}%</strong>
            </div>
          </div>

          <div class="mt-2 text-[10px] text-slate-300 line-clamp-2">
            ${hotspot.aiResult.osmMatchedZone ? `📍 Near: ${hotspot.aiResult.osmMatchedZone.name} (${hotspot.aiResult.osmProximityMeters}m)` : '📍 Rural / Forest Wilderness'}
          </div>

          <div class="mt-2.5 pt-1.5 border-t border-tactical-800 text-center">
            <span class="text-[10px] text-cyan-400 hover:underline cursor-pointer font-bold">CLICK TO INSPECT FULL INTEL & SPECTRAL BANDS →</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { className: 'tactical-popup' });
      marker.addTo(group);

      // Render Dispersion Smoke Hazard Cone if enabled
      if (layerState.showDispersionPlumes && (category === 'INDUSTRIAL_DISASTER' || category === 'FOREST_WILDFIRE' || hotspot.frp > 60)) {
        const { windDirectionDeg, plumeLengthKm, hazardConeAngle } = hotspot.aiResult.dispersion;
        
        // Calculate plume cone vertices in lat/lon
        const startLat = hotspot.latitude;
        const startLon = hotspot.longitude;
        
        const degToRad = Math.PI / 180;
        const lengthDeg = plumeLengthKm / 111; // Approx 111km per deg
        
        const bearing1 = (windDirectionDeg - hazardConeAngle / 2) * degToRad;
        const bearing2 = (windDirectionDeg + hazardConeAngle / 2) * degToRad;
        
        const pt1Lat = startLat + Math.cos(bearing1) * lengthDeg;
        const pt1Lon = startLon + (Math.sin(bearing1) * lengthDeg) / Math.cos(startLat * degToRad);
        
        const pt2Lat = startLat + Math.cos(bearing2) * lengthDeg;
        const pt2Lon = startLon + (Math.sin(bearing2) * lengthDeg) / Math.cos(startLat * degToRad);

        const plumePolygon = L.polygon(
          [[startLat, startLon], [pt1Lat, pt1Lon], [pt2Lat, pt2Lon]],
          {
            color: category === 'INDUSTRIAL_DISASTER' ? '#ff0055' : '#ff5400',
            weight: 1,
            fillColor: category === 'INDUSTRIAL_DISASTER' ? '#ff0055' : '#ff5400',
            fillOpacity: 0.18,
            dashArray: '3, 3'
          }
        );

        plumePolygon.bindTooltip(
          `<div class="font-mono text-xs"><strong>Smoke Plume Hazard Cone</strong><br/>Wind: ${hotspot.aiResult.dispersion.windSpeedKmh} km/h | AQI: ${hotspot.aiResult.dispersion.airQualityImpactAqi}</div>`,
          { sticky: true }
        );

        plumePolygon.addTo(dispGroup);
      }
    }
  }, [hotspots, selectedHotspot, layerState.showFirmsHotspots, layerState.showDispersionPlumes, onSelectHotspot]);

  // 5. Render DBSCAN Persistence Centroids
  useEffect(() => {
    const group = clustersLayerGroupRef.current;
    group.clearLayers();

    if (!layerState.showDbscanClusters) return;

    for (const cluster of dbscanClusters) {
      if (cluster.isPersistentCluster) {
        const circle = L.circle([cluster.centerLat, cluster.centerLon], {
          radius: 1200,
          color: '#a855f7',
          weight: 2,
          fillColor: '#a855f7',
          fillOpacity: 0.15,
          dashArray: '5, 5',
        });

        circle.bindTooltip(
          `<div class="font-mono text-xs">
            <strong class="text-purple-400">DBSCAN Persistent Cluster #${cluster.clusterId}</strong><br/>
            Points: ${cluster.points.length} detections | Avg FRP: ${cluster.averageFRP} MW<br/>
            Temporal Active Window: ${cluster.temporalSpreadDays} days
          </div>`,
          { sticky: true }
        );

        circle.addTo(group);
      }
    }
  }, [dbscanClusters, layerState.showDbscanClusters]);

  // 6. Smooth Pan/Zoom when a hotspot is selected
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedHotspot) return;

    map.flyTo([selectedHotspot.latitude, selectedHotspot.longitude], 12, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  }, [selectedHotspot]);

  return (
    <div className="relative w-full h-full bg-tactical-950">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
