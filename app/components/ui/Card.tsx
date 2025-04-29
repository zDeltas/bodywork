import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface CardProps extends ViewProps {
  variant?: 'default' | 'highlighted' | 'secondary';
}

export default function Card({
  variant = 'default',
  style,
  children,
  ...props
}: CardProps) {
  const styles = useStyles();

  return (
    <View
      style={[
        styles.card,
        styles[variant],
        style
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.base,
      ...theme.shadows.sm
    },
    default: {
      // Default card style is already defined in the base card style
    },
    highlighted: {
      borderWidth: 1,
      borderColor: theme.colors.primary
    },
    secondary: {
      backgroundColor: theme.colors.background.button
    }
  });
}; 
