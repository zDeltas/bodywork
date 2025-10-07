import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Play, Pause, Zap } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import Text from '@/app/components/ui/Text';

interface EmotionalActionButtonProps {
  hasActiveSession: boolean;
  onPress: () => void;
  userMood?: 'motivated' | 'tired' | 'energetic' | 'focused';
}

const EmotionalActionButton: React.FC<EmotionalActionButtonProps> = ({
  hasActiveSession,
  onPress,
  userMood = 'motivated'
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles();
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowOpacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const createPulseAnimation = () => {
      return Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]);
    };

    const createGlowAnimation = () => {
      return Animated.sequence([
        Animated.timing(glowOpacityAnim, {
          toValue: 0.6,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacityAnim, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]);
    };

    const pulseLoop = Animated.loop(createPulseAnimation());
    const glowLoop = Animated.loop(createGlowAnimation());
    
    pulseLoop.start();
    glowLoop.start();

    return () => {
      pulseLoop.stop();
      glowLoop.stop();
    };
  }, []);

  const getEmotionalMessage = () => {
    if (hasActiveSession) {
      return {
        primary: t('home.emotional.action.continue'),
        secondary: t('home.emotional.action.keepGoing'),
        icon: Pause
      };
    }

    switch (userMood) {
      case 'energetic':
        return {
          primary: t('home.emotional.action.unleash'),
          secondary: t('home.emotional.action.energyReady'),
          icon: Zap
        };
      case 'focused':
        return {
          primary: t('home.emotional.action.focus'),
          secondary: t('home.emotional.action.mindReady'),
          icon: Play
        };
      case 'tired':
        return {
          primary: t('home.emotional.action.gentle'),
          secondary: t('home.emotional.action.easyStart'),
          icon: Play
        };
      default:
        return {
          primary: t('home.emotional.action.transform'),
          secondary: t('home.emotional.action.readyToGrow'),
          icon: Play
        };
    }
  };

  const getMoodColor = () => {
    switch (userMood) {
      case 'energetic': return '#F72585';
      case 'focused': return theme.colors.primary;
      case 'tired': return theme.colors.warning;
      default: return '#4CC9F0';
    }
  };

  const message = getEmotionalMessage();
  const moodColor = getMoodColor();
  const ActionIcon = message.icon;

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.glowContainer,
          {
            backgroundColor: moodColor + '40',
            opacity: glowOpacityAnim,
            transform: [{ scale: pulseAnim }]
          }
        ]}
      />
      
      <TouchableOpacity
        style={[styles.button, { backgroundColor: moodColor }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Animated.View 
          style={[
            styles.buttonContent,
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          <ActionIcon size={28} color="white" />
          <View style={styles.textContainer}>
            <Text variant="subheading" style={styles.primaryText}>
              {message.primary}
            </Text>
            <Text variant="caption" style={styles.secondaryText}>
              {message.secondary}
            </Text>
          </View>
        </Animated.View>
      </TouchableOpacity>

      <View style={styles.emotionalHint}>
        <Text variant="caption" style={[styles.hintText, { color: moodColor }]}>
          {t(`home.emotional.mood.${userMood}`)}
        </Text>
      </View>
    </View>
  );
};

const useStyles = () => {
  const { theme } = useTheme();
  
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      marginHorizontal: theme.spacing.lg,
      marginVertical: theme.spacing.xl,
    },
    glowContainer: {
      position: 'absolute',
      width: '100%',
      height: 80,
      borderRadius: theme.borderRadius.full,
    },
    button: {
      width: '100%',
      height: 80,
      borderRadius: theme.borderRadius.full,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.lg,
      elevation: 8,
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    textContainer: {
      marginLeft: theme.spacing.md,
      flex: 1,
    },
    primaryText: {
      color: 'white',
      fontFamily: theme.typography.fontFamily.bold,
      fontSize: theme.typography.fontSize.lg,
      textShadowColor: 'rgba(0,0,0,0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    secondaryText: {
      color: 'rgba(255,255,255,0.9)',
      fontFamily: theme.typography.fontFamily.medium,
      marginTop: 2,
      textShadowColor: 'rgba(0,0,0,0.2)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 1,
    },
    emotionalHint: {
      marginTop: theme.spacing.sm,
    },
    hintText: {
      fontFamily: theme.typography.fontFamily.semibold,
      textTransform: 'uppercase',
      letterSpacing: 1,
      fontSize: 11,
    },
  });
};

export default React.memo(EmotionalActionButton);
