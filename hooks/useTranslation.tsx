import { useSettings } from './useSettings';
import { Language, TranslationKey, translations } from '@/translations';

export const useTranslation = () => {
  const { settings } = useSettings();

  // Use the language from settings, or default to 'fr' if not set
  const language = (settings.language || 'fr') as Language;

  // Function to get a translation by key
  const t = (key: TranslationKey): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      value = value[k];
      if (value === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    return value as string;
  };

  return {
    t,
    language
  };
};
