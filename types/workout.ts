import { Series, Workout } from './common';

export { Workout, Series };

export const WorkoutDateUtils = {
  getDatePart: (isoString: string): string => {
    return isoString.split('T')[0];
  },

  createISOString: (dateString: string): string => {
    return new Date(dateString).toISOString();
  },

  formatForDisplay: (isoString: string, locale: string = 'en'): string => {
    const date = new Date(isoString);
    return date.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  },
};
