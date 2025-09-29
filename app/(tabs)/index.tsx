import React, { useEffect, useState, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Animated } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import { LineChart, Plus } from 'lucide-react-native';
import Header from '@/app/components/layout/Header';
import { useSettings } from '@/app/hooks/useSettings';
import { Workout, WorkoutDateUtils } from '@/types/workout';
import { RoutineSession } from '@/types/common';
import storageService from '@/app/services/storage';
import { useWorkouts } from '@/app/hooks/useWorkouts';
import FloatButtonAction from '@/app/components/ui/FloatButtonAction';
import WeeklyCalendar from '@/app/components/ui/WeeklyCalendar';
import WorkoutCard from '@/app/components/history/WorkoutCard';
import RoutineSessionCard from '@/app/components/history/RoutineSessionCard';
import EmptyState from '@/app/components/history/EmptyState';

interface MarkedDate {
  marked?: boolean;
  dotColor?: string;
  selected?: boolean;
}

export default function WorkoutScreen() {
  const params = useLocalSearchParams();
  const [selectedDate, setSelectedDate] = useState<string>(
    WorkoutDateUtils.getDatePart(new Date().toISOString())
  );
  const { t, language } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();
  const { workouts, loading, error, refreshWorkouts } = useWorkouts();
  const [routineSessions, setRoutineSessions] = useState<RoutineSession[]>([]);
  const { settings } = useSettings();
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    const reloadSessions = async () => {
      try {
        const sessions = await storageService.getRoutineSessions();
        setRoutineSessions(sessions || []);
      } catch {
      }
    };
    if (params.refresh === 'true') {
      refreshWorkouts();
      reloadSessions();
    }
  }, [params.refresh, refreshWorkouts]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const sessions = await storageService.getRoutineSessions();
        if (!isMounted) return;
        setRoutineSessions(sessions || []);
      } catch (e) {
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const sessions = await storageService.getRoutineSessions();
        setRoutineSessions(sessions || []);
      } catch {
      }
    })();
  }, [selectedDate]);


  const markedDates = useMemo(() => {
    const acc: Record<string, MarkedDate> = {};
    for (const workout of workouts) {
      const date = WorkoutDateUtils.getDatePart(workout.date);
      acc[date] = { marked: true, dotColor: theme.colors.primary };
    }
    for (const s of routineSessions) {
      const date = WorkoutDateUtils.getDatePart(s.date);
      acc[date] = { marked: true, dotColor: theme.colors.primary };
    }
    return acc;
  }, [workouts, routineSessions, theme.colors.primary]);

  const { filteredWorkouts, sessionsForDate, nonRoutineWorkouts, totalWorkouts } = useMemo(() => {
    const filtered = workouts.filter((workout: Workout) => {
      const workoutDate = WorkoutDateUtils.getDatePart(workout.date);
      return workoutDate === selectedDate;
    });

    const sessions = routineSessions.filter(s => {
      const d = WorkoutDateUtils.getDatePart(s.date);
      return d === selectedDate;
    });

    const nonRoutine = filtered.filter(w => !w.routineTitle);
    const total = sessions.length + nonRoutine.length;

    return {
      filteredWorkouts: filtered,
      sessionsForDate: sessions,
      nonRoutineWorkouts: nonRoutine,
      totalWorkouts: total
    };
  }, [workouts, routineSessions, selectedDate]);

  // Animation d'entrée
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  React.useEffect(() => {
    if (!__DEV__) return;
    try {
      console.log('[Index] selectedDate:', selectedDate);
      console.log('[Index] sessionsForDate:', JSON.stringify(sessionsForDate));
      console.log('[Index] nonRoutineWorkouts:', nonRoutineWorkouts.length);
    } catch {
    }
  }, [selectedDate, sessionsForDate.length, nonRoutineWorkouts.length]);

  return (
    <View style={styles.container}>
      <Header
        title={t('common.appTitle')}
        rightComponent={
          <View>
            <TouchableOpacity onPress={() => router.push('/screens/stats')}>
              <LineChart size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
        <WeeklyCalendar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          markedDates={markedDates}
        />


        <Animated.View style={{ opacity: fadeAnim }}>
          {loading ? (
            <EmptyState type="loading" />
          ) : error ? (
            <EmptyState type="error" />
          ) : totalWorkouts > 0 ? (
            <>
              {/* Sessions de routine */}
              {sessionsForDate.map(session => (
                <RoutineSessionCard key={session.id} session={session} />
              ))}

              {/* Entraînements individuels */}
              {nonRoutineWorkouts.map(workout => (
                <WorkoutCard key={workout.id} workout={workout} settings={settings} />
              ))}
            </>
          ) : (
            <EmptyState type="noWorkouts" selectedDate={selectedDate} />
          )}
        </Animated.View>
      </ScrollView>
      <FloatButtonAction
        icon={<Plus size={24} color={theme.colors.background.main} />}
        onPress={() => router.push({ pathname: '/screens/workout/new', params: { selectedDate } })}
      />
    </View>
  );
}

const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.main
    },
    content: {
      flex: 1
    },
  });
};
