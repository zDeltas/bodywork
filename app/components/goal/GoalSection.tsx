import React from 'react';
import { Alert, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import { router } from 'expo-router';
import useGoals from '@/app/hooks/useGoals';
import useWorkouts from '@/app/hooks/useWorkouts';

interface GoalSectionProps {
  fadeAnim: Animated.Value;
}

const GoalSection: React.FC<GoalSectionProps> = ({ fadeAnim }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { workouts } = useWorkouts();
  const { goals, deleteGoal } = useGoals(workouts);

  const styles = StyleSheet.create({
    chartContainer: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
      ...theme.shadows.sm
    },
    chartTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.bold,
      marginBottom: theme.spacing.lg,
      color: theme.colors.text.primary
    },
    noGoalsContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.lg
    },
    noGoalsText: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.secondary,
      textAlign: 'center'
    },
    goalItem: {
      marginBottom: theme.spacing.lg,
      borderRadius: theme.borderRadius.base
    },
    goalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm
    },
    goalTitle: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.text.primary,
      flex: 1
    },
    goalHeaderRight: {
      flexDirection: 'row',
      alignItems: 'center'
    },
    goalValues: {
      marginRight: theme.spacing.md
    },
    goalCurrent: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.success
    },
    goalSeparator: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.secondary
    },
    goalTarget: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.primary
    },
    deleteGoalButton: {
      padding: theme.spacing.xs
    },
    goalProgressContainer: {
      height: theme.spacing.sm,
      backgroundColor: theme.colors.background.button,
      borderRadius: theme.borderRadius.xs,
      overflow: 'hidden',
      marginBottom: theme.spacing.sm
    },
    goalProgressBar: {
      height: '100%',
      borderRadius: theme.borderRadius.xs
    },
    goalProgressLow: {
      backgroundColor: theme.colors.error
    },
    goalProgressMedium: {
      backgroundColor: theme.colors.primary
    },
    goalProgressHigh: {
      backgroundColor: theme.colors.success
    },
    goalProgressText: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text.secondary
    },
    addGoalButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.md,
      padding: theme.spacing.md
    },
    addGoalText: {
      marginLeft: theme.spacing.sm,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.primary,
      fontFamily: theme.typography.fontFamily.semiBold
    }
  });

  return (
    <Animated.View
      style={[
        styles.chartContainer,
        { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }
      ]}
    >
      <Text style={styles.chartTitle}>{t('stats.goals')}</Text>

      {goals.length === 0 ? (
        <View style={styles.noGoalsContainer}>
          <Text style={styles.noGoalsText}>{t('stats.noGoalsYet')}</Text>
        </View>
      ) : (
        goals.map((goal, index) => (
          <View key={index} style={styles.goalItem}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalTitle}>{goal.exercise}</Text>
              <View style={styles.goalHeaderRight}>
                <Text style={styles.goalValues}>
                  <Text style={styles.goalCurrent}>{goal.current}kg</Text>
                  <Text style={styles.goalSeparator}> / </Text>
                  <Text style={styles.goalTarget}>{goal.target}kg</Text>
                </Text>
                <TouchableOpacity
                  style={styles.deleteGoalButton}
                  onPress={() => {
                    Alert.alert(
                      t('goals.deleteGoal'),
                      t('goals.deleteGoalConfirmation').replace('{exercise}', goal.exercise),
                      [
                        {
                          text: t('common.cancel'),
                          style: 'cancel'
                        },
                        {
                          text: t('common.delete'),
                          style: 'destructive',
                          onPress: () => {
                            deleteGoal(goal.exercise);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                          }
                        }
                      ]
                    );
                  }}
                >
                  <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.goalProgressContainer}>
              <View
                style={[
                  styles.goalProgressBar,
                  { width: `${goal.progress}%` },
                  goal.progress > 80 ? styles.goalProgressHigh :
                    goal.progress > 50 ? styles.goalProgressMedium :
                      styles.goalProgressLow
                ]}
              />
            </View>

            <Text style={styles.goalProgressText}>
              {goal.progress < 100
                ? t('goals.goalRemaining').replace('{remaining}', (goal.target - goal.current).toString())
                : t('goals.goalAchieved')}
            </Text>
          </View>
        ))
      )}

      <TouchableOpacity
        style={styles.addGoalButton}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/screens/goal/new');
        }}
      >
        <Ionicons name="add-circle" size={20} color={theme.colors.primary} />
        <Text style={styles.addGoalText}>{t('goals.addGoal')}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default GoalSection;
