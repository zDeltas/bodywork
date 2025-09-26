import { useCallback, useEffect, useMemo, useState } from 'react';
import { RoutineSession, Workout } from '@/types/common';
import { storageService } from '@/app/services/storage';

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadWorkouts = useCallback(async () => {
    setLoading(true);
    try {
      const [storedManual, sessions] = await Promise.all([
        storageService.getWorkouts(),
        storageService.getRoutineSessions()
      ]);
      const manual = (storedManual || []).filter(w => !w.routineId);
      const derivedFromSessions: Workout[] = (sessions || []).flatMap((s: RoutineSession) => {
        const date = s.date;
        const routineId = s.routineId;
        const routineTitle = s.routineTitle;
        return (s.exercises || []).map((ex) => ({
          ...ex,
          id: `${s.id}_${ex.exerciseIndex ?? 0}`,
          date,
          routineId,
          routineTitle
        } as Workout));
      });
      setWorkouts([...manual, ...derivedFromSessions]);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Erreur lors du chargement des entraînements')
      );
      setWorkouts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (mounted) {
        await loadWorkouts();
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [loadWorkouts]);

  const saveWorkout = useCallback(async (workout: Workout) => {
    if (workout.routineId) {
      return;
    }
    setWorkouts((prev) => {
      const idx = prev.findIndex((w) => w.id === workout.id);
      let updated;
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = workout;
      } else {
        updated = [...prev, workout];
      }
      storageService.saveWorkout(workout).then(async () => {
        const [storedManual, sessions] = await Promise.all([
          storageService.getWorkouts(),
          storageService.getRoutineSessions()
        ]);
        const manual = (storedManual || []).filter(w => !w.routineId);
        const derivedFromSessions: Workout[] = (sessions || []).flatMap((s: RoutineSession) => {
          const date = s.date;
          const routineId = s.routineId;
          const routineTitle = s.routineTitle;
          return (s.exercises || []).map((ex) => ({
            ...ex,
            id: `${s.id}_${ex.exerciseIndex ?? 0}`,
            date,
            routineId,
            routineTitle
          } as Workout));
        });
        setWorkouts([...manual, ...derivedFromSessions]);
      });
      return updated;
    });
  }, []);

  const deleteWorkout = useCallback(async (id: string) => {
    setWorkouts((prev) => {
      const updated = prev.filter((w) => w.id !== id);
      storageService.deleteWorkout(id).then(async () => {
        const [storedManual, sessions] = await Promise.all([
          storageService.getWorkouts(),
          storageService.getRoutineSessions()
        ]);
        const manual = (storedManual || []).filter(w => !w.routineId);
        const derivedFromSessions: Workout[] = (sessions || []).flatMap((s: RoutineSession) => {
          const date = s.date;
          const routineId = s.routineId;
          const routineTitle = s.routineTitle;
          return (s.exercises || []).map((ex) => ({
            ...ex,
            id: `${s.id}_${ex.exerciseIndex ?? 0}`,
            date,
            routineId,
            routineTitle
          } as Workout));
        });
        setWorkouts([...manual, ...derivedFromSessions]);
      });
      return updated;
    });
  }, []);

  const getWorkoutById = useCallback(
    (id: string) => {
      return workouts.find((workout) => workout.id === id) || null;
    },
    [workouts]
  );

  const getWorkoutsByExercise = useCallback(
    (exercise: string) => {
      return workouts.filter((workout) => workout.exercise === exercise);
    },
    [workouts]
  );

  const getWorkoutsByMuscleGroup = useCallback(
    (muscleGroup: string) => {
      return workouts.filter((workout) => workout.muscleGroup === muscleGroup);
    },
    [workouts]
  );

  const getWorkoutsByDate = useCallback(
    (date: string) => {
      return workouts.filter((workout) => {
        const workoutDate = workout.date.split('T')[0];
        return workoutDate === date;
      });
    },
    [workouts]
  );

  const contextValue = useMemo(
    () => ({
      workouts,
      loading,
      error,
      saveWorkout,
      deleteWorkout,
      getWorkoutById,
      getWorkoutsByExercise,
      getWorkoutsByMuscleGroup,
      getWorkoutsByDate,
      setWorkouts,
      refreshWorkouts: loadWorkouts
    }),
    [
      workouts,
      loading,
      error,
      saveWorkout,
      deleteWorkout,
      getWorkoutById,
      getWorkoutsByExercise,
      getWorkoutsByMuscleGroup,
      getWorkoutsByDate,
      loadWorkouts
    ]
  );

  return contextValue;
}

export default useWorkouts;
