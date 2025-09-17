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
    secondaryMuscles: ['triceps', 'shoulders']
  },
  {
    key: 'exercise_chest_inclineBenchPress',
    primaryMuscle: 'chest',
    secondaryMuscles: ['triceps', 'shoulders']
  },
  {
    key: 'exercise_chest_declineBenchPress',
    primaryMuscle: 'chest',
    secondaryMuscles: ['triceps', 'shoulders']
  },
  {
    key: 'exercise_chest_dumbbellFlyes',
    primaryMuscle: 'chest',
    secondaryMuscles: ['shoulders']
  },
  {
    key: 'exercise_chest_cableCrossover',
    primaryMuscle: 'chest',
    secondaryMuscles: ['shoulders']
  },

  // Back
  {
    key: 'exercise_back_pullUps',
    primaryMuscle: 'back',
    secondaryMuscles: ['biceps', 'shoulders']
  },
  {
    key: 'exercise_back_latPulldown',
    primaryMuscle: 'back',
    secondaryMuscles: ['biceps', 'shoulders']
  },
  {
    key: 'exercise_back_barbellRow',
    primaryMuscle: 'back',
    secondaryMuscles: ['biceps', 'shoulders']
  },
  {
    key: 'exercise_back_dumbbellRow',
    primaryMuscle: 'back',
    secondaryMuscles: ['biceps', 'shoulders']
  },
  {
    key: 'exercise_back_tBarRow',
    primaryMuscle: 'back',
    secondaryMuscles: ['biceps', 'shoulders']
  },
  {
    key: 'exercise_back_uprightRow',
    primaryMuscle: 'trapezius',
    secondaryMuscles: ['shoulders', 'biceps']
  },
  {
    key: 'exercise_back_facePulls',
    primaryMuscle: 'trapezius',
    secondaryMuscles: ['shoulders', 'triceps']
  },

  // Shoulders
  {
    key: 'exercise_shoulders_militaryPress',
    primaryMuscle: 'shoulders',
    secondaryMuscles: ['triceps', 'core']
  },
  {
    key: 'exercise_shoulders_lateralRaises',
    primaryMuscle: 'shoulders'
  },
  {
    key: 'exercise_shoulders_frontRaises',
    primaryMuscle: 'shoulders'
  },
  {
    key: 'exercise_shoulders_rearDeltFlyes',
    primaryMuscle: 'trapezius',
    secondaryMuscles: ['shoulders']
  },
  {
    key: 'exercise_shoulders_shrugs',
    primaryMuscle: 'trapezius'
  },

  // Biceps
  {
    key: 'exercise_biceps_barbellCurl',
    primaryMuscle: 'biceps',
    secondaryMuscles: ['forearms']
  },
  {
    key: 'exercise_biceps_dumbbellCurl',
    primaryMuscle: 'biceps',
    secondaryMuscles: ['forearms']
  },
  {
    key: 'exercise_biceps_hammerCurl',
    primaryMuscle: 'biceps',
    secondaryMuscles: ['forearms']
  },
  {
    key: 'exercise_biceps_preacherCurl',
    primaryMuscle: 'biceps',
    secondaryMuscles: ['forearms']
  },
  {
    key: 'exercise_biceps_concentrationCurl',
    primaryMuscle: 'biceps',
    secondaryMuscles: ['forearms']
  },

  // Triceps
  {
    key: 'exercise_triceps_cableExtension',
    primaryMuscle: 'triceps',
    secondaryMuscles: ['forearms']
  },
  {
    key: 'exercise_triceps_skullCrushers',
    primaryMuscle: 'triceps',
    secondaryMuscles: ['forearms']
  },
  {
    key: 'exercise_triceps_overheadExtension',
    primaryMuscle: 'triceps',
    secondaryMuscles: ['forearms']
  },
  {
    key: 'exercise_triceps_dips',
    primaryMuscle: 'triceps',
    secondaryMuscles: ['chest', 'shoulders']
  },
  {
    key: 'exercise_triceps_closegripBenchPress',
    primaryMuscle: 'triceps',
    secondaryMuscles: ['chest', 'forearms']
  },

  // Core
  {
    key: 'exercise_core_plank',
    primaryMuscle: 'core',
    secondaryMuscles: ['shoulders', 'triceps']
  },
  {
    key: 'exercise_core_legRaises',
    primaryMuscle: 'core'
  },
  {
    key: 'exercise_core_crunches',
    primaryMuscle: 'core'
  },
  {
    key: 'exercise_core_hangingKneeRaises',
    primaryMuscle: 'core',
    secondaryMuscles: ['forearms']
  },

  // Obliques
  {
    key: 'exercise_core_russianTwist',
    primaryMuscle: 'obliques',
    secondaryMuscles: ['core']
  },
  {
    key: 'exercise_core_sidePlank',
    primaryMuscle: 'obliques',
    secondaryMuscles: ['core', 'shoulders']
  },
  {
    key: 'exercise_core_obliqueCrunches',
    primaryMuscle: 'obliques',
    secondaryMuscles: ['core']
  },
  {
    key: 'exercise_core_woodChops',
    primaryMuscle: 'obliques',
    secondaryMuscles: ['core', 'shoulders']
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
    secondaryMuscles: ['hamstrings', 'core', 'calves']
  },
  {
    key: 'exercise_legs_legPress',
    primaryMuscle: 'quadriceps',
    secondaryMuscles: ['hamstrings', 'calves']
  },
  {
    key: 'exercise_legs_legExtension',
    primaryMuscle: 'quadriceps'
  },
  {
    key: 'exercise_legs_frontSquat',
    primaryMuscle: 'quadriceps',
    secondaryMuscles: ['hamstrings', 'core', 'calves']
  },
  {
    key: 'exercise_legs_bulgarianSplitSquat',
    primaryMuscle: 'quadriceps',
    secondaryMuscles: ['hamstrings', 'core', 'calves']
  },

  // Hamstrings
  {
    key: 'exercise_legs_deadlift',
    primaryMuscle: 'hamstrings',
    secondaryMuscles: ['back', 'trapezius', 'core', 'calves']
  },
  {
    key: 'exercise_legs_legCurls',
    primaryMuscle: 'hamstrings'
  },
  {
    key: 'exercise_legs_romanianDeadlift',
    primaryMuscle: 'hamstrings',
    secondaryMuscles: ['back', 'trapezius', 'core']
  },
  {
    key: 'exercise_legs_goodMornings',
    primaryMuscle: 'hamstrings',
    secondaryMuscles: ['back', 'core']
  },
  {
    key: 'exercise_legs_gluteHamRaises',
    primaryMuscle: 'hamstrings',
    secondaryMuscles: ['core']
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
    secondaryMuscles: ['calves', 'quadriceps', 'hamstrings']
  },
  {
    key: 'exercise_cardio_cycling',
    primaryMuscle: 'cardio',
    secondaryMuscles: ['quadriceps', 'hamstrings', 'calves']
  },
  {
    key: 'exercise_cardio_rowing',
    primaryMuscle: 'cardio',
    secondaryMuscles: ['back', 'shoulders', 'legs']
  },
  {
    key: 'exercise_cardio_jumpingJacks',
    primaryMuscle: 'cardio',
    secondaryMuscles: ['calves', 'shoulders']
  },
  {
    key: 'exercise_cardio_burpees',
    primaryMuscle: 'cardio',
    secondaryMuscles: ['chest', 'shoulders', 'triceps', 'quadriceps', 'hamstrings', 'calves']
  }
];

// Fonction helper pour obtenir les exercices par groupe musculaire
export const getExercisesByMuscleGroup = (muscleGroup: MuscleGroupKey): ExerciseDefinition[] => {
  return predefinedExercises.filter(exercise => 
    exercise.primaryMuscle === muscleGroup || 
    exercise.secondaryMuscles?.includes(muscleGroup)
  );
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

// Composants
export { default as UnifiedExerciseList } from './UnifiedExerciseList';
export { default as ExerciseCard } from './ExerciseCard';
export { default as InteractiveMuscleMap } from './InteractiveMuscleMap';
export { default as ExerciseListModal } from './ExerciseListModal';

