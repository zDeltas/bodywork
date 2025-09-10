import { Routine, SessionState } from '@/types/common';

export const INITIAL_SESSION_STATE: SessionState = {
  currentExerciseIndex: 0,
  currentSeriesIndex: 0,
  isResting: false,
  restTime: 0,
  routineFinished: false,
  completedExercises: [],
  pendingSeries: null,
  rpe: ''
};

export default interface SessionContextType {
  routine: Routine | null;
  sessionState: SessionState;
  setSessionState: (state: SessionState | ((prev: SessionState) => SessionState)) => void;
  handleCompletedSeries: () => void;
  handleRestComplete: () => Promise<void>;
  handleRpeSave: () => void;
  handleCancel: () => void;
  handleFinishWorkout: () => void;
} 
