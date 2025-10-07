import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Target, Flame, Zap, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import Text from '@/app/components/ui/Text';

interface MotivationCardProps {
  currentSessions: number;
  targetSessions: number;
  weeklyGoal?: string;
}

const MotivationCard: React.FC<MotivationCardProps> = ({
  currentSessions,
  targetSessions,
  weeklyGoal
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles();

  const progressPercentage = Math.min((currentSessions / targetSessions) * 100, 100);
  const sessionsLeft = Math.max(targetSessions - currentSessions, 0);

  const getChallengeMessage = () => {
    if (progressPercentage >= 100) {
      return t('home.emotional.challenge.conquered');
    } else if (sessionsLeft === 1) {
      return t('home.emotional.challenge.final');
    } else if (sessionsLeft <= 2) {
      return t('home.emotional.challenge.close');
    } else if (progressPercentage >= 50) {
      return t('home.emotional.challenge.halfway');
    } else {
      return t('home.emotional.challenge.begin');
    }
  };

  const getMotivationLevel = () => {
    if (progressPercentage >= 100) return 'achieved';
    if (sessionsLeft === 1) return 'final';
    if (sessionsLeft <= 2) return 'close';
    if (progressPercentage >= 50) return 'momentum';
    return 'ignite';
  };

  const motivationColor = {
    achieved: theme.colors.success,
    final: '#F72585',
    close: theme.colors.primary,
    momentum: '#4CC9F0',
    ignite: theme.colors.warning
  }[getMotivationLevel()];

  const getMotivationIcon = () => {
    const level = getMotivationLevel();
    if (level === 'achieved') return Target;
    if (level === 'final' || level === 'close') return Flame;
    return Zap;
  };

  const MotivationIcon = getMotivationIcon();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Target size={20} color={theme.colors.primary} />
        <Text variant="subheading" style={styles.headerText}>
          {t('home.emotional.weeklyChallenge')}
        </Text>
        <MotivationIcon size={18} color={motivationColor} />
      </View>

      <View style={styles.goalContainer}>
        <Text variant="body" style={styles.goalText}>
          {weeklyGoal || t('home.emotional.defaultGoal')}
        </Text>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text variant="caption" style={styles.progressLabel}>
            {t('home.emotional.progress')}
          </Text>
          <Text variant="caption" style={[styles.progressPercentage, { color: motivationColor }]}>
            {Math.round(progressPercentage)}%
          </Text>
        </View>
        
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${progressPercentage}%`,
                backgroundColor: motivationColor 
              }
            ]} 
          />
        </View>
        
        <View style={styles.sessionCounter}>
          <Text variant="body" style={styles.sessionText}>
            {currentSessions}/{targetSessions}
          </Text>
          <Text variant="caption" style={styles.sessionLabel}>
            {t('home.emotional.sessions')}
          </Text>
        </View>
      </View>

      <View style={styles.challengeSection}>
        <Text variant="body" style={[styles.challengeMessage, { color: motivationColor }]}>
          {getChallengeMessage()}
        </Text>
      </View>

      {sessionsLeft > 0 && (
        <View style={styles.actionContainer}>
          <View style={[styles.actionBadge, { backgroundColor: motivationColor + '20' }]}>
            <Text variant="caption" style={[styles.actionText, { color: motivationColor }]}>
              {sessionsLeft === 1 
                ? t('home.emotional.oneMore') 
                : t('home.emotional.sessionsLeft', { count: sessionsLeft })
              }
            </Text>
            <ChevronRight size={14} color={motivationColor} />
          </View>
        </View>
      )}

      <View style={styles.motivationBadge}>
        <Text variant="caption" style={[styles.motivationText, { color: motivationColor }]}>
          {t(`home.emotional.motivation.${getMotivationLevel()}`)}
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
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
    },
    headerText: {
      marginHorizontal: theme.spacing.sm,
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semibold,
    },
    goalContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      paddingHorizontal: theme.spacing.md,
    },
    goalText: {
      textAlign: 'center',
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.medium,
      lineHeight: 22,
    },
    progressSection: {
      marginBottom: theme.spacing.lg,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    progressLabel: {
      color: theme.colors.text.secondary,
    },
    progressPercentage: {
      fontFamily: theme.typography.fontFamily.bold,
    },
    progressBar: {
      height: 12,
      backgroundColor: theme.colors.background.input,
      borderRadius: theme.borderRadius.full,
      overflow: 'hidden',
      marginBottom: theme.spacing.sm,
    },
    progressFill: {
      height: '100%',
      borderRadius: theme.borderRadius.full,
    },
    sessionCounter: {
      alignItems: 'center',
    },
    sessionText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.bold,
      fontSize: theme.typography.fontSize.lg,
    },
    sessionLabel: {
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.xs,
    },
    challengeSection: {
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    challengeMessage: {
      textAlign: 'center',
      fontFamily: theme.typography.fontFamily.semibold,
      fontSize: theme.typography.fontSize.md,
    },
    actionContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    actionBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
    },
    actionText: {
      fontFamily: theme.typography.fontFamily.semibold,
      marginRight: theme.spacing.xs,
    },
    motivationBadge: {
      alignSelf: 'center',
    },
    motivationText: {
      fontFamily: theme.typography.fontFamily.bold,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
  });
};

export default React.memo(MotivationCard);
