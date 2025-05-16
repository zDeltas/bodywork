import { StyleSheet, TouchableOpacity } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { router } from 'expo-router';

interface FloatingActionButtonProps {
  onPress?: () => void;
  onLongPress?: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export function FloatingActionButton({
  onPress,
  onLongPress,
  position = 'bottom-right',
}: FloatingActionButtonProps) {
  const { theme } = useTheme();
  const styles = useStyles(position);

  const defaultOnPress = () => {
    const today = new Date().toISOString().split('T')[0];
    router.push({
      pathname: '/screens/workout/new',
      params: { selectedDate: today },
    });
  };

  const defaultOnLongPress = () => {
    router.push('/screens/routines/new');
  };

  return (
    <TouchableOpacity
      style={styles.floatingButton}
      onPress={onPress || defaultOnPress}
      onLongPress={onLongPress || defaultOnLongPress}
      activeOpacity={0.8}
    >
      <Plus color={theme.colors.text.primary} size={28} />
    </TouchableOpacity>
  );
}

const useStyles = (position: FloatingActionButtonProps['position']) => {
  const { theme } = useTheme();

  const getPosition = () => {
    switch (position) {
      case 'bottom-left':
        return {
          bottom: 20,
          left: theme.spacing.base,
        };
      case 'top-right':
        return {
          top: theme.spacing.base,
          right: theme.spacing.base,
        };
      case 'top-left':
        return {
          top: theme.spacing.base,
          left: theme.spacing.base,
        };
      default:
        return {
          bottom: 20,
          right: theme.spacing.base,
        };
    }
  };

  return StyleSheet.create({
    floatingButton: {
      position: 'absolute',
      width: 60,
      height: 60,
      borderRadius: theme.borderRadius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      ...getPosition(),
      zIndex: 999,
    },
  });
}; 
