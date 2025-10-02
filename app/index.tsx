import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useOnboardingStatus } from '@/app/providers/OnboardingProvider';
import { useTheme } from '@/app/hooks/useTheme';
import Text from '@/app/components/ui/Text';
import { resetOnboarding, checkOnboardingStatus } from '@/app/utils/resetOnboarding';

const IndexScreen: React.FC = () => {
  const { theme } = useTheme();
  const { isOnboardingCompleted, isLoading } = useOnboardingStatus();
  const [hasNavigated, setHasNavigated] = useState(false);
  const styles = useStyles();

  const handleResetOnboarding = async () => {
    console.log('Resetting onboarding...');
    await resetOnboarding();
    router.replace('/screens/onboarding/OnboardingScreen');
  };

  const handleCheckStatus = async () => {
    const status = await checkOnboardingStatus();
    console.log('Current status:', status);
  };

  useEffect(() => {
    console.log('IndexScreen - isLoading:', isLoading, 'isOnboardingCompleted:', isOnboardingCompleted, 'hasNavigated:', hasNavigated);
    
    if (!isLoading && !hasNavigated) {
      setHasNavigated(true);
      
      if (isOnboardingCompleted) {
        console.log('Navigating to main app');
        router.replace('/(tabs)');
      } else {
        console.log('Navigating to onboarding');
        router.replace('/screens/onboarding/OnboardingScreen');
      }
    }
  }, [isLoading, isOnboardingCompleted, hasNavigated]);

  // Show loading screen while checking onboarding status
  return (
    <View style={styles.container}>
      <Text style={[styles.loadingText, { color: theme.colors.text.primary }]}>
        {isLoading ? 'Chargement...' : 'Redirection...'}
      </Text>
      <Text style={[styles.debugText, { color: theme.colors.text.secondary }]}>
        Loading: {isLoading.toString()}, Completed: {isOnboardingCompleted.toString()}
      </Text>
      
      <View style={styles.debugButtons}>
        <TouchableOpacity 
          style={[styles.debugButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleResetOnboarding}
        >
          <Text style={[styles.debugButtonText, { color: theme.colors.text.onPrimary }]}>
            Reset Onboarding
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.debugButton, { backgroundColor: theme.colors.text.secondary }]}
          onPress={handleCheckStatus}
        >
          <Text style={[styles.debugButtonText, { color: theme.colors.text.onPrimary }]}>
            Check Status
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const useStyles = () => {
  const { theme } = useTheme();
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.main,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: theme.typography.fontSize.lg,
      fontFamily: theme.typography.fontFamily.medium,
      marginBottom: theme.spacing.md,
    },
    debugText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    debugButtons: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    debugButton: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
    },
    debugButtonText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.semiBold,
    },
  });
};

export default IndexScreen;
