import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Timer, Play, RotateCcw, Zap } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import Text from '@/app/components/ui/Text';

export interface StatusChipProps {
  isResting: boolean;
  isPreparation?: boolean;
  restText: string;
  preparationText?: string;
  exerciseText: string;
  restType?: 'series' | 'exercise';
}

const StatusChip = React.memo<StatusChipProps>(({
  isResting,
  isPreparation = false,
  restText,
  preparationText = '',
  exerciseText,
  restType
}) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);

  // Déterminer l'icône selon l'état
  let IconComponent = Play;
  let iconColor = theme.colors.text.primary;
  let chipStyle = styles.chip;
  let displayText = exerciseText;
  let textStyle = styles.text;

  if (isPreparation) {
    IconComponent = Zap; // Icône pour la préparation
    iconColor = theme.colors.warning;
    chipStyle = [styles.chip, styles.chipPreparation];
    textStyle = [styles.text, styles.textPreparation];
    displayText = preparationText;
  } else if (isResting) {
    if (restType === 'exercise') {
      IconComponent = RotateCcw; // Icône différente pour repos entre exercices
      iconColor = theme.colors.secondary || theme.colors.primary;
      chipStyle = [styles.chip, styles.chipRestingExercise];
      textStyle = [styles.text, styles.textRestingExercise];
    } else {
      IconComponent = Timer; // Icône classique pour repos entre séries
      iconColor = theme.colors.primary;
      chipStyle = [styles.chip, styles.chipResting];
      textStyle = [styles.text, styles.textResting];
    }
    displayText = restText;
  }

  const text = isPreparation ? preparationText : (isResting ? restText : exerciseText);

  return (
    <View style={chipStyle}>
      <IconComponent size={16} color={iconColor} />
      <Text style={textStyle}>
        {text}
      </Text>
    </View>
  );
});

const useStyles = (theme: any) => StyleSheet.create({
  chip: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: Math.max(6, theme.spacing.xs),
    borderRadius: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.background.main
  },
  chipResting: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10'
  },
  chipRestingExercise: {
    borderColor: theme.colors.secondary || theme.colors.primary,
    backgroundColor: (theme.colors.secondary || theme.colors.primary) + '10'
  },
  chipPreparation: {
    borderColor: theme.colors.warning,
    backgroundColor: theme.colors.warning + '10'
  },
  text: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontWeight: '600'
  },
  textResting: {
    color: theme.colors.primary
  },
  textRestingExercise: {
    color: theme.colors.secondary || theme.colors.primary
  },
  textPreparation: {
    color: theme.colors.warning
  }
});

StatusChip.displayName = 'StatusChip';

export default StatusChip;
