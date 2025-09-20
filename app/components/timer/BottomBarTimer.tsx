import React, { useCallback, useEffect } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Pause, Play } from 'lucide-react-native';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import useHaptics from '@/app/hooks/useHaptics';
import Text from '@/app/components/ui/Text';
import { Button } from '@/app/components/ui/Button';
import { useCountdown } from '@/app/hooks/useCountdown';

interface BottomBarTimerProps {
  initialTime: number;
  onComplete?: () => void;
  autoStart?: boolean;
}

export default function BottomBarTimer({
                                         initialTime,
                                         onComplete,
                                         autoStart = false
                                       }: BottomBarTimerProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const haptics = useHaptics();
  const styles = useStyles();

  const timer = useCountdown({ initialTime, onComplete, autoStart });

  useEffect(() => {
    // Reset timer when initialTime prop changes
    timer.reset(initialTime);
    if (autoStart) timer.start();
  }, [initialTime, autoStart]);

  const toggleTimer = useCallback(() => {
    timer.toggle();
    haptics.impactLight();
  }, [haptics, timer]);

  const adjustTime = useCallback((seconds: number) => {
    timer.adjustTime(seconds);
    haptics.impactLight();
  }, [haptics, timer]);

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.row}>
          <View style={styles.sideButtonWrapper}>
            <Button
              variant="icon"
              onPress={() => adjustTime(-5)}
              style={styles.sideButton}
              disabled={timer.time < 5}
            >
              <Text style={styles.sideButtonText}>-5s</Text>
            </Button>
          </View>
          <Text style={styles.time} variant="heading" weight="bold">
            {timer.formatTime(timer.time)}
          </Text>
          <View style={styles.sideButtonWrapper}>
            <Button
              variant="icon"
              onPress={() => adjustTime(5)}
              style={styles.sideButton}
            >
              <Text style={styles.sideButtonText}>+5s</Text>
            </Button>
          </View>
        </View>
        <View style={styles.playRow}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={toggleTimer}
          >
            {timer.isActive ? (
              <Pause size={32} color={theme.colors.background.main} />
            ) : (
              <Play size={32} color={theme.colors.background.main} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const useStyles = () => {
  const { theme } = useTheme();
  return StyleSheet.create({
    container: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.background.card,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      paddingTop: 12,
      paddingBottom: Platform.OS === 'ios' ? 28 : 16,
      paddingHorizontal: 36,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 8
    },
    inner: {
      alignItems: 'center',
      justifyContent: 'center'
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 8
    },
    playRow: {
      alignItems: 'center',
      marginTop: 4
    },
    time: {
      color: theme.colors.text.primary,
      textAlign: 'center',
      minWidth: 160
    },
    sideButtonWrapper: {
      flex: 1,
      alignItems: 'center'
    },
    sideButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.background.button,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      marginHorizontal: 4,
      padding: 0
    },
    sideButtonText: {
      fontSize: 12,
      color: theme.colors.text.primary,
      marginTop: 2,
      fontWeight: '600',
      textAlign: 'center'
    },
    playButton: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 0,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.18,
      shadowRadius: 8,
      elevation: 4
    }
  });
}; 
