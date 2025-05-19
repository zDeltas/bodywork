import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import Text from '@/app/components/ui/Text';
import { Exercise, Series } from '@/app/types/routine';

type CurrentExerciseProps = {
  exercise: Exercise;
  currentSeries: Series;
  currentSeriesIndex: number;
};

export const CurrentExercise = React.memo(({
  exercise,
  currentSeries,
  currentSeriesIndex
}: CurrentExerciseProps) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles(theme);

  return (
    <View style={styles.exerciseCard}>
      <Text variant="heading" style={styles.exerciseTitle}>
        {exercise.name}
      </Text>
      <View style={styles.seriesInfo}>
        <View style={styles.seriesRow}>
          <Text variant="body" style={styles.seriesLabel}>{t('workout.series' as any)}</Text>
          <Text variant="heading" style={styles.seriesValue}>
            {currentSeriesIndex + 1}/{exercise.series.length}
          </Text>
        </View>
        <View style={styles.seriesRow}>
          <Text variant="body" style={styles.seriesLabel}>{t('workout.weight' as any)}</Text>
          <Text variant="heading" style={styles.seriesValue}>{currentSeries.weight} kg</Text>
        </View>
        <View style={styles.seriesRow}>
          <Text variant="body" style={styles.seriesLabel}>{t('workout.reps' as any)}</Text>
          <Text variant="heading" style={styles.seriesValue}>{currentSeries.reps}</Text>
        </View>
        <View style={styles.seriesRow}>
          <Text variant="body" style={styles.seriesLabel}>{t('workout.rest' as any)}</Text>
          <Text variant="heading" style={styles.seriesValue}>{currentSeries.rest}</Text>
        </View>
      </View>
    </View>
  );
});

const useStyles = (theme: any) => StyleSheet.create({
  exerciseCard: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm
  },
  exerciseTitle: {
    marginBottom: theme.spacing.lg,
    color: theme.colors.text.primary
  },
  seriesInfo: {
    gap: theme.spacing.md
  },
  seriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  seriesLabel: {
    color: theme.colors.text.secondary
  },
  seriesValue: {
    color: theme.colors.text.primary
  }
}); 