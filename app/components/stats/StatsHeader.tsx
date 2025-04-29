import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/hooks/useTheme';
import { X } from 'lucide-react-native';
import { router } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';

interface StatsHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function StatsHeader({ searchQuery, setSearchQuery }: StatsHeaderProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();

  return (
    <Animated.View
      entering={FadeIn.duration(500)}
      style={styles.header}
    >
      <Animated.Text
        entering={FadeIn.duration(600).delay(100)}
        style={styles.title}
      >
        {t('stats.title')}
      </Animated.Text>
      <Animated.View entering={FadeIn.duration(600).delay(200)}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <X color={theme.colors.text.primary} size={24} />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg
    },
    title: {
      fontSize: theme.typography.fontSize['3xl'],
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text.primary
    },
    closeButton: {
      padding: theme.spacing.sm
    }
  });
}; 