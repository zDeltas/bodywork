import { createContext, useContext } from 'react';
import { UserProfile } from '@/types/onboarding';

const STORAGE_KEY = 'userProfile';

interface ValidationErrors {
  name?: string;
  height?: string;
  weight?: string;
  birthDate?: string;
  equipment?: string;
  priorityMuscleGroups?: string;
}

export type OnboardingContextType = {
  // State
  profile: UserProfile;
  currentStep: number;
  isLoading: boolean;
  errors: ValidationErrors;
  isCompleted: boolean;
  // Profile updates
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateBasicProfile: (updates: Partial<Pick<UserProfile, 'name' | 'gender' | 'birthDate' | 'height' | 'weight'>>) => void;
  updateGoalsLevel: (updates: Partial<Pick<UserProfile, 'primaryGoal' | 'fitnessLevel'>>) => void;
  updateWorkoutPrefs: (updates: Partial<Pick<UserProfile, 'weeklyWorkouts' | 'availableEquipment' | 'priorityMuscleGroups'>>) => void;
  updateAppSettings: (updates: Partial<Pick<UserProfile, 'language' | 'units' | 'nutritionTracking'>>) => void;
  // Navigation
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  // Storage
  saveProfile: () => Promise<boolean>;
  loadProfile: () => Promise<UserProfile | null>;
  resetProfile: () => Promise<void>;
  // Utilities
  getStepProgress: () => number;
  isStepValid: (step: number) => boolean;
  canProceed: () => boolean;
  validateCurrentStep: () => boolean;
  completeOnboarding: () => Promise<void>;
};
export const OnboardingFlowContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = (): OnboardingContextType => {
  const ctx = useContext(OnboardingFlowContext);
  if (!ctx) {
    throw new Error('useOnboarding must be used within an OnboardingFlowProvider');
  }
  return ctx as OnboardingContextType;
};
