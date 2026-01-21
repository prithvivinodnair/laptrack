import './Controls.css';

interface ControlsProps {
  isRunning: boolean;
  hasLaps: boolean;
  hasStarted: boolean;
  onStart: () => void;
  onPause: () => void;
  onLap: () => void;
  onUndoLap: () => void;
  onReset: () => void;
}

export function Controls({
  isRunning,
  hasLaps,
  hasStarted,
  onStart,
  onPause,
  onLap,
  onUndoLap,
  onReset,
}: ControlsProps) {
  return (
    <div className="controls-container">
      {!hasStarted ? (
        <button className="control-btn start-btn large" onClick={onStart}>
          <span className="btn-icon">▶</span>
          <span>Start Run</span>
        </button>
      ) : (
        <>
          <div className="controls-row">
            {isRunning ? (
              <>
                <button className="control-btn lap-btn" onClick={onLap}>
                  <span className="btn-icon">⚡</span>
                  <span>Lap</span>
                </button>
                <button className="control-btn pause-btn" onClick={onPause}>
                  <span className="btn-icon">⏸</span>
                  <span>Pause</span>
                </button>
              </>
            ) : (
              <>
                <button className="control-btn reset-btn" onClick={onReset}>
                  <span className="btn-icon">↺</span>
                  <span>Reset</span>
                </button>
                <button className="control-btn resume-btn" onClick={onStart}>
                  <span className="btn-icon">▶</span>
                  <span>Resume</span>
                </button>
              </>
            )}
          </div>
          {hasLaps && (
            <button className="control-btn undo-btn" onClick={onUndoLap}>
              <span className="btn-icon">↩</span>
              <span>Undo Last Lap</span>
            </button>
          )}
        </>
      )}
      {hasStarted && isRunning && hasLaps && (
        <button className="control-btn finish-btn" onClick={onPause}>
          <span>Finish Run</span>
        </button>
      )}
    </div>
  );
}
