import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Clock, Timer, Play, Pause, Zap } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import Text from '@/app/components/ui/Text';

export interface TimerDisplayProps {
  time: number;
  isActive?: boolean;
  isResting?: boolean;
  isPreparation?: boolean;
  onToggle?: () => void;
  showToggleButton?: boolean;
  formatTime: (seconds: number) => string;
}

const TimerDisplay = React.memo<TimerDisplayProps>(({
  time,
  isActive = false,
  isResting = false,
  isPreparation = false,
  onToggle,
  showToggleButton = false,
  formatTime
}) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);

  const IconComponent = isPreparation ? Zap : (isResting ? Timer : Clock);
  const iconColor = isPreparation ? theme.colors.warning : (isResting ? theme.colors.primary : theme.colors.text.primary);

  return (
    <View style={[styles.container, isResting && styles.containerResting]}>
      <IconComponent size={28} color={iconColor} />
      
      <Text style={[styles.timerText, (isResting || isPreparation) && styles.timerTextResting]}>
        {formatTime(time)}
      </Text>

      {showToggleButton && onToggle && (
        <TouchableOpacity onPress={onToggle} style={styles.toggleButton}>
          {isActive ? (
            <Pause size={20} color={theme.colors.primary} />
          ) : (
            <Play size={20} color={theme.colors.primary} />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
});

const useStyles = (theme: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.main,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    gap: theme.spacing.sm
  },
  containerResting: {
    backgroundColor: theme.colors.primary + '15',
    borderColor: theme.colors.primary,
    borderWidth: 2
  },
  timerText: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text.primary,
    fontVariant: ['tabular-nums']
  },
  timerTextResting: {
    color: theme.colors.primary
  },
  toggleButton: {
    padding: theme.spacing.xs
  }
});

TimerDisplay.displayName = 'TimerDisplay';

export default TimerDisplay;
