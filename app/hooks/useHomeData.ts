import { useState, useEffect, useMemo, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useWorkouts } from '@/app/hooks/useWorkouts';
import { useSettings } from '@/app/hooks/useSettings';
import storageService from '@/app/services/storage';
import routineScheduleService from '@/app/services/routineSchedule';
import { RoutineSession, RoutineSchedule, Routine } from '@/types/common';
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
  // Weekly Discipline = Constance / Adhérence
  weeklyDiscipline: {
    adherenceRate: number; // séances réalisées / séances planifiées
    streakWeeks: number; // semaines consécutives avec adhérence >= target
    onTimePercentage: number; // séances faites le jour prévu
    plannedSessions: number;
    completedSessions: number;
  };
  // Weekly Challenge = Objectif / Défi de la semaine
  weeklyChallenge: {
    type: 'sessions' | 'volume' | 'pr'; // Type de défi
    current: number;
    target: number;
    progress: number; // 0-1
    daysRemaining: number;
    description: string;
  };
  // Nouvelles cartes Gainizi
  planningAdherence: {
    completedSessions: number; // Total sur les dernières semaines
    plannedSessions: number; // Total planifié sur les dernières semaines
    adherenceRate: number; // Moyenne d'adhérence sur les dernières semaines
    streakWeeks: number; // Semaines consécutives au-dessus du seuil
    weeksAnalyzed: number; // Nombre de semaines analysées
    stabilityMessage: string; // Message sur la stabilité de l'assiduité
  };
  weeklyChallenge2: {
    challengeType: 'sessions' | 'volume' | 'muscle_group';
    current: number;
    target: number;
    progress: number; // 0-1
    daysRemaining: number;
    sessionsRemaining?: number;
    challengeDescription: string;
    isCompleted: boolean; // Défi accompli avant fin de semaine
    specialMessage?: string; // Message de félicitations spécial
  };
  // Routines du jour
  dailyRoutine: {
    hasRoutineToday: boolean;
    routines: Array<{
      id: string;
      name: string;
      muscleGroups: string[];
      estimatedDuration?: number; // en minutes
      lastPerformance?: {
        reps: number;
        weight: number;
      };
      isCompleted: boolean;
    }>;
    isCompleted: boolean;
  };
  // Routines planifiées cette semaine
  weeklyRoutines: {
    [key: string]: Array<{
      id: string;
      name: string;
      mainMuscleGroup: string;
      estimatedDuration: number;
      isCompleted: boolean;
      isMissed: boolean;
    }>; // key = YYYY-MM-DD, value = routines for that day
  };
  weeklyTarget: number; // nombre de séances prévues dans la semaine
  completedThisWeek: number;
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
  const [routineSchedules, setRoutineSchedules] = useState<RoutineSchedule[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les données (initial + à chaque focus de l'écran Home)
  useEffect(() => {
    const loadData = async () => {
      try {
        const [sessions, profile, schedules, routinesData] = await Promise.all([
          storageService.getRoutineSessions(),
          storageService.getOnboardingProfile(),
          routineScheduleService.getSchedules(),
          storageService.getRoutines()
        ]);
        setRoutineSessions(sessions || []);
        setUserProfile(profile);
        setRoutineSchedules(schedules || []);
        setRoutines(routinesData || []);
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
          const [sessions, profile, schedules, routinesData] = await Promise.all([
            storageService.getRoutineSessions(),
            storageService.getOnboardingProfile(),
            routineScheduleService.getSchedules(),
            storageService.getRoutines()
          ]);
          if (isActive) {
            setRoutineSessions(sessions || []);
            setUserProfile(profile);
            setRoutineSchedules(schedules || []);
            setRoutines(routinesData || []);
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
        targetSessions: 4,
        // Weekly Discipline defaults
        adherenceRate: 0,
        streakWeeks: 0,
        onTimePercentage: 0,
        plannedSessions: 4,
        completedSessions: 0,
        // Weekly Challenge defaults
        challengeType: 'sessions' as const,
        challengeCurrent: 0,
        challengeTarget: 4,
        challengeProgress: 0,
        challengeDaysRemaining: 7,
        challengeDescription: 'Atteindre mes objectifs fitness'
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

    // Compter les ACTIVITÉS (jours d'entraînement uniques)
    // 1 activité = 1 jour avec au moins une session OU un workout
    const routineSessionDates = thisWeekSessions.map(s => WorkoutDateUtils.getDatePart(s.date));
    const freeWorkoutDates = thisWeekWorkouts.map(w => WorkoutDateUtils.getDatePart(w.date));
    const allActivityDates = [...new Set([...routineSessionDates, ...freeWorkoutDates])];
    const totalActivities = allActivityDates.length;
    // Objectif d'activités provenant du profil d'onboarding (fallback 4)
    const targetActivitiesRaw = userProfile?.weeklyWorkouts ?? 4;
    const targetActivities = Math.min(Math.max(targetActivitiesRaw, 1), 14);


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

    // LONG TERM ADHERENCE CALCULATIONS - Indicateur de constance globale
    const weeksToAnalyze = 4; // Analyser les 4 dernières semaines
    const adherenceThreshold = 70; // Seuil pour streak de régularité
    
    let totalCompletedActivities = 0;
    let totalPlannedActivities = 0;
    let weeklyAdherenceRates = [];
    let streakWeeks = 0;
    
    // Calculer l'adhérence pour chaque semaine des 4 dernières
    for (let weekOffset = 0; weekOffset < weeksToAnalyze; weekOffset++) {
      const weekStart = new Date(startOfWeek);
      weekStart.setDate(startOfWeek.getDate() - (weekOffset * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekWorkouts = workouts.filter((workout: Workout) => {
        const workoutDate = new Date(workout.date);
        return workoutDate >= weekStart && workoutDate <= weekEnd;
      });
      const weekSessions = (routineSessions || []).filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate >= weekStart && sessionDate <= weekEnd;
      });
      
      // Compter les ACTIVITÉS (jours uniques) pour cette semaine
      const weekSessionDates = weekSessions.map(s => WorkoutDateUtils.getDatePart(s.date));
      const weekWorkoutDates = weekWorkouts.map(w => WorkoutDateUtils.getDatePart(w.date));
      const weekActivityDates = [...new Set([...weekSessionDates, ...weekWorkoutDates])];
      const weekTotal = weekActivityDates.length;
      const weekAdherence = targetActivities > 0 ? (weekTotal / targetActivities) * 100 : 0;
      
      totalCompletedActivities += weekTotal;
      totalPlannedActivities += targetActivities;
      weeklyAdherenceRates.push(weekAdherence);
    }
    
    // Adhérence moyenne sur les dernières semaines
    const longTermAdherenceRate = totalPlannedActivities > 0 ? (totalCompletedActivities / totalPlannedActivities) * 100 : 0;
    
    // Calculer le streak de semaines au-dessus du seuil (70%)
    for (let i = 0; i < weeklyAdherenceRates.length; i++) {
      if (weeklyAdherenceRates[i] >= adherenceThreshold) {
        streakWeeks++;
      } else {
        break;
      }
    }
    
    // Déterminer le niveau d'assiduité et générer un message motivant
    const getAssiduiteLevelAndMessage = (adherenceRate: number, streakWeeks: number, weeklyRates: number[]) => {
      // Déterminer le niveau
      let level: 'Faible' | 'Moyenne' | 'Bonne' | 'Excellente';
      if (adherenceRate >= 85) level = 'Excellente';
      else if (adherenceRate >= 70) level = 'Bonne';
      else if (adherenceRate >= 50) level = 'Moyenne';
      else level = 'Faible';
      
      // Calculer la progression par rapport au mois précédent (approximation)
      const recentWeeks = weeklyRates.slice(0, 2); // 2 semaines récentes
      const olderWeeks = weeklyRates.slice(2, 4); // 2 semaines plus anciennes
      const recentAvg = recentWeeks.reduce((sum, rate) => sum + rate, 0) / recentWeeks.length;
      const olderAvg = olderWeeks.reduce((sum, rate) => sum + rate, 0) / olderWeeks.length;
      const progression = recentAvg - olderAvg;
      
      // Messages selon le niveau et la progression
      let message = "";
      
      switch (level) {
        case 'Excellente':
          message = progression > 5 
            ? "Tu es au top de ta forme ! Ta régularité s'améliore encore"
            : "Discipline exemplaire ! Tu maintiens un rythme de champion";
          break;
          
        case 'Bonne':
          message = progression > 10
            ? "Belle progression ! Tu prends de très bonnes habitudes"
            : progression < -10
            ? "Petit ralentissement, mais tu restes sur la bonne voie"
            : "Très bonne régularité ! Tu as trouvé ton rythme";
          break;
          
        case 'Moyenne':
          message = progression > 15
            ? "Ça s'améliore nettement ! Continue sur cette lancée"
            : progression > 5
            ? "Tu progresses bien ! Chaque séance compte"
            : "Tu peux faire mieux ! Accroche-toi, ça va payer";
          break;
          
        case 'Faible':
          message = progression > 10
            ? "Super, tu reprends le rythme ! Continue comme ça"
            : totalCompletedActivities === 0
            ? "C'est le moment de commencer ! Première activité = premier pas"
            : "Allez, on se remet en selle ! Tu en es capable";
          break;
      }
      
      // Ajouter félicitation pour long streak (≥ 4 semaines)
      if (streakWeeks >= 4) {
        message += ` Incroyable streak de ${streakWeeks} semaines !`;
      }
      
      return message;
    };
    
    const motivationalMessage = getAssiduiteLevelAndMessage(longTermAdherenceRate, streakWeeks, weeklyAdherenceRates);
    
    // On-time % = activités faites le jour prévu (simplified: assume all are on-time for now)
    const onTimePercentage = totalActivities > 0 ? 85 : 0; // Placeholder logic

    // WEEKLY CHALLENGE CALCULATIONS - Spécifications exactes
    // Objectif hebdomadaire personnalisé (défaut: activités)
    const challengeType = 'sessions'; // Peut être 'volume' ou 'muscle_group'
    const challengeCurrent = totalActivities;
    const challengeTarget = targetActivities;
    // Progression (%) = (valeur réalisée ÷ objectif fixé) × 100
    const challengeProgress = challengeTarget > 0 ? Math.min(challengeCurrent / challengeTarget, 1) : 0;
    
    // Jours restants = (dimanche - date du jour)
    const nextSunday = new Date(endOfWeek);
    nextSunday.setHours(23, 59, 59, 999);
    const challengeDaysRemaining = Math.max(0, Math.ceil((nextSunday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Description dynamique selon progression
    const challengeIsCompleted = challengeCurrent >= challengeTarget;
    const challengeDescription = challengeIsCompleted
      ? 'Défi réussi ! Excellent travail'
      : challengeTarget - challengeCurrent === 1
      ? 'Plus qu\'une séance !'
      : `${challengeTarget} ${challengeType === 'sessions' ? 'séances' : 'kg'} prévues`;
    
    // Message spécial si défi accompli avant fin de semaine
    const challengeSpecialMessage = challengeIsCompleted && challengeDaysRemaining > 0
      ? `Bravo ! Défi accompli avec ${challengeDaysRemaining} jour${challengeDaysRemaining > 1 ? 's' : ''} d'avance !`
      : undefined;

    // DAILY ROUTINE CALCULATIONS - Routines du jour
    const todayDateString = WorkoutDateUtils.getDatePart(today.toISOString());
    
    // Obtenir le jour de la semaine actuel
    const todayDayOfWeek = routineScheduleService.getDayOfWeekFromDate(today);
    
    // Trouver les routines planifiées pour aujourd'hui
    const todayScheduledRoutines = routineSchedules.filter(schedule => 
      schedule.isActive && schedule.scheduledDays.includes(todayDayOfWeek)
    );
    
    // Vérifier si des séances ont été faites aujourd'hui
    const todayWorkouts = workouts.filter((workout: Workout) => 
      WorkoutDateUtils.getDatePart(workout.date) === todayDateString
    );
    const todaySessions = (routineSessions || []).filter(session => 
      WorkoutDateUtils.getDatePart(session.date) === todayDateString
    );
    const isTodayCompleted = todayWorkouts.length > 0 || todaySessions.length > 0;
    
    // Construire les données des routines du jour
    const todayRoutines = todayScheduledRoutines.map(schedule => {
      const routine = routines.find(r => r.id === schedule.routineId);
      if (!routine) return null;
      
      // Calculer la durée estimée
      const estimatedDuration = routine.totalTime || 
        (routine.exercises.length * 15); // Estimation: 15min par exercice
      
      // Extraire les groupes musculaires
      const muscleGroups = [...new Set(
        routine.exercises.map(ex => ex.name).filter(Boolean)
      )];
      
      // Vérifier si cette routine spécifique a été faite aujourd'hui
      const routineCompleted = todaySessions.some(session => 
        session.routineId === routine.id
      );
      
      return {
        id: routine.id,
        name: routine.title,
        muscleGroups,
        estimatedDuration,
        lastPerformance: undefined, // TODO: Calculer depuis l'historique
        isCompleted: routineCompleted
      };
    }).filter(Boolean);
    
    const dailyRoutineData = {
      hasRoutineToday: todayRoutines.length > 0,
      routines: todayRoutines,
      isCompleted: isTodayCompleted
    };

    // WEEKLY ROUTINES CALCULATIONS - Routines planifiées cette semaine
    const weeklyRoutinesData: { [key: string]: Array<{
      id: string;
      name: string;
      mainMuscleGroup: string;
      estimatedDuration: number;
      isCompleted: boolean;
      isMissed: boolean;
    }> } = {};

    // Calculer les dates de la semaine (lundi à dimanche)
    const startOfWeekDate = new Date(today);
    startOfWeekDate.setDate(today.getDate() - ((today.getDay() + 6) % 7)); // Lundi
    
    let weeklyTargetCount = 0;
    let completedThisWeekCount = 0;

    // Pour chaque jour de la semaine
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeekDate);
      currentDate.setDate(startOfWeekDate.getDate() + i);
      const dateKey = WorkoutDateUtils.getDatePart(currentDate.toISOString());
      const dayOfWeek = routineScheduleService.getDayOfWeekFromDate(currentDate);
      
      // Trouver les routines planifiées pour ce jour
      const dayScheduledRoutines = routineSchedules.filter(schedule => 
        schedule.isActive && schedule.scheduledDays.includes(dayOfWeek)
      );
      
      // Vérifier les séances faites ce jour-là
      const dayWorkouts = workouts.filter((workout: Workout) => 
        WorkoutDateUtils.getDatePart(workout.date) === dateKey
      );
      const daySessions = (routineSessions || []).filter(session => 
        WorkoutDateUtils.getDatePart(session.date) === dateKey
      );
      
      const dayRoutines = dayScheduledRoutines.map(schedule => {
        const routine = routines.find(r => r.id === schedule.routineId);
        if (!routine) return null;
        
        // Vérifier si cette routine spécifique a été faite ce jour
        const routineCompleted = daySessions.some(session => 
          session.routineId === routine.id
        ) || dayWorkouts.length > 0; // Approximation pour les workouts libres
        
        // Déterminer si c'est manqué (passé et non fait)
        const isPast = currentDate < today && !routineCompleted;
        
        // Extraire le groupe musculaire principal
        const mainMuscleGroup = routine.exercises.length > 0 
          ? routine.exercises[0].name || 'Général'
          : 'Général';
        
        if (routineCompleted) {
          completedThisWeekCount++;
        }
        weeklyTargetCount++;
        
        return {
          id: routine.id,
          name: routine.title,
          mainMuscleGroup,
          estimatedDuration: routine.totalTime || (routine.exercises.length * 15),
          isCompleted: routineCompleted,
          isMissed: isPast
        };
      }).filter(Boolean);
      
      if (dayRoutines.length > 0) {
        weeklyRoutinesData[dateKey] = dayRoutines;
      }
    }

    return {
      totalVolume: Math.round(totalVolume),
      sessionsCompleted: totalActivities,
      streak,
      progressPercentage: Math.min((totalActivities / targetActivities) * 100, 100),
      weeklyDelta,
      currentSessions: totalActivities,
      targetSessions: targetActivities,
      // Long Term Adherence - Constance globale
      longTermAdherenceRate: Math.round(longTermAdherenceRate),
      longTermStreakWeeks: streakWeeks,
      longTermCompletedSessions: totalCompletedActivities,
      longTermPlannedSessions: totalPlannedActivities,
      weeksAnalyzed: weeksToAnalyze,
      motivationalMessage,
      // Weekly Challenge
      challengeType,
      challengeCurrent,
      challengeTarget,
      challengeProgress,
      challengeDaysRemaining,
      challengeDescription,
      challengeIsCompleted,
      challengeSpecialMessage,
      // Daily Routine
      dailyRoutineData,
      // Weekly Routines
      weeklyRoutinesData,
      weeklyTargetCount,
      completedThisWeekCount
    };
  }, [workouts, routineSessions, userProfile, routineSchedules, routines]);

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
    // Weekly Discipline = Constance / Adhérence
    weeklyDiscipline: {
      adherenceRate: weeklyData.adherenceRate,
      streakWeeks: weeklyData.streakWeeks,
      onTimePercentage: weeklyData.onTimePercentage,
      plannedSessions: weeklyData.plannedSessions,
      completedSessions: weeklyData.completedSessions
    },
    // Weekly Challenge = Objectif / Défi de la semaine
    weeklyChallenge: {
      type: weeklyData.challengeType,
      current: weeklyData.challengeCurrent,
      target: weeklyData.challengeTarget,
      progress: weeklyData.challengeProgress,
      daysRemaining: weeklyData.challengeDaysRemaining,
      description: weeklyData.challengeDescription
    },
    // Nouvelles cartes Gainizi - Adhérence long terme
    planningAdherence: {
      completedSessions: weeklyData.longTermCompletedSessions,
      plannedSessions: weeklyData.longTermPlannedSessions,
      adherenceRate: weeklyData.longTermAdherenceRate,
      streakWeeks: weeklyData.longTermStreakWeeks,
      weeksAnalyzed: weeklyData.weeksAnalyzed,
      stabilityMessage: weeklyData.motivationalMessage
    },
    weeklyChallenge2: {
      challengeType: weeklyData.challengeType as 'sessions' | 'volume' | 'muscle_group',
      current: weeklyData.challengeCurrent,
      target: weeklyData.challengeTarget,
      progress: weeklyData.challengeProgress,
      daysRemaining: weeklyData.challengeDaysRemaining,
      sessionsRemaining: Math.max(0, weeklyData.challengeTarget - weeklyData.challengeCurrent),
      challengeDescription: weeklyData.challengeDescription,
      isCompleted: weeklyData.challengeIsCompleted,
      specialMessage: weeklyData.challengeSpecialMessage
    },
    // Routines du jour
    dailyRoutine: weeklyData.dailyRoutineData,
    // Routines planifiées cette semaine
    weeklyRoutines: weeklyData.weeklyRoutinesData,
    weeklyTarget: weeklyData.weeklyTargetCount,
    completedThisWeek: weeklyData.completedThisWeekCount,
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

// Default export to satisfy Expo Router
export default function UseHomeDataIndex() {
  // Empty function to satisfy Expo Router requirement
}
