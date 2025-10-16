import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Calendar, CheckCircle, Clock, Play, Rocket, Target, TrendingUp } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import { router } from 'expo-router';
import Text from '@/app/components/ui/Text';
import BaseCard from '@/app/components/home/BaseCard';

interface DailyRoutineCardProps {
  hasRoutineToday: boolean;
  routines: Array<{
    id: string;
    name: string;
    muscleGroups: string[];
    estimatedDuration?: number;
    lastPerformance?: {
      reps: number;
      weight: number;
    };
    isCompleted: boolean;
  }>;
  isCompleted?: boolean;
  onPress?: () => void;
}

const DailyRoutineCard: React.FC<DailyRoutineCardProps> = ({
                                                             hasRoutineToday,
                                                             routines,
                                                             isCompleted = false,
                                                             onPress
                                                           }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles();

  const getStateColor = () => {
    if (!hasRoutineToday) {
      return theme.colors.text.secondary;
    } else if (isCompleted) {
      return theme.colors.success;
    } else {
      return '#4CC9F0';
    }
  };

  const stateColor = getStateColor();

  const getStateIcon = () => {
    if (!hasRoutineToday) {
      return Calendar;
    } else if (isCompleted) {
      return Target;
    } else {
      return Rocket;
    }
  };

  const StateIcon = getStateIcon();

  const getTotalDuration = () => {
    return routines.reduce((sum, routine) => sum + (routine.estimatedDuration || 0), 0);
  };

  const getCompletedRoutinesCount = () => {
    return routines.filter(routine => routine.isCompleted).length;
  };

  const getMotivationalMessage = () => {
    if (isCompleted) {
      return t('home.dailyRoutine.motivationalCompleted');
    }
    if (!hasRoutineToday) {
      return t('home.dailyRoutine.motivationalRest');
    }
    const completedCount = getCompletedRoutinesCount();
    if (completedCount > 0) {
      return t('home.dailyRoutine.motivationalContinue');
    }
    return t('home.dailyRoutine.motivationalReady');
  };

  return (
    <BaseCard
      title={t('home.dailyRoutine.title')}
      icon={<StateIcon size={28} color={stateColor} />}
    >

      {hasRoutineToday && routines.length > 0 ? (
        <>
          {}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Clock size={16} color={theme.colors.text.secondary} />
              <Text variant="body" style={styles.summaryText}>
                {routines.length} {routines.length === 1 ? 'séance prévue' : 'séances prévues'} • {getTotalDuration()} min
                totales
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <TrendingUp size={16} color={theme.colors.text.secondary} />
              <Text variant="body" style={styles.summaryText}>
                {t('home.dailyRoutine.progress')} : {getCompletedRoutinesCount()}/{routines.length}
                {getCompletedRoutinesCount() > 0 && ' ✅'}
              </Text>
            </View>
          </View>

          {}
          <View style={styles.routinesList}>
            {routines.slice(0, 3).map((routine, idx) => (
              <View
                key={routine.id}
                style={[
                  styles.routineItem,
                  routine.isCompleted && styles.routineItemCompleted
                ]}
              >
                <View style={styles.routineItemLeft}>
                  <View style={[
                    styles.routineNumber,
                    routine.isCompleted && styles.routineNumberCompleted
                  ]}>
                    {routine.isCompleted ? (
                      <CheckCircle size={20} color={theme.colors.success} />
                    ) : (
                      <Text style={styles.routineNumberText}>{idx + 1}</Text>
                    )}
                  </View>
                  <View style={styles.routineInfo}>
                    <Text
                      variant="body"
                      style={[
                        styles.routineItemName,
                        routine.isCompleted && styles.routineItemNameCompleted
                      ]}
                      numberOfLines={1}
                    >
                      {routine.name}
                    </Text>
                    {routine.estimatedDuration && (
                      <Text variant="caption" style={styles.routineItemDuration}>
                        {routine.estimatedDuration} min
                      </Text>
                    )}
                  </View>
                </View>
                {routine.isCompleted ? (
                  <View style={styles.statusIndicator}>
                    <Text style={styles.completedIcon}>✓</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.playButton}
                    onPress={() => router.push(`/screens/workout/session?routineId=${routine.id}`)}
                  >
                    <Play size={18} color="white" fill="white" />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </>
      ) : (
        <>
          {}
          <View style={styles.emptyStateContainer}>
            <Text variant="body" style={styles.emptyStateMessage}>
              {isCompleted
                ? t('home.dailyRoutine.sessionCompletedMessage')
                : t('home.dailyRoutine.noRoutineMessage')
              }
            </Text>
            {!isCompleted && (
              <TouchableOpacity
                style={styles.createRoutineButton}
                onPress={() => router.push('/screens/routines')}
                activeOpacity={0.7}
              >
                <Text style={styles.createRoutineButtonText}>
                  {t('home.dailyRoutine.createRoutine')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {}
          <Text variant="caption" style={styles.motivationalText}>
            {getMotivationalMessage()}
          </Text>
        </>
      )}
    </BaseCard>
  );
};

const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    summaryContainer: {
      backgroundColor: theme.colors.background.input,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      gap: theme.spacing.sm
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm
    },
    summaryText: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.fontSize.sm,
      flex: 1
    },
    routinesList: {
      gap: theme.spacing.md,
      marginBottom: theme.spacing.lg
    },
    routineItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.background.input,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      borderWidth: 0,
      ...theme.shadows.sm
    },
    routineItemCompleted: {
      opacity: 0.8 // Légèrement atténué mais pas trop
    },
    routineItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: theme.spacing.md
    },
    routineNumber: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      ...theme.shadows.sm
    },
    routineNumberCompleted: {
      backgroundColor: 'transparent'
    },
    routineNumberText: {
      color: 'white',
      fontFamily: theme.typography.fontFamily.bold,
      fontSize: theme.typography.fontSize.lg
    },
    routineInfo: {
      flex: 1
    },
    routineItemName: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.md,
      marginBottom: 2
    },
    routineItemNameCompleted: {
      color: theme.colors.text.secondary // Texte plus discret pour les terminées
    },
    routineItemDuration: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.fontSize.xs
    },
    playButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.md
    },
    statusIndicator: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center'
    },
    completedIcon: {
      fontSize: 24,
      color: theme.colors.success,
      fontFamily: theme.typography.fontFamily.bold
    },
    emptyStateContainer: {
      paddingVertical: theme.spacing.xl,
      alignItems: 'center'
    },
    emptyStateMessage: {
      color: theme.colors.text.primary,
      textAlign: 'center',
      fontSize: theme.typography.fontSize.md,
      lineHeight: 24,
      marginBottom: theme.spacing.lg
    },
    createRoutineButton: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.primary
    },
    createRoutineButtonText: {
      color: theme.colors.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.md
    },
    motivationalText: {
      color: theme.colors.text.secondary,
      textAlign: 'center',
      fontSize: theme.typography.fontSize.sm,
      fontStyle: 'italic',
      marginTop: theme.spacing.md
    }
  });
};

DailyRoutineCard.displayName = 'DailyRoutineCard';

export default React.memo(DailyRoutineCard);
