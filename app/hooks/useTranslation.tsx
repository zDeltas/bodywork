import { useSettings } from './useSettings';
import { Language, TranslationKey, translations } from '@/translations';

export const useTranslation = () => {
  const { settings } = useSettings();

  const language = (settings.language || 'fr') as Language;

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (!value || typeof value !== 'object') {
        console.warn(`Translation path broken for key: ${key}`);
        return String(key);
      }
      value = value[k];
      if (value === undefined) {
        console.warn(`Translation key not found: ${key}`);
        return String(key);
      }
    }

    if (typeof value === 'object') {
      console.warn(`Translation value for key ${key} is an object, not a string`);
      return String(key);
    }

    let result = String(value);
    
    // Handle parameter interpolation
    if (params) {
      Object.keys(params).forEach(paramKey => {
        const placeholder = `{${paramKey}}`;
        result = result.replace(new RegExp(placeholder, 'g'), String(params[paramKey]));
      });
    }

    return result;
  };

  return {
    t,
    language
  };
};

export default useTranslation;
