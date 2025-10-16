// Types et interfaces
export type MuscleGroupKey = 
  | 'chest'
  | 'back' 
  | 'legs'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'core'
  | 'obliques'
  | 'forearms'
  | 'abductors'
  | 'adductors'
  | 'quadriceps'
  | 'trapezius'
  | 'hamstrings'
  | 'calves'
  | 'cardio';

export interface ExerciseDefinition {
  key: string;
  primaryMuscle: MuscleGroupKey;
  secondaryMuscles?: MuscleGroupKey[];
  // Optional richer metadata
  kind?: ExerciseKind; // strength_* or cardio_*
  cardioMode?: 'walk' | 'run' | 'bike' | 'row' | 'elliptical' | 'other';
  defaultMet?: number; // optional override/default MET
  supportsGrade?: boolean; // for treadmill walking/running (ACSM)
  supportsPower?: boolean; // for cycling ergometer (ACSM)
}

// Interface pour les exercices avec traductions (compatible avec types/common.ts)
export interface Exercise {
  name: string;
  key: string;
  translationKey: string;
  series: any[];
  primaryMuscle?: MuscleGroupKey;
  secondaryMuscles?: MuscleGroupKey[];
}

// Données des exercices prédéfinis
export const muscleGroupKeys: MuscleGroupKey[] = [
  'chest',
  'back',
  'legs',
  'shoulders',
  'biceps',
  'triceps',
  'core',
  'obliques',
  'forearms',
  'abductors',
  'adductors',
  'quadriceps',
  'trapezius',
  'hamstrings',
  'calves',
  'cardio'
];

