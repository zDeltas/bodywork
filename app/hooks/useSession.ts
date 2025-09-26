import { useCallback, useEffect, useState, useMemo } from 'react';
import { router } from 'expo-router';
import useHaptics from '@/app/hooks/useHaptics';
import storageService from '@/app/services/storage';
import { Exercise, Routine, SessionState, Workout } from '@/types/common';
import { INITIAL_SESSION_STATE, SessionContextType } from '../types/session';
import { useSettings } from '@/app/hooks/useSettings';

const useSession = (routineId: string): SessionContextType => {
  const haptics = useHaptics();
  const { settings } = useSettings();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>(INITIAL_SESSION_STATE);

  const convertTimeToSeconds = useCallback((timeStr: string | undefined): number => {
    if (!timeStr) return 1;
    const [minutes, seconds] = timeStr.split(':').map(Number);
    if (isNaN(minutes) || isNaN(seconds)) return 1;
    return (minutes * 60) + seconds;
  }, []);

  const getRestTimeAndType = useCallback((isLastSeries: boolean, currentExercise: Exercise, currentSeries: any): { time: number; type: 'series' | 'exercise' } => {
    if (isLastSeries) {
      return {
        time: currentExercise.restBetweenExercises || 60,
        type: 'exercise'
      };
    } else {
      return {
        time: convertTimeToSeconds(currentSeries.rest),
        type: 'series'
      };
    }
  }, [convertTimeToSeconds]);

  const getRestTime = useCallback((isLastSeries: boolean, currentExercise: Exercise, currentSeries: any): number => {
    return getRestTimeAndType(isLastSeries, currentExercise, currentSeries).time;
  }, [getRestTimeAndType]);

  const currentSessionData = useMemo(() => {
    if (!routine) return null;
    
    const currentExercise = routine.exercises[sessionState.currentExerciseIndex];
    const currentSeries = currentExercise?.series[sessionState.currentSeriesIndex];
    const isLastExercise = sessionState.currentExerciseIndex === routine.exercises.length - 1;
    const isLastSeries = currentSeries && sessionState.currentSeriesIndex === currentExercise.series.length - 1;
    
    return {
      currentExercise,
      currentSeries,
      isLastExercise,
      isLastSeries
    };
  }, [routine, sessionState.currentExerciseIndex, sessionState.currentSeriesIndex]);

  const handleCompletedSeries = useCallback(() => {
    if (!currentSessionData) return;
    const { currentExercise, currentSeries, isLastSeries } = currentSessionData;

    if (currentSeries.type === 'workingSet') {
      if (settings.rpeMode === 'never') {
        if (routine) {
          const updatedRoutine = { ...routine };
          updatedRoutine.exercises = [...routine.exercises];
          const exIdx = sessionState.currentExerciseIndex;
          const seIdx = sessionState.currentSeriesIndex;
          updatedRoutine.exercises[exIdx] = { ...updatedRoutine.exercises[exIdx] } as any;
          updatedRoutine.exercises[exIdx].series = [...updatedRoutine.exercises[exIdx].series];
          updatedRoutine.exercises[exIdx].series[seIdx] = {
            ...updatedRoutine.exercises[exIdx].series[seIdx],
            rpe: 7
          } as any;
          setRoutine(updatedRoutine);
          const { time: rest, type: restType } = getRestTimeAndType(isLastSeries, updatedRoutine.exercises[exIdx], updatedRoutine.exercises[exIdx].series[seIdx]);
          setSessionState((prev: SessionState) => ({
            ...prev,
            restTime: rest,
            restType,
            isResting: true,
            rpe: '',
            pendingSeries: null
          }));
        }
      } else {
        setSessionState((prev: SessionState) => ({
          ...prev,
          pendingSeries: {
            exerciseIdx: sessionState.currentExerciseIndex,
            seriesIdx: sessionState.currentSeriesIndex
          }
        }));
      }
    } else {
      const { time: rest, type: restType } = getRestTimeAndType(isLastSeries, currentExercise, currentSeries);
      setSessionState((prev: SessionState) => ({
        ...prev,
        restTime: rest,
        restType,
        isResting: true,
        rpe: '',
        pendingSeries: null
      }));
    }
  }, [currentSessionData, sessionState.currentExerciseIndex, sessionState.currentSeriesIndex, getRestTimeAndType, settings.rpeMode, routine]);

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

    const currentExercise = updatedRoutine.exercises[exerciseIdx];
    const isLastSeries = seriesIdx === currentExercise.series.length - 1;
    const currentSeries = updatedRoutine.exercises[exerciseIdx].series[seriesIdx];
    
    const { time: rest, type: restType } = getRestTimeAndType(isLastSeries, currentExercise, currentSeries);
    setSessionState((prev: SessionState) => ({
      ...prev,
      restTime: rest,
      restType,
      isResting: true,
      rpe: '',
      pendingSeries: null
    }));
  }, [routine, sessionState.pendingSeries, sessionState.rpe, getRestTimeAndType]);

  const startPreparation = useCallback((preparationTime: number) => {
    setSessionState((prev: SessionState) => ({
      ...prev,
      isPreparation: true,
      preparationTime: preparationTime,
      isResting: false,
      restTime: 0,
      restType: undefined
    }));
  }, []);

  const handlePreparationComplete = useCallback(() => {
    setSessionState((prev: SessionState) => ({
      ...prev,
      isPreparation: false,
      preparationTime: 0
    }));
  }, []);

  const handleRestComplete = useCallback(async () => {
    if (!currentSessionData) return;
    const { currentExercise, isLastExercise, isLastSeries } = currentSessionData;

    setSessionState((prev: SessionState) => ({
      ...prev,
      isResting: false
    }));

    if (!isLastSeries) {
      if (routine?.enablePreparation && routine.preparationTime && routine.preparationTime > 0) {
        setSessionState((prev: SessionState) => ({
          ...prev,
          currentSeriesIndex: prev.currentSeriesIndex + 1,
          isPreparation: true,
          preparationTime: routine.preparationTime!,
          isResting: false,
          restTime: 0,
          restType: undefined
        }));
      } else {
        setSessionState((prev: SessionState) => ({
          ...prev,
          currentSeriesIndex: prev.currentSeriesIndex + 1
        }));
      }
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
        if (routine?.enablePreparation && routine.preparationTime && routine.preparationTime > 0) {
          setSessionState((prev: SessionState) => ({
            ...prev,
            currentExerciseIndex: prev.currentExerciseIndex + 1,
            currentSeriesIndex: 0,
            completedExercises: [...prev.completedExercises, workout],
            isPreparation: true,
            preparationTime: routine.preparationTime!,
            isResting: false,
            restTime: 0,
            restType: undefined
          }));
        } else {
          setSessionState((prev: SessionState) => ({
            ...prev,
            currentExerciseIndex: prev.currentExerciseIndex + 1,
            currentSeriesIndex: 0,
            completedExercises: [...prev.completedExercises, workout]
          }));
        }
      } else {
        setSessionState((prev: SessionState) => ({
          ...prev,
          completedExercises: [...prev.completedExercises, workout],
          routineFinished: true
        }));
      }
    }
  }, [currentSessionData]);

  const handleCancel = useCallback(() => {
    router.push('/(tabs)');
  }, []);

  const handleFinishWorkout = useCallback(() => {
    haptics.impactLight();
    setSessionState(INITIAL_SESSION_STATE);
    router.replace('/(tabs)');
  }, [haptics]);

  const handlePrevious = useCallback(() => {
    if (!routine) return;
    
    haptics.impactLight();
    
    setSessionState((prev: SessionState) => {
      if (prev.isResting) {
        return {
          ...prev,
          isResting: false,
          restTime: 0
        };
      }

      if (prev.currentSeriesIndex > 0) {
        return {
          ...prev,
          currentSeriesIndex: prev.currentSeriesIndex - 1
        };
      } else if (prev.currentExerciseIndex > 0) {
        const prevExercise = routine.exercises[prev.currentExerciseIndex - 1];
        return {
          ...prev,
          currentExerciseIndex: prev.currentExerciseIndex - 1,
          currentSeriesIndex: prevExercise.series.length - 1
        };
      }
      
      return prev;
    });
  }, [routine, haptics]);

  const handleNext = useCallback(() => {
    if (!routine || !currentSessionData) return;
    
    haptics.impactLight();

    if (sessionState.isResting) {
      handleRestComplete();
      return;
    }
    
    setSessionState((prev: SessionState) => {
      const { currentExercise, currentSeries, isLastSeries } = currentSessionData;
      const { time: rest, type: restType } = getRestTimeAndType(isLastSeries, currentExercise, currentSeries);

      if (isLastSeries) {
        if (currentSeries.type === 'workingSet') {
          if (settings.rpeMode === 'never') {
            const updatedRoutine = { ...routine };
            updatedRoutine.exercises = [...routine.exercises];
            const exIdx = prev.currentExerciseIndex;
            const seIdx = prev.currentSeriesIndex;
            updatedRoutine.exercises[exIdx] = { ...updatedRoutine.exercises[exIdx] } as any;
            updatedRoutine.exercises[exIdx].series = [...updatedRoutine.exercises[exIdx].series];
            updatedRoutine.exercises[exIdx].series[seIdx] = {
              ...updatedRoutine.exercises[exIdx].series[seIdx],
              rpe: 7
            } as any;
            setRoutine(updatedRoutine);
            if (rest > 0) {
              return {
                ...prev,
                isResting: true,
                restTime: rest,
                restType
              } as SessionState;
            }
          } else {
            return {
              ...prev,
              pendingSeries: {
                exerciseIdx: prev.currentExerciseIndex,
                seriesIdx: prev.currentSeriesIndex
              }
            } as SessionState;
          }
        }
        if (rest > 0) {
          return {
            ...prev,
            isResting: true,
            restTime: rest,
            restType
          };
        }
        if (prev.currentExerciseIndex < routine.exercises.length - 1) {
          if (routine?.enablePreparation && routine.preparationTime && routine.preparationTime > 0) {
            return {
              ...prev,
              currentExerciseIndex: prev.currentExerciseIndex + 1,
              currentSeriesIndex: 0,
              isPreparation: true,
              preparationTime: routine.preparationTime,
              isResting: false,
              restTime: 0,
              restType: undefined
            };
          } else {
            return {
              ...prev,
              currentExerciseIndex: prev.currentExerciseIndex + 1,
              currentSeriesIndex: 0,
              isResting: false,
              restTime: 0,
              restType: undefined
            };
          }
        }
        return prev;
      }

      if (rest > 0) {
        return {
          ...prev,
          restTime: rest,
          restType,
          isResting: true
        };
      }
      if (routine?.enablePreparation && routine.preparationTime && routine.preparationTime > 0) {
        return {
          ...prev,
          currentSeriesIndex: prev.currentSeriesIndex + 1,
          isPreparation: true,
          preparationTime: routine.preparationTime,
          isResting: false,
          restTime: 0,
          restType: undefined
        };
      } else {
        return {
          ...prev,
          currentSeriesIndex: prev.currentSeriesIndex + 1,
          isResting: false,
          restTime: 0,
          restType: undefined
        };
      }
    });
  }, [routine, currentSessionData, haptics, getRestTime, sessionState.isResting, handleRestComplete, settings.rpeMode]);

  useEffect(() => {
    const loadRoutine = async () => {
      const routines = await storageService.getRoutines();
      const foundRoutine = routines.find(r => r.id === routineId);
      if (foundRoutine) {
        if (settings.rpeMode === 'never') {
          const updated = { ...foundRoutine } as Routine;
          updated.exercises = foundRoutine.exercises.map(ex => ({
            ...ex,
            series: ex.series.map(se => se.type === 'workingSet' && (se as any).rpe == null ? { ...se, rpe: 7 } : se)
          }));
          setRoutine(updated);
        } else {
          setRoutine(foundRoutine);
        }

        if (foundRoutine.enablePreparation && foundRoutine.preparationTime && foundRoutine.preparationTime > 0) {
          setSessionState(prev => ({
            ...prev,
            isPreparation: true,
            preparationTime: foundRoutine.preparationTime!,
            isResting: false,
            restTime: 0,
            restType: undefined
          }));
        }
      }
    };
    loadRoutine();
  }, [routineId, settings.rpeMode]);

  return {
    routine,
    sessionState,
    setSessionState,
    handleCompletedSeries,
    handleRestComplete,
    handleRpeSave,
    handleCancel,
    handleFinishWorkout,
    handlePrevious,
    handleNext,
    startPreparation,
    handlePreparationComplete
  };
};

export default useSession;
