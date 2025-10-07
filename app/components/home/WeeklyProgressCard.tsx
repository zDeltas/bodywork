import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Target, Activity, Flame, TrendingUp } from 'lucide-react-native';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import Text from '@/app/components/ui/Text';
import Card from '@/app/components/ui/Card';

interface WeeklyProgressCardProps {
  totalVolume: number;
  sessionsCompleted: number;
  streak: number;
  progressPercentage: number;
  weeklyDelta?: number; // percentage vs last week
}

const WeeklyProgressCard: React.FC<WeeklyProgressCardProps> = React.memo(({
  totalVolume,
  sessionsCompleted,
  streak,
  progressPercentage,
  weeklyDelta
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();

  // Animation pour le graphique radial avec optimisation
  const progress = useSharedValue(0);
  
  React.useEffect(() => {
    progress.value = withTiming(progressPercentage / 100, {
      duration: 1200,
    });
  }, [progressPercentage, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${progress.value * 360}deg` }],
    };
  });

  return (
    <Card style={styles.card}>
      <Text variant="subheading" style={styles.title}>
        {t('home.currentWeek')}
      </Text>
      {/* Delta badge */}
      {typeof weeklyDelta === 'number' && (
        <View style={styles.deltaBadge}>
          <TrendingUp size={14} color="#10b981" />
          <Text variant="caption" style={styles.deltaText}>
            {weeklyDelta > 0 ? `+${Math.round(weeklyDelta)}%` : `${Math.round(weeklyDelta)}%`} {t('home.vsLastWeek')}
          </Text>
        </View>
      )}
      
      <View style={styles.content}>
        {/* Graphique radial animé */}
        <View style={styles.chartContainer}>
          <View style={styles.chartBackground}>
            <Animated.View style={[styles.chartFill, animatedStyle]} />
            <View style={styles.chartCenter}>
              <Text variant="heading" style={styles.percentageText}>
                {Math.round(progressPercentage)}%
              </Text>
            </View>
          </View>
        </View>
        
        {/* Statistiques */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Target size={20} color={theme.colors.primary} />
            <Text variant="caption" style={styles.statLabel}>
              {t('home.totalVolume')}
            </Text>
            <Text variant="body" style={styles.statValue}>
              {totalVolume}kg
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Activity size={20} color={theme.colors.primary} />
            <Text variant="caption" style={styles.statLabel}>
              {t('home.sessionsCompleted')}
            </Text>
            <Text variant="body" style={styles.statValue}>
              {sessionsCompleted}
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Flame size={20} color={theme.colors.primary} />
            <Text variant="caption" style={styles.statLabel}>
              {t('home.streak')}
            </Text>
            <Text variant="body" style={styles.statValue}>
              {streak} {t('home.streakDays')}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
});

const useStyles = () => {
  const { theme } = useTheme();
  
  return StyleSheet.create({
    card: {
      // Card provides background, radius and shadows
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      shadowColor: '#4CC9F0',
      shadowOpacity: 0.15,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
    },
    title: {
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.lg,
      fontWeight: '600',
    },
    deltaBadge: {
      position: 'absolute',
      top: theme.spacing.lg,
      right: theme.spacing.lg,
      backgroundColor: 'rgba(16, 185, 129, 0.15)', // emerald green tint
      borderRadius: 999,
      paddingVertical: 4,
      paddingHorizontal: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    deltaText: {
      color: '#3EF37D',
      fontWeight: '600',
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    chartContainer: {
      marginRight: theme.spacing.xl,
    },
    chartBackground: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.background.button,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    },
    chartFill: {
      position: 'absolute',
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 4,
      borderColor: theme.colors.primary,
      borderTopColor: 'transparent',
      borderRightColor: 'transparent',
    },
    chartCenter: {
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
    },
    percentageText: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    statsContainer: {
      flex: 1,
      gap: theme.spacing.md,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    statLabel: {
      flex: 1,
      color: theme.colors.text.secondary,
    },
    statValue: {
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
  });
};

WeeklyProgressCard.displayName = 'WeeklyProgressCard';

export default React.memo(WeeklyProgressCard);
