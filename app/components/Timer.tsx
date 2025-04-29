import React, { useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, Vibration, View } from 'react-native';
import {
  Inter_400Regular as InterRegular,
  Inter_600SemiBold as InterSemiBold,
  useFonts
} from '@expo-google-fonts/inter';
import { Pause, Play, RotateCcw } from 'lucide-react-native';
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
    if (mode === 'timer') {
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Vibration.vibrate([0, 500, 200, 500]);
      }
      setIsRunning(true);
    }
  }, [mode]);

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
      onComplete?.();
    }
  }, [currentSet, sets, initialTime, onComplete]);

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
      <Animated.View
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(300)}
        style={styles.content}
      >
        <Text style={styles.exerciseName}>{exerciseName}</Text>
        <Text style={styles.setInfo}>
          {t('sets')} {currentSet}/{sets}
        </Text>
        <Text style={styles.time}>
          {formatTime(isResting ? restTimeState : workTime)}
        </Text>
        <View style={styles.controls}>
          <Animated.View
            entering={FadeIn.springify()}
            exiting={FadeOut.springify()}
          >
            <TouchableOpacity
              style={styles.button}
              onPress={toggleTimer}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {isRunning ? (
                <Pause size={24} color={theme.colors.text.primary} />
              ) : (
                <Play size={24} color={theme.colors.text.primary} />
              )}
            </TouchableOpacity>
          </Animated.View>
          <Animated.View
            entering={FadeIn.springify()}
            exiting={FadeOut.springify()}
          >
            <TouchableOpacity
              style={styles.button}
              onPress={resetTimer}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <RotateCcw size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}

// Define styles using the current theme
const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: Platform.OS === 'ios' ? 20 : 16
    },
    content: {
      alignItems: 'center',
      width: '100%'
    },
    exerciseName: {
      fontSize: Platform.OS === 'ios' ? 24 : 20,
      fontWeight: '600',
      marginBottom: 8,
      textAlign: 'center'
    },
    setInfo: {
      fontSize: Platform.OS === 'ios' ? 18 : 16,
      marginBottom: 16,
      opacity: 0.7
    },
    time: {
      fontSize: Platform.OS === 'ios' ? 72 : 64,
      fontWeight: '700',
      marginBottom: 32
    },
    controls: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: Platform.OS === 'ios' ? 24 : 20
    },
    button: {
      width: Platform.OS === 'ios' ? 56 : 48,
      height: Platform.OS === 'ios' ? 56 : 48,
      borderRadius: Platform.OS === 'ios' ? 28 : 24,
      backgroundColor: theme.colors.background.button,
      justifyContent: 'center',
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4
        },
        android: {
          elevation: 4
        }
      })
    }
  });
};
