import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/app/hooks/useTheme';
import OnboardingHeader from './OnboardingHeader';
import OnboardingFooter from './OnboardingFooter';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  onNext?: () => void;
  onSkip?: () => void;
  nextButtonText?: string;
  skipButtonText?: string;
  showSkipButton?: boolean;
  nextButtonDisabled?: boolean;
  footerType?: 'single' | 'double' | 'custom';
  customFooter?: React.ReactNode;
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  children,
  currentStep,
  totalSteps,
  title,
  subtitle,
  showBackButton = true,
  onBack,
  onNext,
  onSkip,
  nextButtonText,
  skipButtonText,
  showSkipButton = false,
  nextButtonDisabled = false,
  footerType = 'single',
  customFooter,
}) => {
  const { theme } = useTheme();
  const styles = useStyles();

  return (
    <View style={styles.container}>
      {/* Header fixe en haut */}
      <OnboardingHeader 
        title={title} 
        subtitle={subtitle}
        currentStep={currentStep}
        totalSteps={totalSteps}
        showBackButton={showBackButton}
        onBack={onBack}
      />

      <ScrollView
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          {children}
        </View>
      </ScrollView>

      {/* Footer avec boutons */}
      {customFooter || (
        <OnboardingFooter
          type={footerType}
          onNext={onNext}
          onSkip={onSkip}
          nextButtonText={nextButtonText}
          skipButtonText={skipButtonText}
          showSkipButton={showSkipButton}
          nextButtonDisabled={nextButtonDisabled}
        />
      )}
    </View>
  );
};

const useStyles = () => {
  const { theme } = useTheme();
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.main,
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      paddingBottom: theme.spacing['3xl'] + 80, // Espace pour le footer fixe
    },
    form: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
    },
  });
};

export default OnboardingLayout;
