import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Target } from 'lucide-react-native';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import Text from '@/app/components/ui/Text';

interface WeeklyGoalCardProps {
  currentSessions: number;
  targetSessions: number;
}

const WeeklyGoalCard: React.FC<WeeklyGoalCardProps> = React.memo(({
  currentSessions,
  targetSessions
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();

  const progressPercentage = React.useMemo(() => 
    Math.min((currentSessions / targetSessions) * 100, 100), 
    [currentSessions, targetSessions]
  );
  
  const remainingSessions = React.useMemo(() => 
    Math.max(targetSessions - currentSessions, 0), 
    [targetSessions, currentSessions]
  );

  const getMotivationalMessage = React.useCallback(() => {
    if (currentSessions >= targetSessions) {
      return t('home.goalAchieved');
    } else if (remainingSessions === 1) {
      return t('home.oneMoreSession');
    } else {
      return t('home.almostThere');
    }
  }, [currentSessions, targetSessions, remainingSessions, t]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Target size={20} color="#4CC9F0" />
        <Text variant="subheading" style={styles.title}>
          {t('home.weeklyGoal')}
        </Text>
      </View>
      
      {/* Barre de progression */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${progressPercentage}%`,
                backgroundColor: currentSessions >= targetSessions ? '#10b981' : '#4CC9F0'
              }
            ]} 
          />
        </View>
        <Text variant="body" style={styles.progressText}>
          {currentSessions}/{targetSessions} {t('common.sessions')}
        </Text>
      </View>
      
      {/* Message motivationnel */}
      <Text variant="caption" style={styles.motivationText}>
        {getMotivationalMessage()}
      </Text>
    </View>
  );
});

const useStyles = () => {
  const { theme } = useTheme();
  
  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.background.card,
      borderRadius: 16,
      padding: theme.spacing.lg,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      ...theme.shadows.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    title: {
      color: theme.colors.text.primary,
      fontWeight: '600',
    },
    progressContainer: {
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    progressBar: {
      height: 8,
      backgroundColor: theme.colors.background.input,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 4,
    },
    progressText: {
      textAlign: 'center',
      color: theme.colors.text.primary,
      fontWeight: '600',
    },
    motivationText: {
      textAlign: 'center',
      color: theme.colors.text.secondary,
      fontStyle: 'italic',
    },
  });
};

WeeklyGoalCard.displayName = 'WeeklyGoalCard';

export default React.memo(WeeklyGoalCard);
