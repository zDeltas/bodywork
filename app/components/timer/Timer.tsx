import React, { useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet, Vibration, View } from 'react-native';
import {
  Inter_400Regular as InterRegular,
  Inter_600SemiBold as InterSemiBold,
  useFonts
} from '@expo-google-fonts/inter';
import { Pause, Play, RotateCcw } from 'lucide-react-native';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import useHaptics from '@/app/hooks/useHaptics';
import Text from '@/app/components/ui/Text';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Button } from '@/app/components/ui/Button';
import Svg, { Circle } from 'react-native-svg';

interface TimerProps {
  initialTime?: number; // work time seconds
  mode?: 'timer' | 'stopwatch';
  onComplete?: () => void;
  sets?: number;
  restTime?: number;
  prepTime?: number;
}

export default function Timer({
                                initialTime = 60,
                                mode = 'timer',
                                onComplete,
                                sets = 1,
                                restTime = 60,
                                prepTime = 10
                              }: TimerProps) {
  const { t } = useTranslation();
  const haptics = useHaptics();
  const styles = useStyles();
  const { theme } = useTheme();
  const [workTime, setWorkTime] = useState(mode === 'timer' ? initialTime : 0);
  const [restTimeState, setRestTimeState] = useState(restTime);
  const [prepTimeState, setPrepTimeState] = useState(prepTime);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [phase, setPhase] = useState<'prep' | 'work' | 'rest'>('prep');
  const [fontsLoaded] = useFonts({
    'Inter-Regular': InterRegular,
    'Inter-SemiBold': InterSemiBold
  });

  const vibrateSuccess = useCallback(() => {
    if (Platform.OS === 'ios') {
      haptics.success();
    } else {
      Vibration.vibrate([0, 500, 200, 500]);
    }
  }, [haptics]);

  const handleWorkComplete = useCallback(() => {
    vibrateSuccess();
    setPhase('rest');
    setRestTimeState(restTime);
  }, [restTime, vibrateSuccess]);

  const handleRestComplete = useCallback(() => {
    vibrateSuccess();
    if (currentSet < sets) {
      setCurrentSet((prev) => prev + 1);
      setPhase('work');
      setWorkTime(initialTime);
    } else {
      setIsRunning(false);
      setPhase('prep');
    }
  }, [currentSet, sets, initialTime, onComplete, vibrateSuccess]);

  useEffect(() => {
    if (!isRunning) {
      setWorkTime(mode === 'timer' ? initialTime : 0);
      setRestTimeState(restTime);
      setPrepTimeState(prepTime);
      setPhase('prep');
    }
  }, [initialTime, restTime, prepTime, mode]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isRunning) {
      interval = setInterval(() => {
        if (mode === 'stopwatch') {
          setWorkTime((prev) => prev + 1);
          return;
        }

        if (phase === 'prep') {
          setPrepTimeState((prev) => {
            if (prev <= 1) {
              vibrateSuccess();
              setPhase('work');
              return prepTime; // reset for potential next start
            }
            return prev - 1;
          });
        } else if (phase === 'work') {
          setWorkTime((prev) => {
            if (prev <= 1) {
              handleWorkComplete();
              return initialTime; // reset work time for next work phase
            }
            return prev - 1;
          });
        } else if (phase === 'rest') {
          setRestTimeState((prev) => {
            if (prev <= 1) {
              handleRestComplete();
              return restTime; // reset rest for next rest phase
            }
            return prev - 1;
          });
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, mode, phase, handleWorkComplete, handleRestComplete, initialTime, restTime, prepTime, vibrateSuccess]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = useCallback(() => {
    setIsRunning((prev) => !prev);
    haptics.impactLight();
  }, [haptics]);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setCurrentSet(1);
    setPhase('prep');
    setWorkTime(mode === 'timer' ? initialTime : 0);
    setRestTimeState(restTime);
    setPrepTimeState(prepTime);
    haptics.impactMedium();
  }, [initialTime, restTime, prepTime, mode, haptics]);

  if (!fontsLoaded) {
    return null;
  }

  const phaseLabel = phase === 'prep' ? 'Préparation' : phase === 'work' ? 'Travail' : 'Repos';
  const phaseColors = {
    prep: theme.colors.warning,
    work: theme.colors.primary,
    rest: theme.colors.info
  } as const;
  const currentPhaseTotal = mode === 'stopwatch' ? 0 : (phase === 'prep' ? prepTime : phase === 'work' ? initialTime : restTime);
  const currentPhaseRemaining = mode === 'stopwatch' ? workTime : (phase === 'prep' ? prepTimeState : phase === 'work' ? workTime : restTimeState);
  const size = 260;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = currentPhaseTotal > 0 ? currentPhaseRemaining / currentPhaseTotal : 0;
  const dashOffset = circumference * (1 - Math.min(Math.max(progress, 0), 1));

  const computeTotalRemaining = () => {
    if (mode === 'stopwatch') return 0;

    const futureSets = Math.max(sets - currentSet, 0);

    const pre =
      phase === 'prep'
        ? prepTimeState + initialTime + restTime
        : phase === 'work'
          ? workTime + restTime
          : restTimeState;

    return pre + futureSets * (initialTime + restTime);
  };
  const totalRemaining = computeTotalRemaining();

  const getNextPhase = () => {
    if (mode === 'stopwatch') return null;
    if (phase === 'prep') return { name: 'Travail', duration: initialTime };
    if (phase === 'work') return { name: 'Repos', duration: restTime };
    if (currentSet < sets) return { name: 'Travail', duration: initialTime };
    return { name: 'Terminé', duration: 0 };
  };
  const nextPhase = getNextPhase();

  const titleLabel: string = mode === 'timer' ? t('timer.title') : t('timer.stopwatch');

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(300)} style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>{titleLabel}</Text>
          {mode === 'timer' && (
            <Text style={[styles.globalTime, { color: theme.colors.text.secondary }]}>Total {formatTime(totalRemaining)}</Text>
          )}
          <Button variant="icon" onPress={resetTimer} style={styles.resetBtn}
                  icon={<RotateCcw size={18} color={theme.colors.text.onPrimary} />} />
        </View>

        <View style={styles.ringContainer}>
          <Svg width={size} height={size}>
            <Circle cx={size / 2} cy={size / 2} r={radius} stroke={theme.colors.background.button} strokeWidth={stroke} fill="none" />
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={phaseColors[phase]}
              strokeWidth={stroke}
              fill="none"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              rotation="-90"
              originX={size / 2}
              originY={size / 2}
            />
          </Svg>
          <View style={styles.centerContent}>
            <Text style={[styles.time, { color: theme.colors.text.primary }]}>{formatTime(currentPhaseRemaining)}</Text>
            <Text style={[styles.phaseText, { color: theme.colors.text.secondary }]}>{phaseLabel}</Text>
          </View>
        </View>

        {nextPhase && nextPhase.duration > 0 && (
          <Text style={[styles.nextText, { color: theme.colors.text.secondary }]}>Prochaine phase
            : {nextPhase.name} · {formatTime(nextPhase.duration)}</Text>
        )}

        <View style={styles.bottomRow}>
          {mode === 'timer' && <Text style={[styles.setInfo, { color: theme.colors.text.secondary }]}>Série {phase === 'prep' ? 1 : currentSet} / {sets}</Text>}
          <Button
            variant="primary"
            icon={isRunning ? <Pause size={28} color={theme.colors.text.onPrimary} /> : <Play size={28} color={theme.colors.text.onPrimary} />}
            onPress={toggleTimer}
            style={styles.bigActionButton}
          />
        </View>
      </Animated.View>
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
      paddingVertical: 24,
      paddingHorizontal: 20,
      backgroundColor: theme.colors.background.card,
      borderRadius: 24,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 16
        },
        android: {
          elevation: 8
        }
      })
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8
    },
    headerTitle: {
      fontSize: Platform.OS === 'ios' ? 20 : 18,
      fontWeight: '700'
    },
    globalTime: {
      fontSize: 14,
      fontWeight: '600'
    },
    resetBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center'
    },
    ringContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 8
    },
    centerContent: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center'
    },
    nextText: {
      marginTop: 8,
      textAlign: 'center'
    },
    bottomRow: {
      marginTop: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    bigActionButton: {
      width: 72,
      height: 72,
      borderRadius: 36,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.35,
          shadowRadius: 12
        },
        android: {
          elevation: 10
        }
      })
    },
    setInfo: {
      fontSize: Platform.OS === 'ios' ? 18 : 16,
      fontWeight: '600',
      opacity: 0.9,
      textAlign: 'center'
    },
    time: {
      fontSize: Platform.OS === 'ios' ? 72 : 64,
      fontWeight: '700',
      textAlign: 'center',
      includeFontPadding: false,
      lineHeight: Platform.OS === 'ios' ? 84 : 76
    },
    phaseText: {
      fontSize: Platform.OS === 'ios' ? 18 : 16,
      fontWeight: '600',
      textTransform: 'none',
      letterSpacing: 0.5,
      marginTop: 4
    }
  });
};
