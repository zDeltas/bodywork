import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '../ui/Text';
import { useTheme } from '@/hooks/useTheme';

interface WorkoutStatsProps {
  stats: {
    totalWorkouts: number;
    totalExercises: number;
    totalTime: number;
    averageWorkoutTime: number;
  };
}

const WorkoutStats: React.FC<WorkoutStatsProps> = ({ stats }) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.statItem}>
        <Text variant="heading" style={styles.statValue}>
          {stats.totalWorkouts}
        </Text>
        <Text variant="caption">Total Workouts</Text>
      </View>
      <View style={styles.statItem}>
        <Text variant="heading" style={styles.statValue}>
          {stats.totalExercises}
        </Text>
        <Text variant="caption">Total Exercises</Text>
      </View>
      <View style={styles.statItem}>
        <Text variant="heading" style={styles.statValue}>
          {Math.round(stats.totalTime / 60)}h
        </Text>
        <Text variant="caption">Total Time</Text>
      </View>
      <View style={styles.statItem}>
        <Text variant="heading" style={styles.statValue}>
          {Math.round(stats.averageWorkoutTime / 60)}m
        </Text>
        <Text variant="caption">Avg. Time</Text>
      </View>
    </View>
  );
};

const useStyles = (theme: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: theme.colors.background.card,
    borderRadius: 8,
    marginBottom: 16
  },
  statItem: {
    alignItems: 'center'
  },
  statValue: {
    color: theme.colors.primary,
    marginBottom: 4
  }
});

export default WorkoutStats; 
