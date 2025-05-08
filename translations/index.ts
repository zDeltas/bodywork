import en from './en';
import fr from './fr';

export const translations = {
  en,
  fr
};

// Improved type for accessing nested translations
type RecursiveKeyOf<TObj extends object> = {
  [TKey in keyof TObj & (string | number)]: TObj[TKey] extends object
    ? `${TKey}` | `${TKey}.${RecursiveKeyOf<TObj[TKey]>}`
    : `${TKey}`
}[keyof TObj & (string | number)];

export type TranslationKey = RecursiveKeyOf<typeof en>;

// Export the available languages
export type Language = 'en' | 'fr';

// Helper type for measurement keys from the translations
export type MeasurementTranslationKey = 
  | 'measurements.neck'
  | 'measurements.shoulders'
  | 'measurements.chest'
  | 'measurements.arms'
  | 'measurements.forearms'
  | 'measurements.waist'
  | 'measurements.hips'
  | 'measurements.thighs'
  | 'measurements.calves';
