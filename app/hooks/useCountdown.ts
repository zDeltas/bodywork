import { useTimer, UseTimerOptions, UseTimerReturn } from '@/app/hooks/useTimer';

export type UseCountdownOptions = Pick<UseTimerOptions, 'initialTime' | 'onComplete' | 'autoStart'>;

/**
 * useCountdown: Countdown timer (minuteur) that decrements to 0 and triggers onComplete.
 * Thin wrapper around useTimer with countUp=false to keep responsibilities separated from chrono.
 */
export const useCountdown = (options: UseCountdownOptions = {}): UseTimerReturn => {
  const { initialTime = 0, onComplete, autoStart = false } = options;
  return useTimer({ initialTime, onComplete, autoStart, countUp: false });
};

export default useCountdown;
