import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import { Activity, Dumbbell, Layers, LineChart, Plus, Repeat } from 'lucide-react-native';
import Header from '@/app/components/layout/Header';
import { useSettings } from '@/app/hooks/useSettings';
import { Workout, WorkoutDateUtils } from '@/types/workout';
import { RoutineSession } from '@/types/common';
import storageService from '@/app/services/storage';
import { useWorkouts } from '@/app/hooks/useWorkouts';
import FloatButtonAction from '@/app/components/ui/FloatButtonAction';
import WeeklyCalendar from '@/app/components/ui/WeeklyCalendar';
import { TranslationKey } from '@/translations';

interface WorkingSetInfo {
  weight: number;
  reps: number;
  sets: number;
  rpe: number;
}

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

  const getWorkingSetInfo = (workout: Workout): WorkingSetInfo => {
    if (workout.series && workout.series.length > 0) {
      const workingSet = workout.series.find((s) => s.type === 'workingSet') || workout.series[0];
      const workingSetsCount = workout.series.filter((s) => s.type === 'workingSet').length;

      return {
        weight: workingSet.weight || 0,
        reps: workingSet.reps || 0,
        sets: workingSetsCount || 0,
        rpe: workingSet.rpe || 0
      };
    }

    return {
      weight: 0,
      reps: 0,
      sets: 0,
      rpe: 0
    };
  };

  const markedDates = (() => {
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
  })();

  const filteredWorkouts = workouts.filter((workout: Workout) => {
    const workoutDate = WorkoutDateUtils.getDatePart(workout.date);
    return workoutDate === selectedDate;
  });

  const sessionsForDate = routineSessions.filter(s => {
    const d = WorkoutDateUtils.getDatePart(s.date);
    return d === selectedDate;
  });

  const nonRoutineWorkouts = filteredWorkouts.filter(w => !w.routineTitle);

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

        {loading ? (
          <View style={styles.noWorkoutContainer}>
            <Text style={styles.noWorkoutText}>{t('common.loading')}</Text>
          </View>
        ) : error ? (
          <View style={styles.noWorkoutContainer}>
            <Text style={styles.noWorkoutText}>{t('common.errorLoadingWorkouts')}</Text>
          </View>
        ) : (sessionsForDate.length + nonRoutineWorkouts.length) > 0 ? (
          <>
            {sessionsForDate.map(s => (
              <View key={s.id} style={styles.workoutCard}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => router.push({
                    pathname: '/screens/routines/history',
                    params: { routineId: s.routineId, title: s.routineTitle }
                  })}
                >
                  <View style={styles.workoutDetailsCard}>
                    <Text style={styles.workoutTitle}>{s.routineTitle}</Text>
                    <Text style={styles.workoutDate}>
                      {language === 'fr' ? `${s.exerciseCount} exercices` : `${s.exerciseCount} exercises`}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))}

            {nonRoutineWorkouts.map((workout) => (
              <View key={workout.id} style={styles.workoutCard}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => router.push({
                    pathname: '/screens/ExerciseDetails',
                    params: { exercise: workout.exercise }
                  })}
                >
                  <View style={styles.workoutDetailsCard}>
                    <Text style={styles.workoutTitle}>{t(workout.exercise as TranslationKey)}</Text>
                    <Text style={styles.workoutDate}>
                      {WorkoutDateUtils.formatForDisplay(workout.date, language)}
                    </Text>
                    {(() => {
                      const info = getWorkingSetInfo(workout);
                      const isWarmUp =
                        workout.series &&
                        workout.series.length > 0 &&
                        workout.series[0].type === 'warmUp';
                      let rpeBg = theme.colors.primary;
                      const displayedRpe = info.rpe > 0 ? info.rpe : (settings.rpeMode === 'never' ? 7 : 0);
                      if (displayedRpe >= 8) rpeBg = '#e74c3c';
                      else if (displayedRpe >= 5) rpeBg = '#f5c542';
                      return (
                        <>
                          <View style={styles.workoutTypeBadgeContainer}>
                            <Text
                              style={[
                                styles.workoutTypeBadge,
                                {
                                  backgroundColor: isWarmUp
                                    ? theme.colors.text.disabled
                                    : theme.colors.primary,
                                  color: theme.colors.background.main
                                }
                              ]}
                            >
                              {isWarmUp ? t('workout.warmUpSeries') : t('workout.workingSeries')}
                            </Text>
                          </View>
                          <View style={styles.workoutInfoRow}>
                            <View style={styles.workoutInfoItem}>
                              <Dumbbell
                                size={18}
                                color={theme.colors.primary}
                                style={styles.workoutInfoIcon}
                              />
                              <Text style={styles.workoutInfoValue}>{info.weight}kg</Text>
                            </View>
                            <View style={styles.workoutInfoItem}>
                              <Repeat
                                size={18}
                                color={theme.colors.primary}
                                style={styles.workoutInfoIcon}
                              />
                              <Text style={styles.workoutInfoValue}>{info.reps}</Text>
                            </View>
                            <View style={styles.workoutInfoItem}>
                              <Layers
                                size={18}
                                color={theme.colors.primary}
                                style={styles.workoutInfoIcon}
                              />
                              <Text style={styles.workoutInfoValue}>{info.sets}</Text>
                            </View>
                            {settings.rpeMode !== 'never' && displayedRpe > 0 && (
                              <View style={[styles.rpeBadge, { backgroundColor: rpeBg }]}>
                                <Activity
                                  size={14}
                                  color={theme.colors.background.main}
                                  style={styles.rpeBadgeIcon}
                                />
                                <Text style={styles.rpeBadgeText}>RPE {displayedRpe}</Text>
                              </View>
                            )}
                          </View>
                          {workout.series && workout.series.length > 0 && workout.series[0].note && (
                            <View style={styles.workoutNoteBox}>
                              <Text style={styles.workoutNoteText}>{workout.series[0].note}</Text>
                            </View>
                          )}
                        </>
                      );
                    })()}
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.noWorkoutContainer}>
            <Text style={styles.noWorkoutText}>{t('common.noWorkoutForDate')}</Text>
          </View>
        )}
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
    workoutCard: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.default
    },
    workoutDetailsCard: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.base,
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
      flexDirection: 'column',
      alignItems: 'flex-start',
      ...theme.shadows.sm
    },
    routineBadge: {
      alignSelf: 'flex-start',
      backgroundColor: theme.colors.background.button,
      borderRadius: 12,
      paddingVertical: 4,
      paddingHorizontal: 10,
      marginBottom: theme.spacing.xs
    },
    routineBadgeText: {
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary
    },
    workoutInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: theme.spacing.sm
    },
    workoutInfoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: theme.spacing.lg
    },
    workoutInfoIcon: {
      marginRight: theme.spacing.xs
    },
    workoutInfoValue: {
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.primary
    },
    rpeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 16,
      paddingVertical: 2,
      paddingHorizontal: 10,
      marginLeft: theme.spacing.sm
    },
    rpeBadgeText: {
      color: theme.colors.background.main,
      fontFamily: theme.typography.fontFamily.bold,
      fontSize: theme.typography.fontSize.sm,
      marginLeft: 4
    },
    rpeBadgeIcon: {
      marginRight: 2
    },
    workoutTypeBadgeContainer: {
      marginBottom: theme.spacing.xs
    },
    workoutTypeBadge: {
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.sm,
      paddingVertical: 2,
      paddingHorizontal: 10,
      borderRadius: 12,
      overflow: 'hidden',
      alignSelf: 'flex-start'
    },
    workoutNoteBox: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.base,
      padding: theme.spacing.sm,
      marginTop: theme.spacing.xs,
      alignSelf: 'stretch'
    },
    workoutNoteText: {
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text.secondary,
      fontSize: theme.typography.fontSize.sm,
      fontStyle: 'italic'
    },
    workoutTitle: {
      fontFamily: theme.typography.fontFamily.bold,
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs
    },
    workoutDate: {
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.sm
    },
    noWorkoutContainer: {
      padding: theme.spacing.base,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.lg
    },
    noWorkoutText: {
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.secondary,
      textAlign: 'center'
    }
  });
};
