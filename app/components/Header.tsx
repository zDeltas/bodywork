import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import Text from './ui/Text';
import TouchableOpacity from './ui/TouchableOpacity';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
}

export default function Header({ title, showBackButton = true, rightComponent }: HeaderProps) {
  const { theme } = useTheme();
  const styles = useStyles();

  return (
    <Animated.View
      entering={FadeIn.duration(500)}
      style={styles.header}
    >
      <View style={styles.leftContainer}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ChevronLeft color={theme.colors.text.primary} size={24} />
          </TouchableOpacity>
        )}
      </View>

      <Text variant="heading" style={styles.title}>
        {title}
      </Text>

      <View style={styles.rightContainer}>
        {rightComponent}
      </View>
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
      paddingVertical: theme.spacing.base + 8,
      backgroundColor: theme.colors.background.main
    },
    leftContainer: {
      width: 40,
      alignItems: 'flex-start'
    },
    rightContainer: {
      width: 40,
      alignItems: 'flex-end'
    },
    title: {
      flex: 1,
      textAlign: 'center'
    },
    backButton: {
      padding: theme.spacing.sm
    }
  });
}; 
