export interface Lap {
  lapNumber: number;
  time: number; // in milliseconds
  distance: number; // in meters
  pace: number; // seconds per km
  speed: number; // km/h
}

export interface RunSession {
  laps: Lap[];
  lapDistance: number; // distance of one lap in meters
  startTime: number | null;
  isRunning: boolean;
  currentLapStartTime: number | null;
  elapsedTime: number; // total elapsed time
  currentLapTime: number; // current lap elapsed time
}

export interface SplitAnalysis {
  firstHalfPace: number; // seconds per km
  secondHalfPace: number; // seconds per km
  splitDifference: number; // percentage difference (negative = negative split = good)
  splitType: 'negative' | 'positive' | 'even';
}

export interface ProjectedTime {
  distance: number; // in meters
  label: string;
  time: number; // in milliseconds
}

export interface RunStats {
  totalDistance: number; // in meters
  totalTime: number; // in milliseconds
  averagePace: number; // seconds per km
  averageSpeed: number; // km/h
  fastestLap: Lap | null;
  slowestLap: Lap | null;
  totalLaps: number;
  // Advanced metrics
  paceConsistency: number; // coefficient of variation (lower = more consistent)
  paceRange: number; // difference between fastest and slowest pace in seconds
  splitAnalysis: SplitAnalysis | null; // null if less than 2 laps
  projectedTimes: ProjectedTime[];
  averageLapTime: number; // in milliseconds
}
