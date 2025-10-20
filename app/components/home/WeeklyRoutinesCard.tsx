import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Calendar, CheckCircle, Clock, Target, Sun, Check, X, Circle } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import { router } from 'expo-router';
import Text from '@/app/components/ui/Text';
import { DayOfWeek } from '@/types/common';
import { format, startOfWeek, addDays, isSameDay, isAfter, endOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface WeeklyRoutineData {
  id: string;
  name: string;
  mainMuscleGroup: string;
  estimatedDuration: number;
  isCompleted: boolean;
  isMissed: boolean;
}

export interface WeeklyRoutinesCardProps {
  weeklyRoutines: {
    [key: string]: WeeklyRoutineData[]; // key = YYYY-MM-DD, value = routines for that day
  };
  weeklyTarget: number; // nombre de séances prévues dans la semaine
  completedThisWeek: number;
  onPress?: () => void;
  onDayPress?: (date: string, routines: WeeklyRoutineData[]) => void;
}

const WeeklyRoutinesCard: React.FC<WeeklyRoutinesCardProps> = ({
  weeklyRoutines,
  weeklyTarget,
  completedThisWeek,
  onPress,
  onDayPress
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles();

  // Calculer les dates de la semaine (lundi à dimanche)
  const weekDates = useMemo(() => {
    const today = new Date();
    const monday = startOfWeek(today, { weekStartsOn: 1 }); // 1 = lundi
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  }, []);

  // Obtenir les initiales des jours
  const getDayInitial = (date: Date) => {
    return format(date, 'EEEEEE', { locale: fr }).toUpperCase(); // L, M, M, J, V, S, D
  };

  // Obtenir le statut d'un jour
  const getDayStatus = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayRoutines = weeklyRoutines[dateKey] || [];
    const today = new Date();
    const isToday = isSameDay(date, today);
    const isPast = isAfter(today, endOfDay(date));

    if (dayRoutines.length === 0) {
      return { type: 'rest', color: theme.colors.text.secondary, IconComponent: Sun };
    }

    const completedCount = dayRoutines.filter(r => r.isCompleted).length;
    const totalCount = dayRoutines.length;

    if (completedCount === totalCount) {
      return { type: 'completed', color: theme.colors.success, IconComponent: Check };
    } else if (isPast && completedCount < totalCount) {
      return { type: 'missed', color: theme.colors.error, IconComponent: X };
    } else if (isToday && completedCount < totalCount) {
      return { type: 'today', color: '#4CC9F0', IconComponent: Circle };
    } else {
      return { type: 'planned', color: theme.colors.text.secondary, IconComponent: Circle };
    }
  };

  // Messages motivationnels selon la progression
  const getWeeklyMessage = () => {
    const remaining = weeklyTarget - completedThisWeek;
    const today = new Date();
    const isSunday = today.getDay() === 0;
    const isWeekEnd = today.getDay() >= 6; // Samedi ou dimanche

    if (completedThisWeek >= weeklyTarget) {
      if (isWeekEnd) {
        return t('home.weeklyRoutines.weekCompleted');
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

  // Bouton d'action selon le contexte
  const getActionButton = () => {
    const today = new Date();
    const isSunday = today.getDay() === 0;
    const isWeekEnd = today.getDay() >= 6;

    if (completedThisWeek >= weeklyTarget && isWeekEnd) {
      return {
        text: t('home.weeklyRoutines.planNextWeek'),
        action: () => router.push('/screens/routines')
      };
    } else {
      return {
        text: t('home.weeklyRoutines.viewRoutines'),
        action: () => router.push('/screens/routines')
      };
    }
  };

  const actionButton = getActionButton();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Calendar size={28} color="#4CC9F0" />
          <View style={styles.headerTextContainer}>
            <Text variant="subheading" style={styles.title}>
              {t('home.weeklyRoutines.title')}
            </Text>
          </View>
        </View>
      </View>

      {/* Grille des 7 jours */}
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
                { borderColor: status.color }
              ]}
              onPress={() => onDayPress?.(dateKey, dayRoutines)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayInitial, { color: status.color }]}>
                {getDayInitial(date)}
              </Text>
              <View style={styles.dayIcon}>
                <status.IconComponent size={14} color={status.color} />
              </View>
              {dayRoutines.length > 0 && (
                <Text style={[styles.dayCount, { color: status.color }]}>
                  {dayRoutines.length}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Résumé de progression */}
      <View style={styles.progressContainer}>
        <View style={styles.progressRow}>
          <Target size={16} color={theme.colors.text.secondary} />
          <Text style={styles.progressText}>
            {t('home.weeklyRoutines.weekProgress', { completed: completedThisWeek, target: weeklyTarget })}
          </Text>
        </View>
        
        {/* Barre de progression */}
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${Math.min((completedThisWeek / weeklyTarget) * 100, 100)}%`,
                backgroundColor: completedThisWeek >= weeklyTarget ? theme.colors.success : '#4CC9F0'
              }
            ]} 
          />
        </View>
      </View>

      {/* Séparateur */}
      <View style={styles.separator} />

      {/* Message motivationnel */}
      <Text variant="caption" style={styles.motivationalText}>
        {getWeeklyMessage()}
      </Text>

      {/* Bouton d'action */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={actionButton.action}
        activeOpacity={0.8}
      >
        <Text style={styles.actionButtonText}>
          {actionButton.text}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const useStyles = () => {
  const { theme } = useTheme();
  
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background.card,
      borderRadius: 24,
      padding: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
      ...theme.shadows.sm,
      borderWidth: 1,
      borderColor: theme.colors.background.input
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.lg
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md
    },
    headerTextContainer: {
      flex: 1
    },
    title: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.bold,
      fontSize: theme.typography.fontSize.xl
    },
    weekGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.lg,
      gap: theme.spacing.xs
    },
    dayButton: {
      flex: 1,
      aspectRatio: 1,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background.main,
      minHeight: 60
    },
    dayInitial: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.semiBold,
      marginBottom: 2
    },
    dayIcon: {
      marginBottom: 2,
      alignItems: 'center',
      justifyContent: 'center'
    },
    dayCount: {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.bold
    },
    progressContainer: {
      marginBottom: theme.spacing.md
    },
    progressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm
    },
    progressText: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.fontSize.sm,
      flex: 1
    },
    progressBar: {
      height: 8,
      backgroundColor: theme.colors.background.input,
      borderRadius: 4,
      overflow: 'hidden'
    },
    progressFill: {
      height: '100%',
      borderRadius: 4
    },
    separator: {
      height: 1,
      backgroundColor: theme.colors.background.input,
      marginVertical: theme.spacing.md
    },
    motivationalText: {
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
      fontStyle: 'italic'
    },
    actionButton: {
      backgroundColor: theme.colors.background.button,
      borderRadius: theme.borderRadius.lg,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.background.input
    },
    actionButtonText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.md
    }
  });
};

WeeklyRoutinesCard.displayName = 'WeeklyRoutinesCard';

export default React.memo(WeeklyRoutinesCard);
