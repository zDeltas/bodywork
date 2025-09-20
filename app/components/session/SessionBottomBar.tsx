import React, { useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useCountdown } from '@/app/hooks/useCountdown';
import { useChrono } from '@/app/hooks/useChrono';
import { useWorkoutTimer } from '@/app/hooks/useWorkoutTimer';
import { useMotivation } from '@/app/hooks/useMotivation';
import Text from '@/app/components/ui/Text';
import TimerDisplay from './atoms/TimerDisplay';
import StatusChip from './atoms/StatusChip';

interface SessionBottomBarProps {
  isResting: boolean;
  restTime?: number;
  restType?: 'series' | 'exercise';
  isPreparation: boolean;
  preparationTime?: number;
  onRestComplete?: () => void;
  onPreparationComplete?: () => void;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  currentSeriesIndex: number;
  totalSeries: number;
  currentExerciseIndex: number;
  totalExercises: number;
}

export const BOTTOM_BAR_HEIGHT = 220;

const SessionBottomBar = React.memo<SessionBottomBarProps>(({
                                                              isResting,
                                                              restTime = 0,
                                                              restType,
                                                              isPreparation,
                                                              preparationTime = 0,
                                                              onRestComplete,
                                                              onPreparationComplete,
                                                              onPrevious,
                                                              onNext,
                                                              canGoPrevious,
                                                              canGoNext,
                                                              currentSeriesIndex,
                                                              totalSeries,
                                                              currentExerciseIndex,
                                                              totalExercises
                                                            }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles(theme);

  // Référence pour détecter le changement d'état du repos et de la préparation
  const prevIsRestingRef = useRef(isResting);
  const prevIsPreparationRef = useRef(isPreparation);

  // Hooks optimisés
  const restTimer = useCountdown({
    initialTime: restTime,
    onComplete: onRestComplete,
    autoStart: false
  });

  const preparationTimer = useCountdown({
    initialTime: preparationTime,
    onComplete: onPreparationComplete,
    autoStart: false
  });

  const workoutTimer = useWorkoutTimer();

  // Chrono par série qui redémarre à 0 pour chaque nouvelle série
  const seriesTimer = useChrono({
    initialTime: 0,
    autoStart: false
  });

  const { motivationalText } = useMotivation({
    currentExerciseIndex,
    currentSeriesIndex,
    totalExercises,
    totalSeries,
    isResting
  });

  const handleAdjustTime = (delta: number) => {
    if (isResting) {
      restTimer.adjustTime(delta);
    } else if (isPreparation) {
      preparationTimer.adjustTime(delta);
    }
  };

  // Gestion des timers
  useEffect(() => {
    if (isResting && restTime > 0) {
      restTimer.reset(restTime);
      restTimer.start();
    } else {
      restTimer.pause();
    }
  }, [isResting, restTime]);

  useEffect(() => {
    if (isPreparation && preparationTime > 0) {
      preparationTimer.reset(preparationTime);
      preparationTimer.start();
    } else {
      preparationTimer.pause();
    }
  }, [isPreparation, preparationTime]);

  useEffect(() => {
    if (!isResting && !isPreparation) {
      workoutTimer.start();
    } else {
      workoutTimer.pause();
    }
  }, [isResting, isPreparation]);

  // Gestion unifiée du timer de série d'exercice
  useEffect(() => {
    const isExercising = !isResting && !isPreparation;
    
    // Démarrer le timer si on est en exercice et qu'il n'est pas actif
    if (isExercising && !seriesTimer.isActive) {
      seriesTimer.start();
    }
    // Arrêter le timer si on n'est plus en exercice et qu'il est actif
    else if (!isExercising && seriesTimer.isActive) {
      seriesTimer.pause();
    }
  }, [isResting, isPreparation]);

  // Réinitialiser le chrono à chaque nouvelle série
  useEffect(() => {
    seriesTimer.reset(0);
    // Si on n'est pas en repos ni en préparation, démarrer immédiatement
    if (!isResting && !isPreparation) {
      seriesTimer.start();
    }
  }, [currentSeriesIndex]);


  return (
    <View style={styles.container}>
      <View style={styles.chipSection}>
        <StatusChip
          isResting={isResting}
          isPreparation={isPreparation}
          restText={restType === 'exercise' ? t('session.restBetweenExercises') : t('session.restNow')}
          preparationText={t('session.preparationNow')}
          exerciseText={t('session.exerciseNow')}
          restType={restType}
        />
      </View>

      <View style={styles.motivationSection}>
        <Text
          style={[
            styles.motivationText,
            isResting && styles.motivationTextResting
          ]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {motivationalText}
        </Text>
      </View>

      <View style={styles.timerSection}>
        <View style={[styles.timerRow, !isResting && !isPreparation && styles.timerRowCentered]}>
          {(isResting || isPreparation) && (
            <TouchableOpacity
              onPress={() => handleAdjustTime(-5)}
              disabled={(isResting && restTimer.time < 5) || (isPreparation && preparationTimer.time < 5)}
              style={[styles.adjustButton, ((isResting && restTimer.time < 5) || (isPreparation && preparationTimer.time < 5)) && styles.buttonDisabled]}
            >
              <Text style={styles.adjustButtonText}>-5s</Text>
            </TouchableOpacity>
          )}

          <TimerDisplay
            time={isPreparation ? preparationTimer.time : (isResting ? restTimer.time : seriesTimer.time)}
            isActive={isPreparation ? preparationTimer.isActive : (isResting ? restTimer.isActive : seriesTimer.isActive)}
            isResting={isResting}
            isPreparation={isPreparation}
            onToggle={isPreparation ? preparationTimer.toggle : (isResting ? restTimer.toggle : undefined)}
            showToggleButton={isResting || isPreparation}
            formatTime={isPreparation ? preparationTimer.formatTime : (isResting ? restTimer.formatTime : seriesTimer.formatTime)}
          />

          {(isResting || isPreparation) && (
            <TouchableOpacity
              onPress={() => handleAdjustTime(5)}
              style={styles.adjustButton}
            >
              <Text style={styles.adjustButtonText}>+5s</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.navigationSection}>
        <TouchableOpacity
          onPress={onPrevious}
          disabled={!canGoPrevious}
          style={[styles.prevButton, !canGoPrevious && styles.buttonDisabled]}
        >
          <ChevronLeft size={20} color={canGoPrevious ? theme.colors.text.primary : theme.colors.text.disabled} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNext}
          disabled={!canGoNext}
          style={[styles.nextButton, !canGoNext && styles.buttonDisabled]}
        >
          <Text style={styles.nextButtonText}>
            {isResting ? t('session.skipRest') : t('session.next')}
          </Text>
          <ChevronRight size={20} color={theme.colors.background.main} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const useStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.card,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.default,
    minHeight: 140,
    ...theme.shadows.sm
  },
  chipSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.sm
  },
  motivationSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md
  },
  motivationText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text.primary,
    textAlign: 'center',
    lineHeight: theme.typography.fontSize.lg * 1.3
  },
  motivationTextResting: {
    color: theme.colors.primary
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    width: '100%'
  },
  timerRowCentered: {
    justifyContent: 'center'
  },
  adjustButton: {
    backgroundColor: theme.colors.background.input,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: Math.max(4, theme.spacing.xs),
    minWidth: 50,
    alignItems: 'center'
  },
  adjustButtonText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600'
  },
  navigationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  prevButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.background.main
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.spacing.md,
    flex: 1,
    marginLeft: theme.spacing.md,
    justifyContent: 'center',
    gap: theme.spacing.sm
  },
  nextButtonText: {
    color: theme.colors.background.main,
    fontWeight: '600',
    fontSize: theme.typography.fontSize.md
  },
  buttonDisabled: {
    opacity: 0.5
  }
});

SessionBottomBar.displayName = 'SessionBottomBar';

export default SessionBottomBar;
