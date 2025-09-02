import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import Text from '@/app/components/ui/Text';
import { Exercise, Series } from '@/types/common';
import { Clock, Dumbbell, Repeat, StickyNote, Ruler } from 'lucide-react-native';

type CurrentExerciseProps = {
  exercise: Exercise;
  currentSeries: Series;
  currentSeriesIndex: number;
};

const CurrentExercise = React.memo(({
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
        <View style={styles.mainInfoContainer}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Repeat size={20} color={theme.colors.primary} style={styles.icon} />
              <View>
                <Text variant="body" style={styles.infoLabel}>{t('workout.series')}</Text>
                <Text variant="heading" style={styles.infoValue}>
                  {currentSeriesIndex + 1}/{exercise.series.length}
                </Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Dumbbell size={20} color={theme.colors.primary} style={styles.icon} />
              <View>
                <Text variant="body" style={styles.infoLabel}>{t('workout.weight')}</Text>
                <Text variant="heading" style={styles.infoValue}>{currentSeries.weight} kg</Text>
              </View>
            </View>
          </View>
          <View style={styles.infoRow}>
            {/* Conditional rendering based on unitType */}
            {currentSeries.unitType === 'reps' ? (
              <View style={styles.infoItem}>
                <Repeat size={20} color={theme.colors.primary} style={styles.icon} />
                <View>
                  <Text variant="body" style={styles.infoLabel}>{t('workout.reps')}</Text>
                  <Text variant="heading" style={styles.infoValue}>{currentSeries.reps}</Text>
                </View>
              </View>
            ) : currentSeries.unitType === 'time' ? (
              <View style={styles.infoItem}>
                <Clock size={20} color={theme.colors.primary} style={styles.icon} />
                <View>
                  <Text variant="body" style={styles.infoLabel}>{t('workout.duration')}</Text>
                  <Text variant="heading" style={styles.infoValue}>
                    {Math.floor((currentSeries.duration || 0) / 60)}:{((currentSeries.duration || 0) % 60).toString().padStart(2, '0')}
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.infoItem}>
                <Ruler size={20} color={theme.colors.primary} style={styles.icon} />
                <View>
                  <Text variant="body" style={styles.infoLabel}>{t('workout.distance')}</Text>
                  <Text variant="heading" style={styles.infoValue}>{currentSeries.distance} m</Text>
                </View>
              </View>
            )}
            <View style={styles.infoItem}>
              <Clock size={20} color={theme.colors.primary} style={styles.icon} />
              <View>
                <Text variant="body" style={styles.infoLabel}>{t('timer.restTime')}</Text>
                <Text variant="heading" style={styles.infoValue}>{currentSeries.rest}</Text>
              </View>
            </View>
          </View>
        </View>
        {currentSeries.note && (
          <View style={styles.noteContainer}>
            <View style={styles.noteHeader}>
              <StickyNote size={18} color={theme.colors.primary} style={styles.noteIcon} />
              <Text variant="body" style={styles.noteLabel}>{t('common.note')}</Text>
            </View>
            <Text variant="body" style={styles.noteText}>{currentSeries.note}</Text>
          </View>
        )}
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
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.xl
  },
  seriesInfo: {
    gap: theme.spacing.lg
  },
  mainInfoContainer: {
    gap: theme.spacing.md
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.input,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm
  },
  icon: {
    marginRight: theme.spacing.xs
  },
  infoLabel: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm
  },
  infoValue: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.lg
  },
  noteContainer: {
    backgroundColor: theme.colors.background.input,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs
  },
  noteIcon: {
    marginRight: theme.spacing.xs
  },
  noteLabel: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600'
  },
  noteText: {
    color: theme.colors.text.primary,
    fontStyle: 'italic',
    lineHeight: 20
  }
});

export default CurrentExercise; 
