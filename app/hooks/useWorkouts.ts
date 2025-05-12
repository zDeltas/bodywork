import { useState, useEffect, useCallback, useMemo } from 'react';
import { Workout } from '../types/common';
import storageService, { StorageKeys } from '../services/storage';

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fonction pour charger les workouts
  const loadWorkouts = useCallback(async () => {
    setLoading(true);
    try {
      const stored = await storageService.getWorkouts();
      setWorkouts(stored || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors du chargement des entraînements'));
      setWorkouts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les workouts au montage
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (mounted) {
        await loadWorkouts();
      }
    };
    load();
    return () => { mounted = false; };
  }, [loadWorkouts]);

  // Ajouter ou mettre à jour un workout
  const saveWorkout = useCallback(async (workout: Workout) => {
    setWorkouts(prev => {
      const idx = prev.findIndex(w => w.id === workout.id);
      let updated;
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = workout;
      } else {
        updated = [...prev, workout];
      }
      storageService.saveWorkout(workout).then(async () => {
        const stored = await storageService.getWorkouts();
        setWorkouts(stored || []);
      });
      return updated;
    });
  }, []);

  // Supprimer un workout
  const deleteWorkout = useCallback(async (id: string) => {
    setWorkouts(prev => {
      const updated = prev.filter(w => w.id !== id);
      storageService.deleteWorkout(id).then(async () => {
        const stored = await storageService.getWorkouts();
        setWorkouts(stored || []);
      });
      return updated;
    });
  }, []);

  // Fonction pour récupérer un workout par son ID
  const getWorkoutById = useCallback((id: string) => {
    return workouts.find(workout => workout.id === id) || null;
  }, [workouts]);

  // Fonction pour filtrer les workouts par exercice
  const getWorkoutsByExercise = useCallback((exercise: string) => {
    return workouts.filter(workout => workout.exercise === exercise);
  }, [workouts]);

  // Fonction pour filtrer les workouts par groupe musculaire
  const getWorkoutsByMuscleGroup = useCallback((muscleGroup: string) => {
    return workouts.filter(workout => workout.muscleGroup === muscleGroup);
  }, [workouts]);

  // Fonction pour filtrer les workouts par date
  const getWorkoutsByDate = useCallback((date: string) => {
    return workouts.filter(workout => {
      const workoutDate = workout.date.split('T')[0];
      return workoutDate === date;
    });
  }, [workouts]);

  const contextValue = useMemo(() => ({
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
  }), [workouts, loading, error, saveWorkout, deleteWorkout, getWorkoutById, getWorkoutsByExercise, getWorkoutsByMuscleGroup, getWorkoutsByDate, loadWorkouts]);

  return contextValue;
}

export default useWorkouts; 