import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { WorkoutCardSkeleton, ExerciseCardSkeleton } from './SkeletonComponents';

interface SkeletonListProps {
  type: 'workout' | 'exercise';
  count?: number;
}

const SkeletonList: React.FC<SkeletonListProps> = ({ type, count = 3 }) => {
  const renderItem = () => {
    switch (type) {
      case 'workout':
        return <WorkoutCardSkeleton />;
      case 'exercise':
        return <ExerciseCardSkeleton />;
      default:
        return null;
    }
  };

  return (
    <FlatList
      data={Array(count).fill(0)}
      renderItem={renderItem}
      keyExtractor={(_, index) => `skeleton-${index}`}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});

export default SkeletonList;
