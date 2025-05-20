import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { ExerciseCardSkeleton, WorkoutCardSkeleton } from './SkeletonComponents';

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
    padding: 16
  }
});

export default SkeletonList;
