export type Series = {
  weight: number;
  reps: number;
  note: string;
  rest: string;
  type: 'warmUp' | 'workingSet';
  rpe?: number;
};

export type Exercise = {
  name: string;
  key: string;
  series: Series[];
};

export type Routine = {
  id: string;
  title: string;
  description: string;
  exercises: Exercise[];
  createdAt: string;
  lastUsed?: string;
  favorite?: boolean;
  usageCount?: number;
  totalTime?: number;
};

export type RoutineStats = {
  totalExercises: number;
  totalSeries: number;
  estimatedTime: number;
  isRecent: boolean;
};

export type Workout = {
  id: string;
  muscleGroup: string;
  exercise: string;
  name: string;
  series: Series[];
  date: string;
};

export type SessionState = {
  currentExerciseIndex: number;
  currentSeriesIndex: number;
  isResting: boolean;
  restTime: number;
  routineFinished: boolean;
  completedExercises: Workout[];
  pendingSeries: { exerciseIdx: number; seriesIdx: number } | null;
  rpe: string;
}; 