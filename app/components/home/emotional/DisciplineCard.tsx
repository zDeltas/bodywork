import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar, Trophy, Zap } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import Text from '@/app/components/ui/Text';

interface DisciplineCardProps {
  weekProgress: number;
  streak: number;
  sessionsCompleted: number;
  targetSessions: number;
}

const DisciplineCard: React.FC<DisciplineCardProps> = ({
  weekProgress,
  streak,
  sessionsCompleted,
  targetSessions
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles();

  const getDisciplineMessage = () => {
    if (weekProgress >= 100) {
      return t('home.emotional.discipline.complete');
    } else if (weekProgress >= 75) {
      return t('home.emotional.discipline.excellent');
    } else if (weekProgress >= 50) {
      return t('home.emotional.discipline.good');
    } else if (weekProgress >= 25) {
      return t('home.emotional.discipline.progress');
    } else {
      return t('home.emotional.discipline.start');
    }
  };

  const getSatisfactionLevel = () => {
    if (weekProgress >= 100) return 'complete';
    if (weekProgress >= 75) return 'high';
    if (weekProgress >= 50) return 'medium';
    return 'building';
  };

  const satisfactionColor = {
    complete: theme.colors.success,
    high: theme.colors.primary,
    medium: theme.colors.warning,
    building: theme.colors.secondary
  }[getSatisfactionLevel()];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Calendar size={20} color={theme.colors.primary} />
        <Text variant="subheading" style={styles.headerText}>
          {t('home.emotional.weeklyDiscipline')}
        </Text>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${Math.min(weekProgress, 100)}%`,
                backgroundColor: satisfactionColor 
              }
            ]} 
          />
        </View>
        <Text variant="caption" style={styles.progressText}>
          {sessionsCompleted}/{targetSessions} {t('home.emotional.sessions')}
        </Text>
      </View>

      <View style={styles.messageContainer}>
        <Text variant="body" style={[styles.disciplineMessage, { color: satisfactionColor }]}>
          {getDisciplineMessage()}
        </Text>
      </View>

      {streak > 0 && (
        <View style={styles.streakContainer}>
          <Zap size={16} color={theme.colors.warning} />
          <Text variant="caption" style={styles.streakText}>
            {streak} {t('home.emotional.daysStreak')}
          </Text>
          <Trophy size={16} color={theme.colors.warning} />
        </View>
      )}

      <View style={styles.satisfactionBadge}>
        <Text variant="caption" style={[styles.satisfactionText, { color: satisfactionColor }]}>
          {t(`home.emotional.satisfaction.${getSatisfactionLevel()}`)}
        </Text>
      </View>
    </View>
  );
};

const useStyles = () => {
  const { theme } = useTheme();
  
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      ...theme.shadows.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
      justifyContent: 'center',
    },
    headerText: {
      marginLeft: theme.spacing.sm,
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semibold,
    },
    progressSection: {
      marginBottom: theme.spacing.md,
    },
    progressBar: {
      height: 8,
      backgroundColor: theme.colors.background.input,
      borderRadius: theme.borderRadius.full,
      overflow: 'hidden',
      marginBottom: theme.spacing.xs,
    },
    progressFill: {
      height: '100%',
      borderRadius: theme.borderRadius.full,
    },
    progressText: {
      textAlign: 'center',
      color: theme.colors.text.secondary,
    },
    messageContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    disciplineMessage: {
      textAlign: 'center',
      fontFamily: theme.typography.fontFamily.semibold,
      fontSize: theme.typography.fontSize.md,
    },
    streakContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.warning + '20',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.full,
      marginBottom: theme.spacing.md,
    },
    streakText: {
      marginHorizontal: theme.spacing.xs,
      color: theme.colors.warning,
      fontFamily: theme.typography.fontFamily.semibold,
    },
    satisfactionBadge: {
      alignSelf: 'center',
    },
    satisfactionText: {
      fontFamily: theme.typography.fontFamily.semibold,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  });
};

export default React.memo(DisciplineCard);
