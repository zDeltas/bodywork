import React, { useState, useCallback, useMemo } from 'react';
import { router } from 'expo-router';
import {
  UserProfile,
  INITIAL_USER_PROFILE,
  Gender,
  BiologicalSex,
  Goal,
  Level,
  Equipment,
  MuscleGroup,
  Language,
  Units,
} from '@/types/onboarding';
import { useOnboardingStatus } from '@/app/providers/OnboardingProvider';
import { OnboardingFlowContext, OnboardingContextType } from '@/app/hooks/useOnboarding';
import storageService, { StorageKeys } from '@/app/services/storage';

interface ValidationErrors {
  name?: string;
  height?: string;
  weight?: string;
  birthDate?: string;
  equipment?: string;
  priorityMuscleGroups?: string;
}

const OnboardingFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setOnboardingCompleted } = useOnboardingStatus();
  const [profile, setProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isCompleted, setIsCompleted] = useState(false);

  // Validation functions
  const validateStep1 = useCallback((): ValidationErrors => {
    const stepErrors: ValidationErrors = {};

    if (!profile.name.trim()) {
      stepErrors.name = 'Le nom est requis';
    }

    if (!profile.birthDate) {
      stepErrors.birthDate = 'La date de naissance est requise';
    }

    if (profile.height < 100 || profile.height > 250) {
      stepErrors.height = 'Taille invalide (100-250 cm)';
    }

    if (profile.weight < 30 || profile.weight > 300) {
      stepErrors.weight = 'Poids invalide (30-300 kg)';
    }

    return stepErrors;
  }, [profile]);

  const validateStep3 = useCallback((): ValidationErrors => {
    const stepErrors: ValidationErrors = {};

    if (profile.availableEquipment.length === 0) {
      stepErrors.equipment = "Sélectionnez au moins un type d'équipement";
    }

    if (profile.priorityMuscleGroups.length === 0) {
      stepErrors.priorityMuscleGroups = 'Sélectionnez au moins un groupe musculaire';
    }

    return stepErrors;
  }, [profile]);

  const validateCurrentStep = useCallback((): boolean => {
    let stepErrors: ValidationErrors = {};

    switch (currentStep) {
      case 0: // Initial welcome - no validation needed
      case 1: // Language selection - no validation needed
      case 2: // Theme selection - no validation needed
      case 3: // Data explanation - no validation needed
        stepErrors = {};
        break;
      case 4: // Basic profile
        stepErrors = validateStep1();
        break;
      case 5: // Goals & Level - no validation needed
        stepErrors = {};
        break;
      case 6: // Workout preferences
        stepErrors = validateStep3();
        break;
      case 7: // App settings - no validation needed
        stepErrors = {};
        break;
      default:
        stepErrors = {};
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }, [currentStep, validateStep1, validateStep3]);

  // Profile update functions
  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
    setErrors(prev => ({
      ...prev,
      ...Object.keys(updates).reduce((acc, key) => ({ ...acc, [key]: undefined }), {} as ValidationErrors),
    }));
  }, []);

  const updateBasicProfile = useCallback((updates: {
    name?: string;
    gender?: Gender;
    biologicalSex?: BiologicalSex;
    birthDate?: string;
    height?: number;
    weight?: number;
  }) => {
    setProfile(prev => ({ ...prev, ...updates }));
    setErrors(prev => ({
      ...prev,
      ...Object.keys(updates).reduce((acc, key) => ({ ...acc, [key]: undefined }), {} as ValidationErrors),
    }));
  }, []);

  const updateGoalsLevel = useCallback((updates: {
    primaryGoal?: Goal;
    fitnessLevel?: Level;
  }) => {
    setProfile(prev => ({ ...prev, ...updates }));
  }, []);

  const updateWorkoutPrefs = useCallback((updates: {
    weeklyWorkouts?: number;
    availableEquipment?: Equipment[];
    priorityMuscleGroups?: MuscleGroup[];
  }) => {
    setProfile(prev => ({ ...prev, ...updates }));
    setErrors(prev => ({
      ...prev,
      ...Object.keys(updates).reduce((acc, key) => ({ ...acc, [key]: undefined }), {} as ValidationErrors),
    }));
  }, []);

  const updateAppSettings = useCallback((updates: {
    language?: Language;
    units?: Units;
    enableRpe?: boolean;
  }) => {
    setProfile(prev => ({ ...prev, ...updates }));
  }, []);

  // Navigation functions
  const nextStep = useCallback(() => {
    if (validateCurrentStep()) {
      // If we're at the last step (7), show welcome screen instead of completing
      if (currentStep === 7) {
        setIsCompleted(true);
      } else {
        setCurrentStep(prev => Math.min(prev + 1, 7));
      }
    }
  }, [validateCurrentStep, currentStep]);

  const previousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    setErrors({});
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step <= 7) {
      setCurrentStep(step);
      setErrors({});
    }
  }, []);

  // Storage functions
  const saveProfile = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);

      if (!validateCurrentStep()) {
        return false;
      }

      const finalProfile: UserProfile = {
        ...profile,
        completedOnboarding: true,
        createdAt: new Date().toISOString(),
      };

      // Debug: log profile on save
      console.log('[Onboarding] Saving profile:', finalProfile);

      await storageService.setOnboardingProfile(finalProfile);
      setProfile(finalProfile);

      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [profile, validateCurrentStep]);

  const loadProfile = useCallback(async (): Promise<UserProfile | null> => {
    try {
      setIsLoading(true);
      const stored = await storageService.getOnboardingProfile();
      if (stored) {
        setProfile(stored);
        return stored;
      }

      return null;
    } catch (error) {
      console.error('Error loading profile:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetProfile = useCallback(async () => {
    try {
      await storageService.removeItem(StorageKeys.ONBOARDING_PROFILE);
      setProfile(INITIAL_USER_PROFILE);
      setCurrentStep(0);
      setErrors({});
    } catch (error) {
      console.error('Error resetting profile:', error);
    }
  }, []);

  // Utility functions
  const getStepProgress = useCallback(() => {
    return (currentStep / 7) * 100;
  }, [currentStep]);

  const isStepValid = useCallback((step: number): boolean => {
    const tempStep = currentStep;
    setCurrentStep(step);
    const valid = validateCurrentStep();
    setCurrentStep(tempStep);
    return valid;
  }, [currentStep, validateCurrentStep]);

  const canProceed = useCallback((): boolean => {
    return validateCurrentStep();
  }, [validateCurrentStep]);

  const completeOnboarding = useCallback(async () => {
    try {
      setIsLoading(true);

      // Save the final profile
      const finalProfile: UserProfile = {
        ...profile,
        completedOnboarding: true,
        createdAt: new Date().toISOString(),
      };

      // Debug: log profile on finish
      console.log('[Onboarding] Completing onboarding with profile:', finalProfile);

      await storageService.setOnboardingProfile(finalProfile);
      setProfile(finalProfile);

      // Mark onboarding as completed in the provider FIRST
      await storageService.setOnboardingStatus(true);
      setOnboardingCompleted(true);

      // Wait a bit to ensure state is propagated
      await new Promise(resolve => setTimeout(resolve, 100));

      // Navigate to main app
      console.log('[Onboarding] Navigating to main app...');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  }, [profile, setOnboardingCompleted]);

  const value = useMemo<OnboardingContextType>(
    () => ({
      profile,
      currentStep,
      isLoading,
      errors,
      isCompleted,
      updateProfile,
      updateBasicProfile,
      updateGoalsLevel,
      updateWorkoutPrefs,
      updateAppSettings,
      nextStep,
      previousStep,
      goToStep,
      saveProfile,
      loadProfile,
      resetProfile,
      getStepProgress,
      isStepValid,
      canProceed,
      validateCurrentStep,
      completeOnboarding,
    }), [
      profile,
      currentStep,
      isLoading,
      errors,
      isCompleted,
      updateProfile,
      updateBasicProfile,
      updateGoalsLevel,
      updateWorkoutPrefs,
      updateAppSettings,
      nextStep,
      previousStep,
      goToStep,
      saveProfile,
      loadProfile,
      resetProfile,
      getStepProgress,
      isStepValid,
      canProceed,
      validateCurrentStep,
      completeOnboarding,
    ],
  );

  return (
    <OnboardingFlowContext.Provider value={value}>
      {children}
    </OnboardingFlowContext.Provider>
  );
};

export default OnboardingFlowProvider;
