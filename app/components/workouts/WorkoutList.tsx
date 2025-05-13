import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import Text from '@/app/components/ui/Text';
import { useTheme } from '@/app/hooks/useTheme';
import { WorkoutSummary } from '@/app/types/common';
import { Button } from '@/app/components/ui/Button';

interface WorkoutListProps {
  workouts: WorkoutSummary[];
  onWorkoutPress: (workout: WorkoutSummary) => void;
}

const WorkoutList: React.FC<WorkoutListProps> = ({ workouts, onWorkoutPress }) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);

  const renderWorkoutItem = ({ item }: { item: WorkoutSummary }) => (
    <Button
      variant="secondary"
      onPress={() => onWorkoutPress(item)}
      style={styles.workoutItem}
    >
      <Text variant="subheading" style={styles.workoutName}>
        {item.name}
      </Text>
      <Text variant="caption">
        Duration: {Math.round(item.duration / 60)} minutes
      </Text>
      <Text variant="caption">
        Exercises: {item.exercises.length}
      </Text>
    </Button>
  );

  return (
    <View style={styles.container}>
      {workouts.length === 0 ? (
        <Text variant="body" style={styles.emptyText}>
          No workouts available
        </Text>
      ) : (
        <FlatList
          data={workouts}
          renderItem={renderWorkoutItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const useStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1
  },
  listContent: {
    padding: 16
  },
  workoutItem: {
    backgroundColor: theme.colors.background.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16
  },
  workoutName: {
    color: theme.colors.primary
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24
  }
});

export default WorkoutList; 
