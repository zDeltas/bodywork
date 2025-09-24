import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Timer as TimerIcon } from 'lucide-react-native';
import Text from '@/app/components/ui/Text';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';

interface RestTimeSelectorProps {
  restTime: string;
  onPress: () => void;
}

const RestTimeSelector: React.FC<RestTimeSelectorProps> = React.memo(({
  restTime, 
  onPress 
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <TimerIcon color={theme.colors.text.secondary} size={22} style={styles.titleIcon} />
        <Text variant="body" style={styles.label}>
          {t('timer.restTime')}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.input}
        onPress={onPress}
      >
        <Text style={styles.timeText}>
          {restTime || '00:00'}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

RestTimeSelector.displayName = 'RestTimeSelector';

const useStyles = (theme: any) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.base
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  titleIcon: {
    marginRight: theme.spacing.sm
  },
  label: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.base,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.background.input,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  timeText: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.md,
    textAlign: 'center',
    width: '100%'
  }
});

export default RestTimeSelector;
