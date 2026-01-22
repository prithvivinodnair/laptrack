import type { RunStats } from '../types';
import { formatTime, formatPace, formatSpeed, formatDistance } from '../utils';
import './RaceSummary.css';

interface RaceSummaryProps {
  name: string;
  stats: RunStats;
  onNewRace: () => void;
}

function getPerformanceMessage(stats: RunStats): string {
  if (stats.paceConsistency < 3) {
    return "Elite-level consistency! You ran like a machine.";
  }
  if (stats.paceConsistency < 5) {
    return "Outstanding pacing! You maintained great control throughout.";
  }
  if (stats.splitAnalysis?.splitType === 'negative') {
    return "Strong negative split! You finished faster than you started.";
  }
  if (stats.totalDistance >= 5000) {
    return "Impressive distance covered! Great endurance.";
  }
  return "Great effort! Every lap counts.";
}

export function RaceSummary({ name, stats, onNewRace }: RaceSummaryProps) {
  const performanceMessage = getPerformanceMessage(stats);

  return (
    <div className="race-summary">
      <div className="summary-header">
        <div className="checkered-flag">🏁</div>
        <h1 className="summary-title">Race Complete!</h1>
        <p className="summary-greeting">
          Congratulations, <span className="runner-name">{name}</span>!
        </p>
        <p className="performance-message">{performanceMessage}</p>
      </div>

      <div className="summary-stats">
        <div className="main-stat">
          <span className="main-stat-value">{formatDistance(stats.totalDistance)}</span>
          <span className="main-stat-label">Total Distance</span>
        </div>

        <div className="main-stat">
          <span className="main-stat-value">{formatTime(stats.totalTime)}</span>
          <span className="main-stat-label">Total Time</span>
        </div>

        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{stats.totalLaps}</span>
            <span className="stat-label">Laps</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{formatPace(stats.averagePace)}</span>
            <span className="stat-label">Avg Pace /km</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{formatSpeed(stats.averageSpeed)}</span>
            <span className="stat-label">Avg Speed km/h</span>
          </div>
          {stats.fastestLap && (
            <div className="stat-item highlight">
              <span className="stat-value">{formatTime(stats.fastestLap.time)}</span>
              <span className="stat-label">Fastest Lap</span>
            </div>
          )}
          {stats.caloriesBurned !== null && (
            <div className="stat-item calories">
              <span className="stat-value">{Math.round(stats.caloriesBurned)}</span>
              <span className="stat-label">Calories</span>
            </div>
          )}
          {stats.splitAnalysis && (
            <div className={`stat-item split-${stats.splitAnalysis.splitType}`}>
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
            </div>
          )}
        </div>

        {stats.paceConsistency > 0 && (
          <div className="consistency-badge">
            <span className="consistency-value">{stats.paceConsistency.toFixed(1)}%</span>
            <span className="consistency-label">Pace Variation</span>
          </div>
        )}
      </div>

      <button className="new-race-btn" onClick={onNewRace}>
        <span className="btn-icon">🏃</span>
        Start New Race
      </button>
    </div>
  );
}
