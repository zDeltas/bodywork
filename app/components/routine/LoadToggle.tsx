import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Text from '@/app/components/ui/Text';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';

interface LoadToggleProps {
  withLoad: boolean;
  onToggle: () => void;
}

/**
 * Composant optimisé pour le toggle "avec charge"
 * Utilise React.memo pour éviter les re-renders inutiles
 */
const LoadToggle: React.FC<LoadToggleProps> = React.memo(({ 
  withLoad, 
  onToggle 
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles(theme);

  return (
    <TouchableOpacity
      onPress={onToggle}
      style={styles.container}
    >
      <Text style={styles.label}>{t('routine.withLoad')}</Text>
      <View style={[styles.switch, withLoad && styles.switchActive]}>
        <View style={[styles.thumb, withLoad && styles.thumbActive]} />
      </View>
    </TouchableOpacity>
  );
});

LoadToggle.displayName = 'LoadToggle';

const useStyles = (theme: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    paddingVertical: theme.spacing.sm
  },
  label: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.md,
    flex: 1,
    marginLeft: theme.spacing.sm
  },
  switch: {
    width: 36,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.border.default,
    justifyContent: 'center'
  },
  switchActive: {
    backgroundColor: theme.colors.primary
  },
  thumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.background.card,
    marginLeft: 2
  },
  thumbActive: {
    marginLeft: 16
  }
});

export default LoadToggle;
