import type { RunStats } from '../types';
import { formatTime, formatPace, formatSpeed, formatDistance, formatProjectedTime } from '../utils';
import './Stats.css';

interface StatsProps {
  stats: RunStats;
}

function getConsistencyRating(cv: number): { label: string; class: string } {
  if (cv < 3) return { label: 'Elite', class: 'elite' };
  if (cv < 5) return { label: 'Great', class: 'great' };
  if (cv < 8) return { label: 'Good', class: 'good' };
  if (cv < 12) return { label: 'Fair', class: 'fair' };
  return { label: 'Variable', class: 'variable' };
}

export function Stats({ stats }: StatsProps) {
  if (stats.totalLaps === 0) {
    return null;
  }

  const consistencyRating = getConsistencyRating(stats.paceConsistency);

  return (
    <div className="stats-container">
      <h3 className="stats-title">Run Statistics</h3>

      {/* Primary Stats */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <span className="stat-value">{formatDistance(stats.totalDistance)}</span>
          <span className="stat-label">Total Distance</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.totalLaps}</span>
          <span className="stat-label">Laps</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{formatTime(stats.totalTime)}</span>
          <span className="stat-label">Total Time</span>
        </div>
        <div className="stat-card highlight">
          <span className="stat-value">{formatPace(stats.averagePace)}</span>
          <span className="stat-label">Avg Pace /km</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{formatSpeed(stats.averageSpeed)}</span>
          <span className="stat-label">Avg Speed km/h</span>
        </div>
        {stats.fastestLap && (
          <div className="stat-card fastest">
            <span className="stat-value">{formatTime(stats.fastestLap.time)}</span>
            <span className="stat-label">Fastest Lap #{stats.fastestLap.lapNumber}</span>
          </div>
        )}
      </div>

      {/* Advanced Stats - only show if we have enough data */}
      {stats.totalLaps >= 2 && (
        <>
          <h3 className="stats-title">Performance Analysis</h3>
          <div className="stats-grid">
            {/* Pace Consistency */}
            <div className={`stat-card consistency ${consistencyRating.class}`}>
              <span className="stat-value">{stats.paceConsistency.toFixed(1)}%</span>
              <span className="stat-label">Pace Variation</span>
              <span className="stat-badge">{consistencyRating.label}</span>
            </div>

            {/* Pace Range */}
            <div className="stat-card">
              <span className="stat-value">±{Math.round(stats.paceRange)}s</span>
              <span className="stat-label">Pace Range /km</span>
            </div>

            {/* Split Analysis */}
            {stats.splitAnalysis && (
              <div className={`stat-card split ${stats.splitAnalysis.splitType}`}>
                <span className="stat-value">
                  {stats.splitAnalysis.splitType === 'negative' ? '−' : stats.splitAnalysis.splitType === 'positive' ? '+' : ''}
                  {Math.abs(stats.splitAnalysis.splitDifference).toFixed(1)}%
                </span>
                <span className="stat-label">
                  {stats.splitAnalysis.splitType === 'negative'
                    ? 'Negative Split'
                    : stats.splitAnalysis.splitType === 'positive'
                    ? 'Positive Split'
                    : 'Even Split'}
                </span>
                <span className="stat-hint">
                  {stats.splitAnalysis.splitType === 'negative'
                    ? 'Getting faster!'
                    : stats.splitAnalysis.splitType === 'positive'
                    ? 'Slowing down'
                    : 'Steady pace'}
                </span>
              </div>
            )}

            {/* First vs Second Half Pace */}
            {stats.splitAnalysis && (
              <div className="stat-card">
                <div className="split-comparison">
                  <div className="split-half">
                    <span className="split-pace">{formatPace(stats.splitAnalysis.firstHalfPace)}</span>
                    <span className="split-label">1st Half</span>
                  </div>
                  <span className="split-arrow">→</span>
                  <div className="split-half">
                    <span className="split-pace">{formatPace(stats.splitAnalysis.secondHalfPace)}</span>
                    <span className="split-label">2nd Half</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Projected Times */}
      {stats.projectedTimes.length > 0 && (
        <>
          <h3 className="stats-title">Projected Finish Times</h3>
          <div className="projections-list">
            {stats.projectedTimes.map((projection) => (
              <div key={projection.label} className="projection-item">
                <span className="projection-distance">{projection.label}</span>
                <span className="projection-time">{formatProjectedTime(projection.time)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
