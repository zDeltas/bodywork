import { useState, useEffect, useMemo, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useWorkouts } from '@/app/hooks/useWorkouts';
import { useSettings } from '@/app/hooks/useSettings';
import storageService from '@/app/services/storage';
import { RoutineSession } from '@/types/common';
import { Workout, WorkoutDateUtils } from '@/types/workout';
import { UserProfile } from '@/types/onboarding';

interface HomeData {
  userName: string;
  showPhilosophyCard: boolean;
  weekProgress: {
    current: number;
    total: number;
  };
  weeklyStats: {
    totalVolume: number;
    sessionsCompleted: number;
    streak: number;
    progressPercentage: number;
    weeklyDelta?: number;
  };
  lastSession: {
    date: string;
    duration: number;
    muscleGroups: string[];
    totalVolume: number;
  } | null;
  weeklyGoal: {
    currentSessions: number;
    targetSessions: number;
  };
  hasActiveSession: boolean;
}

export const useHomeData = (): { data: HomeData; loading: boolean; error: string | null } => {
  const { workouts, loading: workoutsLoading } = useWorkouts();
  const { settings } = useSettings();
  const [routineSessions, setRoutineSessions] = useState<RoutineSession[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données (initial + à chaque focus de l'écran Home)
  useEffect(() => {
    const loadData = async () => {
      try {
        const [sessions, profile] = await Promise.all([
          storageService.getRoutineSessions(),
          storageService.getOnboardingProfile()
        ]);
        setRoutineSessions(sessions || []);
        setUserProfile(profile);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data');
      }
    };

    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const reload = async () => {
        try {
          const [sessions, profile] = await Promise.all([
            storageService.getRoutineSessions(),
            storageService.getOnboardingProfile()
          ]);
          if (isActive) {
            setRoutineSessions(sessions || []);
            setUserProfile(profile);
          }
        } catch (err) {
          console.error('Error reloading data on focus:', err);
        }
      };
      reload();
      return () => {
        isActive = false;
      };
    }, [])
  );

  // Calculer les données de la semaine en cours
  const weeklyData = useMemo(() => {
    // Vérifier que les données sont disponibles
    if (!workouts || !Array.isArray(workouts)) {
      return {
        totalVolume: 0,
        sessionsCompleted: 0,
        streak: 0,
        progressPercentage: 0,
        currentSessions: 0,
        targetSessions: 4
      };
    }

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Previous week range
    const startOfPrevWeek = new Date(startOfWeek);
    startOfPrevWeek.setDate(startOfWeek.getDate() - 7);
    const endOfPrevWeek = new Date(endOfWeek);
    endOfPrevWeek.setDate(endOfWeek.getDate() - 7);

    // Filtrer les workouts de cette semaine
    const thisWeekWorkouts = workouts.filter((workout: Workout) => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= startOfWeek && workoutDate <= endOfWeek;
    });
    const prevWeekWorkouts = workouts.filter((workout: Workout) => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= startOfPrevWeek && workoutDate <= endOfPrevWeek;
    });

    // Filtrer les sessions de routine de cette semaine
    const thisWeekSessions = (routineSessions || []).filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= startOfWeek && sessionDate <= endOfWeek;
    });
    const prevWeekSessions = (routineSessions || []).filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= startOfPrevWeek && sessionDate <= endOfPrevWeek;
    });

    const totalSessions = thisWeekWorkouts.length + thisWeekSessions.length;
    // Objectif provenant du profil d'onboarding (fallback 4)
    const targetSessionsRaw = userProfile?.weeklyWorkouts ?? 4;
    const targetSessions = Math.min(Math.max(targetSessionsRaw, 1), 14);

    // Calculer le volume total (les éléments `workouts` sont des exercices individuels)
    const calcExerciseVolume = (w: Workout) => {
      const seriesArr = Array.isArray(w.series) ? w.series : [];
      return seriesArr.reduce((acc, s) => acc + (s.weight || 0) * (s.reps || 0), 0);
    };

    const totalVolume = thisWeekWorkouts.reduce((sum, workout) => sum + calcExerciseVolume(workout), 0);
    const prevTotalVolume = prevWeekWorkouts.reduce((sum, workout) => sum + calcExerciseVolume(workout), 0);

    // Calculer le streak (jours consécutifs)
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateString = WorkoutDateUtils.getDatePart(checkDate.toISOString());
      
      const hasWorkout = workouts.some(w => 
        WorkoutDateUtils.getDatePart(w.date) === dateString
      ) || (routineSessions || []).some(s => 
        WorkoutDateUtils.getDatePart(s.date) === dateString
      );
      
      if (hasWorkout) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    // Weekly delta vs last week (volume)
    let weeklyDelta: number | undefined = undefined;
    if (prevTotalVolume > 0) {
      weeklyDelta = ((totalVolume - prevTotalVolume) / prevTotalVolume) * 100;
    } else if (totalVolume > 0) {
      weeklyDelta = 100;
    } else {
      weeklyDelta = 0;
    }

    return {
      totalVolume: Math.round(totalVolume),
      sessionsCompleted: totalSessions,
      streak,
      progressPercentage: Math.min((totalSessions / targetSessions) * 100, 100),
      weeklyDelta,
      currentSessions: totalSessions,
      targetSessions
    };
  }, [workouts, routineSessions, userProfile]);

  // Trouver la dernière session
  const lastSession = useMemo(() => {
    // Vérifier que les données sont disponibles
    if (!workouts || !Array.isArray(workouts)) {
      return null;
    }

    const allSessions = [
      ...workouts.map(w => ({
        date: w.date,
        type: 'workout' as const,
        data: w
      })),
      ...(routineSessions || []).map(s => ({
        date: s.date,
        type: 'routine' as const,
        data: s
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (allSessions.length === 0) return null;

    const latest = allSessions[0];
    
    if (latest.type === 'workout') {
      const workout = latest.data as Workout;
      const muscleGroups = workout.muscleGroup ? [workout.muscleGroup] : [];
      const volume = (Array.isArray(workout.series) ? workout.series : []).reduce(
        (acc, s) => acc + (s.weight || 0) * (s.reps || 0),
        0
      );

      return {
        date: workout.date,
        // Pas de durée au niveau de l'exercice unique: fallback 60min si absent
        duration: 60,
        muscleGroups,
        totalVolume: Math.round(volume)
      };
    } else {
      const session = latest.data as RoutineSession;
      // Déduire durée, muscles et volume à partir des exercices et totaux
      const sessionExercises = Array.isArray(session.exercises) ? session.exercises : [];
      const muscleGroups = [...new Set(sessionExercises.map(e => e.muscleGroup).filter(Boolean))];
      const volume = sessionExercises.reduce((sum, ex) => {
        const seriesArr = Array.isArray(ex.series) ? ex.series : [];
        return sum + seriesArr.reduce((acc, s) => acc + (s.weight || 0) * (s.reps || 0), 0);
      }, 0);
      const durationMinutes = session.totals?.totalSeconds
        ? Math.max(1, Math.round(session.totals.totalSeconds / 60))
        : 60;

      return {
        date: session.date,
        duration: durationMinutes,
        muscleGroups,
        totalVolume: Math.round(volume)
      };
    }
  }, [workouts, routineSessions]);

  // Données finales
  const data: HomeData = {
    userName: userProfile?.name || 'Champion',
    showPhilosophyCard: userProfile?.showPhilosophyCard ?? true,
    weekProgress: {
      current: weeklyData.currentSessions,
      total: weeklyData.targetSessions
    },
    weeklyStats: {
      totalVolume: weeklyData.totalVolume,
      sessionsCompleted: weeklyData.sessionsCompleted,
      streak: weeklyData.streak,
      progressPercentage: weeklyData.progressPercentage,
      weeklyDelta: weeklyData.weeklyDelta
    },
    lastSession,
    weeklyGoal: {
      currentSessions: weeklyData.currentSessions,
      targetSessions: weeklyData.targetSessions
    },
    hasActiveSession: false // TODO: Détecter s'il y a une session active
  };

  useEffect(() => {
    if (!workoutsLoading) {
      setLoading(false);
    }
  }, [workoutsLoading]);

  return { data, loading, error };
};
