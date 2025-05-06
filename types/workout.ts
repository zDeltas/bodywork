export interface Series {
  weight: number;
  reps: number;
  note: string;
  rpe: number;
  type: 'warmUp' | 'workingSet';
}

export interface Workout {
  id: string;
  exercise: string;
  muscleGroup: string;
  series: Series[];
  date: string;
} 