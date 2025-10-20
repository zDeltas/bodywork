import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Calendar, Check, Circle, Flame, Minus, Target, Trophy, X, Zap } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import { router } from 'expo-router';
import Text from '@/app/components/ui/Text';
import BaseCard from '@/app/components/home/BaseCard';
import { addDays, endOfDay, format, isAfter, isSameDay, startOfWeek } from 'date-fns';

export interface WeeklyRoutineData {
  id: string;
  name: string;
  mainMuscleGroup: string;
  estimatedDuration: number;
  isCompleted: boolean;
  isMissed: boolean;
}

export interface WeeklyChallengeData {
  challengeType: 'sessions' | 'volume' | 'muscle_group';
  current: number;
  target: number;
  progress: number;
  daysRemaining: number;
  sessionsRemaining?: number;
  challengeDescription: string;
  isCompleted: boolean;
  specialMessage?: string;
}

export interface WeeklyChallengeRoutinesCardProps {
  weeklyRoutines: {
    [key: string]: WeeklyRoutineData[];
  };
  weeklyTarget: number;
  completedThisWeek: number;

  weeklyChallenge: WeeklyChallengeData;

  onPress?: () => void;
  onDayPress?: (date: string, routines: WeeklyRoutineData[]) => void;
}

const WeeklyChallengeRoutinesCard: React.FC<WeeklyChallengeRoutinesCardProps> = ({
                                                                                   weeklyRoutines,
                                                                                   weeklyTarget,
                                                                                   completedThisWeek,
                                                                                   weeklyChallenge,
                                                                                   onPress,
                                                                                   onDayPress
                                                                                 }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles();

  const weekDates = useMemo(() => {
    const today = new Date();
    const monday = startOfWeek(today, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  }, []);

  const getDayInitial = (date: Date) => {
    const dayNames = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    return dayNames[date.getDay()];
  };

  const getDayStatus = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayRoutines = weeklyRoutines[dateKey] || [];
    const today = new Date();
    const isToday = isSameDay(date, today);
    const isPast = isAfter(today, endOfDay(date));

    if (dayRoutines.length === 0) {
      return {
        type: 'rest',
        color: theme.colors.text.secondary,
        backgroundColor: 'transparent',
        borderStyle: 'dashed' as const
      };
    }

    const completedCount = dayRoutines.filter(r => r.isCompleted).length;
    const totalCount = dayRoutines.length;

    if (completedCount === totalCount) {
      return {
        type: 'completed',
        color: theme.colors.success,
        backgroundColor: theme.colors.success + '15',
        borderStyle: 'solid' as const
      };
    } else if (isPast && completedCount < totalCount) {
      return {
        type: 'missed',
        color: theme.colors.error,
        backgroundColor: theme.colors.error + '10',
        borderStyle: 'solid' as const
      };
    } else if (isToday && completedCount < totalCount) {
      return {
        type: 'today',
        color: '#4CC9F0',
        backgroundColor: '#4CC9F0' + '20',
        borderStyle: 'solid' as const
      };
    } else {
      return {
        type: 'planned',
        color: theme.colors.text.secondary,
        backgroundColor: 'transparent',
        borderStyle: 'solid' as const
      };
    }
  };

  const getChallengeIcon = () => {
    if (weeklyChallenge.isCompleted) return Trophy;
    if (weeklyChallenge.progress >= 0.5) return Flame;
    return Zap;
  };

  const getChallengeColor = () => {
    if (weeklyChallenge.isCompleted) return theme.colors.success;
    if (weeklyChallenge.progress >= 0.5) return '#4CC9F0';
    return theme.colors.warning;
  };

  const getChallengeMessage = () => {
    const { progress, isCompleted, daysRemaining } = weeklyChallenge;

    if (isCompleted) {
      return t('home.weeklyChallenge.messages.conquered');
    } else if (progress >= 0.8) {
      return t('home.weeklyChallenge.messages.final');
    } else if (progress >= 0.5) {
      return t('home.weeklyChallenge.messages.close');
    } else if (progress >= 0.2) {
      return t('home.weeklyChallenge.messages.halfway');
    } else {
      return t('home.weeklyChallenge.messages.begin');
    }
  };

  const getRoutinesMessage = () => {
    const remaining = weeklyTarget - completedThisWeek;
    const today = new Date();
    const isSunday = today.getDay() === 0;
    const isWeekEnd = today.getDay() >= 6;

    if (completedThisWeek >= weeklyTarget) {
      if (isWeekEnd) {
        return t('home.weeklyRoutines.weekCompleted', { completed: completedThisWeek, target: weeklyTarget });
      } else {
        return t('home.weeklyRoutines.targetReached');
      }
    } else if (remaining === 1) {
      return t('home.weeklyRoutines.oneMore');
    } else if (remaining === 2) {
      return t('home.weeklyRoutines.twoMore');
    } else if (isSunday) {
      return t('home.weeklyRoutines.weekEnded');
    } else {
      return t('home.weeklyRoutines.keepGoing', { remaining });
    }
  };

  const getActionButton = () => {
    const today = new Date();
    const isSunday = today.getDay() === 0;
    const isWeekEnd = today.getDay() >= 6;

    if (weeklyChallenge.isCompleted && completedThisWeek >= weeklyTarget && isWeekEnd) {
      return {
        text: t('home.weeklyRoutines.planNextWeek'),
        action: () => router.push('/screens/routines')
      };
    } else {
      return {
        text: t('home.weeklyRoutines.viewProgramming'),
        action: () => router.push('/screens/weekly-programming')
      };
    }
  };

  const actionButton = getActionButton();
  const ChallengeIcon = getChallengeIcon();
  const challengeColor = getChallengeColor();

  return (
    <BaseCard
      title={t('home.weeklyChallenge.title')}
      subtitle={weeklyChallenge.challengeDescription}
      icon={<ChallengeIcon size={28} color={challengeColor} />}
      headerRight={
        <View style={[styles.challengeBadge, { backgroundColor: challengeColor + '20' }]}>
          <Text style={[styles.challengeProgress, { color: challengeColor }]}>
            {Math.round(weeklyChallenge.progress * 100)}%
          </Text>
        </View>
      }
    >

      {}
      <View style={styles.weekGrid}>
        {weekDates.map((date, index) => {
          const status = getDayStatus(date);
          const dateKey = format(date, 'yyyy-MM-dd');
          const dayRoutines = weeklyRoutines[dateKey] || [];

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayButton,
                {
                  borderColor: status.color,
                  backgroundColor: status.backgroundColor,
                  borderStyle: status.borderStyle
                }
              ]}
              onPress={() => onDayPress?.(dateKey, dayRoutines)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayInitial, { color: status.color }]}>
                {getDayInitial(date)}
              </Text>

              {}
              {dayRoutines.length > 0 ? (
                <View style={styles.statusIcon}>
                  {status.type === 'completed' ? <Check size={14} color={status.color} strokeWidth={3} /> :
                    status.type === 'missed' ? <X size={14} color={status.color} strokeWidth={3} /> :
                      <Circle size={12} color={status.color} strokeWidth={2} />}
                </View>
              ) : (
                <View style={styles.statusIcon}>
                  <Minus size={14} color={status.color} strokeWidth={2} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {}
      <View style={styles.progressSection}>
        {}
        <View style={styles.challengeRow}>
          <Target size={16} color={challengeColor} />
          <Text style={styles.challengeText}>
            {t('home.weeklyChallenge.microCopy', {
              current: weeklyChallenge.current,
              target: weeklyChallenge.target,
              unit: t(`home.weeklyChallenge.units.${weeklyChallenge.challengeType}`),
              days: weeklyChallenge.daysRemaining
            })}
          </Text>
        </View>

        {}
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(weeklyChallenge.progress * 100, 100)}%`,
                backgroundColor: challengeColor
              }
            ]}
          />
        </View>

        {}
        <View style={styles.routinesRow}>
          <Calendar size={16} color={theme.colors.text.secondary} />
          <Text style={styles.routinesText}>
            {t('home.weeklyRoutines.weekProgress', { completed: completedThisWeek, target: weeklyTarget })}
          </Text>
        </View>
      </View>

      {}
      <View style={styles.separator} />

      {}
      <View style={styles.messagesContainer}>
        <Text variant="caption" style={[styles.challengeMessage, { color: challengeColor }]}>
          {getChallengeMessage()}
        </Text>
        <Text variant="caption" style={styles.routinesMessage}>
          {getRoutinesMessage()}
        </Text>
      </View>

      {}
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: challengeColor + '15', borderColor: challengeColor + '30' }]}
        onPress={actionButton.action}
        activeOpacity={0.8}
      >
        <Text style={[styles.actionButtonText, { color: challengeColor }]}>
          {actionButton.text}
        </Text>
      </TouchableOpacity>
    </BaseCard>
  );
};

const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    challengeBadge: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1
    },
    challengeProgress: {
      fontSize: theme.typography.fontSize.md,
      fontFamily: theme.typography.fontFamily.bold
    },
    weekGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.lg + 4,
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xs
    },
    dayButton: {
      flex: 1,
      aspectRatio: 1,
      borderRadius: 12,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background.card,
      minHeight: 56,
    },
    dayInitial: {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.bold,
      marginBottom: 2,
      letterSpacing: 0.5
    },
    statusIcon: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2
    },
    progressSection: {
      gap: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xs
    },
    challengeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm
    },
    challengeText: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      flex: 1
    },
    progressBar: {
      height: 12,
      backgroundColor: theme.colors.background.input,
      borderRadius: 6,
      overflow: 'hidden'
    },
    progressFill: {
      height: '100%',
      borderRadius: 6
    },
    routinesRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm
    },
    routinesText: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.fontSize.sm,
      flex: 1
    },
    separator: {
      height: 1,
      backgroundColor: theme.colors.background.input,
      marginVertical: theme.spacing.md
    },
    messagesContainer: {
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
      paddingHorizontal: theme.spacing.sm
    },
    challengeMessage: {
      textAlign: 'center',
      fontFamily: theme.typography.fontFamily.semiBold
    },
    routinesMessage: {
      color: theme.colors.text.secondary,
      textAlign: 'center',
      fontStyle: 'italic'
    },
    actionButton: {
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      alignItems: 'center',
      borderWidth: 1
    },
    actionButtonText: {
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.md
    }
  });
};

WeeklyChallengeRoutinesCard.displayName = 'WeeklyChallengeRoutinesCard';

export default React.memo(WeeklyChallengeRoutinesCard);
