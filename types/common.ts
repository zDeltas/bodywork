export type SeriesType = 'warmUp' | 'workingSet';

export interface Series {
  weight: number;
  reps: number;
  note: string;
  rpe: number;
  type: SeriesType;
}

export interface Workout {
  id: string;
  exercise: string;
  muscleGroup: string;
  series: Series[];
  date: string;
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

export type Period = '1m' | '3m' | '6m';
