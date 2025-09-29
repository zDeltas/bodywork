import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import { Workout, WorkoutDateUtils } from '@/types/workout';
import { Activity, Dumbbell, Layers, Repeat } from 'lucide-react-native';
import { TranslationKey } from '@/translations';
import Text from '@/app/components/ui/Text';

interface WorkoutCardProps {
  workout: Workout;
  settings: any;
}

interface WorkingSetInfo {
  weight: number;
  reps: number;
  sets: number;
  rpe: number;
}

const WorkoutCard: React.FC<WorkoutCardProps> = React.memo(({ workout, settings }) => {
  const { theme } = useTheme();
  const { t, language } = useTranslation();
  const styles = useStyles();

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

    return { weight: 0, reps: 0, sets: 0, rpe: 0 };
  };

  const getRpeBadgeColor = (rpe: number) => {
    if (rpe >= 8) return '#e74c3c';
    if (rpe >= 6) return '#f39c12';
    if (rpe >= 4) return '#f1c40f';
    return theme.colors.primary;
  };

  const info = getWorkingSetInfo(workout);
  const isWarmUp = workout.series && workout.series.length > 0 && workout.series[0].type === 'warmUp';
  const displayedRpe = info.rpe > 0 ? info.rpe : (settings.rpeMode === 'never' ? 0 : 0);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => router.push({
        pathname: '/screens/ExerciseDetails',
        params: { exercise: workout.exercise }
      })}
    >
      <View style={styles.cardContent}>
        {/* En-tête */}
        <View style={styles.header}>
          <View style={styles.titleInfo}>
            <Text variant="subheading" style={styles.exerciseTitle}>
              {t(workout.exercise as TranslationKey)}
            </Text>
            <Text variant="caption" style={styles.dateText}>
              {WorkoutDateUtils.formatForDisplay(workout.date, language)}
            </Text>
          </View>
          
          {/* Badge type d'entraînement */}
          <View style={[
            styles.typeBadge,
            { backgroundColor: isWarmUp ? theme.colors.text.disabled : theme.colors.primary }
          ]}>
            <Text variant="caption" style={styles.typeBadgeText}>
              {isWarmUp ? t('workout.warmUpSeries') : t('workout.workingSeries')}
            </Text>
          </View>
        </View>

        {/* Statistiques en ligne */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Dumbbell size={16} color={theme.colors.text.secondary} />
            <Text variant="body" style={styles.statText}>{info.weight}kg</Text>
          </View>
          
          <View style={styles.statItem}>
            <Repeat size={16} color={theme.colors.text.secondary} />
            <Text variant="body" style={styles.statText}>{info.reps}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Layers size={16} color={theme.colors.text.secondary} />
            <Text variant="body" style={styles.statText}>{info.sets}</Text>
          </View>

          {settings.rpeMode !== 'never' && displayedRpe > 0 && (
            <View style={styles.statItem}>
              <Activity size={16} color={getRpeBadgeColor(displayedRpe)} />
              <Text variant="body" style={[styles.statText, { color: getRpeBadgeColor(displayedRpe) }]}>
                RPE {displayedRpe}
              </Text>
            </View>
          )}
        </View>

        {/* Note si présente */}
        {workout.series && workout.series.length > 0 && workout.series[0].note && (
          <View style={styles.noteContainer}>
            <Text variant="caption" style={styles.noteText}>
              "{workout.series[0].note}"
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      marginHorizontal: theme.spacing.base,
      marginVertical: theme.spacing.xs,
      ...theme.shadows.sm,
    },
    cardContent: {
      padding: theme.spacing.base,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
    },
    titleInfo: {
      flex: 1,
    },
    exerciseTitle: {
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    dateText: {
      color: theme.colors.text.secondary,
    },
    typeBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.base,
    },
    typeBadgeText: {
      color: theme.colors.background.main,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    statText: {
      color: theme.colors.text.primary,
      marginLeft: theme.spacing.xs,
    },
    noteContainer: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border.light,
      paddingTop: theme.spacing.sm,
    },
    noteText: {
      color: theme.colors.text.secondary,
      fontStyle: 'italic',
    },
  });
};

WorkoutCard.displayName = 'WorkoutCard';

export default WorkoutCard;
