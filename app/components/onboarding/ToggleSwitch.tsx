import React from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/app/hooks/useTheme';
import Text from '@/app/components/ui/Text';

interface ToggleSwitchProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  description,
  value,
  onValueChange
}) => {
  const { theme } = useTheme();
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={[styles.label, { color: theme.colors.text.primary }]}>
          {label}
        </Text>
        {description && (
          <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
            {description}
          </Text>
        )}
      </View>
      
      <TouchableOpacity
        style={[
          styles.switch,
          {
            backgroundColor: value ? theme.colors.primary : theme.colors.border.default,
          }
        ]}
        onPress={() => onValueChange(!value)}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.thumb,
            {
              backgroundColor: theme.colors.text.onPrimary,
              transform: [{ translateX: value ? 20 : 2 }],
            }
          ]}
        />
      </TouchableOpacity>
    </View>
  );
};

const useStyles = () => {
  const { theme } = useTheme();
  
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
    },
    textContainer: {
      flex: 1,
      marginRight: theme.spacing.md,
    },
    label: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.semiBold,
      marginBottom: theme.spacing.xs,
    },
    description: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.sm,
    },
    switch: {
      width: 44,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      position: 'relative',
    },
    thumb: {
      width: 20,
      height: 20,
      borderRadius: 10,
      position: 'absolute',
    },
  });
};

export default ToggleSwitch;
