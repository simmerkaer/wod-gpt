import { useState, useEffect, useRef, useCallback } from 'react';

export type TimerType = 'countdown' | 'countup' | 'interval';

export interface TimerState {
  minutes: number;
  seconds: number;
  isRunning: boolean;
  isFinished: boolean;
  totalSeconds: number;
  initialSeconds: number;
}

export interface UseTimerOptions {
  type: TimerType;
  initialMinutes?: number;
  intervalMinutes?: number;
  onFinish?: () => void;
  onIntervalChange?: (isRest: boolean) => void;
}

export const useTimer = (options: UseTimerOptions) => {
  const {
    type,
    initialMinutes = 20,
    intervalMinutes = 1,
    onFinish,
    onIntervalChange
  } = options;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(() => {
    if (type === 'countup' || type === 'interval') {
      return 0;
    } else {
      return initialMinutes * 60;
    }
  });
  const [isFinished, setIsFinished] = useState(false);
  const [intervalCount, setIntervalCount] = useState(0);
  const [isRestPeriod, setIsRestPeriod] = useState(false);

  const initialSeconds = initialMinutes * 60;

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const start = useCallback(() => {
    setIsRunning(true);
    setIsFinished(false);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setIsFinished(false);
    setIntervalCount(0);
    setIsRestPeriod(false);
    if (type === 'countup' || type === 'interval') {
      setTotalSeconds(0);
    } else {
      setTotalSeconds(initialSeconds);  // Countdown starts from initial time
    }
  }, [type, initialSeconds]);

  // Reset timer when workout options change (new workout generated)
  useEffect(() => {
    reset();
  }, [reset]);

  const toggle = useCallback(() => {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  }, [isRunning, start, pause]);

  useEffect(() => {
    if (isRunning && !isFinished) {
      intervalRef.current = setInterval(() => {
        setTotalSeconds(prev => {
          let newSeconds: number;
          
          if (type === 'countdown') {
            newSeconds = prev - 1;
            if (newSeconds <= 0) {
              setIsFinished(true);
              setIsRunning(false);
              onFinish?.();
              return 0;
            }
          } else if (type === 'countup') {
            newSeconds = prev + 1;
          } else if (type === 'interval') {
            // EMOM logic - count up from 0
            newSeconds = prev + 1;
            
            if (newSeconds % 60 === 0) {
              setIntervalCount(prevCount => prevCount + 1);
              onIntervalChange?.(false); // Start of new work period
            }
            
            // Check if we've reached the total workout time
            if (newSeconds >= initialSeconds) {
              setIsFinished(true);
              setIsRunning(false);
              onFinish?.();
              return initialSeconds;
            }
          } else {
            newSeconds = prev + 1; // Default case
          }
          
          return newSeconds;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isFinished, type, initialSeconds, onFinish, onIntervalChange]);

  const getProgressPercentage = () => {
    if (type === 'countdown') {
      return ((initialSeconds - totalSeconds) / initialSeconds) * 100;
    } else if (type === 'interval') {
      return (totalSeconds / initialSeconds) * 100;
    }
    return 0; // countup doesn't have a defined end
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentInterval = () => {
    if (type === 'interval') {
      // For intervals, totalSeconds counts up from 0
      // For EMOM (intervalMinutes = 1), show current minute of workout
      if (intervalMinutes === 1) {
        // At 0-59 seconds = minute 1, 60-119 seconds = minute 2, etc.
        const currentMinute = Math.floor(totalSeconds / 60) + 1;
        // Clamp to valid range (1 to initialMinutes)
        return Math.min(currentMinute, initialMinutes);
      }
      // For other intervals (e.g., every 4 minutes), calculate current set
      const currentSet = Math.floor(totalSeconds / (intervalMinutes * 60)) + 1;
      // Calculate max sets based on total duration and interval duration
      const maxSets = Math.ceil(initialMinutes / intervalMinutes);
      return Math.min(currentSet, maxSets);
    }
    return 0;
  };

  return {
    minutes,
    seconds,
    totalSeconds,
    isRunning,
    isFinished,
    intervalCount,
    isRestPeriod,
    start,
    pause,
    reset,
    toggle,
    getProgressPercentage,
    formatTime: () => formatTime(totalSeconds),
    getCurrentInterval,
    timerState: {
      minutes,
      seconds,
      isRunning,
      isFinished,
      totalSeconds,
      initialSeconds
    } as TimerState
  };
};