export default {
  // Common
  common: {
    loading: 'Chargement...',
    close: 'Fermer',
    errorLoadingWorkouts: 'Erreur lors du chargement des entraînements :',
    errorSavingWorkouts: 'Erreur lors de la sauvegarde des entraînements :',
    appTitle: 'Body Work',
    noWorkoutForDate: 'Aucun entraînement enregistré pour cette date',
    date: 'Date',
    noDataAvailable: 'Aucune donnée disponible pour cette période',
    error: 'Erreur',
    success: 'Succès',
    cancel: 'Annuler',
    reset: 'Réinitialiser',
    save: 'Enregistrer',
    delete: 'Supprimer',
    ok: 'OK',
    use: 'Utiliser',
    select: 'Sélectionner',
    note: 'Note',
    custom: 'Personnalisé'
  },

  // Settings screen
  settings: {
    title: 'Paramètres',
    loadingSettings: 'Chargement des paramètres...',
    preferences: 'Préférences',
    exportData: 'Exporter les données',
    exportToCSV: 'Exporter en CSV',
    noWorkoutsToExport: 'Aucun entraînement à exporter',
    exportSuccess: 'Export réussi',
    sharingNotAvailable: 'Le partage n\'est pas disponible sur cet appareil',
    exportError: 'Erreur lors de l\'export',
    gender: 'Genre',
    male: 'Homme',
    female: 'Femme',
    weightUnit: 'Unité de poids',
    application: 'Application',
    about: 'À propos',
    language: 'Langue',
    english: 'Anglais',
    french: 'Français',
    theme: 'Thème',
    dark: 'Sombre',
    light: 'Clair',
    resetData: 'Réinitialiser les données',
    resetDataConfirmation: 'Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.',
    dataResetSuccess: 'Toutes les données ont été réinitialisées avec succès.',
    errorResettingData: 'Une erreur est survenue lors de la réinitialisation des données.'
  },

  // About section
  about: {
    title: 'BodyWork',
    version: 'Version 1.0.0',
    description: 'Une application pour suivre vos entraînements, mesurer vos progrès et atteindre vos objectifs de remise en forme.',
    developer: 'Développeur',
    contact: 'Contact',
    website: 'Site web',
    privacyPolicy: 'Politique de confidentialité',
    termsOfService: 'Conditions d\'utilisation'
  },

  // Muscle Map
  muscleMap: {
    frontView: 'Vue de face',
    backView: 'Vue de dos',
    muscleRestState: 'État de repos des muscles',
    restPeriod0to24: '0-24h',
    restPeriod24to72: '24-72h',
    restPeriod72plus: '72h+'
  },

  // Workout screen
  workout: {
    noWorkoutsToday: 'Aucun entraînement enregistré aujourd\'hui',
    startWorkout: 'Commencer un entraînement',
    weight: 'Poids',
    reps: 'Répétitions',
    sets: 'Séries',
    rpe: 'RPE',
    warmUpSeries: 'Séries d\'échauffement',
    workingSeries: 'Séries de travail',
    newWorkout: 'Nouvel entraînement',
    customExercise: 'Exercice personnalisé',
    backToPredefined: 'Retour aux exercices prédéfinis',
    weightKg: 'Poids (kg)',
    suggested: 'Suggéré',
    rpeTitle: 'RPE (Rate of Perceived Exertion)',
    rpeDescription: '1 = Très facile, 10 = Effort maximal',
    addExercise: 'Ajouter l\'exercice',
    searchExercises: 'Chercher des exercices...',
    seriesType: 'Type de série',
    warmUp: 'Échauffement',
    workingSet: 'Série de travail',
    warmUpDescription: 'Série d\'échauffement (RPE non pris en compte)',
    workingSetDescription: 'Série de travail (RPE important)',
    addSeries: 'Ajouter une série',
    series: 'Series',
    optionalNote: 'Note optionnelle',
    usePreviousValues: 'Utiliser les valeurs précédentes',
    notApplicable: 'N/A',
    selectDate: 'Sélectionner une date'
  },

  // Timer screen
  timer: {
    title: 'Minuteur',
    restTime: 'Temps de repos',
    workTime: 'Temps de travail',
    stopwatch: 'Chronomètre',
    customTime: 'Temps personnalisé',
    minutes: 'Minutes',
    seconds: 'Secondes',
    exerciseName: 'Nom de l\'exercice',
    enterExerciseName: 'Entrez le nom de l\'exercice',
    exercise: 'Exercice',
    quick: 'Rapide',
    standard: 'Standard',
    long: 'Long',
    veryLong: 'Très long',
    series: 'Séries'
  },

  // Stats screen
  stats: {
    title: 'Statistiques',
    overview: 'Aperçu',
    totalWorkouts: 'Total des entraînements',
    totalExercises: 'Total des exercices',
    totalVolume: 'Volume total',
    avgWorkoutTime: 'Temps moyen d\'entraînement',
    progressionTextNone: 'Aucune donnée de progression disponible',
    attendance: 'Assiduité',
    series: 'Séries',
    sessions: 'Séances',
    goals: 'Objectifs',
    noGoalsYet: 'Aucun objectif défini',
    addGoal: 'Ajouter un objectif',
    muscleDistribution: 'Distribution des groupes musculaires',
    oneMonth: '1 Mois',
    threeMonths: '3 Mois',
    sixMonths: '6 Mois',
    period: 'Période :',
    muscleGroup: 'Groupe musculaire :',
    allGroups: 'Tous les groupes',
    progressionText: '💪 Vous avez progressé de {progress}% sur {exercise} !',
    progressionTextMonth: '💪 Vous avez progressé de {progress}% ce mois-ci !',
    progressionNoData: '💪 Continuez vos efforts, les progrès viendront !',
    oneRM: 'Progression du 1RM',
    volumePerWeek: 'Volume par semaine',
    repsPerSession: 'Répétitions par séance',
    selectExercise: 'Sélectionner un exercice',
    allExercises: 'Tous les exercices',
    volume: 'Volume',
    repetitions: 'Répétitions'
  },

  // Goals
  goals: {
    goalRemaining: 'Il reste {remaining}kg',
    goalAchieved: 'Objectif atteint !',
    addGoal: 'Ajouter un objectif',
    newGoal: 'Nouvel objectif',
    currentWeight: 'Poids actuel',
    targetWeight: 'Poids cible',
    selectExerciseForGoal: 'Sélectionner un exercice',
    deleteGoal: 'Supprimer l\'objectif',
    deleteGoalConfirmation: 'Êtes-vous sûr de vouloir supprimer l\'objectif pour {exercise} ?',
    useLastWorkout: 'Utiliser le dernier entraînement',
    useSuggested: 'Utiliser la suggestion',
    exerciseNotFound: 'Exercice non trouvé',
    exerciseNotFoundMessage: 'Vous devez avoir un historique d\'entraînement pour cet exercice avant de définir un objectif.',
    pleaseCompleteAllFields: 'Veuillez remplir tous les champs',
    invalidWeightValues: 'Valeurs de poids invalides',
    errorSavingGoal: 'Erreur lors de la sauvegarde de l\'objectif',
    goalDetails: 'Détails de l\'objectif',
    currentWeightDescription: 'Poids actuel',
    targetWeightDescription: 'Poids cible'
  },

  // Time periods
  periods: {
    oneMonth: '1 mois',
    threeMonths: '3 mois',
    sixMonths: '6 mois'
  },

  // Exercise selector
  exerciseSelector: {
    searchExercise: 'Rechercher un exercice...',
    favorites: 'Favoris',
    recentExercises: 'Exercices récents',
    noFavorites: 'Pas encore d\'exercices favoris',
    noRecentExercises: 'Aucun exercice récent',
    searchResults: 'Résultats de recherche',
    noExercisesInGroup: 'Aucun exercice disponible dans ce groupe musculaire'
  },

  // Muscle groups
  muscleGroups: {
    chest: 'Pectoraux',
    back: 'Dos',
    legs: 'Jambes',
    arms: 'Bras',
    shoulders: 'Épaules',
    biceps: 'Biceps',
    triceps: 'Triceps',
    core: 'Abdominaux',
    cardio: 'Cardio',
    other: 'Autre'
  },

  // Measurements screen
  measurements: {
    title: 'Mesures',
    invalidDate: 'Date invalide',
    dateFormatError: 'Erreur de formatage de date:',
    neck: 'Cou',
    forearms: 'Avant-bras',
    waist: 'Taille',
    hips: 'Hanches',
    thighs: 'Cuisses',
    calves: 'Mollets',
    history: 'Historique',
    historyOf: 'Historique {part}'
  },

  // Exercise details screen
  exerciseDetails: {
    estimated_1rm: '1RM estimé',
    last_session: 'Dernière séance'
  },

  // Exercise names - Chest
  exercise_chest_benchPress: 'Développé couché',
  exercise_chest_inclineBenchPress: 'Développé incliné',
  exercise_chest_declineBenchPress: 'Développé décliné',
  exercise_chest_dumbbellFlyes: 'Écarté avec haltères',
  exercise_chest_cableCrossover: 'Crossover à la poulie',

  // Exercise names - Back
  exercise_back_pullUps: 'Tractions',
  exercise_back_latPulldown: 'Tirage vertical',
  exercise_back_barbellRow: 'Rowing barre',
  exercise_back_dumbbellRow: 'Rowing haltère',
  exercise_back_tBarRow: 'Rowing T-Bar',

  // Exercise names - Legs
  exercise_legs_squat: 'Squat',
  exercise_legs_deadlift: 'Soulevé de terre',
  exercise_legs_legPress: 'Presse à jambes',
  exercise_legs_lunges: 'Fentes',
  exercise_legs_legExtension: 'Extension des jambes',

  // Exercise names - Shoulders
  exercise_shoulders_militaryPress: 'Développé militaire',
  exercise_shoulders_lateralRaises: 'Élévations latérales',
  exercise_shoulders_frontRaises: 'Élévations frontales',
  exercise_shoulders_rearDeltFlyes: 'Oiseau pour deltoïdes postérieurs',
  exercise_shoulders_shrugs: 'Haussements d\'épaules',

  // Exercise names - Biceps
  exercise_biceps_barbellCurl: 'Curl barre',
  exercise_biceps_dumbbellCurl: 'Curl haltères',
  exercise_biceps_hammerCurl: 'Curl marteau',
  exercise_biceps_preacherCurl: 'Curl au pupitre',
  exercise_biceps_concentrationCurl: 'Curl concentration',

  // Exercise names - Triceps
  exercise_triceps_cableExtension: 'Extension à la poulie',
  exercise_triceps_skullCrushers: 'Barre au front',
  exercise_triceps_overheadExtension: 'Extension au-dessus de la tête',
  exercise_triceps_dips: 'Dips',
  exercise_triceps_closegripBenchPress: 'Développé couché prise serrée',

  // Exercise names - Core
  exercise_core_plank: 'Planche',
  exercise_core_russianTwist: 'Twists russes',
  exercise_core_legRaises: 'Relevés de jambes',
  exercise_core_crunches: 'Crunchs',
  exercise_core_hangingKneeRaises: 'Relevés de genoux suspendu'
};
