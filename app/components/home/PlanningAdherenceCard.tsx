import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, CheckCircle, TrendingUp } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import Text from '@/app/components/ui/Text';
import BaseCard from '@/app/components/home/BaseCard';

interface PlanningAdherenceCardProps {
  completedSessions: number;
  plannedSessions: number;
  adherenceRate: number; // Pourcentage d'adhérence moyen
  streakWeeks: number; // Semaines consécutives au-dessus du seuil
  weeksAnalyzed: number; // Nombre de semaines analysées
  stabilityMessage: string; // Message sur la stabilité
  onPress?: () => void;
}

const PlanningAdherenceCard: React.FC<PlanningAdherenceCardProps> = ({
  completedSessions,
  plannedSessions,
  adherenceRate,
  streakWeeks,
  weeksAnalyzed,
  stabilityMessage,
  onPress
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles();

  // Le message motivationnel est maintenant généré dans useHomeData
  // Plus besoin de logique locale, on utilise directement stabilityMessage

  // Couleur selon le niveau d'assiduité
  const getAdherenceColor = () => {
    if (completedSessions === 0) {
      return '#4CC9F0'; // Turquoise Gainizi pour commencer
    } else if (adherenceRate >= 85) {
      return theme.colors.success; // Vert pour excellente assiduité
    } else if (adherenceRate >= 70) {
      return '#4CC9F0'; // Turquoise pour bonne assiduité
    } else if (adherenceRate >= 50) {
      return theme.colors.warning; // Orange pour assiduité moyenne
    } else {
      return theme.colors.secondary; // Gris pour assiduité faible
    }
  };

  const adherenceColor = getAdherenceColor();

  return (
    <BaseCard
      title={t('home.adherence.title')}
      subtitle={`Ta discipline moyenne sur les ${weeksAnalyzed} dernières semaines`}
      icon={<Calendar size={24} color={adherenceColor} />}
      onPress={onPress}
    >

      {/* Indicateur principal - Sessions réalisées */}
      <View style={styles.mainIndicator}>
        <View style={styles.sessionsRow}>
          <CheckCircle size={18} color={adherenceColor} />
          <Text variant="body" style={styles.sessionsText}>
            <Text style={[styles.sessionsNumber, { color: adherenceColor }]}>
              {completedSessions}
            </Text>
            <Text style={styles.sessionsTotal}>/{plannedSessions} </Text>
            <Text style={styles.sessionsLabel}>
              séances respectées • {Math.round(adherenceRate)}%
            </Text>
          </Text>
        </View>
      </View>

      {/* Barre de progression circulaire ou linéaire */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${Math.min(adherenceRate, 100)}%`,
                backgroundColor: adherenceColor 
              }
            ]} 
          />
        </View>
      </View>

      {/* Message de stabilité */}
      <View style={styles.messageContainer}>
        <Text variant="body" style={[styles.message, { color: adherenceColor }]}>
          {stabilityMessage}
        </Text>
      </View>

      {/* Badge de streak si présent (≥ 2 semaines) */}
      {streakWeeks >= 2 && (
        <View style={[styles.streakContainer, { backgroundColor: adherenceColor + '15' }]}>
          <TrendingUp size={16} color={adherenceColor} />
          <Text variant="caption" style={[styles.streakText, { color: adherenceColor }]}>
            🔥 {streakWeeks} semaines de régularité
          </Text>
        </View>
      )}
    </BaseCard>
  );
};

const useStyles = () => {
  const { theme } = useTheme();
  
  return StyleSheet.create({
    mainIndicator: {
      marginBottom: theme.spacing.lg,
    },
    sessionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    sessionsText: {
      marginLeft: theme.spacing.sm,
      flex: 1,
    },
    sessionsNumber: {
      fontFamily: theme.typography.fontFamily.bold,
      fontSize: theme.typography.fontSize.lg,
    },
    sessionsTotal: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.bold,
    },
    sessionsLabel: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.fontSize.md,
    },
    progressContainer: {
      marginBottom: theme.spacing.lg,
    },
    progressBar: {
      height: 12,
      backgroundColor: theme.colors.background.input,
      borderRadius: theme.borderRadius.full,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: theme.borderRadius.full,
    },
    messageContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    message: {
      textAlign: 'center',
      fontFamily: theme.typography.fontFamily.semibold,
      fontSize: theme.typography.fontSize.lg,
    },
    streakContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.full,
      alignSelf: 'center',
    },
    streakText: {
      marginLeft: theme.spacing.xs,
      fontFamily: theme.typography.fontFamily.semibold,
    },
  });
};

PlanningAdherenceCard.displayName = 'PlanningAdherenceCard';

export default React.memo(PlanningAdherenceCard);
