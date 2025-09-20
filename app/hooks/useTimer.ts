import { useEffect, useState, useCallback } from 'react';

export interface UseTimerOptions {
  initialTime?: number;
  onComplete?: () => void;
  autoStart?: boolean;
  countUp?: boolean; // when true, timer increments instead of decrements
}

export interface UseTimerReturn {
  time: number;
  isActive: boolean;
  start: () => void;
  pause: () => void;
  reset: (newTime?: number) => void;
  adjustTime: (delta: number) => void;
  toggle: () => void;
  formatTime: (seconds: number) => string;
}

export const useTimer = ({
  initialTime = 0,
  onComplete,
  autoStart = false,
  countUp = false
}: UseTimerOptions = {}): UseTimerReturn => {
  const [time, setTime] = useState(initialTime);
  const [isActive, setIsActive] = useState(autoStart);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        setTime(prev => {
          if (countUp) {
            // Count up mode: simply increment time
            return prev + 1;
          } else {
            // Count down mode: stop at 0 and trigger onComplete
            if (prev <= 1) {
              setIsActive(false);
              onComplete?.();
              return 0;
            }
            return prev - 1;
          }
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, onComplete, countUp]);

  const start = useCallback(() => {
    setIsActive(true);
  }, []);

  const pause = useCallback(() => {
    setIsActive(false);
  }, []);

  const reset = useCallback((newTime?: number) => {
    setTime(newTime ?? initialTime);
    setIsActive(false);
  }, [initialTime]);

  const adjustTime = useCallback((delta: number) => {
    setTime(prev => {
      const next = Math.max(0, prev + delta);
      if (!countUp && next === 0) {
        setIsActive(false);
        onComplete?.();
      }
      return next;
    });
  }, [onComplete, countUp]);

  const toggle = useCallback(() => {
    setIsActive(prev => !prev);
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    time,
    isActive,
    start,
    pause,
    reset,
    adjustTime,
    toggle,
    formatTime
  };
};

export default useTimer;
