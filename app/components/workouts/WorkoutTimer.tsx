import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '../ui/Text';
import { useTheme } from '@/hooks/useTheme';

interface WorkoutTimerProps {
  duration: number;
  onComplete: () => void;
  isActive?: boolean;
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const WorkoutTimer: React.FC<WorkoutTimerProps> = ({
                                                     duration,
                                                     onComplete,
                                                     isActive = true
                                                   }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const { theme } = useTheme();
  const styles = useStyles(theme);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            onComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [timeLeft, isActive, onComplete]);

  const progress = (timeLeft / duration) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <Text variant="heading" style={styles.timerText}>
          {formatTime(timeLeft)}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%` }
            ]}
          />
        </View>
      </View>
      <Text variant="caption" style={styles.label}>
        Time Remaining
      </Text>
    </View>
  );
};

const useStyles = (theme: any) => StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 8
  },
  timerText: {
    color: theme.colors.primary,
    marginBottom: 16
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: theme.colors.background.card,
    borderRadius: 2,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary
  },
  label: {
    marginTop: 8
  }
});

export default WorkoutTimer; 
