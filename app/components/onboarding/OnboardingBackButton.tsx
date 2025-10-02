import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';

interface OnboardingBackButtonProps {
  onPress: () => void;
}

const OnboardingBackButton: React.FC<OnboardingBackButtonProps> = ({ onPress }) => {
  const { theme } = useTheme();
  const styles = useStyles();

  return (
    <TouchableOpacity
      style={styles.goBackButton}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <ArrowLeft size={24} color={theme.colors.text.primary} />
    </TouchableOpacity>
  );
};

const useStyles = () => {
  const { theme } = useTheme();
  
  return StyleSheet.create({
    goBackButton: {
      padding: theme.spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
};

export default OnboardingBackButton;
