import { EditableSeries } from '@/types/common';

/**
 * Utilitaires pour la gestion des routines
 * Logique métier pure sans dépendances React
 */

/**
 * Formate le temps de repos en format mm:ss
 */
export const formatRestTime = (minutes: number, seconds: number): string => {
  if (minutes === 0 && seconds === 0) return '';
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Parse le temps de repos depuis le format mm:ss
 */
export const parseRestTime = (timeString: string): { minutes: number; seconds: number } => {
  if (!timeString || timeString === '00:00') {
    return { minutes: 0, seconds: 0 };
  }
  
  const [minutes, seconds] = timeString.split(':').map(Number);
  return { 
    minutes: minutes || 0, 
    seconds: seconds || 0 
  };
};

/**
 * Formate la durée en format mm:ss
 */
export const formatDuration = (minutes: number, seconds: number): string => {
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Valide si une série est complète selon son type d'unité
 */
export const isSeriesValid = (series: EditableSeries): boolean => {
  switch (series.unitType) {
    case 'repsAndWeight':
      return !!(series.weight && series.reps);
    case 'reps':
      return !!series.reps;
    case 'time':
      return !!series.duration;
    case 'distance':
      return !!series.distance;
    default:
      return false;
  }
};

/**
 * Valide si un titre de routine est valide
 */
export const isRoutineTitleValid = (title: string): boolean => {
  return title.trim().length > 0;
};

/**
 * Valide si une routine est complète pour la sauvegarde
 */
export const isRoutineComplete = (title: string, exercisesCount: number): boolean => {
  return isRoutineTitleValid(title) && exercisesCount > 0;
};

/**
 * Génère un ID unique pour une routine
 */
export const generateRoutineId = (): string => {
  return `routine_${Date.now()}_${Math.random().toString(36)}`;
};

/**
 * Génère une clé unique pour un exercice
 */
export const generateExerciseKey = (exerciseKey: string): string => {
  return `${exerciseKey}_${Date.now()}`;
};

/**
 * Crée une série vide avec les paramètres par défaut
 */
export const createEmptySeries = (
  unitType: 'repsAndWeight' | 'reps' | 'time' | 'distance' = 'repsAndWeight',
  seriesType: 'warmUp' | 'workingSet' = 'workingSet',
  rest: string = ''
): EditableSeries => ({
  unitType,
  weight: '',
  reps: '',
  duration: '',
  distance: '',
  note: '',
  rest,
  type: seriesType
});

/**
 * Détermine si la charge est applicable pour un type d'unité donné
 */
export const isLoadApplicable = (unitType: string): boolean => {
  return unitType === 'time' || unitType === 'distance';
};

/**
 * Calcule le nombre total de séries dans une liste d'exercices
 */
export const getTotalSeriesCount = (exercises: any[]): number => {
  return exercises.reduce((total, exercise) => total + exercise.series.length, 0);
};

/**
 * Calcule la durée estimée d'une routine (approximative)
 */
export const estimateRoutineDuration = (exercises: any[]): number => {
  // Estimation basique : 30 secondes par série + temps de repos moyen
  const totalSeries = getTotalSeriesCount(exercises);
  const averageRestTime = 90; // 1.5 minutes en secondes
  const averageSeriesTime = 30; // 30 secondes par série
  
  return totalSeries * (averageSeriesTime + averageRestTime);
};

/**
 * Formate la durée estimée en format lisible
 */
export const formatEstimatedDuration = (durationInSeconds: number): string => {
  const minutes = Math.round(durationInSeconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}min`;
};
