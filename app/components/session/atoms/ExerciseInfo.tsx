import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/app/hooks/useTheme';
import Text from '@/app/components/ui/Text';

export interface ExerciseInfoProps {
  exerciseName: string;
  musclesText: string;
}

const ExerciseInfo = React.memo<ExerciseInfoProps>(({
  exerciseName,
  musclesText
}) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);

  return (
    <View style={styles.container}>
      <Text variant="heading" style={styles.exerciseTitle}>
        {exerciseName}
      </Text>
      {!!musclesText && (
        <Text style={styles.targetedMusclesText}>
          {musclesText}
        </Text>
      )}
    </View>
  );
});

const useStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  exerciseTitle: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600'
  },
  targetedMusclesText: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
    marginTop: theme.spacing.xs,
    fontStyle: 'italic'
  }
});

ExerciseInfo.displayName = 'ExerciseInfo';

export default ExerciseInfo;
