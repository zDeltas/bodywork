import { useChrono } from '@/app/hooks/useChrono';
import type { UseTimerReturn } from '@/app/hooks/useTimer';

/**
 * useWorkoutTimer: Harmonized workout-level chronometer built on top of useChrono.
 * Returns the standard UseTimerReturn shape (time, isActive, start, pause, reset, adjustTime, toggle, formatTime)
 * to keep APIs consistent across timers in the app.
 */
export type UseWorkoutTimerReturn = UseTimerReturn;

export const useWorkoutTimer = (): UseWorkoutTimerReturn => {
  // Workout chrono should not auto-start by itself; SessionBottomBar controls it.
  const chrono = useChrono({ initialTime: 0, autoStart: false });
  return chrono;
};

export default useWorkoutTimer;
