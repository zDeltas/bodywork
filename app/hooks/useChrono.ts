import { useTimer, UseTimerReturn } from '@/app/hooks/useTimer';

export type UseChronoOptions = { autoStart?: boolean; initialTime?: number };

/**
 * useChrono: Chronometer (chrono) that counts up from initialTime (default 0).
 * Thin wrapper around useTimer with countUp=true to separate concerns from countdown timers.
 */
export const useChrono = (options: UseChronoOptions = {}): UseTimerReturn => {
  const { autoStart = false, initialTime = 0 } = options;
  return useTimer({ initialTime, autoStart, countUp: true });
};

export default useChrono;
