import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Text from '@/app/components/ui/Text';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';

interface SeriesTypeSelectorProps {
  selectedType: 'warmUp' | 'workingSet';
  onTypeChange: (type: 'warmUp' | 'workingSet') => void;
}

const SeriesTypeSelector: React.FC<SeriesTypeSelectorProps> = React.memo(({
  selectedType, 
  onTypeChange 
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles(theme);

  return (
    <View style={styles.container}>
      <Text variant="body" style={styles.label}>
        {t('routine.seriesType')}
      </Text>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            selectedType === 'warmUp' && styles.buttonSelected
          ]}
          onPress={() => onTypeChange('warmUp')}
        >
          <Text
            style={[
              styles.buttonText,
              selectedType === 'warmUp' && styles.buttonTextSelected
            ]}
          >
            {t('routine.warmUp')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            selectedType === 'workingSet' && styles.buttonSelected
          ]}
          onPress={() => onTypeChange('workingSet')}
        >
          <Text
            style={[
              styles.buttonText,
              selectedType === 'workingSet' && styles.buttonTextSelected
            ]}
          >
            {t('routine.workingSet')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

SeriesTypeSelector.displayName = 'SeriesTypeSelector';

const useStyles = (theme: any) => StyleSheet.create({
  container: {
    marginTop: theme.spacing.base,
    marginBottom: theme.spacing.base
  },
  label: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.base,
    marginBottom: theme.spacing.sm
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm
  },
  button: {
    flex: 1,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.default
  },
  buttonSelected: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primaryBorder
  },
  buttonText: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.base,
    textAlign: 'center'
  },
  buttonTextSelected: {
    color: theme.colors.primary
  }
});

export default SeriesTypeSelector;
