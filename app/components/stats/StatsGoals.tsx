import React, { useCallback, useState, Dispatch, SetStateAction } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/hooks/useTheme';
import GoalSection from '@/app/components/GoalSection';

interface Goal {
  exercise: string;
  current: number;
  target: number;
  progress: number;
}

interface StatsGoalsProps {
  fadeAnim: Animated.Value;
  goals: Goal[];
  setGoals: Dispatch<SetStateAction<Goal[]>>;
  workouts: any[];
  getCurrentWeight: (exercise: string) => number | null;
}

export default function StatsGoals({
  fadeAnim,
  goals,
  setGoals,
  workouts,
  getCurrentWeight
}: StatsGoalsProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [newGoalExercise, setNewGoalExercise] = useState('exercise_chest_benchPress');
  const [newGoalCurrent, setNewGoalCurrent] = useState('');
  const [suggestedTarget, setSuggestedTarget] = useState<number | null>(null);

  const styles = StyleSheet.create({
    container: {
      marginBottom: theme.spacing.xl
    }
  });

  const suggestTargetWeight = useCallback((currentWeight: number) => {
    if (!currentWeight) return null;

    const improvementFactor = currentWeight < 50 ? 0.05 : 0.025;
    const suggestedImprovement = currentWeight * improvementFactor;
    const roundingFactor = 2.5;
    return Math.ceil((currentWeight + suggestedImprovement) / roundingFactor) * roundingFactor;
  }, []);

  const handleAddGoal = useCallback(() => {
    if (!newGoalExercise || !newGoalCurrent) return;

    const currentWeight = parseFloat(newGoalCurrent);
    const target = suggestedTarget || currentWeight * 1.1; // 10% improvement by default

    const newGoal: Goal = {
      exercise: newGoalExercise,
      current: currentWeight,
      target,
      progress: Math.min(Math.round((currentWeight / target) * 100), 100)
    };

    setGoals(prevGoals => [...prevGoals, newGoal]);
    setShowExerciseSelector(false);
    setNewGoalCurrent('');
    setSuggestedTarget(null);
  }, [newGoalExercise, newGoalCurrent, suggestedTarget, setGoals]);

  return (
    <View style={styles.container}>
      <GoalSection
        fadeAnim={fadeAnim}
        goals={goals}
        setGoals={setGoals}
      />
    </View>
  );
} 