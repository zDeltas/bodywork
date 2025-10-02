import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useOnboarding } from '@/app/hooks/useOnboarding';
import { useSettings } from '@/app/hooks/useSettings';
import { useTranslation } from '@/app/hooks/useTranslation';
import Text from '@/app/components/ui/Text';
import OnboardingLayout from '@/app/components/onboarding/OnboardingLayout';
import { Check } from 'lucide-react-native';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const AVAILABLE_LANGUAGES: Language[] = [
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
];

const LanguageSelectionScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { nextStep, previousStep, currentStep, updateProfile } = useOnboarding();
  const { settings, updateSettings } = useSettings();
  const [selectedLanguage, setSelectedLanguage] = useState<string>(settings.language || 'fr');
  const styles = useStyles();

  const handleLanguageSelect = async (languageCode: string) => {
    setSelectedLanguage(languageCode);
    await updateSettings({ language: languageCode as 'fr' | 'en' });
  };

  const handleContinue = async () => {
    await updateSettings({ language: selectedLanguage as 'fr' | 'en' });
    updateProfile({ language: selectedLanguage as 'fr' | 'en' });
    nextStep();
  };

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={8}
      title={t('onboarding.languageSelection.title')}
      showBackButton={true}
      onBack={previousStep}
      onNext={handleContinue}
      nextButtonText={t('onboarding.continue')}
      footerType="single"
    >
      <View style={styles.languageList}>
        {AVAILABLE_LANGUAGES.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={[
              styles.languageItem,
              {
                backgroundColor: selectedLanguage === language.code 
                  ? theme.colors.primaryLight 
                  : theme.colors.background.card,
                borderColor: selectedLanguage === language.code 
                  ? theme.colors.primary 
                  : theme.colors.border.default,
              }
            ]}
            onPress={() => handleLanguageSelect(language.code)}
          >
            <View style={styles.languageContent}>
              <Text style={styles.flag}>{language.flag}</Text>
              <View style={styles.languageText}>
                <Text style={[styles.languageName, { color: theme.colors.text.primary }]}>
                  {language.nativeName}
                </Text>
                <Text style={[styles.languageSubname, { color: theme.colors.text.secondary }]}>
                  {language.name}
                </Text>
              </View>
            </View>
            {selectedLanguage === language.code && (
              <Check 
                size={24} 
                color={theme.colors.primary} 
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </OnboardingLayout>
  );
};

const useStyles = () => {
  const { theme } = useTheme();
  
  return StyleSheet.create({
    languageList: {
      flex: 1,
      gap: theme.spacing.md,
    },
    languageItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      borderWidth: 2,
    },
    languageContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    flag: {
      fontSize: 32,
      marginRight: theme.spacing.md,
    },
    languageText: {
      flex: 1,
    },
    languageName: {
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.semiBold,
      marginBottom: theme.spacing.xs,
    },
    languageSubname: {
      fontSize: theme.typography.fontSize.md,
      fontFamily: theme.typography.fontFamily.regular,
    },
  });
};

export default LanguageSelectionScreen;