// Liste unifiée des exercices avec muscle primaire et secondaires
export const predefinedExercises: ExerciseDefinition[] = [
  // Chest
  {
    key: 'exercise_chest_benchPress',
    primaryMuscle: 'chest',
    secondaryMuscles: ['triceps', 'shoulders'],
    kind: 'strength_press',
    tags: ['compound'],
    equipment: 'barbell',
    movementPattern: 'press',
    unilateral: false,
    skillLevel: 'beginner',
    impact: 'low'
  },
  {
    key: 'exercise_chest_inclineBenchPress',
    primaryMuscle: 'chest',
    secondaryMuscles: ['triceps', 'shoulders'],
    kind: 'strength_press',
    defaultMet: 6.0
  },
  {
    key: 'exercise_chest_declineBenchPress',
    primaryMuscle: 'chest',
    secondaryMuscles: ['triceps', 'shoulders'],
    kind: 'strength_press',
    defaultMet: 6.0
  },
  {
    key: 'exercise_chest_dumbbellFlyes',
    primaryMuscle: 'chest',
    secondaryMuscles: ['shoulders'],
    kind: 'strength_press',
    defaultMet: 6.0
  },
  {
    key: 'exercise_chest_cableCrossover',
    primaryMuscle: 'chest',
    secondaryMuscles: ['shoulders'],
    kind: 'strength_press',
    defaultMet: 6.0
  },

  // Back
  {
    key: 'exercise_back_pullUps',
    primaryMuscle: 'back',
    secondaryMuscles: ['biceps', 'shoulders'],
    kind: 'strength_pull',
    defaultMet: 6.0
  },
  {
    key: 'exercise_back_latPulldown',
    primaryMuscle: 'back',
    secondaryMuscles: ['biceps', 'shoulders'],
    kind: 'strength_pull',
    defaultMet: 6.0
  },
  {
    key: 'exercise_back_barbellRow',
    primaryMuscle: 'back',
    secondaryMuscles: ['biceps', 'shoulders'],
    kind: 'strength_pull',
    tags: ['compound'],
    equipment: 'barbell',
    movementPattern: 'pull',
    unilateral: false,
    skillLevel: 'beginner',
    impact: 'low'
  },
  {
    key: 'exercise_back_dumbbellRow',
    primaryMuscle: 'back',
    secondaryMuscles: ['biceps', 'shoulders'],
    kind: 'strength_pull',
    defaultMet: 6.0
  },
  {
    key: 'exercise_back_tBarRow',
    primaryMuscle: 'back',
    secondaryMuscles: ['biceps', 'shoulders'],
    kind: 'strength_pull',
    defaultMet: 6.0
  },
  {
    key: 'exercise_back_uprightRow',
    primaryMuscle: 'trapezius',
    secondaryMuscles: ['shoulders', 'biceps'],
    kind: 'strength_pull',
    defaultMet: 6.0
  },
  {
    key: 'exercise_back_facePulls',
    primaryMuscle: 'trapezius',
    secondaryMuscles: ['shoulders', 'triceps'],
    kind: 'strength_pull',
    defaultMet: 6.0
  },

  // Shoulders
  {
    key: 'exercise_shoulders_militaryPress',
    primaryMuscle: 'shoulders',
    secondaryMuscles: ['triceps', 'core'],
    kind: 'strength_press',
    defaultMet: 6.0
  },
  {
    key: 'exercise_shoulders_lateralRaises',
    primaryMuscle: 'shoulders',
    kind: 'strength_press',
    defaultMet: 6.0
  },
  {
    key: 'exercise_shoulders_frontRaises',
    primaryMuscle: 'shoulders',
    kind: 'strength_press',
    defaultMet: 6.0
  },
  {
    key: 'exercise_shoulders_rearDeltFlyes',
    primaryMuscle: 'trapezius',
    secondaryMuscles: ['shoulders'],
    kind: 'strength_pull',
    defaultMet: 6.0
  },
  {
    key: 'exercise_shoulders_shrugs',
    primaryMuscle: 'trapezius',
    kind: 'strength_pull',
    defaultMet: 6.0
  },

  // Biceps
  {
    key: 'exercise_biceps_barbellCurl',
    primaryMuscle: 'biceps',
    secondaryMuscles: ['forearms'],
    kind: 'strength_pull',
    defaultMet: 6.0
  },
  {
    key: 'exercise_biceps_dumbbellCurl',
    primaryMuscle: 'biceps',
    secondaryMuscles: ['forearms'],
    kind: 'strength_pull',
    defaultMet: 6.0
  },
  {
    key: 'exercise_biceps_hammerCurl',
    primaryMuscle: 'biceps',
    secondaryMuscles: ['forearms'],
    kind: 'strength_pull',
    defaultMet: 6.0
  },
  {
    key: 'exercise_biceps_preacherCurl',
    primaryMuscle: 'biceps',
    secondaryMuscles: ['forearms'],
    kind: 'strength_pull',
    defaultMet: 6.0
  },
  {
    key: 'exercise_biceps_concentrationCurl',
    primaryMuscle: 'biceps',
    secondaryMuscles: ['forearms'],
    kind: 'strength_pull',
    defaultMet: 6.0
  },

  // Triceps
  {
    key: 'exercise_triceps_cableExtension',
    primaryMuscle: 'triceps',
    secondaryMuscles: ['forearms'],
    kind: 'strength_press',
    defaultMet: 6.0
  },
  {
    key: 'exercise_triceps_skullCrushers',
    primaryMuscle: 'triceps',
    secondaryMuscles: ['forearms'],
    kind: 'strength_press',
    defaultMet: 6.0
  },
  {
    key: 'exercise_triceps_overheadExtension',
    primaryMuscle: 'triceps',
    secondaryMuscles: ['forearms'],
    kind: 'strength_press',
    defaultMet: 6.0
  },
  {
    key: 'exercise_triceps_dips',
    primaryMuscle: 'triceps',
    secondaryMuscles: ['chest', 'shoulders'],
    kind: 'strength_press',
    defaultMet: 6.0
  },
  {
    key: 'exercise_triceps_closegripBenchPress',
    primaryMuscle: 'triceps',
    secondaryMuscles: ['chest', 'forearms'],
    kind: 'strength_press',
    defaultMet: 6.0
  },

  // Core
  {
    key: 'exercise_core_plank',
    primaryMuscle: 'core',
    secondaryMuscles: ['shoulders', 'triceps'],
    kind: 'strength_core',
    defaultMet: 3.5
  },
  {
    key: 'exercise_core_legRaises',
    primaryMuscle: 'core',
    kind: 'strength_core',
    defaultMet: 3.5
  },
  {
    key: 'exercise_core_crunches',
    primaryMuscle: 'core',
    kind: 'strength_core',
    defaultMet: 3.5
  },
  {
    key: 'exercise_core_hangingKneeRaises',
    primaryMuscle: 'core',
    secondaryMuscles: ['forearms'],
    kind: 'strength_core',
    defaultMet: 3.5
  },

  // Obliques
  {
    key: 'exercise_core_russianTwist',
    primaryMuscle: 'obliques',
    secondaryMuscles: ['core'],
    kind: 'strength_core',
    defaultMet: 3.5
  },
  {
    key: 'exercise_core_sidePlank',
    primaryMuscle: 'obliques',
    secondaryMuscles: ['core', 'shoulders'],
    kind: 'strength_core',
    defaultMet: 3.5
  },
  {
    key: 'exercise_core_obliqueCrunches',
    primaryMuscle: 'obliques',
    secondaryMuscles: ['core'],
    kind: 'strength_core',
    defaultMet: 3.5
  },
  {
    key: 'exercise_core_woodChops',
    primaryMuscle: 'obliques',
    secondaryMuscles: ['core', 'shoulders'],
    kind: 'strength_core',
    defaultMet: 3.5
  },

  // Forearms
  {
    key: 'exercise_forearms_wristCurls',
    primaryMuscle: 'forearms'
  },
  {
    key: 'exercise_forearms_reverseCurls',
    primaryMuscle: 'forearms'
  },
  {
    key: 'exercise_forearms_farmerWalk',
    primaryMuscle: 'forearms',
    secondaryMuscles: ['core', 'trapezius']
  },
  {
    key: 'exercise_forearms_gripTraining',
    primaryMuscle: 'forearms'
  },

  // Quadriceps
  {
    key: 'exercise_legs_squat',
    primaryMuscle: 'quadriceps',
    secondaryMuscles: ['hamstrings', 'core', 'calves'],
    kind: 'strength_squat',
    defaultMet: 6.0
  },
  {
    key: 'exercise_legs_legPress',
    primaryMuscle: 'quadriceps',
    secondaryMuscles: ['hamstrings', 'calves'],
    kind: 'strength_squat',
    defaultMet: 6.0
  },
  {
    key: 'exercise_legs_legExtension',
    primaryMuscle: 'quadriceps',
    kind: 'strength_squat',
    defaultMet: 6.0
  },
  {
    key: 'exercise_legs_frontSquat',
    primaryMuscle: 'quadriceps',
    secondaryMuscles: ['hamstrings', 'core', 'calves'],
    kind: 'strength_squat',
    defaultMet: 6.0
  },
  {
    key: 'exercise_legs_bulgarianSplitSquat',
    primaryMuscle: 'quadriceps',
    secondaryMuscles: ['hamstrings', 'core', 'calves'],
    kind: 'strength_squat',
    defaultMet: 6.0
  },

  // Hamstrings
  {
    key: 'exercise_legs_deadlift',
    primaryMuscle: 'hamstrings',
    secondaryMuscles: ['back', 'trapezius', 'core', 'calves'],
    kind: 'strength_hinge',
    defaultMet: 6.0
  },
  {
    key: 'exercise_legs_legCurls',
    primaryMuscle: 'hamstrings',
    kind: 'strength_hinge',
    defaultMet: 6.0
  },
  {
    key: 'exercise_legs_romanianDeadlift',
    primaryMuscle: 'hamstrings',
    secondaryMuscles: ['back', 'trapezius', 'core'],
    kind: 'strength_hinge',
    defaultMet: 6.0
  },
  {
    key: 'exercise_legs_goodMornings',
    primaryMuscle: 'hamstrings',
    secondaryMuscles: ['back', 'core'],
    kind: 'strength_hinge',
    defaultMet: 6.0
  },
  {
    key: 'exercise_legs_gluteHamRaises',
    primaryMuscle: 'hamstrings',
    secondaryMuscles: ['core'],
    kind: 'strength_hinge',
    defaultMet: 6.0
  },

  // Abductors
  {
    key: 'exercise_legs_sideLunges',
    primaryMuscle: 'abductors',
    secondaryMuscles: ['quadriceps', 'hamstrings']
  },
  {
    key: 'exercise_legs_clamshells',
    primaryMuscle: 'abductors'
  },
  {
    key: 'exercise_legs_hipAbduction',
    primaryMuscle: 'abductors'
  },
  {
    key: 'exercise_legs_lateralWalks',
    primaryMuscle: 'abductors',
    secondaryMuscles: ['quadriceps']
  },

  // Adductors
  {
    key: 'exercise_legs_sumoSquats',
    primaryMuscle: 'adductors',
    secondaryMuscles: ['quadriceps', 'hamstrings']
  },
  {
    key: 'exercise_legs_hipAdduction',
    primaryMuscle: 'adductors'
  },
  {
    key: 'exercise_legs_innerThighLifts',
    primaryMuscle: 'adductors'
  },
  {
    key: 'exercise_legs_adductorMachine',
    primaryMuscle: 'adductors'
  },

  // Calves
  {
    key: 'exercise_legs_calfRaises',
    primaryMuscle: 'calves'
  },
  {
    key: 'exercise_legs_seatedCalfRaises',
    primaryMuscle: 'calves'
  },
  {
    key: 'exercise_legs_boxJumps',
    primaryMuscle: 'calves',
    secondaryMuscles: ['quadriceps', 'hamstrings']
  },

  // Cardio
  {
    key: 'exercise_cardio_running',
    primaryMuscle: 'cardio',
    secondaryMuscles: ['calves', 'quadriceps', 'hamstrings'],
    kind: 'cardio_run',
    cardioMode: 'run',
    supportsGrade: true,
    defaultMet: 9.8
  },
  {
    key: 'exercise_cardio_cycling',
    primaryMuscle: 'cardio',
    secondaryMuscles: ['quadriceps', 'hamstrings', 'calves'],
    kind: 'cardio_bike',
    cardioMode: 'bike',
    supportsPower: true,
    defaultMet: 8.0
  },
  {
    key: 'exercise_cardio_rowing',
    primaryMuscle: 'cardio',
    secondaryMuscles: ['back', 'shoulders', 'legs'],
    kind: 'cardio_row',
    cardioMode: 'row',
    defaultMet: 8.0
  },
  {
    key: 'exercise_cardio_jumpingJacks',
    primaryMuscle: 'cardio',
    secondaryMuscles: ['calves', 'shoulders'],
    kind: 'other',
    defaultMet: 7.0
  },
  {
    key: 'exercise_cardio_burpees',
    primaryMuscle: 'cardio',
    secondaryMuscles: ['chest', 'shoulders', 'triceps', 'quadriceps', 'hamstrings', 'calves'],
    kind: 'other',
    defaultMet: 8.0
  },
];

