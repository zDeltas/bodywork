export type SeriesType = 'warmUp' | 'workingSet';
export type ExerciseUnit = 'repsAndWeight' | 'reps' | 'time' | 'distance';

export interface Series {
  unitType: ExerciseUnit;
  weight: number;
  reps?: number;
  duration?: number; // in seconds
  distance?: number; // in meters
  note: string;
  rpe: number;
  type: SeriesType;
  rest?: string;
}

export interface EditableSeries {
  unitType?: ExerciseUnit;
  weight: string;
  reps?: string;
  duration?: string; // in seconds
  distance?: string; // in meters
  note: string;
  rest?: string;
  rpe?: string; // string in forms; converted to number when saving
  showRpeDropdown?: boolean;
  type: SeriesType;
}

export const defaultSeries: Partial<Series> = {
  unitType: 'repsAndWeight',
  weight: 0,
  reps: 0,
  duration: 0,
  distance: 0
};

export interface Exercise {
  name: string;
  key: string;
  translationKey: string;
  series: Series[];
  note?: string;
  restBetweenExercises?: number;
}

export interface Routine {
  id: string;
  title: string;
  description: string;
  exercises: Exercise[];
  createdAt: string;
  lastUsed?: string;
  favorite?: boolean;
  usageCount?: number;
  totalTime?: number;
  exerciseRestMode?: 'beginner' | 'advanced';
  enablePreparation?: boolean;
  preparationTime?: number; // en secondes
  // Planification
  scheduledDays?: DayOfWeek[];
  isScheduled?: boolean;
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface RoutineSchedule {
  routineId: string;
  routineTitle: string;
  scheduledDays: DayOfWeek[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface RoutineStats {
  totalExercises: number;
  totalSeries: number;
  estimatedTime: number;
}

export interface Workout {
  id: string;
  exercise: string;
  muscleGroup: string;
  series: Series[];
  date: string;
  name?: string;
  routineId?: string;
  routineTitle?: string;
  // Index of this exercise within the routine execution (0-based)
  exerciseIndex?: number;
  // Actual durations recorded during session (in seconds)
  prepSeconds?: number;
  // Split rest into per-series rest vs between-exercises rest for better analytics
  restSeriesSeconds?: number;
  restBetweenExercisesSeconds?: number;
  // Backward-compat total rest (may be derived = restSeriesSeconds + restBetweenExercisesSeconds)
  restSeconds?: number;
  workSeconds?: number;
  // Optional total time for this exercise (prep + rest + work)
  totalSeconds?: number;
}

export interface RoutineSessionTotals {
  prepSeconds: number;
  restSeriesSeconds: number;
  restBetweenExercisesSeconds: number;
  workSeconds: number;
  totalSeconds: number;
}

export interface RoutineSession {
  id: string;
  routineId: string;
  routineTitle: string;
  date: string; // ISO date for the session
  exercises: Workout[]; // ordered by exerciseIndex
  totals: RoutineSessionTotals;
  // Aggregates/metadata
  notes?: string[]; // collected notes (e.g., first series notes per exercise)
  muscles?: string[]; // translated or raw keys, depending on usage
  exerciseCount: number;
  seriesCount: number;
  // Optional total calories computed live during the session
  caloriesKcal?: number;
}

export interface Goal {
  exercise: string;
  current: number;
  target: number;
  progress: number;
}

export interface StatsData {
  workouts: Workout[];
  monthlyProgress: number;
  trainingFrequency: number;
  bestProgressExercise: { progress: number; exercise: string } | null;
  muscleDistribution: {
    name: string;
    value: number;
    color: string;
    originalName: string;
  }[];
}

export interface SessionState {
  currentExerciseIndex: number;
  currentSeriesIndex: number;
  isResting: boolean;
  restTime: number;
  restType?: 'series' | 'exercise'; // Type de repos en cours
  isPreparation: boolean; // État de préparation avant exercice
  preparationTime: number; // Temps de préparation restant
  routineFinished: boolean;
  completedExercises: Workout[];
  pendingSeries: { exerciseIdx: number; seriesIdx: number } | null;
  rpe: string;
}

export type Period = '7d' | '14d' | '1m' | '3m';
