import { formatTime } from '../utils';
import './Timer.css';

interface TimerProps {
  elapsedTime: number;
  currentLapTime: number;
  lapNumber: number;
}

export function Timer({ elapsedTime, currentLapTime, lapNumber }: TimerProps) {
  return (
    <div className="timer-container">
      <div className="timer-main">
        <span className="timer-value">{formatTime(elapsedTime)}</span>
        <span className="timer-label">Total Time</span>
      </div>
      <div className="timer-lap">
        <div className="lap-indicator">LAP {lapNumber}</div>
        <span className="timer-lap-value">{formatTime(currentLapTime)}</span>
      </div>
    </div>
  );
}
