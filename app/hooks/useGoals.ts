import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Workout } from '@/types/workout';

interface Goal {
  exercise: string;
  current: number;
  target: number;
  progress: number;
}

const useGoals = (workouts: Workout[]) => {
  const [goals, setGoals] = useState<Goal[]>([]);

  const getCurrentWeight = useCallback((exerciseName: string): number | null => {
    if (!exerciseName || workouts.length === 0) return null;

    const exerciseWorkouts = workouts.filter(w => w.exercise === exerciseName);
    if (exerciseWorkouts.length === 0) return null;

    exerciseWorkouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const mostRecentWorkout = exerciseWorkouts[0];
    const workingSet = mostRecentWorkout.series.find(s => s.type === 'workingSet');
    return workingSet?.weight || null;
  }, [workouts]);

  const suggestTargetWeight = useCallback((currentWeight: number): number | null => {
    if (!currentWeight) return null;

    const improvementFactor = currentWeight < 50 ? 0.05 : 0.025;
    const suggestedImprovement = currentWeight * improvementFactor;
    const roundingFactor = 2.5;
    return Math.ceil((currentWeight + suggestedImprovement) / roundingFactor) * roundingFactor;
  }, []);

  useEffect(() => {
    const loadGoals = async () => {
      try {
        const storedGoals = await AsyncStorage.getItem('goals');
        if (storedGoals) {
          const parsedGoals = JSON.parse(storedGoals) as Goal[];
          if (Array.isArray(parsedGoals)) {
            setGoals(parsedGoals);
          }
        }
      } catch (error) {
        console.error('Error loading goals:', error);
      }
    };

    loadGoals();
  }, []);

  useEffect(() => {
    if (workouts.length > 0 && goals.length > 0) {
      const updatedGoals = goals.map(goal => {
        const currentWeight = getCurrentWeight(goal.exercise);
        if (currentWeight) {
          const progress = Math.min(Math.round((currentWeight / goal.target) * 100), 100);
          return { ...goal, current: currentWeight, progress };
        }
        return goal;
      });

      if (JSON.stringify(updatedGoals) !== JSON.stringify(goals)) {
        setGoals(updatedGoals);
        try {
          AsyncStorage.setItem('goals', JSON.stringify(updatedGoals));
        } catch (error) {
          console.error('Error saving goals:', error);
        }
      }
    }
  }, [workouts, goals, getCurrentWeight]);

  const addGoal = useCallback(async (exercise: string, target: number) => {
    const currentWeight = getCurrentWeight(exercise) || 0;
    const newGoal: Goal = {
      exercise,
      current: currentWeight,
      target,
      progress: Math.min(Math.round((currentWeight / target) * 100), 100)
    };

    setGoals(prev => {
      const updatedGoals = [...prev, newGoal];
      try {
        AsyncStorage.setItem('goals', JSON.stringify(updatedGoals));
      } catch (error) {
        console.error('Error saving goals:', error);
      }
      return updatedGoals;
    });
  }, [getCurrentWeight]);

  const removeGoal = useCallback(async (exercise: string) => {
    setGoals(prev => {
      const updatedGoals = prev.filter(goal => goal.exercise !== exercise);
      try {
        AsyncStorage.setItem('goals', JSON.stringify(updatedGoals));
      } catch (error) {
        console.error('Error saving goals:', error);
      }
      return updatedGoals;
    });
  }, []);

  return {
    goals,
    setGoals,
    addGoal,
    removeGoal,
    getCurrentWeight,
    suggestTargetWeight
  };
};

export default useGoals; 