// Fonction helper pour obtenir les exercices par groupe musculaire
export const getExercisesByMuscleGroup = (muscleGroup: MuscleGroupKey): ExerciseDefinition[] => {
  return predefinedExercises.filter(exercise => 
    exercise.primaryMuscle === muscleGroup || 
    exercise.secondaryMuscles?.includes(muscleGroup)
  );
};

// ---- MET mapping & helpers (centralized) ----

export const MET_CONSTANTS = {
  rest: 1.25,
  preparation: 2.5,
  cardioFallback: {
    walk: 3.3,
    run: 9.8,
    bike: 8.0,
    row: 8.0,
    elliptical: 5.0,
    other: 7.0,
  },
  strengthFallback: {
    oly: 8.0,
    squat: 6.0,
    hinge: 6.0,
    press: 6.0,
    pull: 6.0,
    core: 3.5,
  },
} as const;

// getExerciseKindFromKeyOrName removed: we now rely on predefined kind in metadata

export const getExerciseMeta = (keyOrName?: string): ExerciseDefinition | undefined => {
  const raw = keyOrName || '';
  const base = raw.replace(/_\d+$/, '');
  return predefinedExercises.find(e => e.key === base);
};

export const mapRpeToMet = (rpe: number | undefined, meta?: ExerciseDefinition): number => {
  // If RPE provided, use thresholds
  if (typeof rpe === 'number') return rpe <= 4 ? 3.5 : (rpe >= 8 ? 8.0 : 6.0);

  // Priority fallback: per-exercise defaultMet if provided
  if (meta?.defaultMet) return meta.defaultMet;

  // Cardio fallback by mode
  if (meta?.cardioMode) {
    const key = meta.cardioMode as keyof typeof MET_CONSTANTS.cardioFallback;
    return MET_CONSTANTS.cardioFallback[key] ?? MET_CONSTANTS.cardioFallback.other;
  }

  // Core floor
  if (meta?.primaryMuscle === 'core' || meta?.primaryMuscle === 'obliques') {
    return MET_CONSTANTS.strengthFallback.core;
  }

  // Generic strength fallback
  return MET_CONSTANTS.strengthFallback.press; // 6.0
};

