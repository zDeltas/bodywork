import AsyncStorage from '@react-native-async-storage/async-storage';

export const resetOnboarding = async () => {
  try {
    await AsyncStorage.removeItem('onboarding_completed');
    await AsyncStorage.removeItem('userProfile');
    console.log('Onboarding reset successfully');
    return true;
  } catch (error) {
    console.error('Error resetting onboarding:', error);
    return false;
  }
};

export const checkOnboardingStatus = async () => {
  try {
    const onboardingCompleted = await AsyncStorage.getItem('onboarding_completed');
    const userProfile = await AsyncStorage.getItem('userProfile');
    console.log('Onboarding status:', {
      onboardingCompleted,
      userProfile: userProfile ? 'exists' : 'not found'
    });
    return {
      onboardingCompleted,
      userProfile
    };
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return null;
  }
};
