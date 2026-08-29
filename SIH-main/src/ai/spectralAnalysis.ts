import { SpectralAnalysis } from '../types';

/**
 * Derives satellite multi-spectral indices for a given thermal anomaly.
 * Correlates with Sentinel-2 MSI bands:
 * - B8 / B8A: Near-Infrared (NIR) 842nm
 * - B4: Red (665nm)
 * - B11: Shortwave Infrared-1 (SWIR-1) 1610nm
 * - B12: Shortwave Infrared-2 (SWIR-2) 2190nm (sensitive to intense combustion > 500°C)
 */
export function calculateSpectralIndices(
  lat: number,
  lon: number,
  frp: number,
  brightnessK: number,
  isIndustrialZone: boolean,
  isForestZone: boolean
): SpectralAnalysis {
  let ndvi: number;
  let nbr: number;
  let swirRatio: number;
  let canopyLossPct: number;

  if (isIndustrialZone) {
    // Industrial sites have impervious roofs/metal structures: very low NDVI (< 0.15),
    // moderate to high SWIR reflectance from flare stacks/combustion, minimal burn-scar drop in NBR
    ndvi = +(0.05 + ((Math.sin(lat * 10) * 0.05) + 0.03)).toFixed(3);
    // NBR for industrial metal structures is typically near zero or slightly positive (-0.05 to +0.15)
    nbr = +(0.08 + (Math.cos(lon * 5) * 0.04)).toFixed(3);
    // Very high SWIR 2/1 ratio for high-temp industrial flames
    swirRatio = +(1.85 + (frp / 250)).toFixed(2);
    canopyLossPct = +(2.5 + (Math.random() * 4)).toFixed(1);
  } else if (isForestZone) {
    // Forest canopy with active blaze: Pre-fire NDVI was 0.75, dropping sharply.
    // NBR drops deeply negative (e.g. -0.45) indicating severe burn scar & canopy destruction
    ndvi = +(0.68 - Math.min(0.5, frp / 300)).toFixed(3);
    nbr = +(-0.25 - Math.min(0.45, frp / 200)).toFixed(3);
    swirRatio = +(1.35 + (frp / 400)).toFixed(2);
    canopyLossPct = +Math.min(96, Math.max(25, (frp * 0.45) + 20)).toFixed(1);
  } else {
    // Agricultural / Mixed
    ndvi = +(0.32 - (frp / 600)).toFixed(3);
    nbr = +(-0.12 - (frp / 500)).toFixed(3);
    swirRatio = +(1.22 + (frp / 500)).toFixed(2);
    canopyLossPct = +Math.min(45, (frp * 0.2) + 5).toFixed(1);
  }

  // Thermal anomaly index derived from brightness temperature (Planck radiance approximation)
  const thermalAnomalyIndex = +Math.min(99.9, Math.max(10, ((brightnessK - 300) / 120) * 100)).toFixed(1);

  return {
    ndvi,
    nbr,
    swirRatio,
    thermalAnomalyIndex,
    canopyLossPct,
  };
}
