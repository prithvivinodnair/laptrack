import { useState, useRef, useCallback, useEffect } from 'react';
import type { Lap, RunSession } from '../types';
import { calculatePace, calculateSpeed } from '../utils';

const STORAGE_KEY = 'laptrack_session';

export function useTimer(lapDistance: number) {
  const [session, setSession] = useState<RunSession>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...parsed, isRunning: false };
      } catch {
        // ignore parse errors
      }
    }
    return {
      laps: [],
      lapDistance,
      startTime: null,
      isRunning: false,
      currentLapStartTime: null,
      elapsedTime: 0,
      currentLapTime: 0,
    };
  });

  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lapStartTimeRef = useRef<number | null>(null);
  const baseElapsedRef = useRef<number>(session.elapsedTime);
  const baseLapElapsedRef = useRef<number>(session.currentLapTime);

  // Save session to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  // Update lap distance in session when it changes
  useEffect(() => {
    setSession(prev => ({ ...prev, lapDistance }));
  }, [lapDistance]);

  const updateTime = useCallback(() => {
    const now = Date.now();
    if (startTimeRef.current !== null) {
      const elapsed = baseElapsedRef.current + (now - startTimeRef.current);
      const lapElapsed = baseLapElapsedRef.current + (now - (lapStartTimeRef.current || startTimeRef.current));

      setSession(prev => ({
        ...prev,
        elapsedTime: elapsed,
        currentLapTime: lapElapsed,
      }));
    }
  }, []);

  const start = useCallback(() => {
    const now = Date.now();
    startTimeRef.current = now;
    lapStartTimeRef.current = now;
    baseElapsedRef.current = session.elapsedTime;
    baseLapElapsedRef.current = session.currentLapTime;

    setSession(prev => ({
      ...prev,
      isRunning: true,
      startTime: prev.startTime || now,
      currentLapStartTime: prev.currentLapStartTime || now,
    }));

    intervalRef.current = window.setInterval(updateTime, 10);
  }, [session.elapsedTime, session.currentLapTime, updateTime]);

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Save current elapsed times
    const now = Date.now();
    if (startTimeRef.current !== null) {
      baseElapsedRef.current = baseElapsedRef.current + (now - startTimeRef.current);
      baseLapElapsedRef.current = baseLapElapsedRef.current + (now - (lapStartTimeRef.current || startTimeRef.current));
    }

    startTimeRef.current = null;
    lapStartTimeRef.current = null;

    setSession(prev => ({
      ...prev,
      isRunning: false,
      elapsedTime: baseElapsedRef.current,
      currentLapTime: baseLapElapsedRef.current,
    }));
  }, []);

  const lap = useCallback(() => {
    if (!session.isRunning) return;

    const lapTime = session.currentLapTime;
    const newLap: Lap = {
      lapNumber: session.laps.length + 1,
      time: lapTime,
      distance: session.lapDistance,
      pace: calculatePace(lapTime, session.lapDistance),
      speed: calculateSpeed(lapTime, session.lapDistance),
    };

    // Reset lap timer
    lapStartTimeRef.current = Date.now();
    baseLapElapsedRef.current = 0;

    setSession(prev => ({
      ...prev,
      laps: [...prev.laps, newLap],
      currentLapTime: 0,
      currentLapStartTime: Date.now(),
    }));
  }, [session.isRunning, session.currentLapTime, session.laps.length, session.lapDistance]);

  const undoLap = useCallback(() => {
    if (session.laps.length === 0) return;

    const lastLap = session.laps[session.laps.length - 1];

    // Add the last lap's time back to current lap time
    baseLapElapsedRef.current = baseLapElapsedRef.current + lastLap.time;

    setSession(prev => ({
      ...prev,
      laps: prev.laps.slice(0, -1),
      currentLapTime: prev.currentLapTime + lastLap.time,
    }));
  }, [session.laps]);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    startTimeRef.current = null;
    lapStartTimeRef.current = null;
    baseElapsedRef.current = 0;
    baseLapElapsedRef.current = 0;

    setSession(prev => ({
      ...prev,
      laps: [],
      startTime: null,
      isRunning: false,
      currentLapStartTime: null,
      elapsedTime: 0,
      currentLapTime: 0,
    }));

    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    session,
    start,
    pause,
    lap,
    undoLap,
    reset,
  };
}
