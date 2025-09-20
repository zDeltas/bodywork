import { useCallback, useEffect, useState, useMemo } from 'react';
import { router } from 'expo-router';
import useHaptics from '@/app/hooks/useHaptics';
import storageService from '@/app/services/storage';
import { Exercise, Routine, SessionState, Workout } from '@/types/common';
import { INITIAL_SESSION_STATE, SessionContextType } from '../types/session';

const useSession = (routineId: string): SessionContextType => {
  const haptics = useHaptics();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>(INITIAL_SESSION_STATE);

  // Mémoisation de la conversion de temps
  const convertTimeToSeconds = useCallback((timeStr: string | undefined): number => {
    if (!timeStr) return 1;
    const [minutes, seconds] = timeStr.split(':').map(Number);
    if (isNaN(minutes) || isNaN(seconds)) return 1;
    return (minutes * 60) + seconds;
  }, []);

  // Helper pour déterminer le temps de repos approprié et son type
  const getRestTimeAndType = useCallback((isLastSeries: boolean, currentExercise: Exercise, currentSeries: any): { time: number; type: 'series' | 'exercise' } => {
    if (isLastSeries) {
      // Pour la dernière série, utiliser restBetweenExercises si disponible
      return {
        time: currentExercise.restBetweenExercises || 60, // 60s par défaut
        type: 'exercise'
      };
    } else {
      // Pour les autres séries, utiliser le temps de repos de la série
      return {
        time: convertTimeToSeconds(currentSeries.rest),
        type: 'series'
      };
    }
  }, [convertTimeToSeconds]);

  // Helper pour rétrocompatibilité
  const getRestTime = useCallback((isLastSeries: boolean, currentExercise: Exercise, currentSeries: any): number => {
    return getRestTimeAndType(isLastSeries, currentExercise, currentSeries).time;
  }, [getRestTimeAndType]);

  // Mémoisation des données de session courantes
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
      setSessionState((prev: SessionState) => ({
        ...prev,
        pendingSeries: {
          exerciseIdx: sessionState.currentExerciseIndex,
          seriesIdx: sessionState.currentSeriesIndex
        }
      }));
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
  }, [currentSessionData, sessionState.currentExerciseIndex, sessionState.currentSeriesIndex, getRestTimeAndType]);

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
    
    // Déterminer si c'est la dernière série de l'exercice
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
      // Vérifier si la routine a la préparation activée pour la série suivante
      if (routine?.enablePreparation && routine.preparationTime && routine.preparationTime > 0) {
        // Démarrer la préparation avant la série suivante
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
        // Pas de préparation, passer directement à la série suivante
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
        // Vérifier si la routine a la préparation activée pour la première série du nouvel exercice
        if (routine?.enablePreparation && routine.preparationTime && routine.preparationTime > 0) {
          // Démarrer la préparation avant la première série du nouvel exercice
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
          // Pas de préparation, passer directement au nouvel exercice
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
      // Si on est en repos, on revient à la série actuelle
      if (prev.isResting) {
        return {
          ...prev,
          isResting: false,
          restTime: 0
        };
      }
      
      // Sinon on revient à la série précédente
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

    // Si on est en repos, "passer le repos" doit équivaloir à la fin du repos
    if (sessionState.isResting) {
      handleRestComplete();
      return;
    }
    
    setSessionState((prev: SessionState) => {
      const { currentExercise, currentSeries, isLastSeries } = currentSessionData;
      const { time: rest, type: restType } = getRestTimeAndType(isLastSeries, currentExercise, currentSeries);

      // Si on est sur la dernière série de l'exercice, on demande le RPE si c'est une working set
      if (isLastSeries) {
        if (currentSeries.type === 'workingSet') {
          return {
            ...prev,
            pendingSeries: {
              exerciseIdx: prev.currentExerciseIndex,
              seriesIdx: prev.currentSeriesIndex
            }
          };
        }
        // Sinon (pas une working set), on déclenche d'abord le repos s'il existe
        if (rest > 0) {
          return {
            ...prev,
            isResting: true,
            restTime: rest,
            restType
          };
        }
        // Pas de repos, vérifier si la préparation est activée avant de passer à l'exercice suivant
        if (prev.currentExerciseIndex < routine.exercises.length - 1) {
          if (routine?.enablePreparation && routine.preparationTime && routine.preparationTime > 0) {
            // Démarrer la préparation avant la première série du nouvel exercice
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
            // Pas de préparation, passer directement au nouvel exercice
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

      // Cas général (pas dernière série)
      // Si un temps de repos est défini, on lance le repos sans avancer d'abord,
      // puis handleRestComplete avancera à la série suivante à la fin du repos.
      if (rest > 0) {
        return {
          ...prev,
          restTime: rest,
          restType,
          isResting: true
        };
      }
      // Pas de repos: vérifier si la préparation est activée avant d'avancer à la série suivante
      if (routine?.enablePreparation && routine.preparationTime && routine.preparationTime > 0) {
        // Démarrer la préparation avant la série suivante
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
        // Pas de préparation, avancer directement à la série suivante
        return {
          ...prev,
          currentSeriesIndex: prev.currentSeriesIndex + 1,
          isResting: false,
          restTime: 0,
          restType: undefined
        };
      }
    });
  }, [routine, currentSessionData, haptics, getRestTime, sessionState.isResting, handleRestComplete]);

  useEffect(() => {
    const loadRoutine = async () => {
      const routines = await storageService.getRoutines();
      const foundRoutine = routines.find(r => r.id === routineId);
      if (foundRoutine) {
        setRoutine(foundRoutine);
        
        // Démarrer la préparation au début de la première série si activée
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
  }, [routineId]);

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
