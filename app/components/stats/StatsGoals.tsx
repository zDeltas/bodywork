import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '@/app/hooks/useTheme';
import GoalSection from '@/app/components/goal/GoalSection';

interface StatsGoalsProps {
  fadeAnim: Animated.Value;
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.xl
    }
  });

export default function StatsGoals({ fadeAnim }: StatsGoalsProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <GoalSection fadeAnim={fadeAnim} />
    </View>
  );
}
