import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Play, RotateCcw } from 'lucide-react-native';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import Text from '@/app/components/ui/Text';

interface StartSessionButtonProps {
  onPress: () => void;
  hasActiveSession?: boolean;
}

const StartSessionButton: React.FC<StartSessionButtonProps> = ({
  onPress,
  hasActiveSession = false
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();

  // Animation de pulsation subtile et sophistiquée
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  
  React.useEffect(() => {
    // Animation de pulsation douce
    scale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      false
    );
    
    // Animation d'opacité subtile pour l'effet "glow"
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 2000 }),
        withTiming(1, { duration: 2000 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const buttonText = hasActiveSession 
    ? t('home.resumeSession')
    : t('home.startSession');

  const IconComponent = hasActiveSession ? RotateCcw : Play;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity 
        onPress={onPress}
        activeOpacity={0.8}
        style={styles.touchable}
      >
        {/* Dégradé simulé avec des vues superposées */}
        <View style={styles.gradientContainer}>
          <View style={[styles.gradientLayer, styles.gradientPrimary]} />
          <View style={[styles.gradientLayer, styles.gradientSecondary]} />
          
          {/* Contenu du bouton */}
          <View style={styles.buttonContent}>
            <IconComponent 
              size={24} 
              color="#FFFFFF" 
              style={styles.icon}
            />
            <Text variant="body" style={styles.buttonText}>
              {buttonText}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const useStyles = () => {
  const { theme } = useTheme();
  
  return StyleSheet.create({
    container: {
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
    },
    touchable: {
      borderRadius: 32,
      overflow: 'hidden',
      ...theme.shadows.lg,
      shadowColor: '#F72585',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 15,
    },
    gradientContainer: {
      position: 'relative',
      borderRadius: 32,
      overflow: 'hidden',
    },
    gradientLayer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    gradientPrimary: {
      backgroundColor: '#4CC9F0',
    },
    gradientSecondary: {
      backgroundColor: '#F72585',
      opacity: 0.7,
      transform: [{ translateX: 50 }, { skewX: '-15deg' }],
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
      gap: theme.spacing.sm,
      position: 'relative',
      zIndex: 1,
    },
    icon: {
      marginRight: theme.spacing.xs,
      shadowColor: '#000000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '700',
      textAlign: 'center',
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
  });
};

StartSessionButton.displayName = 'StartSessionButton';

export default React.memo(StartSessionButton);
