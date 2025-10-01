import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import Text from '@/app/components/ui/Text';
import { useTheme } from '@/app/hooks/useTheme';

interface LoadingViewProps {
  message?: string;
}

export default function LoadingView({ message = 'Chargement...' }: LoadingViewProps) {
  const { theme } = useTheme();
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
    },
    message: {
      marginTop: theme.spacing.md,
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text.secondary,
      textAlign: 'center',
    },
  });
};