// Fonction helper pour obtenir les exercices par muscle primaire uniquement
export const getPrimaryExercisesByMuscleGroup = (muscleGroup: MuscleGroupKey): ExerciseDefinition[] => {
  return predefinedExercises.filter(exercise => exercise.primaryMuscle === muscleGroup);
};

export const getMuscleGroups = (t: (key: string) => string) => {
  return muscleGroupKeys.map((key) => t(`muscleGroups.${key}`));
};

export const getPredefinedExercises = (t: (key: string) => string) => {
  const result: { [key: string]: Exercise[] } = {};
  
  muscleGroupKeys.forEach(muscleKey => {
    result[muscleKey] = getExercisesByMuscleGroup(muscleKey).map(exercise => ({
      name: t(exercise.key),
      key: exercise.key,
      translationKey: exercise.key,
      series: [],
      primaryMuscle: exercise.primaryMuscle,
      secondaryMuscles: exercise.secondaryMuscles
    }));
  });
  
  return result;
};

// Helper function to determine the unit type based on exercise key
export const getExerciseUnitType = (exerciseKey: string): 'weight' | 'time' | 'distance' => {
  // Exercises that are measured in time
  if (exerciseKey === 'exercise_core_plank') {
    return 'time';
  }
  
  // Exercises that are measured in distance (for cardio)
  if (exerciseKey.includes('exercise_cardio_')) {
    return 'distance';
  }
  
  // Default to weight for most exercises
  return 'weight';
};

