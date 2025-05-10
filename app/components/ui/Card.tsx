import React from 'react';
import { Platform, StyleSheet, View, ViewProps } from 'react-native';
import { useTheme } from '@/app/hooks/useTheme';
import Animated, { FadeIn } from 'react-native-reanimated';

interface CardProps extends ViewProps {
  variant?: 'default' | 'highlighted' | 'secondary';
  animated?: boolean;
}

export default function Card({
                               variant = 'default',
                               style,
                               children,
                               animated = true,
                               ...props
                             }: CardProps) {
  const styles = useStyles();

  const CardComponent = animated ? Animated.View : View;

  return (
    <CardComponent
      entering={animated ? FadeIn.duration(300) : undefined}
      style={[
        styles.card,
        styles[variant],
        style
      ]}
      {...props}
    >
      {children}
    </CardComponent>
  );
}

const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.background.card,
      borderRadius: Platform.OS === 'ios' ? 16 : 12,
      padding: Platform.OS === 'ios' ? 16 : 12,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4
        },
        android: {
          elevation: 4
        }
      })
    },
    default: {},
    highlighted: {
      borderWidth: Platform.OS === 'ios' ? 1 : 1.5,
      borderColor: theme.colors.primary,
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4
        },
        android: {
          elevation: 6
        }
      })
    },
    secondary: {
      backgroundColor: theme.colors.background.button,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2
        },
        android: {
          elevation: 2
        }
      })
    }
  });
}; 
