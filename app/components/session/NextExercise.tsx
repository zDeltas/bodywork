import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import Text from '@/app/components/ui/Text';
import { Exercise } from '@/types/common';

type NextExerciseProps = {
  exercise: Exercise;
};

const NextExercise = React.memo(({ exercise }: NextExerciseProps) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles(theme);

  return (
    <View style={styles.nextExerciseCard}>
      <Text variant="subheading" style={styles.nextExerciseTitle}>
        {t('workout.nextExercise')}
      </Text>
      <Text variant="heading" style={styles.nextExerciseName}>
        {exercise.name}
      </Text>
      {exercise.series[0] && (
        <View style={styles.nextExerciseDetails}>
          <Text variant="body" style={styles.nextExerciseDetail}>
            {exercise.series[0].weight}kg × {exercise.series[0].reps} {t('workout.reps')}
          </Text>
        </View>
      )}
    </View>
  );
});

const useStyles = (theme: any) => StyleSheet.create({
  nextExerciseCard: {
    backgroundColor: theme.colors.background.button,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg
  },
  nextExerciseTitle: {
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs
  },
  nextExerciseName: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs
  },
  nextExerciseDetails: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  nextExerciseDetail: {
    color: theme.colors.text.secondary
  }
});

export default NextExercise; 
