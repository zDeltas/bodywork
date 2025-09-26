import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import { Activity, CircleUser, Dumbbell, Layers, LineChart, Plus, Repeat } from 'lucide-react-native';
import Header from '@/app/components/layout/Header';
import { Workout, WorkoutDateUtils } from '@/types/workout';
import { useWorkouts } from '@/app/hooks/useWorkouts';
import FloatButtonAction from '@/app/components/ui/FloatButtonAction';
import WeeklyCalendar from '@/app/components/ui/WeeklyCalendar';
import { TranslationKey } from '@/translations';

/**
 * Interface pour les informations d'une série de travail
 */
interface WorkingSetInfo {
  weight: number;
  reps: number;
  sets: number;
  rpe: number;
}

/**
 * Interface pour les dates marquées dans le calendrier
 */
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

  // Vérifier si un rafraîchissement est demandé via les paramètres de route
  useEffect(() => {
    if (params.refresh === 'true') {
      refreshWorkouts();
    }
  }, [params.refresh, refreshWorkouts]);

  /**
   * Récupère les informations de la série de travail d'un entraînement
   */
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

  /**
   * Prépare les dates marquées pour le calendrier
   */
  const markedDates = workouts.reduce<Record<string, MarkedDate>>((acc, workout) => {
    const date = WorkoutDateUtils.getDatePart(workout.date);
    acc[date] = { marked: true, dotColor: theme.colors.primary };
    return acc;
  }, {});

  /**
   * Filtre les entraînements pour la date sélectionnée
   */
  const filteredWorkouts = workouts.filter((workout) => {
    const workoutDate = WorkoutDateUtils.getDatePart(workout.date);
    return workoutDate === selectedDate;
  });

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
        ) : filteredWorkouts.length > 0 ? (
          filteredWorkouts.map((workout) => (
            <View key={workout.id} style={styles.workoutCard}>
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
                  if (info.rpe >= 8) rpeBg = '#e74c3c';
                  else if (info.rpe >= 5) rpeBg = '#f5c542';
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
                        {info.rpe > 0 && (
                          <View style={[styles.rpeBadge, { backgroundColor: rpeBg }]}>
                            <Activity
                              size={14}
                              color={theme.colors.background.main}
                              style={styles.rpeBadgeIcon}
                            />
                            <Text style={styles.rpeBadgeText}>RPE {info.rpe}</Text>
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
            </View>
          ))
        ) : (
          <View style={styles.noWorkoutContainer}>
            <Text style={styles.noWorkoutText}>{t('common.noWorkoutForDate')}</Text>
          </View>
        )}
      </ScrollView>
      <FloatButtonAction
        icon={<Plus size={24} color={theme.colors.background.main} />}
        onPress={() => router.push('/screens/workout/new')}
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
