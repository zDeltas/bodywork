import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Calendar, Target, Trophy, Flame, Zap } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import { router } from 'expo-router';
import Text from '@/app/components/ui/Text';
import BaseCard from '@/app/components/home/BaseCard';
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

export interface WeeklyChallengeData {
  challengeType: 'sessions' | 'volume' | 'muscle_group';
  current: number;
  target: number;
  progress: number; // 0-1
  daysRemaining: number;
  sessionsRemaining?: number;
  challengeDescription: string;
  isCompleted: boolean;
  specialMessage?: string;
}

export interface WeeklyChallengeRoutinesCardProps {
  // Données des routines planifiées
  weeklyRoutines: {
    [key: string]: WeeklyRoutineData[]; // key = YYYY-MM-DD, value = routines for that day
  };
  weeklyTarget: number;
  completedThisWeek: number;
  
  // Données du défi hebdomadaire
  weeklyChallenge: WeeklyChallengeData;
  
  // Callbacks
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

  // Calculer les dates de la semaine (lundi à dimanche)
  const weekDates = useMemo(() => {
    const today = new Date();
    const monday = startOfWeek(today, { weekStartsOn: 1 }); // 1 = lundi
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  }, []);

  // Obtenir une seule lettre par jour
  const getDayInitial = (date: Date) => {
    const dayNames = ['D', 'L', 'M', 'M', 'J', 'V', 'S']; // Dimanche, Lundi, Mardi, Mercredi, Jeudi, Vendredi, Samedi
    return dayNames[date.getDay()];
  };

  // Obtenir le statut d'un jour
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

  // Icône du défi selon la progression
  const getChallengeIcon = () => {
    if (weeklyChallenge.isCompleted) return Trophy;
    if (weeklyChallenge.progress >= 0.5) return Flame;
    return Zap;
  };

  // Couleur du défi selon la progression
  const getChallengeColor = () => {
    if (weeklyChallenge.isCompleted) return theme.colors.success;
    if (weeklyChallenge.progress >= 0.5) return '#4CC9F0';
    return theme.colors.warning;
  };

  // Messages du défi selon la progression
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

  // Messages motivationnels selon la progression des routines
  const getRoutinesMessage = () => {
    const remaining = weeklyTarget - completedThisWeek;
    const today = new Date();
    const isSunday = today.getDay() === 0;
    const isWeekEnd = today.getDay() >= 6; // Samedi ou dimanche

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

  // Bouton d'action selon le contexte
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
              
              {/* Indicateur de statut avec caractères */}
              {dayRoutines.length > 0 ? (
                <Text style={[styles.statusCharacter, { color: status.color }]}>
                  {status.type === 'completed' ? '✓' : 
                   status.type === 'missed' ? '✗' : 
                   status.type === 'today' ? '○' : '○'}
                </Text>
              ) : (
                <Text style={[styles.statusCharacter, { color: status.color }]}>
                  −
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Section défi et progression */}
      <View style={styles.progressSection}>
        {/* Défi hebdomadaire */}
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

        {/* Barre de progression du défi */}
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

        {/* Progression des routines */}
        <View style={styles.routinesRow}>
          <Calendar size={16} color={theme.colors.text.secondary} />
          <Text style={styles.routinesText}>
            {t('home.weeklyRoutines.weekProgress', { completed: completedThisWeek, target: weeklyTarget })}
          </Text>
        </View>
      </View>

      {/* Séparateur */}
      <View style={styles.separator} />

      {/* Messages motivationnels */}
      <View style={styles.messagesContainer}>
        <Text variant="caption" style={[styles.challengeMessage, { color: challengeColor }]}>
          {getChallengeMessage()}
        </Text>
        <Text variant="caption" style={styles.routinesMessage}>
          {getRoutinesMessage()}
        </Text>
      </View>

      {/* Bouton d'action */}
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
      marginBottom: theme.spacing.lg + 4, // Plus d'espace après la grille
      gap: theme.spacing.sm, // Gap plus généreux entre les boutons
      paddingHorizontal: theme.spacing.xs // Padding horizontal pour la grille
    },
    dayButton: {
      flex: 1,
      aspectRatio: 1,
      borderRadius: 12, // Moins arrondi, plus carré
      borderWidth: 1.5, // Bordure plus fine
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background.card,
      minHeight: 56, // Légèrement plus petit
      ...theme.shadows.xs // Ombre subtile
    },
    dayInitial: {
      fontSize: theme.typography.fontSize.xs,
      fontFamily: theme.typography.fontFamily.bold,
      marginBottom: 2,
      letterSpacing: 0.5 // Espacement des lettres pour un look plus moderne
    },
    statusCharacter: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.bold,
      lineHeight: theme.typography.fontSize.lg + 2
    },
    progressSection: {
      gap: theme.spacing.md,
      marginBottom: theme.spacing.lg, // Plus d'espace après la section progression
      paddingHorizontal: theme.spacing.xs // Padding horizontal pour la section
    },
    challengeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm
    },
    challengeText: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.medium,
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
      paddingHorizontal: theme.spacing.sm // Padding pour les messages
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
