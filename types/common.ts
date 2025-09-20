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

export type Period = '1m' | '3m' | '6m';
