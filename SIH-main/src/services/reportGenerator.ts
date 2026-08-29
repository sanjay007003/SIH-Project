import { jsPDF } from 'jspdf';
import { EnrichedHotspot } from '../types';

export function generateIntelligenceDossierPDF(hotspot: EnrichedHotspot): void {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();

  // Header Banner
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(0, 240, 255); // Cyan
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('NATIONAL TECHNICAL RESEARCH ORGANISATION (NTRO)', 14, 14);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('PYRO-SENTRY: THERMAL ANOMALY & INDUSTRIAL FIRE INTELLIGENCE DOSSIER', 14, 22);
  doc.text(`CLASSIFIED REPORT ID: NTRO-GEOINT-${hotspot.id} | GEN TIME: ${timestamp}`, 14, 28);

  // Status Banner
  const isCritical = hotspot.aiResult.threatLevel === 'CRITICAL';
  doc.setFillColor(isCritical ? 220 : 30, isCritical ? 38 : 144, isCritical ? 38 : 255);
  doc.rect(14, 38, 182, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`THREAT CLASSIFICATION: ${hotspot.aiResult.threatLevel} | ${hotspot.aiResult.categoryName.toUpperCase()}`, 18, 45);

  // Hotspot Telemetry Table
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.text('1. SATELLITE TELEMETRY & OBSERVATION PARAMETERS', 14, 58);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const details = [
    ['Hotspot Target ID:', hotspot.id, 'Satellite Sensor:', hotspot.satellite],
    ['Latitude / Longitude:', `${hotspot.latitude.toFixed(4)}°N, ${hotspot.longitude.toFixed(4)}°E`, 'Acquisition Time:', `${hotspot.acq_date} ${hotspot.acq_time} UTC`],
    ['Fire Radiative Power (FRP):', `${hotspot.frp.toFixed(1)} MW`, 'Brightness Temp:', `${hotspot.brightness.toFixed(1)} K (T31: ${hotspot.bright_t31 || 'N/A'} K)`],
    ['Detection Confidence:', `${hotspot.confidence}%`, 'Diurnal Pass:', hotspot.daynight === 'D' ? 'Daytime (Solar Peak)' : 'Nighttime (Thermal Inversion)'],
    ['Target Region:', hotspot.region || 'Indian Strategic Sector', 'Persistence Score:', `${hotspot.aiResult.persistenceScore}% (${hotspot.aiResult.historicalRecurrenceCount} passes in 90d)`]
  ];

  let y = 66;
  for (const row of details) {
    doc.setFont('helvetica', 'bold');
    doc.text(row[0], 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(row[1]), 65, y);

    doc.setFont('helvetica', 'bold');
    doc.text(row[2], 110, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(row[3]), 155, y);
    y += 7;
  }

  // OSM Geospatial Correlation
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('2. OPENSTREETMAP (OSM) INFRASTRUCTURE CORRELATION', 14, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  if (hotspot.aiResult.osmMatchedZone) {
    doc.text(`Nearest Tagged Asset: ${hotspot.aiResult.osmMatchedZone.name}`, 14, y);
    y += 6;
    doc.text(`Asset Type: ${hotspot.aiResult.osmMatchedZone.categoryLabel} | Proximity Distance: ${hotspot.aiResult.osmProximityMeters} meters`, 14, y);
    y += 6;
    doc.text(`Facility Operator: ${hotspot.aiResult.osmMatchedZone.operator || 'Government / Private Industrial Operator'}`, 14, y);
  } else {
    doc.text('No permanent industrial infrastructure recorded within 2000m buffer zone (Open Wilderness / Rural Crop Zone).', 14, y);
  }

  // Multi-Spectral Analysis
  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('3. MULTI-SPECTRAL SATELLITE BAND INDICES (SENTINEL-2 / LANDSAT)', 14, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`• Normalized Burn Ratio (NBR): ${hotspot.aiResult.spectralData.nbr} (Severe burn scar if < -0.25)`, 14, y);
  y += 6;
  doc.text(`• Normalized Difference Vegetation Index (NDVI): ${hotspot.aiResult.spectralData.ndvi}`, 14, y);
  y += 6;
  doc.text(`• Shortwave Infrared (SWIR B12/B11 Ratio): ${hotspot.aiResult.spectralData.swirRatio}`, 14, y);
  y += 6;
  doc.text(`• Estimated Canopy Biomass Loss: ${hotspot.aiResult.spectralData.canopyLossPct}%`, 14, y);

  // Plume Dispersion & Threat Assessment
  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('4. HAZARD PLUME DISPERSION & IMPACT RADIUS', 14, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`• Wind Vector: ${hotspot.aiResult.dispersion.windSpeedKmh} km/h at ${hotspot.aiResult.dispersion.windDirectionDeg}° bearing`, 14, y);
  y += 6;
  doc.text(`• Plume Length: ${hotspot.aiResult.dispersion.plumeLengthKm} km downwind | Air Quality Impact: AQI ${hotspot.aiResult.dispersion.airQualityImpactAqi}`, 14, y);
  y += 6;
  doc.text(`• Recommended Evacuation Radius: ${hotspot.aiResult.evacuationRadiusKm} km | Est. Population Affected: ${hotspot.aiResult.dispersion.affectedPopulationEstimate.toLocaleString()}`, 14, y);

  // Containment Protocol
  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('5. TACTICAL ACTION DIRECTIVE & CONTAINMENT PROTOCOL', 14, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  const splitProtocol = doc.splitTextToSize(hotspot.aiResult.containmentProtocol, 180);
  doc.text(splitProtocol, 14, y);

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('GENERATED BY NTRO PYRO-SENTRY AI SUITE • STRICTLY FOR AUTHORIZED OPERATIONAL USE', 14, 285);

  // Save PDF
  doc.save(`NTRO_INTEL_DOSSIER_${hotspot.id}.pdf`);
}
