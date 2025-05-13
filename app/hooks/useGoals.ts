import { useCallback, useEffect, useState, useMemo } from 'react';
import { Workout } from '@/app/types/common';
import storageService, { StorageKeys } from '../services/storage';

export interface Goal {
  exercise: string;
  current: number;
  target: number;
  progress: number;
}

export function useGoals(workouts: Workout[]) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const getCurrentWeight = useCallback(
    (exerciseName: string): number | null => {
      if (!exerciseName || workouts.length === 0) return null;

      const exerciseWorkouts = workouts.filter((w) => w.exercise === exerciseName);
      if (exerciseWorkouts.length === 0) return null;

      // Trouver le poids le plus lourd parmi tous les entraînements
      let highestWeight = 0;
      exerciseWorkouts.forEach((workout) => {
        workout.series.forEach((series) => {
          if (series.weight > highestWeight) {
            highestWeight = series.weight;
          }
        });
      });

      return highestWeight || null;
    },
    [workouts],
  );

  const suggestTargetWeight = useCallback((currentWeight: number): number | null => {
    if (!currentWeight) return null;

    const improvementFactor = currentWeight < 50 ? 0.05 : 0.025;
    const suggestedImprovement = currentWeight * improvementFactor;
    const roundingFactor = 2.5;
    return Math.ceil((currentWeight + suggestedImprovement) / roundingFactor) * roundingFactor;
  }, []);

  // Charger les goals au montage du composant
  useEffect(() => {
    let mounted = true;
    const loadGoals = async () => {
      setLoading(true);
      try {
        const storedGoals = await storageService.getGoals();
        if (mounted) {
          setGoals(storedGoals || []);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error
              ? err
              : new Error('Une erreur est survenue lors du chargement des goals'),
          );
          setGoals([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadGoals();
    return () => {
      mounted = false;
    };
  }, []);

  // Mettre à jour les goals quand les workouts changent
  useEffect(() => {
    if (workouts.length > 0 && goals.length > 0) {
      const updatedGoals = goals.map((goal) => {
        const currentWeight = getCurrentWeight(goal.exercise);
        if (currentWeight) {
          const progress = Math.min(Math.round((currentWeight / goal.target) * 100), 100);
          return { ...goal, current: currentWeight, progress };
        }
        return goal;
      });

      if (JSON.stringify(updatedGoals) !== JSON.stringify(goals)) {
        setGoals(updatedGoals);
        // Utiliser le service de stockage pour sauvegarder les goals mis à jour
        storageService.setItem(StorageKeys.GOALS, updatedGoals).catch((err) => {
          console.error('Erreur lors de la sauvegarde des goals:', err);
        });
      }
    }
  }, [workouts, goals, getCurrentWeight]);

  const addGoal = useCallback(async (goal: Goal) => {
    setGoals((prev) => {
      const updated = [...prev, goal];
      storageService.saveGoal(goal).then(async () => {
        const stored = await storageService.getGoals();
        setGoals(stored || []);
      });
      return updated;
    });
  }, []);

  const deleteGoal = useCallback(async (exercise: string) => {
    setGoals((prev) => {
      const updated = prev.filter((g) => g.exercise !== exercise);
      storageService.deleteGoal(exercise).then(async () => {
        const stored = await storageService.getGoals();
        setGoals(stored || []);
      });
      return updated;
    });
  }, []);

  const updateGoal = useCallback(async (goal: Goal) => {
    setGoals((prev) => {
      const updated = prev.map((g) => (g.exercise === goal.exercise ? goal : g));
      storageService.saveGoal(goal).then(async () => {
        const stored = await storageService.getGoals();
        setGoals(stored || []);
      });
      return updated;
    });
  }, []);

  const contextValue = useMemo(
    () => ({
      goals,
      loading,
      error,
      addGoal,
      deleteGoal,
      updateGoal,
      setGoals,
      getCurrentWeight,
      suggestTargetWeight,
    }),
    [goals, loading, error, addGoal, deleteGoal, updateGoal],
  );

  return contextValue;
}

export default useGoals;
