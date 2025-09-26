import { useCallback, useEffect, useState } from 'react';
import { WorkoutDateUtils } from '@/types/workout';
import { Period, StatsData, Workout, RoutineSession } from '@/types/common';
import { differenceInDays, subDays, subMonths } from 'date-fns';
import calculations from '@/app/utils/calculations';
import { useTranslation } from '@/app/hooks/useTranslation';
import { TranslationKey } from '@/translations';
import { predefinedExercises, getBaseExerciseKey } from '@/app/components/exercises';
import { storageService } from '@/app/services/storage';

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

  const getStartDateForPeriod = useCallback((period: Period): Date => {
    const now = new Date();
    switch (period) {
      case '7d':
        return subDays(now, 7);
      case '14d':
        return subDays(now, 14);
      case '1m':
        return subMonths(now, 1);
      case '3m':
      default:
        return subMonths(now, 3);
    }
  }, []);

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

  const calculateTrainingFrequency = useCallback((workouts: Workout[]): number => {
    const startDate = getStartDateForPeriod(selectedPeriod);
    const filteredWorkouts = workouts.filter((workout) => new Date(workout.date) >= startDate);

    if (!filteredWorkouts || !Array.isArray(filteredWorkouts)) {
      return 0;
    }

    const uniqueDates = new Set(
      filteredWorkouts.map((w) => WorkoutDateUtils.getDatePart(w.date))
    );
    const daysInPeriod = Math.max(1, differenceInDays(new Date(), startDate));
    return Math.round((uniqueDates.size / daysInPeriod) * 100);
  }, [selectedPeriod, getStartDateForPeriod]);

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

      return {
        progress: bestExercise.progress,
        exercise: t(bestExercise.exercise as TranslationKey)
      };
    },
    [t]
  );

  const getMuscleDistribution = useCallback((workouts: Workout[]): MuscleDistributionData[] => {
    const startDate = getStartDateForPeriod(selectedPeriod);
    const periodWorkouts = workouts.filter((w) => new Date(w.date) >= startDate);
    const PRIMARY_PORTION = 0.7;
    const SECONDARY_PORTION = 0.3;

    const exerciseIndex: Record<string, { primaryMuscle: string; secondaryMuscles: string[] }>
      = predefinedExercises.reduce((acc, ex) => {
        acc[ex.key] = {
          primaryMuscle: ex.primaryMuscle,
          secondaryMuscles: ex.secondaryMuscles ?? []
        };
        return acc;
      }, {} as Record<string, { primaryMuscle: string; secondaryMuscles: string[] }>);

    const muscleGroups: Record<string, number> = {};

    periodWorkouts.forEach((workout) => {
      const volume = workout.series.reduce((total, series) => {
        const unit = series.unitType as any;
        switch (unit) {
          case 'repsAndWeight': {
            const reps = typeof series.reps === 'number' ? series.reps : 0;
            const weight = typeof series.weight === 'number' ? series.weight : 0;
            return total + weight * reps;
          }
          case 'reps': {
            const reps = typeof series.reps === 'number' ? series.reps : 0;
            return total + reps;
          }
          case 'time': {
            const duration = typeof series.duration === 'number' ? series.duration : 0;
            return total + duration;
          }
          case 'distance': {
            const distance = typeof series.distance === 'number' ? series.distance : 0;
            return total + distance;
          }
          default:
            return total;
        }
      }, 0);

      if (volume <= 0) return;

      const baseKey = getBaseExerciseKey(workout.exercise);
      const def = exerciseIndex[baseKey];

      if (def) {
        const primary = def.primaryMuscle;
        muscleGroups[primary] = (muscleGroups[primary] ?? 0) + volume * PRIMARY_PORTION;

        const secs = def.secondaryMuscles;
        if (secs.length > 0) {
          const share = (volume * SECONDARY_PORTION) / secs.length;
          secs.forEach((m) => {
            muscleGroups[m] = (muscleGroups[m] ?? 0) + share;
          });
        }
      } else {
        const fallback = (workout.muscleGroup || 'other').toLowerCase();
        muscleGroups[fallback] = (muscleGroups[fallback] ?? 0) + volume;
      }
    });

    const totalVolume = Object.values(muscleGroups).reduce((sum, v) => sum + v, 0);
    if (totalVolume <= 0) return [];

    return Object.entries(muscleGroups)
      .map(([name, volume]) => ({
        name: t(`muscleGroups.${name.toLowerCase()}` as TranslationKey),
        value: Math.round((volume / totalVolume) * 100),
        color: getMuscleGroupColor(name),
        originalName: name
      }))
      .sort((a, b) => b.value - a.value);
  }, [t, selectedPeriod, getStartDateForPeriod]);

  useEffect(() => {
    const loadUnified = async () => {
      try {
        const [storedManual, sessions] = await Promise.all([
          storageService.getWorkouts(),
          storageService.getRoutineSessions()
        ]);
        const manual = (storedManual || []).filter((w) => !w.routineId).map((workout) => ({
          ...workout,
          series: workout.series.map((series) => ({
            ...series,
            type: series.type || 'workingSet'
          }))
        }));
        const derivedFromSessions: Workout[] = (sessions || []).flatMap((s: RoutineSession) => {
          const date = s.date;
          const routineId = s.routineId;
          const routineTitle = s.routineTitle;
          return (s.exercises || []).map((ex) => ({
            ...ex,
            id: `${s.id}_${ex.exerciseIndex ?? 0}`,
            date,
            routineId,
            routineTitle,
            series: ex.series.map((series) => ({
              ...series,
              type: series.type || 'workingSet'
            }))
          } as Workout));
        });
        const unified = [...manual, ...derivedFromSessions];

        setStatsData({
          workouts: unified,
          monthlyProgress: calculateMonthlyProgress(unified),
          trainingFrequency: calculateTrainingFrequency(unified),
          bestProgressExercise: getBestProgressExercise(unified),
          muscleDistribution: getMuscleDistribution(unified)
        });
      } catch (error) {
        console.error('Error loading unified workouts:', error);
        setStatsData((prev) => ({ ...prev, workouts: [] }));
      }
    };

    loadUnified();
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
