import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/app/hooks/useTheme';
import Text from '@/app/components/ui/Text';
import OnboardingBackButton from './OnboardingBackButton';
import ProgressBar from './ProgressBar';

interface OnboardingHeaderProps {
  title: string;
  subtitle?: string;
  currentStep: number;
  totalSteps: number;
  showBackButton?: boolean;
  onBack?: () => void;
}

const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({ 
  title, 
  subtitle, 
  currentStep, 
  totalSteps, 
  showBackButton = true, 
  onBack 
}) => {
  const { theme } = useTheme();
  const styles = useStyles();

  return (
    <View style={styles.headerContainer}>
      {/* Bouton retour et barre de progression */}
      <View style={styles.topSection}>
        <View style={styles.leftContainer}>
          {showBackButton && currentStep > 0 && onBack && (
            <OnboardingBackButton onPress={onBack} />
          )}
        </View>
        <View style={styles.progressContainer}>
          <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        </View>
      </View>

      {/* Titre et sous-titre */}
      <View style={styles.textSection}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
};

const useStyles = () => {
  const { theme } = useTheme();
  
  return StyleSheet.create({
    headerContainer: {
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    topSection: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    leftContainer: {
      width: 48,
      height: 48,
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    progressContainer: {
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    textSection: {
      alignItems: 'center',
    },
    title: {
      fontSize: theme.typography.fontSize['2xl'],
      fontFamily: theme.typography.fontFamily.bold,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.base,
      fontFamily: theme.typography.fontFamily.regular,
      textAlign: 'center',
      lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.base,
    },
  });
};

export default OnboardingHeader;
