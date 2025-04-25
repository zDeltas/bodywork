import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { Inter_400Regular, Inter_600SemiBold, useFonts } from '@expo-google-fonts/inter';
import { Minus, Pause, Play, Plus, RotateCcw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from '@/hooks/useTranslation';
import theme, { colors, typography, spacing, borderRadius } from '@/app/theme/theme';

interface TimerProps {
  initialTime?: number;
  mode?: 'timer' | 'stopwatch';
  onComplete?: () => void;
  sets?: number;
  restTime?: number;
  exerciseName?: string;
}

export default function Timer({
                                initialTime = 60,
                                mode = 'timer',
                                onComplete,
                                sets = 1,
                                restTime = 60,
                                exerciseName = 'Exercise'
                              }: TimerProps) {
  const { t } = useTranslation();
  const [workTime, setWorkTime] = useState(mode === 'timer' ? initialTime : 0);
  const [restTimeState, setRestTimeState] = useState(restTime);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold
  });

  const handleWorkComplete = useCallback(() => {
    if (mode === 'timer') {
      Vibration.vibrate([0, 500, 200, 500]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsRunning(true);
    }
  }, [mode]);

  const handleRestComplete = useCallback(() => {
    Vibration.vibrate([0, 500, 200, 500]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (currentSet < sets) {
      setCurrentSet(prev => prev + 1);
      setIsRunning(true);
    } else {
      onComplete?.();
      setIsRunning(false);
    }
  }, [currentSet, sets, onComplete]);

  useEffect(() => {
    if (!isRunning) {
      setWorkTime(mode === 'timer' ? initialTime : 0);
      setRestTimeState(restTime);
    }
  }, [initialTime, restTime, isRunning, mode]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        if (isResting) {
          setRestTimeState(prev => {
            if (prev <= 1) {
              setIsRunning(false);
              setIsResting(false);
              handleRestComplete();
              return restTime;
            }
            return prev - 1;
          });
        } else {
          if (mode === 'timer') {
            setWorkTime(prev => {
              if (prev <= 1) {
                setIsRunning(false);
                setIsResting(true);
                handleWorkComplete();
                return initialTime;
              }
              return prev - 1;
            });
          } else { // mode stopwatch
            setWorkTime(prev => prev + 1);
          }
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, isResting, initialTime, restTime, mode, handleWorkComplete, handleRestComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = useCallback(() => {
    setIsRunning((prev) => !prev);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setIsResting(false);
    setCurrentSet(1);
    setWorkTime(mode === 'timer' ? initialTime : 0);
    setRestTimeState(restTime);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [initialTime, restTime, mode]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.exerciseName}>{exerciseName}</Text>
      </View>

      <View style={styles.setsContainer}>
        <Text style={styles.setsLabel}>{t('sets')}</Text>
        <View style={styles.setsControls}>
          <Text style={styles.setsValue}>{currentSet} / {sets}</Text>
        </View>
      </View>

      <View style={[
        styles.timerDisplayContainer,
        isResting ? styles.restTimer : styles.workTimer
      ]}>
        <Text style={styles.timerLabel}>
          {isResting ? t('restTime') : (mode === 'timer' ? t('workTime') : t('stopwatch'))}
        </Text>
        <Text style={styles.time}>
          {formatTime(isResting ? restTimeState : workTime)}
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={resetTimer}
        >
          <RotateCcw color={colors.text.primary} size={24} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, isRunning ? styles.stopButton : styles.startButton]}
          onPress={toggleTimer}
        >
          {isRunning ? (
            <Pause color={colors.text.primary} size={32} />
          ) : (
            <Play color={colors.text.primary} size={32} />
          )}
        </TouchableOpacity>
        <View style={styles.buttonPlaceholder} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    width: '100%',
    ...theme.shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.sm,
  },
  exerciseName: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  setsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  setsLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  setsControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  setsValue: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    minWidth: 60,
    textAlign: 'center',
  },
  timerDisplayContainer: {
    width: '100%',
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  workTimer: {
    backgroundColor: colors.success,
  },
  restTimer: {
    backgroundColor: colors.error,
  },
  timerLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  time: {
    fontSize: typography.fontSize['4xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginTop: spacing.md,
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  },
  startButton: {
    backgroundColor: colors.primary,
  },
  stopButton: {
    backgroundColor: colors.error,
  },
  resetButton: {
    backgroundColor: colors.background.button,
  },
  buttonPlaceholder: {
    width: 70,
  },
});
