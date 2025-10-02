/**
 * Types pour le système d'onboarding
 */

export type Gender = 'male' | 'female' | 'other';
export type BiologicalSex = 'male' | 'female'; // Pour body map anatomique
export type Goal = 'muscle_gain' | 'weight_loss' | 'fitness';
export type Level = 'beginner' | 'intermediate' | 'advanced';
export type Equipment = 'gym' | 'home' | 'limited';
export type MuscleGroup = 'legs' | 'back' | 'arms' | 'chest' | 'shoulders' | 'core' | 'full_body';
export type Language = 'fr' | 'en';
export type Units = 'metric' | 'imperial';
export type Theme = 'light' | 'dark' | 'system';

export interface UserProfile {
  // Profil de base
  name: string;
  gender: Gender;
  biologicalSex: BiologicalSex; // Pour body map anatomique
  birthDate: string; // ISO string
  height: number; // cm
  weight: number; // kg
  
  // Objectifs & niveau
  primaryGoal: Goal;
  fitnessLevel: Level;
  
  // Préférences d'entraînement
  weeklyWorkouts: number; // 1-7
  availableEquipment: Equipment[];
  priorityMuscleGroups: MuscleGroup[];
  
  // Paramètres d'application
  language: Language;
  units: Units;
  preferredTheme: Theme;
  enableRpe: boolean; // RPE enabled only for intermediate/advanced users
  
  // Métadonnées
  completedOnboarding: boolean;
  createdAt: string; // ISO string
}

export interface OnboardingStep {
  step: number;
  title: string;
  isValid: boolean;
}

export const INITIAL_USER_PROFILE: UserProfile = {
  name: '',
  gender: 'male',
  biologicalSex: 'male',
  birthDate: '',
  height: 175,
  weight: 70,
  primaryGoal: 'muscle_gain',
  fitnessLevel: 'beginner',
  weeklyWorkouts: 3,
  availableEquipment: ['gym'],
  priorityMuscleGroups: ['full_body'],
  language: 'fr',
  units: 'metric',
  preferredTheme: 'system',
  enableRpe: false, // Default to false, will be set based on fitness level
  completedOnboarding: false,
  createdAt: new Date().toISOString()
};
