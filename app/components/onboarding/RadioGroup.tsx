import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { CheckCircle, Circle } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import Text from '@/app/components/ui/Text';

interface RadioOption {
  key: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  options: RadioOption[];
  value: string;
  onValueChange: (value: string) => void;
}

const RadioGroup: React.FC<RadioGroupProps> = ({ options, value, onValueChange }) => {
  const { theme } = useTheme();
  const styles = useStyles();

  return (
    <View style={styles.container}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.key}
          style={[
            styles.option,
            {
              backgroundColor: value === option.key ? theme.colors.primaryLight : theme.colors.background.card,
              borderColor: value === option.key ? theme.colors.primary : theme.colors.border.default,
            }
          ]}
          onPress={() => onValueChange(option.key)}
        >
          <View style={styles.optionContent}>
            <View style={styles.optionHeader}>
              {value === option.key ? (
                <CheckCircle size={20} color={theme.colors.primary} />
              ) : (
                <Circle size={20} color={theme.colors.text.secondary} />
              )}
              <Text
                style={[
                  styles.optionLabel,
                  {
                    color: value === option.key ? theme.colors.primary : theme.colors.text.primary,
                  }
                ]}
              >
                {option.label}
              </Text>
            </View>
            {option.description && (
              <Text style={[styles.optionDescription, { color: theme.colors.text.secondary }]}>
                {option.description}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const useStyles = () => {
  const { theme } = useTheme();
  
  return StyleSheet.create({
    container: {
      gap: theme.spacing.sm,
    },
    option: {
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
    },
    optionContent: {
      gap: theme.spacing.xs,
    },
    optionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    optionLabel: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
      flex: 1,
    },
    optionDescription: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      marginLeft: theme.spacing.lg + theme.spacing.sm,
    },
  });
};

export default RadioGroup;
