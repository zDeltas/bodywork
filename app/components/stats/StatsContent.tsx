import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/hooks/useTheme';
import Animated, { FadeIn } from 'react-native-reanimated';
import Text from '@/app/components/ui/Text';
import Card from '@/app/components/ui/Card';

interface StatsContentProps {
  searchQuery: string;
}

export default function StatsContent({ searchQuery }: StatsContentProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();

  return (
    <Animated.View
      entering={FadeIn.duration(500)}
      style={styles.container}
    >
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>{t('stats.overview')}</Text>
        <View style={styles.statsGrid}>
          <Card variant="secondary" style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>{t('stats.totalWorkouts')}</Text>
          </Card>
          <Card variant="secondary" style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>{t('stats.totalExercises')}</Text>
          </Card>
          <Card variant="secondary" style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>{t('stats.totalVolume')}</Text>
          </Card>
          <Card variant="secondary" style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>{t('stats.avgWorkoutTime')}</Text>
          </Card>
        </View>
      </Card>
    </Animated.View>
  );
}

const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.lg
    },
    card: {
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg
    },
    cardTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: theme.spacing.md
    },
    statItem: {
      width: '48%',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md
    },
    statValue: {
      fontSize: theme.typography.fontSize['2xl'],
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs
    },
    statLabel: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      textAlign: 'center'
    }
  });
}; 
