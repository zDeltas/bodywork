import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutDateUtils } from '@/types/workout';
import { Period, StatsData, Workout } from '@/types/common';
import { differenceInDays, subMonths } from 'date-fns';
import calculations from '@/app/utils/calculations';
import { useTranslation } from '@/app/hooks/useTranslation';
import { TranslationKey } from '@/translations';

interface MuscleDistributionData {
  name: string;
  value: number;
  color: string;
  originalName: string;
}

const getMuscleGroupColor = (muscleGroup: string): string => {
  const colors: Record<string, string> = {
    chest: '#FF6B6B',
    back: '#4ECDC4',
    legs: '#45B7D1',
    shoulders: '#96CEB4',
    arms: '#FFEEAD',
    core: '#D4A5A5',
    other: '#9B9B9B'
  };
  return colors[muscleGroup.toLowerCase()] || colors.other;
};

const useStats = (selectedPeriod: Period) => {
  const { t } = useTranslation();
  const [statsData, setStatsData] = useState<StatsData>({
    workouts: [],
    monthlyProgress: 0,
    trainingFrequency: 0,
    bestProgressExercise: null,
    muscleDistribution: []
  });

  const calculateMonthlyProgress = useCallback((workouts: Workout[]): number => {
    const lastMonthWorkouts = workouts.filter((workout: Workout) => {
      const workoutDate = new Date(workout.date);
      const oneMonthAgo = subMonths(new Date(), 1);
      return workoutDate >= oneMonthAgo;
    });

    if (lastMonthWorkouts.length === 0) return 0;

    const firstWorkout = lastMonthWorkouts.reduce((min: Workout, workout: Workout) =>
      new Date(workout.date) < new Date(min.date) ? workout : min
    );
    const lastWorkout = lastMonthWorkouts.reduce((max: Workout, workout: Workout) =>
      new Date(workout.date) > new Date(max.date) ? workout : max
    );

    const firstWorkingSet =
      firstWorkout.series.find((s) => s.type === 'workingSet') || firstWorkout.series[0];
    const lastWorkingSet =
      lastWorkout.series.find((s) => s.type === 'workingSet') || lastWorkout.series[0];

    const first1RM = calculations.calculateEstimated1RM(
      firstWorkingSet.weight,
      firstWorkingSet.reps
    );
    const last1RM = calculations.calculateEstimated1RM(lastWorkingSet.weight, lastWorkingSet.reps);

    return Math.round(((last1RM - first1RM) / first1RM) * 100);
  }, []);

  const calculateTrainingFrequency = useCallback(
    (workouts: Workout[]): number => {
      const filteredWorkouts = workouts.filter((workout) => {
        const workoutDate = new Date(workout.date);
        const startDate = subMonths(
          new Date(),
          selectedPeriod === '1m' ? 1 : selectedPeriod === '3m' ? 3 : 6
        );
        return workoutDate >= startDate;
      });

      if (!filteredWorkouts || !Array.isArray(filteredWorkouts)) {
        return 0;
      }

      const uniqueDates = new Set(
        filteredWorkouts.map((w) => WorkoutDateUtils.getDatePart(w.date))
      );
      const daysInPeriod = differenceInDays(
        new Date(),
        subMonths(new Date(), selectedPeriod === '1m' ? 1 : selectedPeriod === '3m' ? 3 : 6)
      );
      return Math.round((uniqueDates.size / daysInPeriod) * 100);
    },
    [selectedPeriod]
  );

  const getBestProgressExercise = useCallback(
    (workouts: Workout[]): { progress: number; exercise: string } | null => {
      if (!workouts || workouts.length === 0) return null;

      const exerciseProgress = workouts.reduce(
        (acc: { [key: string]: { first: number; last: number } }, workout) => {
          const workingSet =
            workout.series.find((s) => s.type === 'workingSet') || workout.series[0];
          const estimated1RM = calculations.calculateEstimated1RM(
            workingSet.weight,
            workingSet.reps
          );

          if (!acc[workout.exercise]) {
            acc[workout.exercise] = { first: estimated1RM, last: estimated1RM };
          } else {
            acc[workout.exercise].last = estimated1RM;
          }

          return acc;
        },
        {}
      );

      const progressData = Object.entries(exerciseProgress)
        .map(([exercise, data]) => ({
          progress: Math.round(((data.last - data.first) / data.first) * 100),
          exercise
        }))
        .filter((data) => data.progress > 0);

      if (progressData.length === 0) return null;

      const bestExercise = progressData.reduce((max, current) =>
        current.progress > max.progress ? current : max
      );

      // Translate the exercise name using the key
      return {
        progress: bestExercise.progress,
        exercise: t(bestExercise.exercise as TranslationKey) // Translate the exercise key
      };
    },
    [t]
  );

  const getMuscleDistribution = (workouts: Workout[]): MuscleDistributionData[] => {
    const muscleGroups: Record<string, number> = {};

    workouts.forEach((workout) => {
      const volume = workout.series.reduce((total, series) => {
        return total + series.weight * series.reps;
      }, 0);

      if (!muscleGroups[workout.muscleGroup]) {
        muscleGroups[workout.muscleGroup] = 0;
      }
      muscleGroups[workout.muscleGroup] += volume;
    });

    const totalVolume = Object.values(muscleGroups).reduce((sum, volume) => sum + volume, 0);

    return Object.entries(muscleGroups)
      .map(([name, volume]) => ({
        name: t(`muscleGroups.${name.toLowerCase()}` as TranslationKey),
        value: Math.round((volume / totalVolume) * 100),
        color: getMuscleGroupColor(name),
        originalName: name
      }))
      .sort((a, b) => b.value - a.value);
  };

  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        const storedWorkouts = await AsyncStorage.getItem('workouts');
        if (storedWorkouts) {
          const parsedWorkouts = JSON.parse(storedWorkouts) as Workout[];
          const workouts = parsedWorkouts.map((workout) => ({
            ...workout,
            series: workout.series.map((series) => ({
              ...series,
              type: series.type || 'workingSet'
            }))
          }));

          setStatsData({
            workouts,
            monthlyProgress: calculateMonthlyProgress(workouts),
            trainingFrequency: calculateTrainingFrequency(workouts),
            bestProgressExercise: getBestProgressExercise(workouts),
            muscleDistribution: getMuscleDistribution(workouts)
          });
        }
      } catch (error) {
        console.error('Error loading workouts:', error);
      }
    };

    loadWorkouts();
  }, [
    selectedPeriod,
    calculateMonthlyProgress,
    calculateTrainingFrequency,
    getBestProgressExercise,
    getMuscleDistribution
  ]);

  return statsData;
};

export default useStats;
