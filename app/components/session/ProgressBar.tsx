import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/app/hooks/useTheme';
import Text from '@/app/components/ui/Text';
import { useTranslation } from '@/app/hooks/useTranslation';

type ProgressBarProps = {
  current: number;
  total: number;
  label?: string;
};

export const ProgressBar = React.memo(({ current, total, label }: ProgressBarProps) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles(theme);
  const progress = (current / total) * 100;

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      <Text variant="caption" style={styles.progressText}>
        {current}/{total} {label || t('workout.exercises' as any)}
      </Text>
    </View>
  );
});

const useStyles = (theme: any) => StyleSheet.create({
  progressContainer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.card
  },
  progressBar: {
    height: 4,
    backgroundColor: theme.colors.background.button,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary
  },
  progressText: {
    color: theme.colors.text.secondary,
    textAlign: 'center'
  }
}); 