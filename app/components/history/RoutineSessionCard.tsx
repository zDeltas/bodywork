import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import { RoutineSession } from '@/types/common';
import { CheckCircle2, Clock, Target } from 'lucide-react-native';
import Text from '@/app/components/ui/Text';

interface RoutineSessionCardProps {
  session: RoutineSession;
}

const RoutineSessionCard: React.FC<RoutineSessionCardProps> = React.memo(({ session }) => {
  const { theme } = useTheme();
  const { language } = useTranslation();
  const styles = useStyles();

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const getCompletionColor = () => {
    if (session.completedExercises === session.exerciseCount) {
      return '#27ae60'; // Vert pour 100%
    }
    if (session.completedExercises / session.exerciseCount >= 0.8) {
      return '#f39c12'; // Orange pour 80%+
    }
    return theme.colors.primary;
  };

  const completionPercentage = Math.round((session.completedExercises / session.exerciseCount) * 100);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => router.push({
        pathname: '/screens/routines/history',
        params: { 
          routineId: session.routineId, 
          title: session.routineTitle,
          sessionDate: session.date
        }
      })}
    >
      <View style={styles.cardContent}>
        {/* En-tête */}
        <View style={styles.header}>
          <View style={styles.titleInfo}>
            <Text variant="subheading" style={styles.routineTitle}>
              {session.routineTitle}
            </Text>
            <Text variant="caption" style={styles.routineSubtitle}>
              {language === 'fr' 
                ? `${session.exerciseCount} exercices`
                : `${session.exerciseCount} exercises`
              }
            </Text>
          </View>
          
          {/* Badge de complétion */}
          <View style={[
            styles.completionBadge,
            { backgroundColor: getCompletionColor() }
          ]}>
            <Text variant="caption" style={styles.completionText}>
              {completionPercentage}%
            </Text>
          </View>
        </View>

        {/* Statistiques en ligne */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Target size={16} color={theme.colors.text.secondary} />
            <Text variant="body" style={styles.statText}>
              {session.completedExercises}/{session.exerciseCount}
            </Text>
          </View>

          {session.duration && (
            <View style={styles.statItem}>
              <Clock size={16} color={theme.colors.text.secondary} />
              <Text variant="body" style={styles.statText}>
                {formatDuration(session.duration)}
              </Text>
            </View>
          )}

          <View style={styles.statItem}>
            <CheckCircle2 size={16} color={getCompletionColor()} />
            <Text variant="body" style={[styles.statText, { color: getCompletionColor() }]}>
              {session.completedExercises === session.exerciseCount ? 'Terminé' : 'En cours'}
            </Text>
          </View>
        </View>

        {/* Barre de progression */}
        {completionPercentage < 100 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${completionPercentage}%`,
                    backgroundColor: getCompletionColor()
                  }
                ]} 
              />
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      marginHorizontal: theme.spacing.base,
      marginVertical: theme.spacing.xs,
      ...theme.shadows.sm,
    },
    cardContent: {
      padding: theme.spacing.base,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.sm,
    },
    titleInfo: {
      flex: 1,
    },
    routineTitle: {
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    routineSubtitle: {
      color: theme.colors.text.secondary,
    },
    completionBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.base,
    },
    completionText: {
      color: theme.colors.background.main,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    statText: {
      color: theme.colors.text.primary,
      marginLeft: theme.spacing.xs,
    },
    progressContainer: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border.light,
      paddingTop: theme.spacing.sm,
    },
    progressTrack: {
      height: 4,
      backgroundColor: theme.colors.background.input,
      borderRadius: 2,
    },
    progressFill: {
      height: '100%',
      borderRadius: 2,
    },
  });
};

RoutineSessionCard.displayName = 'RoutineSessionCard';

export default RoutineSessionCard;
