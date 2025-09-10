import { useCallback, useEffect, useState } from 'react';
import { router } from 'expo-router';
import useHaptics from '@/app/hooks/useHaptics';
import storageService from '@/app/services/storage';
import { Exercise, Routine, SessionState, Workout } from '@/types/common';
import { INITIAL_SESSION_STATE, SessionContextType } from '../types/session';

const useSession = (routineId: string): SessionContextType => {
  const haptics = useHaptics();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>(INITIAL_SESSION_STATE);

  const convertTimeToSeconds = useCallback((timeStr: string | undefined): number => {
    if (!timeStr) return 1;
    const [minutes, seconds] = timeStr.split(':').map(Number);
    if (isNaN(minutes) || isNaN(seconds)) return 1;
    return (minutes * 60) + seconds;
  }, []);

  const handleCompletedSeries = useCallback(() => {
    if (!routine) return;
    const currentExercise: Exercise = routine.exercises[sessionState.currentExerciseIndex];
    const currentSeries = currentExercise.series[sessionState.currentSeriesIndex];

    if (currentSeries.type === 'workingSet') {
      setSessionState((prev: SessionState) => ({
        ...prev,
        pendingSeries: {
          exerciseIdx: sessionState.currentExerciseIndex,
          seriesIdx: sessionState.currentSeriesIndex
        }
      }));
    } else {
      const rest = convertTimeToSeconds(currentSeries.rest);
      setSessionState((prev: SessionState) => ({
        ...prev,
        restTime: rest,
        isResting: true,
        rpe: '',
        pendingSeries: null
      }));
    }
  }, [routine, sessionState.currentExerciseIndex, sessionState.currentSeriesIndex, convertTimeToSeconds]);

  const handleRpeSave = useCallback(() => {
    if (!routine || !sessionState.pendingSeries) return;
    const { exerciseIdx, seriesIdx } = sessionState.pendingSeries;
    const updatedRoutine = { ...routine };
    updatedRoutine.exercises = [...routine.exercises];
    updatedRoutine.exercises[exerciseIdx] = { ...routine.exercises[exerciseIdx] };
    updatedRoutine.exercises[exerciseIdx].series = [...routine.exercises[exerciseIdx].series];
    updatedRoutine.exercises[exerciseIdx].series[seriesIdx] = {
      ...routine.exercises[exerciseIdx].series[seriesIdx],
      rpe: parseInt(sessionState.rpe) || 7
    };
    setRoutine(updatedRoutine);
    const rest = convertTimeToSeconds(updatedRoutine.exercises[exerciseIdx].series[seriesIdx].rest);
    setSessionState((prev: SessionState) => ({
      ...prev,
      restTime: rest,
      isResting: true,
      rpe: '',
      pendingSeries: null
    }));
  }, [routine, sessionState.pendingSeries, sessionState.rpe, convertTimeToSeconds]);

  const handleRestComplete = useCallback(async () => {
    if (!routine) return;
    const currentExercise: Exercise = routine.exercises[sessionState.currentExerciseIndex];
    const isLastExercise = sessionState.currentExerciseIndex === routine.exercises.length - 1;
    const isLastSeries = sessionState.currentSeriesIndex === currentExercise.series.length - 1;

    setSessionState((prev: SessionState) => ({
      ...prev,
      isResting: false
    }));

    if (!isLastSeries) {
      setSessionState((prev: SessionState) => ({
        ...prev,
        currentSeriesIndex: prev.currentSeriesIndex + 1
      }));
    } else {
      const workout: Workout = {
        id: Date.now().toString(),
        muscleGroup: currentExercise.translationKey.split('_')[0],
        exercise: currentExercise.translationKey,
        name: currentExercise.name,
        series: currentExercise.series,
        date: new Date().toISOString()
      };
      await storageService.saveWorkout(workout);

      if (!isLastExercise) {
        setSessionState((prev: SessionState) => ({
          ...prev,
          currentExerciseIndex: prev.currentExerciseIndex + 1,
          currentSeriesIndex: 0,
          completedExercises: [...prev.completedExercises, workout]
        }));
      } else {
        setSessionState((prev: SessionState) => ({
          ...prev,
          completedExercises: [...prev.completedExercises, workout],
          routineFinished: true
        }));
      }
    }
  }, [routine, sessionState.currentExerciseIndex, sessionState.currentSeriesIndex]);

  const handleCancel = useCallback(() => {
    router.push('/(tabs)');
  }, []);

  const handleFinishWorkout = useCallback(() => {
    haptics.impactLight();
    setSessionState(INITIAL_SESSION_STATE);
    router.replace('/(tabs)');
  }, [haptics]);

  useEffect(() => {
    const loadRoutine = async () => {
      const routines = await storageService.getRoutines();
      const foundRoutine = routines.find(r => r.id === routineId);
      if (foundRoutine) {
        setRoutine(foundRoutine);
      }
    };
    loadRoutine();
  }, [routineId]);

  return {
    routine,
    sessionState,
    setSessionState,
    handleCompletedSeries,
    handleRestComplete,
    handleRpeSave,
    handleCancel,
    handleFinishWorkout
  };
};

export default useSession;
