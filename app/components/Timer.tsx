import React, { useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, Vibration, View } from 'react-native';
import {
  Inter_400Regular as InterRegular,
  Inter_600SemiBold as InterSemiBold,
  useFonts
} from '@expo-google-fonts/inter';
import { Minus, Pause, Play, Plus, RotateCcw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/hooks/useTheme';
import Text from './ui/Text';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface TimerProps {
  initialTime?: number;
  mode?: 'timer' | 'stopwatch';
  onComplete?: () => void;
  sets?: number;
  restTime?: number;
  exerciseName?: string;
  onSetsChange?: (sets: number) => void;
}

export default function Timer({
                                initialTime = 60,
                                mode = 'timer',
                                onComplete,
                                sets = 1,
                                restTime = 60,
                                exerciseName = 'Exercise',
                                onSetsChange
                              }: TimerProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();
  const [workTime, setWorkTime] = useState(mode === 'timer' ? initialTime : 0);
  const [restTimeState, setRestTimeState] = useState(restTime);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [fontsLoaded] = useFonts({
    'Inter-Regular': InterRegular,
    'Inter-SemiBold': InterSemiBold
  });

  const handleWorkComplete = useCallback(() => {
    if (currentSet < sets) {
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Vibration.vibrate([0, 500, 200, 500]);
      }
      setIsResting(true);
      setRestTimeState(restTime);
    } else {
      setIsRunning(false);
      onComplete?.();
    }
  }, [currentSet, sets, restTime, onComplete]);

  const handleRestComplete = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Vibration.vibrate([0, 500, 200, 500]);
    }
    setIsResting(false);
    setCurrentSet(prev => prev + 1);
    if (currentSet < sets) {
      setWorkTime(initialTime);
    } else {
      setIsRunning(false);
      onComplete?.();
    }
  }, [currentSet, sets, initialTime, onComplete]);

  const handleSetChange = useCallback((newSets: number) => {
    const updatedSets = Math.max(1, newSets);
    onSetsChange?.(updatedSets);
    if (currentSet > updatedSets) {
      setCurrentSet(updatedSets);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [currentSet, onSetsChange]);

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
              handleRestComplete();
              return restTime;
            }
            return prev - 1;
          });
        } else {
          if (mode === 'timer') {
            setWorkTime(prev => {
              if (prev <= 1) {
                handleWorkComplete();
                return initialTime;
              }
              return prev - 1;
            });
          } else {
            setWorkTime(prev => prev + 1);
          }
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, isResting, mode, handleWorkComplete, handleRestComplete, initialTime, restTime]);

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
      <Animated.View
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(300)}
        style={[
          styles.content,
          { backgroundColor: isResting ? theme.colors.error : theme.colors.success, borderRadius: 28 }
        ]}
      >
        <View style={styles.contentInner}>
          <Text style={[styles.phaseText, { color: theme.colors.background.main }]}>
            {isResting ? 'REST' : 'WORK'}
          </Text>

          <View style={styles.setsContainer}>
            <TouchableOpacity
              style={[styles.setButton, { opacity: currentSet <= 1 ? 0.5 : 1 }]}
              onPress={() => setCurrentSet(prev => Math.max(1, prev - 1))}
              disabled={currentSet <= 1}
            >
              <Minus size={16} color={theme.colors.background.main} />
            </TouchableOpacity>

            <Text style={[styles.setInfo, { color: theme.colors.background.main }]}>
              {t('timer.series')} {currentSet}/{sets}
            </Text>

            <TouchableOpacity
              style={[styles.setButton, { opacity: currentSet >= sets ? 0.5 : 1 }]}
              onPress={() => setCurrentSet(prev => Math.min(sets, prev + 1))}
              disabled={currentSet >= sets}
            >
              <Plus size={16} color={theme.colors.background.main} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.time, { color: theme.colors.background.main }]}>
            {formatTime(isResting ? restTimeState : workTime)}
          </Text>
        </View>
      </Animated.View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: isRunning ? theme.colors.error : theme.colors.success }
          ]}
          onPress={toggleTimer}
          activeOpacity={0.7}
        >
          {isRunning ? (
            <Pause size={24} color={theme.colors.background.main} strokeWidth={2.5} />
          ) : (
            <Play size={24} color={theme.colors.background.main} strokeWidth={2.5} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.background.card }]}
          onPress={resetTimer}
          activeOpacity={0.7}
        >
          <RotateCcw size={22} color={theme.colors.text.primary} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      gap: 24
    },
    content: {
      width: '100%',
      paddingVertical: 32,
      paddingHorizontal: 20,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12
        },
        android: {
          elevation: 8
        }
      })
    },
    contentInner: {
      alignItems: 'center',
      gap: 12
    },
    setsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      marginVertical: 4
    },
    setButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center'
    },
    setInfo: {
      fontSize: Platform.OS === 'ios' ? 22 : 20,
      fontWeight: '600',
      opacity: 0.9,
      textAlign: 'center',
      minWidth: 100
    },
    time: {
      fontSize: Platform.OS === 'ios' ? 72 : 64,
      fontWeight: '700',
      textAlign: 'center',
      includeFontPadding: false,
      lineHeight: Platform.OS === 'ios' ? 84 : 76
    },
    phaseText: {
      fontSize: Platform.OS === 'ios' ? 24 : 22,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 1
    },
    controls: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 16
    },
    button: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 6
        },
        android: {
          elevation: 4
        }
      })
    }
  });
};
