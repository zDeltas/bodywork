import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Dumbbell, Target, Ruler, Clock } from 'lucide-react-native';
import Text from '@/app/components/ui/Text';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';

interface UnitTypeSelectorProps {
  selectedType: 'repsAndWeight' | 'reps' | 'time' | 'distance';
  onTypeChange: (type: 'repsAndWeight' | 'reps' | 'time' | 'distance') => void;
}

const UnitTypeSelector: React.FC<UnitTypeSelectorProps> = React.memo(({
  selectedType, 
  onTypeChange 
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles(theme);

  const unitTypes = [
    {
      key: 'repsAndWeight' as const,
      label: t('workout.repsAndWeight'),
      icon: <Dumbbell size={16} color={selectedType === 'repsAndWeight' ? theme.colors.primary : theme.colors.text.secondary} />
    },
    {
      key: 'reps' as const,
      label: t('workout.reps'),
      icon: <Target size={16} color={selectedType === 'reps' ? theme.colors.primary : theme.colors.text.secondary} />
    },
    {
      key: 'time' as const,
      label: t('workout.duration'),
      icon: <Clock size={16} color={selectedType === 'time' ? theme.colors.primary : theme.colors.text.secondary} />
    },
    {
      key: 'distance' as const,
      label: t('workout.distance'),
      icon: <Ruler size={16} color={selectedType === 'distance' ? theme.colors.primary : theme.colors.text.secondary} />
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Ruler color={theme.colors.text.secondary} size={22} style={styles.titleIcon} />
        <Text variant="body" style={styles.label}>
          {t('workout.unitType')}
        </Text>
      </View>
      <View style={styles.grid}>
        <View style={styles.row}>
          {unitTypes.slice(0, 2).map((unitType) => (
            <TouchableOpacity
              key={unitType.key}
              style={[
                styles.button,
                selectedType === unitType.key && styles.buttonSelected
              ]}
              onPress={() => onTypeChange(unitType.key)}
            >
              <View style={styles.buttonContent}>
                {unitType.icon}
                <Text
                  style={[
                    styles.buttonText,
                    selectedType === unitType.key && styles.buttonTextSelected
                  ]}
                >
                  {unitType.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.row}>
          {unitTypes.slice(2).map((unitType) => (
            <TouchableOpacity
              key={unitType.key}
              style={[
                styles.button,
                selectedType === unitType.key && styles.buttonSelected
              ]}
              onPress={() => onTypeChange(unitType.key)}
            >
              <View style={styles.buttonContent}>
                {unitType.icon}
                <Text
                  style={[
                    styles.buttonText,
                    selectedType === unitType.key && styles.buttonTextSelected
                  ]}
                >
                  {unitType.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
});

UnitTypeSelector.displayName = 'UnitTypeSelector';

const useStyles = (theme: any) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.base
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm
  },
  titleIcon: {
    marginRight: theme.spacing.sm
  },
  label: {
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.base
  },
  grid: {
    marginBottom: theme.spacing.sm
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
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
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs
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

export default UnitTypeSelector;
