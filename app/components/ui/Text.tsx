import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface TextProps extends RNTextProps {
  variant?: 'primary' | 'secondary' | 'error' | 'success' | 'warning';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  weight?: 'regular' | 'semiBold' | 'bold';
  align?: 'left' | 'center' | 'right';
}

export function Text({
  variant = 'primary',
  size = 'base',
  weight = 'regular',
  align = 'left',
  style,
  children,
  ...props
}: TextProps) {
  const { theme } = useTheme();
  const styles = useStyles();

  return (
    <RNText
      style={[
        styles.text,
        styles[variant],
        styles[size],
        styles[weight],
        { textAlign: align },
        style
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}

const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    text: {
      fontFamily: theme.typography.fontFamily.regular,
    },
    // Variants
    primary: {
      color: theme.colors.text.primary,
    },
    secondary: {
      color: theme.colors.text.secondary,
    },
    error: {
      color: theme.colors.error,
    },
    success: {
      color: theme.colors.success,
    },
    warning: {
      color: theme.colors.warning,
    },
    // Sizes
    xs: {
      fontSize: theme.typography.fontSize.xs,
    },
    sm: {
      fontSize: theme.typography.fontSize.sm,
    },
    base: {
      fontSize: theme.typography.fontSize.base,
    },
    lg: {
      fontSize: theme.typography.fontSize.lg,
    },
    xl: {
      fontSize: theme.typography.fontSize.xl,
    },
    '2xl': {
      fontSize: theme.typography.fontSize['2xl'],
    },
    '3xl': {
      fontSize: theme.typography.fontSize['3xl'],
    },
    '4xl': {
      fontSize: theme.typography.fontSize['4xl'],
    },
    // Weights
    regular: {
      fontFamily: theme.typography.fontFamily.regular,
    },
    semiBold: {
      fontFamily: theme.typography.fontFamily.semiBold,
    },
    bold: {
      fontFamily: theme.typography.fontFamily.bold,
    },
  });
}; 