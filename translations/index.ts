import en from './en';
import fr from './fr';

export const translations = {
  en,
  fr
};

// Create a type for the translation keys based on the English translations
export type TranslationKey = keyof typeof en;

// Export the available languages
export type Language = 'en' | 'fr';
export const languages: Language[] = ['en', 'fr'];

// Get the language name in the current language
export const getLanguageName = (language: Language, currentLanguage: Language): string => {
  if (language === 'en') {
    return translations[currentLanguage].english as string;
  } else if (language === 'fr') {
    return translations[currentLanguage].french as string;
  }
  return language;
};
