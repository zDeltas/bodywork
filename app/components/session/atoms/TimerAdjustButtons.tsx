import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/app/hooks/useTheme';
import Text from '@/app/components/ui/Text';

export interface TimerAdjustButtonsProps {
  onDecrease: () => void;
  onIncrease: () => void;
  canDecrease: boolean;
  decreaseAmount?: number;
  increaseAmount?: number;
}

const TimerAdjustButtons = React.memo<TimerAdjustButtonsProps>(({
  onDecrease,
  onIncrease,
  canDecrease,
  decreaseAmount = 5,
  increaseAmount = 5
}) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);

  return (
    <>
      <TouchableOpacity
        onPress={onDecrease}
        disabled={!canDecrease}
        style={[styles.button, !canDecrease && styles.buttonDisabled]}
      >
        <Text style={styles.buttonText}>-{decreaseAmount}s</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onIncrease} style={styles.button}>
        <Text style={styles.buttonText}>+{increaseAmount}s</Text>
      </TouchableOpacity>
    </>
  );
});

const useStyles = (theme: any) => StyleSheet.create({
  button: {
    backgroundColor: theme.colors.background.input,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: Math.max(4, theme.spacing.xs)
  },
  buttonDisabled: {
    opacity: 0.5
  },
  buttonText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600'
  }
});

TimerAdjustButtons.displayName = 'TimerAdjustButtons';

export default TimerAdjustButtons;
