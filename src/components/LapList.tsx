import type { Lap } from '../types';
import { formatTime, formatPace, getLapComparison } from '../utils';
import './LapList.css';

interface LapListProps {
  laps: Lap[];
  fastestLapNumber: number | null;
  slowestLapNumber: number | null;
  averageLapTime: number;
}

export function LapList({ laps, fastestLapNumber, slowestLapNumber, averageLapTime }: LapListProps) {
  if (laps.length === 0) {
    return (
      <div className="lap-list-empty">
        <div className="empty-icon">🏃</div>
        <p>No laps recorded yet</p>
        <p className="empty-hint">Start running and tap "Lap" to record</p>
      </div>
    );
  }

  const reversedLaps = [...laps].reverse();

  return (
    <div className="lap-list">
      <h3 className="lap-list-title">Lap History</h3>
      <div className="lap-list-header">
        <span>Lap</span>
        <span>Time</span>
        <span>Pace</span>
        <span>vs Avg</span>
      </div>
      <div className="lap-list-items">
        {reversedLaps.map((lap) => {
          const comparison = getLapComparison(lap.time, averageLapTime);
          const comparisonClass = comparison < -2 ? 'faster' : comparison > 2 ? 'slower' : 'average';

          return (
            <div
              key={lap.lapNumber}
              className={`lap-item ${
                lap.lapNumber === fastestLapNumber
                  ? 'fastest'
                  : lap.lapNumber === slowestLapNumber
                  ? 'slowest'
                  : ''
              }`}
            >
              <span className="lap-number">
                {lap.lapNumber}
                {lap.lapNumber === fastestLapNumber && <span className="lap-badge">🏆</span>}
                {lap.lapNumber === slowestLapNumber && laps.length > 1 && (
                  <span className="lap-badge">🐢</span>
                )}
              </span>
              <span className="lap-time">{formatTime(lap.time)}</span>
              <span className="lap-pace">{formatPace(lap.pace)}/km</span>
              <span className={`lap-comparison ${comparisonClass}`}>
                {comparison > 0 ? '+' : ''}{comparison.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
