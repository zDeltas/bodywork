import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Calendar, CheckCircle, Clock, Play, Rocket, Check } from 'lucide-react-native';
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

  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true
    }).start();
  }, []);

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
      return CheckCircle;
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
    <Animated.View style={{ opacity: fadeAnim }}>
      <BaseCard
        title={t('home.dailyRoutine.title')}
        icon={<StateIcon size={28} color={stateColor} />}
        style={hasRoutineToday && !isCompleted ? styles.highlightCard : undefined}
      >
        {hasRoutineToday && routines.length > 0 ? (
          <>
            {/* Résumé compact */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryText}>
                {getCompletedRoutinesCount()}/{routines.length} {routines.length === 1 ? 'séance' : 'séances'} • {getTotalDuration()} min
              </Text>
            </View>

            {/* Liste des Routines */}
            <View style={styles.routinesList}>
              {routines.slice(0, 3).map((routine, idx) => (
                <TouchableOpacity
                  key={routine.id}
                  style={[
                    styles.routineItem,
                    routine.isCompleted && styles.routineItemCompleted
                  ]}
                  onPress={() => !routine.isCompleted && router.push(`/screens/workout/session?routineId=${routine.id}`)}
                  activeOpacity={routine.isCompleted ? 1 : 0.7}
                  disabled={routine.isCompleted}
                >
                  <View style={styles.routineItemContent}>
                    <Text
                      style={[
                        styles.routineItemName,
                        routine.isCompleted && styles.routineItemNameCompleted
                      ]}
                      numberOfLines={1}
                    >
                      {routine.name}
                    </Text>
                    {routine.estimatedDuration && (
                      <View style={styles.durationRow}>
                        <Clock size={14} color={theme.colors.text.secondary} />
                        <Text style={styles.routineItemDuration}>
                          {routine.estimatedDuration} min
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  {routine.isCompleted ? (
                    <View style={[styles.statusBadge, styles.statusBadgeCompleted]}>
                      <Check size={16} color={theme.colors.success} strokeWidth={2.5} />
                    </View>
                  ) : (
                    <View style={[styles.statusBadge, styles.statusBadgePending]}>
                      <Play size={16} color="#4CC9F0" fill="#4CC9F0" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

          </>
        ) : (
          <>
            {/* État Vide */}
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
            {/* Message Motivationnel */}
            <Text variant="caption" style={styles.motivationalText}>
              {getMotivationalMessage()}
            </Text>
          </>
        )}
      </BaseCard>
    </Animated.View>
  );
};

const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    // Bordure gauche highlight
    highlightCard: {
      borderLeftWidth: 3,
      borderLeftColor: '#4CC9F0'
    },
    
    // Résumé compact
    summaryContainer: {
      marginBottom: theme.spacing.lg
    },
    summaryText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
      color: theme.colors.text.secondary,
      textAlign: 'center'
    },

    // Liste des Routines
    routinesList: {
      gap: theme.spacing.sm
    },
    routineItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderWidth: 1.5,
      borderColor: theme.colors.text.secondary + '30'
    },
    routineItemCompleted: {
      opacity: 0.6,
      borderColor: theme.colors.text.secondary + '20'
    },
    routineItemContent: {
      flex: 1,
      marginRight: theme.spacing.md
    },
    routineItemName: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
      color: theme.colors.text.primary,
      marginBottom: 4
    },
    routineItemNameCompleted: {
      color: theme.colors.text.secondary,
      textDecorationLine: 'line-through'
    },
    durationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4
    },
    routineItemDuration: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text.secondary
    },
    statusBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center'
    },
    statusBadgeCompleted: {
      backgroundColor: theme.colors.success + '20'
    },
    statusBadgePending: {
      backgroundColor: '#4CC9F0' + '20'
    },

    // État Vide
    emptyStateContainer: {
      paddingVertical: theme.spacing.xl * 1.5,
      alignItems: 'center'
    },
    emptyStateMessage: {
      color: theme.colors.text.primary,
      textAlign: 'center',
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.regular,
      lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
      marginBottom: theme.spacing.xl
    },
    createRoutineButton: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: '#4CC9F0' + '15',
      borderWidth: 1.5,
      borderColor: '#4CC9F0'
    },
    createRoutineButtonText: {
      color: '#4CC9F0',
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.base
    },
    motivationalText: {
      color: theme.colors.text.secondary,
      textAlign: 'center',
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      fontStyle: 'italic',
      marginTop: theme.spacing.lg
    }
  });
};

DailyRoutineCard.displayName = 'DailyRoutineCard';

export default React.memo(DailyRoutineCard);
