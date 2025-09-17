import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Exercise } from '@/types/common';
import { MuscleGroupKey } from '@/app/components/exercises';

interface ExerciseSelectionState {
  selectedExercise: Exercise | null;
  selectedMuscleGroup: MuscleGroupKey | null;
  searchQuery: string;
}

export function useExerciseSelection() {
  const [state, setState] = useState<ExerciseSelectionState>({
    selectedExercise: null,
    selectedMuscleGroup: null,
    searchQuery: ''
  });
  const router = useRouter();

  const selectExercise = useCallback((exercise: Exercise) => {
    setState(prev => ({
      ...prev,
      selectedExercise: exercise
    }));
  }, []);

  const selectMuscleGroup = useCallback((muscleGroup: MuscleGroupKey) => {
    setState(prev => ({
      ...prev,
      selectedMuscleGroup: muscleGroup
    }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setState(prev => ({
      ...prev,
      searchQuery: query
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setState({
      selectedExercise: null,
      selectedMuscleGroup: null,
      searchQuery: ''
    });
  }, []);

  const navigateToExerciseSelection = useCallback((from?: string) => {
    router.push({
      pathname: '/screens/exercise-selection',
      params: from ? { from } : undefined
    });
  }, [router]);

  const navigateToExerciseList = useCallback((params?: {
    muscleGroup?: MuscleGroupKey;
    search?: string;
  }) => {
    router.push({
      pathname: '/exercise-list',
      params
    });
  }, [router]);

  return {
    ...state,
    selectExercise,
    selectMuscleGroup,
    setSearchQuery,
    clearSelection,
    navigateToExerciseSelection,
    navigateToExerciseList
  };
}

export default useExerciseSelection;




