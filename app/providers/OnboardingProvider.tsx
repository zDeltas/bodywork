import React, { createContext, useContext, useEffect, useState } from 'react';
import storageService from '@/app/services/storage';

interface OnboardingContextType {
  isOnboardingCompleted: boolean;
  setOnboardingCompleted: (completed: boolean) => void;
  checkOnboardingStatus: () => Promise<void>;
  isLoading: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboardingStatus = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboardingStatus must be used within OnboardingProvider');
  }
  return context;
};

interface OnboardingProviderProps {
  children: React.ReactNode;
}

const ONBOARDING_KEY = 'onboarding_completed';

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkOnboardingStatus = async () => {
    try {
      console.log('OnboardingProvider - Checking onboarding status...');
      const completed = await storageService.getOnboardingStatus();
      console.log('OnboardingProvider - Loaded onboarding status from storageService:', completed);
      const isCompleted = !!completed;
      console.log('OnboardingProvider - Parsed isCompleted:', isCompleted);
      setIsOnboardingCompleted(isCompleted);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // Default to not completed if there's an error
      setIsOnboardingCompleted(false);
    } finally {
      console.log('OnboardingProvider - Setting isLoading to false');
      setIsLoading(false);
    }
  };

  const setOnboardingCompleted = async (completed: boolean) => {
    try {
      await storageService.setOnboardingStatus(completed);
      setIsOnboardingCompleted(completed);
    } catch (error) {
      console.error('Error setting onboarding status:', error);
    }
  };

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  // Log onboarding info at app launch once loading completes
  useEffect(() => {
    if (!isLoading) {
      console.log('[Onboarding] Startup status => completed:', isOnboardingCompleted);
      storageService
        .getOnboardingProfile()
        .then((profile) => {
          if (profile) {
            console.log('[Onboarding] Startup userProfile:', profile);
          } else {
            console.log('[Onboarding] Startup userProfile: null');
          }
        })
        .catch((err) => console.error('[Onboarding] Error reading userProfile at startup:', err));
    }
  }, [isLoading, isOnboardingCompleted]);

  return (
    <OnboardingContext.Provider
      value={{
        isOnboardingCompleted,
        setOnboardingCompleted,
        checkOnboardingStatus,
        isLoading,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export default OnboardingProvider;
