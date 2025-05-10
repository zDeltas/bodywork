import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/app/hooks/useTheme';
import Skeleton from './Skeleton';

export const WorkoutCardSkeleton = () => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.card }]}>
      <Skeleton height={24} width="60%" style={styles.title} />
      <Skeleton height={16} width="40%" style={styles.subtitle} />
      <View style={styles.statsContainer}>
        <Skeleton height={16} width="30%" />
        <Skeleton height={16} width="30%" />
        <Skeleton height={16} width="30%" />
      </View>
    </View>
  );
};

export const ExerciseCardSkeleton = () => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.card }]}>
      <Skeleton height={24} width="70%" style={styles.title} />
      <Skeleton height={16} width="50%" style={styles.subtitle} />
      <View style={styles.statsContainer}>
        <Skeleton height={16} width="45%" />
        <Skeleton height={16} width="45%" />
      </View>
    </View>
  );
};

export const StatsCardSkeleton = () => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.card }]}>
      <Skeleton height={20} width="40%" style={styles.title} />
      <Skeleton height={32} width="60%" style={styles.value} />
    </View>
  );
};

export const ChartSkeleton = () => {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.card }]}>
      <Skeleton height={24} width="50%" style={styles.title} />
      <View style={styles.chartContainer}>
        <Skeleton height={200} width="100%" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  value: {
    marginTop: 8,
  },
  chartContainer: {
    marginTop: 16,
  },
}); 