// Mapping centralisé des exercices vers leurs images
export const exerciseToImage: Record<string, any> = {
  // Chest exercises
  'exercise_chest_benchPress': require('../../../assets/images/muscles/chest.png'),
  'exercise_chest_inclineBenchPress': require('../../../assets/images/muscles/chest.png'),
  'exercise_chest_declineBenchPress': require('../../../assets/images/muscles/chest.png'),
  'exercise_chest_dumbbellFlyes': require('../../../assets/images/muscles/chest.png'),
  'exercise_chest_cableCrossover': require('../../../assets/images/muscles/chest.png'),
  
  // Back exercises
  'exercise_back_pullUps': require('../../../assets/images/muscles/back.png'),
  'exercise_back_latPulldown': require('../../../assets/images/muscles/back.png'),
  'exercise_back_barbellRow': require('../../../assets/images/muscles/back.png'),
  'exercise_back_dumbbellRow': require('../../../assets/images/muscles/back.png'),
  'exercise_back_tBarRow': require('../../../assets/images/muscles/back.png'),
  'exercise_back_uprightRow': require('../../../assets/images/muscles/back.png'),
  'exercise_back_facePulls': require('../../../assets/images/muscles/back.png'),
  
  // Shoulder exercises
  'exercise_shoulders_militaryPress': require('../../../assets/images/muscles/shoulders.png'),
  'exercise_shoulders_lateralRaises': require('../../../assets/images/muscles/shoulders.png'),
  'exercise_shoulders_frontRaises': require('../../../assets/images/muscles/shoulders.png'),
  'exercise_shoulders_rearDeltFlyes': require('../../../assets/images/muscles/shoulders.png'),
  'exercise_shoulders_shrugs': require('../../../assets/images/muscles/shoulders.png'),
  
  // Bicep exercises
  'exercise_biceps_barbellCurl': require('../../../assets/images/muscles/biceps.png'),
  'exercise_biceps_dumbbellCurl': require('../../../assets/images/muscles/biceps.png'),
  'exercise_biceps_hammerCurl': require('../../../assets/images/muscles/biceps.png'),
  'exercise_biceps_preacherCurl': require('../../../assets/images/muscles/biceps.png'),
  'exercise_biceps_concentrationCurl': require('../../../assets/images/muscles/biceps.png'),
  
  // Tricep exercises
  'exercise_triceps_cableExtension': require('../../../assets/images/muscles/triceps.png'),
  'exercise_triceps_skullCrushers': require('../../../assets/images/muscles/triceps.png'),
  'exercise_triceps_overheadExtension': require('../../../assets/images/muscles/triceps.png'),
  'exercise_triceps_dips': require('../../../assets/images/muscles/triceps.png'),
  'exercise_triceps_closegripBenchPress': require('../../../assets/images/muscles/triceps.png'),
  
  // Core exercises
  'exercise_core_plank': require('../../../assets/images/muscles/core.png'),
  'exercise_core_russianTwist': require('../../../assets/images/muscles/core.png'),
  'exercise_core_legRaises': require('../../../assets/images/muscles/core.png'),
  'exercise_core_crunches': require('../../../assets/images/muscles/core.png'),
  'exercise_core_hangingKneeRaises': require('../../../assets/images/muscles/core.png'),
  'exercise_core_sidePlank': require('../../../assets/images/muscles/core.png'),
  'exercise_core_obliqueCrunches': require('../../../assets/images/muscles/core.png'),
  'exercise_core_woodChops': require('../../../assets/images/muscles/core.png'),
  
  // Leg exercises
  'exercise_legs_squat': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_deadlift': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_legPress': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_lunges': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_legExtension': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_frontSquat': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_bulgarianSplitSquat': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_legCurls': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_romanianDeadlift': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_goodMornings': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_gluteHamRaises': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_sideLunges': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_clamshells': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_hipAbduction': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_lateralWalks': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_sumoSquats': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_hipAdduction': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_innerThighLifts': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_adductorMachine': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_calfRaises': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_seatedCalfRaises': require('../../../assets/images/muscles/legs.png'),
  'exercise_legs_boxJumps': require('../../../assets/images/muscles/legs.png'),
  
  // Forearm exercises (utilise biceps pour l'instant)
  'exercise_forearms_wristCurls': require('../../../assets/images/muscles/biceps.png'),
  'exercise_forearms_reverseCurls': require('../../../assets/images/muscles/biceps.png'),
  'exercise_forearms_farmerWalk': require('../../../assets/images/muscles/biceps.png'),
  'exercise_forearms_gripTraining': require('../../../assets/images/muscles/biceps.png'),
  
  // Cardio exercises (utilise core pour l'instant)
  'exercise_cardio_running': require('../../../assets/images/muscles/core.png'),
  'exercise_cardio_cycling': require('../../../assets/images/muscles/core.png'),
  'exercise_cardio_rowing': require('../../../assets/images/muscles/core.png'),
  'exercise_cardio_jumpingJacks': require('../../../assets/images/muscles/core.png'),
  'exercise_cardio_burpees': require('../../../assets/images/muscles/core.png'),
};

// Image par défaut pour les exercices non mappés
export const defaultExerciseImage = require('../../../assets/images/muscles/core.png');

// Fonction helper pour extraire la clé de base d'un exercice (supprime le timestamp)
export const getBaseExerciseKey = (exerciseKey: string): string => {
  // Si la clé contient un underscore suivi de chiffres à la fin, on le supprime
  const timestampPattern = /_\d+$/;
  return exerciseKey.replace(timestampPattern, '');
};

// Fonction helper pour obtenir l'image d'un exercice
export const getExerciseImage = (exerciseKey: string) => {
  const baseKey = getBaseExerciseKey(exerciseKey);
  return exerciseToImage[baseKey] || defaultExerciseImage;
};

// Composants
export { default as UnifiedExerciseList } from './UnifiedExerciseList';
export { default as ExerciseCard } from './ExerciseCard';
export { default as InteractiveMuscleMap } from './InteractiveMuscleMap';
export { default as ExerciseListModal } from './ExerciseListModal';

// Default export to satisfy Expo Router
export default function ExercisesIndex() {
  // Empty function to satisfy Expo Router requirement
}

