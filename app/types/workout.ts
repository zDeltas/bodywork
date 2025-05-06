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

// Create a dummy component as default export to satisfy the route requirements
// This is needed because interfaces are type-only and cannot be used at runtime
const WorkoutTypesComponent = () => null;

export default WorkoutTypesComponent; 