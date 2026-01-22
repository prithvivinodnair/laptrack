import type { Lap, RunStats, SplitAnalysis, ProjectedTime } from './types';

export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((ms % 1000) / 10);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
}

export function formatPace(secondsPerKm: number): string {
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.floor(secondsPerKm % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatSpeed(kmh: number): string {
  return kmh.toFixed(1);
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  }
  return `${Math.round(meters)} m`;
}

export function formatPercentage(value: number): string {
  const absValue = Math.abs(value);
  return `${value >= 0 ? '+' : '-'}${absValue.toFixed(1)}%`;
}

// Format projected time with clear labels (e.g., "1h 23m 45s" or "5m 30s")
export function formatProjectedTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

export function calculatePace(timeMs: number, distanceMeters: number): number {
  if (distanceMeters === 0) return 0;
  const timeSeconds = timeMs / 1000;
  const distanceKm = distanceMeters / 1000;
  return timeSeconds / distanceKm;
}

export function calculateSpeed(timeMs: number, distanceMeters: number): number {
  if (timeMs === 0) return 0;
  const timeHours = timeMs / 3600000;
  const distanceKm = distanceMeters / 1000;
  return distanceKm / timeHours;
}

// Calculate MET (Metabolic Equivalent of Task) based on running speed
// MET values from the Compendium of Physical Activities
function getMETForSpeed(speedKmh: number): number {
  if (speedKmh < 6.4) return 6.0;      // < 4 mph (walking/slow jog)
  if (speedKmh < 8.0) return 8.3;      // 4-5 mph
  if (speedKmh < 9.6) return 9.8;      // 5-6 mph
  if (speedKmh < 11.2) return 11.0;    // 6-7 mph
  if (speedKmh < 12.8) return 11.8;    // 7-8 mph
  if (speedKmh < 14.4) return 12.8;    // 8-9 mph
  if (speedKmh < 16.0) return 14.5;    // 9-10 mph
  return 16.0;                          // > 10 mph
}

// Calculate calories burned using MET formula
// Calories = MET × weight (kg) × time (hours)
export function calculateCaloriesBurned(
  timeMs: number,
  distanceMeters: number,
  weightKg: number
): number {
  if (timeMs === 0 || distanceMeters === 0 || weightKg === 0) return 0;

  const timeHours = timeMs / (1000 * 60 * 60);
  const speedKmh = calculateSpeed(timeMs, distanceMeters);
  const met = getMETForSpeed(speedKmh);

  return met * weightKg * timeHours;
}

// Convert weight between units
export function convertWeight(value: number, from: 'kg' | 'lbs', to: 'kg' | 'lbs'): number {
  if (from === to) return value;
  if (from === 'lbs' && to === 'kg') return value * 0.453592;
  return value * 2.20462; // kg to lbs
}

// Calculate coefficient of variation for pace consistency
function calculatePaceConsistency(laps: Lap[]): number {
  if (laps.length < 2) return 0;

  const paces = laps.map(lap => lap.pace);
  const mean = paces.reduce((sum, p) => sum + p, 0) / paces.length;
  const squaredDiffs = paces.map(p => Math.pow(p - mean, 2));
  const variance = squaredDiffs.reduce((sum, d) => sum + d, 0) / paces.length;
  const stdDev = Math.sqrt(variance);

  // Return as percentage
  return (stdDev / mean) * 100;
}

// Calculate split analysis (first half vs second half)
function calculateSplitAnalysis(laps: Lap[]): SplitAnalysis | null {
  if (laps.length < 2) return null;

  const midpoint = Math.floor(laps.length / 2);
  const firstHalf = laps.slice(0, midpoint);
  const secondHalf = laps.slice(midpoint);

  const firstHalfTime = firstHalf.reduce((sum, lap) => sum + lap.time, 0);
  const firstHalfDistance = firstHalf.reduce((sum, lap) => sum + lap.distance, 0);
  const secondHalfTime = secondHalf.reduce((sum, lap) => sum + lap.time, 0);
  const secondHalfDistance = secondHalf.reduce((sum, lap) => sum + lap.distance, 0);

  const firstHalfPace = calculatePace(firstHalfTime, firstHalfDistance);
  const secondHalfPace = calculatePace(secondHalfTime, secondHalfDistance);

  // Positive means second half was slower (positive split)
  // Negative means second half was faster (negative split - the goal!)
  const splitDifference = ((secondHalfPace - firstHalfPace) / firstHalfPace) * 100;

  let splitType: 'negative' | 'positive' | 'even';
  if (Math.abs(splitDifference) < 1) {
    splitType = 'even';
  } else if (splitDifference < 0) {
    splitType = 'negative';
  } else {
    splitType = 'positive';
  }

  return {
    firstHalfPace,
    secondHalfPace,
    splitDifference,
    splitType,
  };
}

// Calculate projected times for common distances
function calculateProjectedTimes(averagePace: number, totalDistance: number): ProjectedTime[] {
  if (averagePace === 0) return [];

  const targets = [
    { label: '1 km', distance: 1000 },
    { label: '5 km', distance: 5000 },
    { label: '10 km', distance: 10000 },
    { label: 'Half Marathon', distance: 21097.5 },
    { label: 'Marathon', distance: 42195 },
  ];

  return targets
    .filter(target => target.distance > totalDistance) // Only show distances we haven't reached
    .slice(0, 3) // Show max 3 projections
    .map(target => ({
      distance: target.distance,
      label: target.label,
      // averagePace is seconds/km, so multiply by km then convert seconds to ms
      time: averagePace * (target.distance / 1000) * 1000,
    }));
}

export function calculateStats(laps: Lap[], weightKg?: number): RunStats {
  if (laps.length === 0) {
    return {
      totalDistance: 0,
      totalTime: 0,
      averagePace: 0,
      averageSpeed: 0,
      fastestLap: null,
      slowestLap: null,
      totalLaps: 0,
      paceConsistency: 0,
      paceRange: 0,
      splitAnalysis: null,
      projectedTimes: [],
      averageLapTime: 0,
      caloriesBurned: null,
    };
  }

  const totalDistance = laps.reduce((sum, lap) => sum + lap.distance, 0);
  const totalTime = laps.reduce((sum, lap) => sum + lap.time, 0);
  const averagePace = calculatePace(totalTime, totalDistance);
  const averageSpeed = calculateSpeed(totalTime, totalDistance);
  const averageLapTime = totalTime / laps.length;

  const sortedByTime = [...laps].sort((a, b) => a.time - b.time);
  const fastestLap = sortedByTime[0];
  const slowestLap = sortedByTime[sortedByTime.length - 1];

  // Pace range (difference between slowest and fastest pace)
  const paceRange = slowestLap.pace - fastestLap.pace;

  return {
    totalDistance,
    totalTime,
    averagePace,
    averageSpeed,
    fastestLap,
    slowestLap,
    totalLaps: laps.length,
    paceConsistency: calculatePaceConsistency(laps),
    paceRange,
    splitAnalysis: calculateSplitAnalysis(laps),
    projectedTimes: calculateProjectedTimes(averagePace, totalDistance),
    averageLapTime,
    caloriesBurned: weightKg ? calculateCaloriesBurned(totalTime, totalDistance, weightKg) : null,
  };
}

// Get how a lap compares to average
export function getLapComparison(lapTime: number, averageLapTime: number): number {
  if (averageLapTime === 0) return 0;
  return ((lapTime - averageLapTime) / averageLapTime) * 100;
}

export function getDistancePresets(): { label: string; meters: number }[] {
  return [
    { label: '100m', meters: 100 },
    { label: '150m', meters: 150 },
    { label: '200m', meters: 200 },
    { label: '250m', meters: 250 },
    { label: '300m', meters: 300 },
    { label: '400m', meters: 400 },
  ];
}
