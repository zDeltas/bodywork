import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedStyle, interpolateColor } from 'react-native-reanimated';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import Text from '@/app/components/ui/Text';

interface DynamicHeaderProps {
  userName?: string;
  weekProgress?: {
    current: number;
    total: number;
  };
}

const DynamicHeader: React.FC<DynamicHeaderProps> = React.memo(({ 
  userName = 'Champion', 
  weekProgress 
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();

  // Progress animation + dynamic color
  const percentage = React.useMemo(() => {
    if (!weekProgress || weekProgress.total === 0) return 0;
    return Math.min(100, Math.max(0, (weekProgress.current / weekProgress.total) * 100));
  }, [weekProgress]);

  const animatedWidth = useSharedValue(0);

  React.useEffect(() => {
    animatedWidth.value = withTiming(percentage, { duration: 800 });
  }, [percentage, animatedWidth]);

  // Animate width and color in worklet
  const progressAnimStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      animatedWidth.value,
      [0, 40, 80, 100],
      ['#ef4444', '#ef4444', '#f59e0b', '#4CC9F0']
    );
    return {
      width: `${animatedWidth.value}%`,
      backgroundColor: color,
    };
  });

  // Déterminer le message selon l'heure
  const getMotivationalMessage = () => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return t('home.morningMotivation');
    } else if (hour >= 12 && hour < 18) {
      return t('home.afternoonMotivation');
    } else {
      return t('home.eveningMotivation');
    }
  };

  return (
    <View style={styles.container}>
      {/* Salutation principale */}
      <Text variant="heading" style={styles.greeting}>
        👋 {t('home.greeting', { name: userName })}
      </Text>
      
      {/* Message motivationnel */}
      <Text variant="body" style={styles.motivation}>
        {getMotivationalMessage()}
      </Text>
      
      {/* Barre de progression hebdomadaire */}
      {weekProgress && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, progressAnimStyle]} />
          </View>
          <Text variant="caption" style={styles.progressText}>
            {t('home.weekProgress', { 
              current: weekProgress.current, 
              total: weekProgress.total 
            })}
          </Text>
        </View>
      )}
    </View>
  );
});

const useStyles = () => {
  const { theme } = useTheme();
  
  return StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.lg,
    },
    greeting: {
      fontSize: 22,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    motivation: {
      fontSize: 16,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.lg,
    },
    progressContainer: {
      alignItems: 'center',
    },
    progressBar: {
      width: '60%',
      height: 4,
      backgroundColor: theme.colors.background.card,
      borderRadius: 2,
      marginBottom: theme.spacing.xs,
    },
    progressFill: {
      height: '100%',
      borderRadius: 2,
    },
    progressText: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      fontWeight: '500',
    },
  });
};

DynamicHeader.displayName = 'DynamicHeader';

export default React.memo(DynamicHeader);
