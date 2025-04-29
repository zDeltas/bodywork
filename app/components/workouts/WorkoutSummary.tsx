import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from '../ui/Text';
import { useTheme } from '@/hooks/useTheme';

interface WorkoutSummaryProps {
  workout: {
    name: string;
    duration: number;
    exercises: Array<{
      name: string;
      sets: number;
      reps: number;
      weight: number;
    }>;
  };
}

const WorkoutSummary: React.FC<WorkoutSummaryProps> = ({ workout }) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);

  return (
    <View style={styles.container}>
      <Text variant="heading" style={styles.title}>
        {workout.name}
      </Text>
      <Text variant="caption" style={styles.duration}>
        Duration: {Math.round(workout.duration / 60)} minutes
      </Text>
      <View style={styles.exercisesContainer}>
        {workout.exercises.map((exercise, index) => (
          <View key={index} style={styles.exerciseItem}>
            <Text variant="subheading">{exercise.name}</Text>
            <Text variant="body">
              {exercise.sets} sets × {exercise.reps} reps
              {exercise.weight > 0 && ` × ${exercise.weight}kg`}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const useStyles = (theme: any) => StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: theme.colors.background.card,
    borderRadius: 8,
    marginBottom: 16,
  },
  title: {
    color: theme.colors.primary,
    marginBottom: 8,
  },
  duration: {
    marginBottom: 16,
  },
  exercisesContainer: {
    marginTop: 8,
  },
  exerciseItem: {
    marginBottom: 12,
  },
});

export default WorkoutSummary;
