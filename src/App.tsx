import { useState, useEffect } from 'react';
import { Timer } from './components/Timer';
import { Controls } from './components/Controls';
import { LapList } from './components/LapList';
import { Stats } from './components/Stats';
import { DistanceSetup } from './components/DistanceSetup';
import { useTimer } from './hooks/useTimer';
import { calculateStats } from './utils';
import './App.css';

const DISTANCE_STORAGE_KEY = 'laptrack_distance';

function App() {
  const [lapDistance, setLapDistance] = useState(() => {
    const saved = localStorage.getItem(DISTANCE_STORAGE_KEY);
    return saved ? parseInt(saved, 10) : 200;
  });

  const { session, start, pause, lap, undoLap, reset } = useTimer(lapDistance);
  const stats = calculateStats(session.laps);

  useEffect(() => {
    localStorage.setItem(DISTANCE_STORAGE_KEY, lapDistance.toString());
  }, [lapDistance]);

  // Prevent screen from sleeping while running
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;

    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && session.isRunning) {
        try {
          wakeLock = await navigator.wakeLock.request('screen');
        } catch {
          // Wake lock not supported or failed
        }
      }
    };

    if (session.isRunning) {
      requestWakeLock();
    }

    return () => {
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, [session.isRunning]);

  const hasStarted = session.startTime !== null || session.elapsedTime > 0;

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">
          <span className="title-icon">🏃</span>
          LapTrack
        </h1>
        <p className="app-subtitle">Indoor Run Tracker</p>
      </header>

      <main className="app-main">
        <DistanceSetup
          lapDistance={lapDistance}
          onDistanceChange={setLapDistance}
          disabled={hasStarted}
        />

        <Timer
          elapsedTime={session.elapsedTime}
          currentLapTime={session.currentLapTime}
          lapNumber={session.laps.length + 1}
        />

        <Controls
          isRunning={session.isRunning}
          hasLaps={session.laps.length > 0}
          hasStarted={hasStarted}
          onStart={start}
          onPause={pause}
          onLap={lap}
          onUndoLap={undoLap}
          onReset={reset}
        />

        {session.laps.length > 0 && (
          <>
            <Stats stats={stats} />
            <LapList
              laps={session.laps}
              fastestLapNumber={stats.fastestLap?.lapNumber ?? null}
              slowestLapNumber={stats.slowestLap?.lapNumber ?? null}
              averageLapTime={stats.averageLapTime}
            />
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>Tap anywhere outside buttons to keep screen awake</p>
      </footer>
    </div>
  );
}

export default App;
