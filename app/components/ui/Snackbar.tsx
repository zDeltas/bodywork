import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react-native';
import Text from '@/app/components/ui/Text';
import { useTheme } from '@/app/hooks/useTheme';

export type MessageType = 'success' | 'error' | 'warning' | 'info';

interface SnackbarProps {
  visible: boolean;
  type: MessageType;
  message: string;
  duration?: number;
  onDismiss: () => void;
}

const Snackbar: React.FC<SnackbarProps> = ({
  visible,
  type,
  message,
  duration = 3000,
  onDismiss
}) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);
  const translateY = useRef(new Animated.Value(100)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    if (visible) {
      // Reset des valeurs
      translateX.setValue(0);
      progressWidth.setValue(100);
      
      // Animation d'entrée
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Animation de la barre de progression
      Animated.timing(progressWidth, {
        toValue: 0,
        duration: duration,
        useNativeDriver: false,
      }).start();

      // Auto-dismiss
      const timer = setTimeout(() => {
        onDismiss();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      // Animation de sortie
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, duration, onDismiss, translateY, translateX, opacity, progressWidth]);


  const getIcon = () => {
    const iconSize = 20;
    const iconColor = getIconColor();
    
    switch (type) {
      case 'success':
        return <CheckCircle size={iconSize} color={iconColor} />;
      case 'error':
        return <XCircle size={iconSize} color={iconColor} />;
      case 'warning':
        return <AlertCircle size={iconSize} color={iconColor} />;
      case 'info':
        return <Info size={iconSize} color={iconColor} />;
      default:
        return <CheckCircle size={iconSize} color={iconColor} />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return theme.colors.success;
      case 'error':
        return theme.colors.error;
      case 'warning':
        return theme.colors.warning;
      case 'info':
        return theme.colors.info;
      default:
        return theme.colors.primary;
    }
  };

  const getIconColor = () => {
    return theme.colors.text.onPrimary;
  };

  const getProgressColor = () => {
    return 'rgba(255, 255, 255, 0.4)';
  };

  const handleGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const handleGestureStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, velocityX } = event.nativeEvent;
      
      // Si le glissement est suffisant ou la vélocité est élevée, fermer
      if (Math.abs(translationX) > 100 || Math.abs(velocityX) > 500) {
        // Animation de sortie par glissement
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: translationX > 0 ? 300 : -300,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onDismiss();
        });
      } else {
        // Retour à la position initiale
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      }
    }
  };

  if (!visible) return null;

  return (
    <PanGestureHandler
      onGestureEvent={handleGestureEvent}
      onHandlerStateChange={handleGestureStateChange}
    >
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY }, { translateX }],
            opacity,
            backgroundColor: getBackgroundColor(),
          },
        ]}
      >
        {/* Barre de progression */}
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: getProgressColor(),
            },
          ]}
        />
        
        <View style={styles.content}>
          {getIcon()}
          <Text variant="body" style={styles.message} numberOfLines={2}>
            {message}
          </Text>
          
          {/* Bouton de fermeture */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onDismiss}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={18} color={getIconColor()} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
};

const useStyles = (theme: any) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: theme.spacing.xl + theme.spacing['3xl'] + theme.spacing.sm,
    left: theme.spacing.base,
    right: theme.spacing.base,
    borderRadius: theme.borderRadius.lg,
    minHeight: 56,
    ...theme.shadows.md,
    zIndex: theme.zIndex.toast,
    overflow: 'hidden',
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 4,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.md,
    paddingTop: theme.spacing.md + 4, // Extra padding pour la barre de progression
    minHeight: 56,
  },
  message: {
    flex: 1,
    color: theme.colors.text.onPrimary,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.regular,
    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.md,
    marginLeft: theme.spacing.md,
    marginRight: theme.spacing.md,
  },
  closeButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Snackbar;
