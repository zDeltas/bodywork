import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { CheckSquare, Square } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import Text from '@/app/components/ui/Text';

interface CheckboxOption {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

interface CheckboxGroupProps {
  options: CheckboxOption[];
  value: string[];
  onValueChange: (value: string[]) => void;
  maxSelections?: number;
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ 
  options, 
  value, 
  onValueChange, 
  maxSelections 
}) => {
  const { theme } = useTheme();
  const styles = useStyles();

  const handleToggle = (optionKey: string) => {
    const isSelected = value.includes(optionKey);
    
    if (isSelected) {
      // Remove from selection
      onValueChange(value.filter(item => item !== optionKey));
    } else {
      // Add to selection (if not at max limit)
      if (!maxSelections || value.length < maxSelections) {
        onValueChange([...value, optionKey]);
      }
    }
  };

  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = value.includes(option.key);
        const isDisabled = maxSelections && !isSelected && value.length >= maxSelections;
        
        return (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.option,
              {
                backgroundColor: isSelected ? theme.colors.primaryLight : theme.colors.background.card,
                borderColor: isSelected ? theme.colors.primary : theme.colors.border.default,
                opacity: isDisabled ? 0.5 : 1,
              }
            ]}
            onPress={() => handleToggle(option.key)}
            disabled={isDisabled}
          >
            <View style={styles.optionContent}>
              {isSelected ? (
                <CheckSquare size={20} color={theme.colors.primary} />
              ) : (
                <Square size={20} color={theme.colors.text.secondary} />
              )}
              
              {option.icon && (
                <View style={styles.iconContainer}>
                  {option.icon}
                </View>
              )}
              
              <Text
                style={[
                  styles.optionLabel,
                  {
                    color: isSelected ? theme.colors.primary : theme.colors.text.primary,
                  }
                ]}
              >
                {option.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
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
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    iconContainer: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionLabel: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
      flex: 1,
    },
  });
};

export default CheckboxGroup;
