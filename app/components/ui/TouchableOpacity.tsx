import React from 'react';
import { TouchableOpacity as RNTouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface TouchableOpacityProps extends React.ComponentProps<typeof RNTouchableOpacity> {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function TouchableOpacity({ 
  variant = 'default',
  size = 'md',
  style,
  ...props 
}: TouchableOpacityProps) {
  const { theme } = useTheme();
  const styles = useStyles();

  return (
    <RNTouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[size],
        style,
      ]}
      {...props}
    />
  );
}

const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    base: {
      borderRadius: theme.borderRadius.base,
      justifyContent: 'center',
      alignItems: 'center',
    },
    default: {
      backgroundColor: theme.colors.background.button,
    },
    primary: {
      backgroundColor: theme.colors.primary,
    },
    secondary: {
      backgroundColor: theme.colors.secondary,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    sm: {
      padding: theme.spacing.sm,
    },
    md: {
      padding: theme.spacing.md,
    },
    lg: {
      padding: theme.spacing.lg,
    },
  });
}; 