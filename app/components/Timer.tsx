import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import { Inter_400Regular, Inter_600SemiBold, useFonts } from '@expo-google-fonts/inter';
import { Minus, Pause, Play, Plus, RotateCcw, Settings } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface TimerProps {
  initialTime?: number;
  mode?: 'timer' | 'stopwatch';
  onComplete?: () => void;
  sets?: number;
  restTime?: number;
  exerciseName?: string;
  onSettingsPress?: () => void;
}

export const REST_TIMES = {
  'Short': 30,
  'Medium': 60,
  'Long': 90,
  'Very Long': 120
};

export default function Timer({
                                initialTime = 60,
                                mode = 'timer',
                                onComplete,
                                sets = 1,
                                restTime = 60,
                                exerciseName = 'Exercise',
                                onSettingsPress
                              }: TimerProps) {
  const [workTime, setWorkTime] = useState(initialTime);
  const [restTimeState, setRestTime] = useState(restTime);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold
  });

  // Mise à jour des temps lorsque les props changent
  useEffect(() => {
    if (!isRunning) {
      setWorkTime(initialTime);
      setRestTime(restTime);
    }
  }, [initialTime, restTime, isRunning]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        if (isResting) {
          setRestTime(prev => {
            if (prev <= 1) {
              setIsRunning(false);
              setIsResting(false);
              handleRestComplete();
              return restTime;
            }
            return prev - 1;
          });
        } else {
          setWorkTime(prev => {
            if (prev <= 1) {
              setIsRunning(false);
              setIsResting(true);
              handleWorkComplete();
              return initialTime;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, isResting, initialTime, restTime]);

  const handleWorkComplete = useCallback(() => {
    Vibration.vibrate([0, 500, 200, 500]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsRunning(true);
  }, []);

  const handleRestComplete = useCallback(() => {
    Vibration.vibrate([0, 500, 200, 500]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (currentSet < sets) {
      setCurrentSet(prev => prev + 1);
      setIsRunning(true);
    } else {
      onComplete?.();
    }
  }, [currentSet, sets, onComplete]);

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
    setWorkTime(initialTime);
    setRestTime(restTime);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [initialTime, restTime]);

  const updateSets = useCallback((increment: boolean) => {
    if (!isRunning) {
      setCurrentSet(prev => Math.max(1, increment ? prev + 1 : prev - 1));
    }
  }, [isRunning]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.exerciseName}>{exerciseName}</Text>
        <TouchableOpacity onPress={onSettingsPress} style={styles.settingsButton}>
          <Settings color="#6366f1" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.setsContainer}>
        <Text style={styles.setsLabel}>Sets</Text>
        <View style={styles.setsControls}>
          <TouchableOpacity
            style={styles.setsButton}
            onPress={() => updateSets(false)}
            disabled={isRunning}
          >
            <Minus color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.setsValue}>{currentSet} / {sets}</Text>
          <TouchableOpacity
            style={styles.setsButton}
            onPress={() => updateSets(true)}
            disabled={isRunning}
          >
            <Plus color="#fff" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[
        styles.timerContainer,
        isResting ? styles.restTimer : styles.workTimer
      ]}>
        <Text style={styles.timerLabel}>
          {isResting ? 'Rest Time' : 'Work Time'}
        </Text>
        <Text style={styles.time}>
          {formatTime(isResting ? restTimeState : workTime)}
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, isRunning ? styles.stopButton : styles.startButton]}
          onPress={toggleTimer}
        >
          {isRunning ? (
            <Pause color="#fff" size={24} />
          ) : (
            <Play color="#fff" size={24} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={resetTimer}
        >
          <RotateCcw color="#fff" size={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '100%'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8
  },
  exerciseName: {
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    color: '#fff'
  },
  settingsButton: {
    padding: 8
  },
  setsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24
  },
  setsLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#fff'
  },
  setsControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  setsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center'
  },
  setsValue: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    minWidth: 60,
    textAlign: 'center'
  },
  timerContainer: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24
  },
  workTimer: {
    backgroundColor: '#22c55e' // Vert
  },
  restTimer: {
    backgroundColor: '#ef4444' // Rouge
  },
  timerLabel: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 8
  },
  time: {
    fontSize: 64,
    fontFamily: 'Inter-SemiBold',
    color: '#fff'
  },
  controls: {
    flexDirection: 'row',
    gap: 16
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  startButton: {
    backgroundColor: '#6366f1'
  },
  stopButton: {
    backgroundColor: '#ef4444'
  },
  resetButton: {
    backgroundColor: '#333'
  }
});
