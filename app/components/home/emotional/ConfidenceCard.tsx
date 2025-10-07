import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Settings, Star, Gift, Smile } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import Text from '@/app/components/ui/Text';

interface ConfidenceCardProps {
  totalRoutines: number;
  customRoutines: number;
  totalWorkouts: number;
  averageRating?: number;
  onCreateRoutine?: () => void;
}

const ConfidenceCard: React.FC<ConfidenceCardProps> = ({
  totalRoutines,
  customRoutines,
  totalWorkouts,
  averageRating = 0,
  onCreateRoutine
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles();

  const personalizationLevel = customRoutines / Math.max(totalRoutines, 1);
  
  const getConfidenceMessage = () => {
    if (totalWorkouts >= 50) {
      return t('home.emotional.confidence.expert');
    } else if (totalWorkouts >= 20) {
      return t('home.emotional.confidence.experienced');
    } else if (totalWorkouts >= 10) {
      return t('home.emotional.confidence.growing');
    } else if (totalWorkouts >= 5) {
      return t('home.emotional.confidence.building');
    } else {
      return t('home.emotional.confidence.starting');
    }
  };

  const getPersonalizationMessage = () => {
    if (personalizationLevel >= 0.8) {
      return t('home.emotional.personalization.master');
    } else if (personalizationLevel >= 0.5) {
      return t('home.emotional.personalization.creator');
    } else if (personalizationLevel >= 0.3) {
      return t('home.emotional.personalization.adapter');
    } else if (customRoutines > 0) {
      return t('home.emotional.personalization.beginner');
    } else {
      return t('home.emotional.personalization.explorer');
    }
  };

  const getPleasureLevel = () => {
    if (averageRating >= 4.5) return 'joy';
    if (averageRating >= 4.0) return 'satisfaction';
    if (averageRating >= 3.5) return 'content';
    if (averageRating >= 3.0) return 'progress';
    return 'discovery';
  };

  const confidenceColor = {
    expert: theme.colors.success,
    experienced: theme.colors.primary,
    growing: '#4CC9F0',
    building: theme.colors.warning,
    starting: theme.colors.secondary
  }[getConfidenceMessage().includes('expert') ? 'expert' : 
    getConfidenceMessage().includes('experienced') ? 'experienced' :
    getConfidenceMessage().includes('growing') ? 'growing' :
    getConfidenceMessage().includes('building') ? 'building' : 'starting'];

  const pleasureColor = {
    joy: '#F72585',
    satisfaction: theme.colors.success,
    content: theme.colors.primary,
    progress: theme.colors.warning,
    discovery: theme.colors.secondary
  }[getPleasureLevel()];

  return (
    <TouchableOpacity style={styles.container} onPress={onCreateRoutine} activeOpacity={0.8}>
      <View style={styles.header}>
        <Settings size={20} color={theme.colors.primary} />
        <Text variant="subheading" style={styles.headerText}>
          {t('home.emotional.personalization')}
        </Text>
        <Star size={18} color={confidenceColor} />
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text variant="heading" style={[styles.statNumber, { color: confidenceColor }]}>
            {totalRoutines}
          </Text>
          <Text variant="caption" style={styles.statLabel}>
            {t('home.emotional.routines')}
          </Text>
        </View>
        
        <View style={styles.statBox}>
          <Text variant="heading" style={[styles.statNumber, { color: theme.colors.primary }]}>
            {customRoutines}
          </Text>
          <Text variant="caption" style={styles.statLabel}>
            {t('home.emotional.custom')}
          </Text>
        </View>
        
        <View style={styles.statBox}>
          <Text variant="heading" style={[styles.statNumber, { color: pleasureColor }]}>
            {totalWorkouts}
          </Text>
          <Text variant="caption" style={styles.statLabel}>
            {t('home.emotional.workouts')}
          </Text>
        </View>
      </View>

      <View style={styles.messageSection}>
        <Text variant="body" style={[styles.confidenceMessage, { color: confidenceColor }]}>
          {getConfidenceMessage()}
        </Text>
        
        <Text variant="caption" style={styles.personalizationMessage}>
          {getPersonalizationMessage()}
        </Text>
      </View>

      {averageRating > 0 && (
        <View style={styles.pleasureSection}>
          <View style={styles.ratingContainer}>
            <Smile size={16} color={pleasureColor} />
            <Text variant="caption" style={[styles.ratingText, { color: pleasureColor }]}>
              {averageRating.toFixed(1)}/5 {t('home.emotional.enjoyment')}
            </Text>
          </View>
          
          <View style={[styles.pleasureBadge, { backgroundColor: pleasureColor + '20' }]}>
            <Gift size={14} color={pleasureColor} />
            <Text variant="caption" style={[styles.pleasureText, { color: pleasureColor }]}>
              {t(`home.emotional.pleasure.${getPleasureLevel()}`)}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.actionHint}>
        <Text variant="caption" style={styles.hintText}>
          {t('home.emotional.createHint')}
        </Text>
      </View>
    </TouchableOpacity>
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
      borderWidth: 1,
      borderColor: theme.colors.primary + '20',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.lg,
    },
    headerText: {
      marginHorizontal: theme.spacing.sm,
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semibold,
    },
    statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.background.input,
      borderRadius: theme.borderRadius.md,
    },
    statBox: {
      alignItems: 'center',
    },
    statNumber: {
      fontFamily: theme.typography.fontFamily.bold,
      fontSize: theme.typography.fontSize.xl,
    },
    statLabel: {
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.xs,
      textAlign: 'center',
    },
    messageSection: {
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    confidenceMessage: {
      textAlign: 'center',
      fontFamily: theme.typography.fontFamily.semibold,
      fontSize: theme.typography.fontSize.md,
      marginBottom: theme.spacing.sm,
    },
    personalizationMessage: {
      textAlign: 'center',
      color: theme.colors.text.secondary,
      fontStyle: 'italic',
    },
    pleasureSection: {
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    ratingText: {
      marginLeft: theme.spacing.xs,
      fontFamily: theme.typography.fontFamily.medium,
    },
    pleasureBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.full,
    },
    pleasureText: {
      marginLeft: theme.spacing.xs,
      fontFamily: theme.typography.fontFamily.semibold,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    actionHint: {
      alignItems: 'center',
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.background.input,
    },
    hintText: {
      color: theme.colors.text.secondary,
      fontStyle: 'italic',
    },
  });
};

export default React.memo(ConfidenceCard);
