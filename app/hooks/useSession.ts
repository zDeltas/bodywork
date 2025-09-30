import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { router } from 'expo-router';
import useHaptics from '@/app/hooks/useHaptics';
import storageService from '@/app/services/storage';
import { Exercise, Routine, SessionState, Workout } from '@/types/common';
import { INITIAL_SESSION_STATE, SessionContextType } from '../types/session';
import { mapRpeToMet, MET_CONSTANTS, getExerciseMeta } from '@/app/components/exercises';
import { useSettings } from '@/app/hooks/useSettings';
import useMeasurements from '@/app/hooks/useMeasurements';
import useSnackbar from '@/app/hooks/useSnackbar';

const useSession = (routineId: string): SessionContextType => {
  const haptics = useHaptics();
  const { settings } = useSettings();
  const { allMeasurements } = useMeasurements();
  const { showInfo } = useSnackbar();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>(INITIAL_SESSION_STATE);

  const phaseRef = useRef<'prep' | 'rest' | 'work' | 'idle'>('idle');
  const lastTsRef = useRef<number>(Date.now());
  const prepAccRef = useRef<number>(0);
  const restSeriesAccRef = useRef<number>(0);
  const restExerciseAccRef = useRef<number>(0);
  const workAccRef = useRef<number>(0);
  const restTypeRef = useRef<'series' | 'exercise' | undefined>(undefined);
  const sessionExercisesRef = useRef<Workout[]>([]);
  const caloriesAccRef = useRef<number>(0);

  // ---- Calories helpers ----
  const getLatestWeightKg = useCallback((): number | undefined => {
    const latest = (allMeasurements || [])
      .filter(m => typeof m.weight === 'number' && m.weight > 0)
      .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())[0];
    return latest?.weight;
  }, [allMeasurements]);

  const getCaloriesOptions = useCallback(() => {
    // Read optional settings; provide safe defaults
    const includeRest = (settings as any)?.calories?.includeRest ?? true;
    const includePreparation = (settings as any)?.calories?.includePreparation ?? true;
    const epocEnabled = (settings as any)?.calories?.epocEnabled ?? false;
    return { includeRest, includePreparation, epocEnabled } as {
      includeRest: boolean;
      includePreparation: boolean;
      epocEnabled: boolean;
    };
  }, [settings]);

  

  const kcalFromMet = (met: number, weightKg: number | undefined, minutes: number): number => {
    if (!weightKg || minutes <= 0 || met <= 0) return 0;
    return met * 3.5 * weightKg / 200 * minutes;
  };

  const convertTimeToSeconds = useCallback((timeStr: string | undefined): number => {
    if (!timeStr) return 1;
    const [minutes, seconds] = timeStr.split(':').map(Number);
    if (isNaN(minutes) || isNaN(seconds)) return 1;
    return (minutes * 60) + seconds;
  }, []);

  const cardioKcalPerMin = useCallback((mode: 'walk' | 'run' | 'bike' | 'row' | 'elliptical' | 'other' | undefined, series?: any, weightKg?: number): number => {
    // ACSM equations return kcal/min via: kcal/min = VO2(ml/kg/min) * weight(kg) / 200
    const durationSec = series?.duration ? convertTimeToSeconds(series.duration) : undefined;
    const distanceM = typeof series?.distance === 'number' ? series.distance : undefined;
    const v = (durationSec && durationSec > 0 && distanceM && distanceM > 0)
      ? (distanceM / durationSec) * 60 // m/min
      : undefined;
    const grade = typeof series?.grade === 'number' ? series.grade : 0; // decimal, default flat

    let vo2: number | undefined;
    if (mode === 'walk' && v) {
      vo2 = 3.5 + 0.1 * v + 1.8 * v * grade;
    } else if (mode === 'run' && v) {
      vo2 = 3.5 + 0.2 * v + 0.9 * v * grade;
    } else if (mode === 'bike') {
      const powerW = typeof series?.power === 'number' ? series.power : undefined;
      const wkg = (powerW && weightKg && weightKg > 0) ? (powerW / weightKg) : undefined;
      if (wkg != null) {
        vo2 = 7 + 10.8 * wkg;
      }
    }
    if (vo2 != null && weightKg) {
      return (vo2 * weightKg) / 200; // kcal/min
    }
    // Fallback to MET for cardio if inputs insufficient, use mode-specific defaults
    const fallbackMet = (() => {
      switch (mode) {
        case 'walk': return 3.3;
        case 'run': return 9.8;
        case 'bike': return 8.0;
        case 'row': return 8.0;
        case 'elliptical': return 5.0;
        default: return 7.0;
      }
    })();
    return (weightKg ? (fallbackMet * 3.5 * weightKg / 200) : 0);
  }, [convertTimeToSeconds]);

  const getCurrentSeriesRpe = () => {
    try {
      const ex = routine?.exercises?.[sessionState.currentExerciseIndex];
      const se = ex?.series?.[sessionState.currentSeriesIndex];
      const rpe = (se && typeof (se as any).rpe === 'number') ? (se as any).rpe as number : undefined;
      return { ex, se, rpe } as { ex?: Exercise; se?: any; rpe?: number };
    } catch {
      return { ex: undefined, se: undefined, rpe: undefined };
    }
  };

  const getPhaseFromState = useCallback((): 'prep' | 'rest' | 'work' => {
    if (sessionState.isPreparation) return 'prep';
    if (sessionState.isResting) return 'rest';
    return 'work';
  }, [sessionState.isPreparation, sessionState.isResting]);

  const switchPhase = useCallback((newPhase: 'prep' | 'rest' | 'work' | 'idle') => {
    const now = Date.now();
    const delta = Math.max(0, Math.floor((now - lastTsRef.current) / 1000));
    // Compute calories for the elapsed delta in the previous phase
    const weightKg = getLatestWeightKg();
    const prevPhase = phaseRef.current;
    if (weightKg && delta > 0) {
      const minutes = delta / 60;
      const { includeRest, includePreparation } = getCaloriesOptions();
      if (prevPhase === 'work') {
        const { ex, se, rpe } = getCurrentSeriesRpe();
        const meta = getExerciseMeta((ex as any)?.translationKey || ex?.name);
        // Base: MET mapping (uses RPE when provided, else meta.defaultMet/cardioMode fallbacks)
        const met = mapRpeToMet(rpe, meta);
        let kcal = kcalFromMet(met, weightKg, minutes);
        // Cardio override: use ACSM kcal if available
        if (meta?.cardioMode) {
          const acsmPerMin = cardioKcalPerMin(meta.cardioMode, se, weightKg);
          if (acsmPerMin > 0) kcal = acsmPerMin * minutes;
        }
        caloriesAccRef.current += kcal;
      } else if (prevPhase === 'rest' && includeRest) {
        caloriesAccRef.current += kcalFromMet(MET_CONSTANTS.rest, weightKg, minutes);
      } else if (prevPhase === 'prep' && includePreparation) {
        caloriesAccRef.current += kcalFromMet(MET_CONSTANTS.preparation, weightKg, minutes);
      }
    }
    switch (phaseRef.current) {
      case 'prep':
        prepAccRef.current += delta;
        break;
      case 'rest':
        if (restTypeRef.current === 'series') {
          restSeriesAccRef.current += delta;
        } else if (restTypeRef.current === 'exercise') {
          restExerciseAccRef.current += delta;
        } else {
          restSeriesAccRef.current += delta;
        }
        break;
      case 'work':
        workAccRef.current += delta;
        break;
    }
    phaseRef.current = newPhase;
    lastTsRef.current = now;
  }, [getLatestWeightKg, getCaloriesOptions, getCurrentSeriesRpe, cardioKcalPerMin]);

  useEffect(() => {
    const desired = getPhaseFromState();
    if (phaseRef.current !== desired) {
      switchPhase(desired);
    }
  }, [sessionState.isPreparation, sessionState.isResting]);

  useEffect(() => {
    restTypeRef.current = sessionState.restType;
  }, [sessionState.restType]);


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
      switchPhase('idle');
      const totalRest = restSeriesAccRef.current + restExerciseAccRef.current;
      const totalSeconds = prepAccRef.current + totalRest + workAccRef.current;
      const workout: Workout = {
        id: Date.now().toString(),
        muscleGroup: currentExercise.translationKey.split('_')[0],
        exercise: currentExercise.translationKey,
        name: currentExercise.name,
        series: currentExercise.series,
        date: new Date().toISOString(),
        routineId: routine?.id,
        routineTitle: routine?.title,
        exerciseIndex: sessionState.currentExerciseIndex,
        prepSeconds: prepAccRef.current,
        restSeriesSeconds: restSeriesAccRef.current,
        restBetweenExercisesSeconds: restExerciseAccRef.current,
        restSeconds: totalRest,
        workSeconds: workAccRef.current,
        totalSeconds
      };
      sessionExercisesRef.current.push(workout);

      prepAccRef.current = 0;
      restSeriesAccRef.current = 0;
      restExerciseAccRef.current = 0;
      workAccRef.current = 0;
      lastTsRef.current = Date.now();
      phaseRef.current = 'idle';

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
        try {
          const exs = sessionExercisesRef.current;
          const totals = {
            prepSeconds: exs.reduce((s, w) => s + (w.prepSeconds || 0), 0),
            restSeriesSeconds: exs.reduce((s, w) => s + (w.restSeriesSeconds || 0), 0),
            restBetweenExercisesSeconds: exs.reduce((s, w) => s + (w.restBetweenExercisesSeconds || 0), 0),
            workSeconds: exs.reduce((s, w) => s + (w.workSeconds || 0), 0),
            totalSeconds: exs.reduce((s, w) => s + (w.totalSeconds || ((w.prepSeconds||0)+(w.workSeconds||0)+(w.restSeconds||((w.restSeriesSeconds||0)+(w.restBetweenExercisesSeconds||0))))), 0)
          };
          // EPOC bonus (optional)
          const { epocEnabled } = getCaloriesOptions();
          const density = totals.workSeconds / Math.max(1, (totals.workSeconds + totals.restSeriesSeconds + totals.restBetweenExercisesSeconds));
          // Compute avg RPE across working sets if available
          let rpeSum = 0; let rpeCount = 0;
          exs.forEach(w => {
            (w.series || []).forEach((se: any) => {
              if (se?.type === 'workingSet' && typeof se.rpe === 'number') { rpeSum += se.rpe; rpeCount += 1; }
            });
          });
          const avgRpe = rpeCount > 0 ? (rpeSum / rpeCount) : 0;
          if (epocEnabled && avgRpe >= 7 && density >= 0.6) {
            caloriesAccRef.current *= 1.06;
          }
          const notes: string[] = [];
          let seriesCount = 0;
          const musclesSet = new Set<string>();
          exs.forEach(w => {
            seriesCount += (w.series?.length || 0);
            if (w.series && w.series.length > 0 && w.series[0].note) notes.push(w.series[0].note);
            if (w.muscleGroup) musclesSet.add(w.muscleGroup);
          });
          const routineSession = {
            id: `${Date.now()}`,
            routineId: routine?.id || '',
            routineTitle: routine?.title || '',
            date: new Date().toISOString(),
            exercises: exs,
            totals,
            notes,
            muscles: Array.from(musclesSet),
            exerciseCount: exs.length,
            seriesCount,
            caloriesKcal: Math.round(caloriesAccRef.current)
          } as any;
          await storageService.saveRoutineSession(routineSession);
        } catch (e) {
          console.warn('Failed to save RoutineSession', e);
        } finally {
          sessionExercisesRef.current = [];
          caloriesAccRef.current = 0;
        }

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

  const handleFinishWorkout = useCallback(async () => {
    haptics.impactLight();
    try {
      await storageService.incrementFeedbackCompletedAndMaybeSchedulePrompt();
    } catch {}
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

    // If we are currently in preparation, pressing Next should end preparation and start work
    if (sessionState.isPreparation) {
      handlePreparationComplete();
      return;
    }

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
  }, [routine, currentSessionData, haptics, getRestTime, sessionState.isResting, sessionState.isPreparation, handleRestComplete, handlePreparationComplete, settings.rpeMode]);

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
