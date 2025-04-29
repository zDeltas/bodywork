import React from 'react';
import { TouchableOpacity as RNTouchableOpacity, StyleSheet, Platform, Pressable } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface TouchableOpacityProps extends React.ComponentProps<typeof RNTouchableOpacity> {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  pressFeedback?: boolean;
}

export default function TouchableOpacity({
  variant = 'default',
  size = 'md',
  style,
  animated = true,
  pressFeedback = true,
  ...props 
}: TouchableOpacityProps) {
  const styles = useStyles();
  const { theme } = useTheme();

  const TouchableComponent = Platform.OS === 'ios' ? Pressable : RNTouchableOpacity;
  const AnimatedTouchable = animated ? Animated.createAnimatedComponent(TouchableComponent) : TouchableComponent;

  return (
    <AnimatedTouchable
      entering={animated ? FadeIn.duration(200) : undefined}
      exiting={animated ? FadeOut.duration(200) : undefined}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        styles[size],
        pressFeedback && pressed && styles.pressed,
        style,
      ]}
      android_ripple={pressFeedback ? {
        color: theme.colors.primary + '20',
        borderless: variant === 'ghost',
        radius: Platform.OS === 'android' ? 20 : undefined,
      } : undefined}
      {...props}
    />
  );
}

const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    base: {
      borderRadius: Platform.OS === 'ios' ? 12 : 8,
      justifyContent: 'center',
      alignItems: 'center',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        android: {
          elevation: 2,
        },
      }),
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
      ...Platform.select({
        ios: {
          shadowOpacity: 0,
        },
        android: {
          elevation: 0,
        },
      }),
    },
    sm: {
      padding: Platform.OS === 'ios' ? 8 : 6,
      minHeight: Platform.OS === 'ios' ? 32 : 28,
    },
    md: {
      padding: Platform.OS === 'ios' ? 12 : 10,
      minHeight: Platform.OS === 'ios' ? 40 : 36,
    },
    lg: {
      padding: Platform.OS === 'ios' ? 16 : 14,
      minHeight: Platform.OS === 'ios' ? 48 : 44,
    },
    pressed: {
      opacity: Platform.OS === 'ios' ? 0.7 : 1,
      transform: [{ scale: Platform.OS === 'ios' ? 0.98 : 1 }],
    },
  });
}; 
