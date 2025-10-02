import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/app/hooks/useTheme';
import { useOnboarding } from '@/app/hooks/useOnboarding';
import OnboardingFlowProvider from '@/app/providers/OnboardingFlowProvider';
import InitialWelcomeScreen from './InitialWelcomeScreen';
import LanguageSelectionScreen from './LanguageSelectionScreen';
import ThemeSelectionScreen from './ThemeSelectionScreen';
import DataExplanationScreen from './DataExplanationScreen';
import BasicProfileScreen from './BasicProfileScreen';
import GoalsLevelScreen from './GoalsLevelScreen';
import WorkoutPrefsScreen from './WorkoutPrefsScreen';
import AppSettingsScreen from './AppSettingsScreen';
import WelcomeScreen from './WelcomeScreen';

const OnboardingContent: React.FC = () => {
  const { theme } = useTheme();
  const styles = useStyles();
  const { currentStep, isCompleted } = useOnboarding();

  // If onboarding is completed, show welcome screen
  if (isCompleted) {
    return <WelcomeScreen />;
  }

  // Render the appropriate step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <InitialWelcomeScreen />;
      case 1:
        return <LanguageSelectionScreen />;
      case 2:
        return <ThemeSelectionScreen />;
      case 3:
        return <DataExplanationScreen />;
      case 4:
        return <BasicProfileScreen />;
      case 5:
        return <GoalsLevelScreen />;
      case 6:
        return <WorkoutPrefsScreen />;
      case 7:
        return <AppSettingsScreen />;
      default:
        return <InitialWelcomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {renderCurrentStep()}
      </View>
    </SafeAreaView>
  );
};

const OnboardingScreen: React.FC = () => {
  return (
    <OnboardingFlowProvider>
      <OnboardingContent />
    </OnboardingFlowProvider>
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
  });
};

export default OnboardingScreen;
