import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/app/hooks/useTheme';
import Text from '@/app/components/ui/Text';

export interface SeriesChipProps {
  isWarmUp: boolean;
  warmUpText: string;
  workingSetText: string;
}

const SeriesChip = React.memo<SeriesChipProps>(({
  isWarmUp,
  warmUpText,
  workingSetText
}) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);

  return (
    <View style={[styles.chip, isWarmUp ? styles.chipWarm : styles.chipWork]}>
      <Text style={[styles.chipText, isWarmUp ? styles.chipWarmText : styles.chipWorkText]}>
        {isWarmUp ? warmUpText : workingSetText}
      </Text>
    </View>
  );
});

const useStyles = (theme: any) => StyleSheet.create({
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: Math.max(4, theme.spacing.xs),
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1
  },
  chipWarm: {
    backgroundColor: theme.colors.warning + '15',
    borderColor: theme.colors.warning
  },
  chipWork: {
    backgroundColor: theme.colors.background.input,
    borderColor: theme.colors.border.default
  },
  chipText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '700'
  },
  chipWarmText: {
    color: theme.colors.warning
  },
  chipWorkText: {
    color: theme.colors.text.secondary
  }
});

SeriesChip.displayName = 'SeriesChip';

export default SeriesChip;
