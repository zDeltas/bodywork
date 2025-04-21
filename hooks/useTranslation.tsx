import { useSettings } from './useSettings';
import { translations, TranslationKey, Language } from '@/translations';

export const useTranslation = () => {
  const { settings } = useSettings();
  
  // Use the language from settings, or default to 'fr' if not set
  const language = (settings.language || 'fr') as Language;
  
  // Function to get a translation by key
  const t = (key: TranslationKey): string => {
    return translations[language][key] as string;
  };
  
  return {
    t,
    language,
  };
};
