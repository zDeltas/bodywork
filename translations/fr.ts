export default {
  // Common
  common: {
    loading: 'Chargement...',
    close: 'Fermer',
    errorLoadingWorkouts: 'Erreur lors du chargement des entraînements :',
    errorSavingWorkouts: 'Erreur lors de la sauvegarde des entraînements :',
    appTitle: 'Gainizi',
    noWorkoutForDate: 'Aucun entraînement enregistré pour cette date',
    date: 'Date',
    noDataAvailable: 'Aucune donnée disponible pour cette période',
    error: 'Erreur',
    success: 'Succès',
    cancel: 'Annuler',
    reset: 'Réinitialiser',
    save: 'Enregistrer',
    update: 'Mettre à jour',
    delete: 'Supprimer',
    ok: 'OK',
    back: 'Retour',
    warning: 'Attention',
    info: 'Information',
    use: 'Utiliser',
    select: 'Sélectionner',
    note: 'Note',
    custom: 'Personnalisé',
    inConstruction: 'En Construction',
    featureComingSoon: 'Cette fonctionnalité arrive bientôt !',
    next: 'Suivant',
    finish: 'Terminer',
    or: 'ou',
    exercises: 'exercices',
    series: 'séries',
    seconds: 'secondes',
    enabled: 'Activé',
    disabled: 'Désactivé',
    day: 'Jour',
    month: 'Mois',
    year: 'Année',
    confirm: 'Confirmer'
  },

  // Types d'exercices (éditeur)
  exerciseTypes: {
    strength: 'Force',
    cardio: 'Cardio',
    other: 'Autre',
    strength_press: 'Poussée',
    strength_pull: 'Traction',
    strength_squat: 'Squat',
    strength_hinge: 'Charnière',
    strength_core: 'Abdos',
    cardio_run: 'Course',
    cardio_bike: 'Vélo',
    cardio_row: 'Aviron',
  },

  // Home screen
  home: {
    greeting: 'Salut {name}',
    morningMotivation: 'On démarre fort aujourd\'hui ? 💪',
    eveningMotivation: 'Une dernière pour la route ? 🔥',
    afternoonMotivation: 'Prêt à transpirer ? 🔥',
    weekProgress: '{current}/{total} séances',
    currentWeek: 'Semaine en cours',
    vsLastWeek: 'vs semaine dernière',
    totalVolume: 'Volume total',
    sessionsCompleted: 'Séances effectuées',
    streak: 'Série',
    streakDays: 'jours consécutifs',
    lastSession: 'Dernière séance',
    seeDetails: 'Voir détails',
    weeklyGoal: 'Objectif de la semaine',
    almostThere: 'Tu y es presque 👊',
    oneMoreSession: 'Encore 1 séance pour atteindre ton objectif 🔥',
    goalAchieved: 'Objectif atteint ! 🎉',
    quickActions: 'Actions rapides',
    viewExercise: 'Voir un exercice',
    startSession: 'Commencer ma séance',
    resumeSession: 'Reprendre ma séance',
    motivationalQuotes: [
      'Chaque rep te rapproche de ta meilleure version 💪',
      'La seule mauvaise séance est celle que tu ne fais pas 🔥',
      'Tes muscles grandissent quand tu dors, mais ils se forgent ici 💪',
      'Aujourd\'hui est le jour parfait pour devenir plus fort 🚀',
      'Chaque goutte de sueur est un pas vers ton objectif 💦',
      'Tu es plus fort que tes excuses 💪',
      'La progression commence par le premier pas 🚀'
    ],
    muscleGroups: 'Groupes musculaires travaillés',
    duration: 'Durée',
    volume: 'Volume'
  },

  // Feedback modal
  feedback: {
    title: 'Votre avis compte',
    score: 'Note (0-10)',
    scoreLabelLow: 'À améliorer',
    scoreLabelMid: 'Bien',
    scoreLabelHigh: 'Excellent',
    liked: 'Ce que vous avez aimé',
    missing: 'Ce qui manque',
    suggestion: 'Suggestion',
    email: 'Email de contact',
    emailInvalid: 'Email invalide',
    emailHint: 'Votre email est optionnel et utilisé uniquement pour vous répondre.',
    optional: 'Optionnel',
    consent: "J'accepte d'être recontacté",
    send: 'Envoyer',
    sentSuccess: 'Merci pour votre avis !',
    offlineQueued: 'Hors ligne: votre avis sera envoyé dès que possible.',
    failedQueued: "Échec de l'envoi, sera réessayé plus tard.",
    chips: {
      liked: {
        ui: 'UI claire',
        performance: 'Performances',
        features: 'Fonctionnalités',
        simplicity: 'Simplicité',
      },
      missing: {
        stats: 'Statistiques',
        exercises: 'Exercices',
        customization: 'Personnalisation',
        export: 'Export',
      }
    }
  },

  // Periods
  periods: {
    sevenDays: '7 jours',
    fourteenDays: '14 jours',
    oneMonth: '1 mois',
    threeMonths: '3 mois'
  },

  // Session
  session: {
    takeBreath: 'Prends ton souffle',
    letsGo: 'C\'est parti !',
    keepGoing: 'Continue !',
    halfwayThere: 'À mi-chemin !',
    almostDone: 'Presque fini !',
    finalPush: 'Dernière ligne droite !',
    series: 'Série',
    exercise: 'Exercice',
    restTime: 'Temps de repos',
    workoutTime: 'Temps d\'exercice',
    skipRest: 'Passer le repos',
    next: 'Suivant',
    exerciseNow: 'Faire l\'exercice',
    restNow: 'Repos entre séries',
    restBetweenExercises: 'Repos entre exercices',
    preparationNow: 'Préparation'
  },

  // Profile screen
  profile: {
    title: 'Profil',
    account: 'Compte',
    myAccount: 'Mon Compte',
    createAccount: 'Créer un compte',
    exportData: 'Exporter les données',
    resetData: 'Réinitialiser les données',
    social: 'Social',
    share: 'Partager l\'application',
    rate: 'Évaluer l\'application',
    settings: 'Paramètres',
    appSettings: 'Paramètres de l\'application',
    instagram: 'Instagram',
    instagramHandle: '@gainiziapp',
    instagramModal: {
      title: 'Suivez-nous sur Instagram',
      message: 'Voulez-vous nous suivre sur Instagram ?',
      follow: 'Nous suivre',
      later: 'Plus tard'
    },
    auth: {
      title: 'Connexion',
      description:
        'Connectez-vous pour synchroniser vos données et accéder à toutes les fonctionnalités',
      signIn: 'Se connecter',
      signOut: 'Se déconnecter',
      continueWithGoogle: 'Continuer avec Google',
      continueWithApple: 'Continuer avec Apple',
      continueWithEmail: 'Continuer avec Email',
      notSignedIn: 'Non connecté'
    },
    challenges: {
      title: 'Défis',
      comingSoon: 'Bientôt disponible',
      description: 'Complétez des défis pour gagner des badges et suivre votre progression !',
      locked: 'Verrouillé',
      unlocked: 'Débloqué'
    }
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
    resetDataConfirmation:
      'Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.',
    dataResetSuccess: 'Toutes les données ont été réinitialisées avec succès.',
    errorResettingData: 'Une erreur est survenue lors de la réinitialisation des données.',
    // Réglage RPE
    rpeMode: 'Réglage RPE',
    rpeAsk: 'Demander le RPE',
    rpeNever: 'Ne pas demander (par défaut 7)'
  },

  // About section
  about: {
    title: 'BodyWork',
    version: 'Version 1.0.0',
    description:
      'Une application pour suivre vos entraînements, mesurer vos progrès et atteindre vos objectifs de remise en forme.',
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
    restPeriod72plus: '72h+',
    lowIntensity: 'Faible',
    mediumIntensity: 'Moyenne',
    highIntensity: 'Élevée'
  },

  // Workout screen
  workout: {
    noWorkoutsToday: 'Aucun entraînement enregistré aujourd\'hui',
    startWorkout: 'Commencer un entraînement',
    weight: 'Poids',
    reps: 'Répétitions',
    duration: 'Durée',
    distance: 'Distance',
    sets: 'Séries',
    rpe: 'RPE',
    selectRpe: 'Sélectionner RPE',

    // Units
    unitType: 'Type d\'unité',
    repsAndWeight: 'Rép. et charge',
    seconds: 'secondes',
    minutes: 'minutes',
    meters: 'mètres',
    kilometers: 'kilomètres',
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
    selectDate: 'Sélectionner la date',
    selectExercise: 'Sélectionner un exercice',
    configuration: 'Configuration',
    series: 'Séries',
    veryEasy: 'Très facile',
    maxEffort: 'Effort maximal',
    addSeries: 'Ajouter une série',
    nextSeries: 'Prochaines séries',
    workoutTime: 'Temps d\'entraînement',
    exercise: 'Exercice',
    skipRest: 'Passer le repos',
    next: 'Suivant',
    letsGo: 'C\'est parti !',
    keepGoing: 'Continue !',
    halfwayThere: 'À mi-chemin !',
    almostDone: 'Presque fini !',
    finalPush: 'Dernier effort !',
    takeBreath: 'Reprends ton souffle',
    restTime: 'Temps de repos',
    restShort: 'repos',
    workoutTime: 'Temps d\'entraînement',
    seriesType: 'Type de série',
    warmUp: 'Échauffement',
    workingSet: 'Série de travail',
    warmUpDescription: 'Série d\'échauffement (RPE non pris en compte)',
    workingSetDescription: 'Série de travail (RPE important)',
    addSeries: 'Ajouter une série',
    series: 'Série',
    seriesPlural: 'Séries',
    exerciseSelected: 'Exercice sélectionné',
    optionalNote: 'Note optionnelle',
    usePreviousValues: 'Utiliser les valeurs précédentes',
    notApplicable: 'N/A',
    selectDate: 'Sélectionner une date',
    duplicateLastSeries: 'Dupliquer la dernière série',
    completedSeries: 'Serie terminée',
    routineCompleted: 'La routine est terminée !',
    quitRoutine: 'Arrêter la routine',
    quitRoutineMessage: 'Êtes-vous sûr de vouloir abandonner cette routine ? Vos progrès seront perdus.',
    exercises: 'exercices',
    nextExercise: 'Exercice suivant',
    upcomingExercises: 'Prochains exercices',
    lastSeriesMessage: 'C\'est votre dernière série ! Donnez tout ce que vous avez !',
    lastExerciseMessage: 'C\'est votre dernier exercice ! Finissez en beauté !',
    noMoreExercises: 'Aucun autre exercice dans cette routine',
    loading: 'Chargement...'
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
    searchByExercise: 'Chercher par exercice',
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
    exerciseNotFoundMessage:
      'Vous devez avoir un historique d\'entraînement pour cet exercice avant de définir un objectif.',
    pleaseCompleteAllFields: 'Veuillez remplir tous les champs',
    invalidWeightValues: 'Valeurs de poids invalides',
    errorSavingGoal: 'Erreur lors de la sauvegarde de l\'objectif',
    goalDetails: 'Détails de l\'objectif',
    currentWeightDescription: 'Poids actuel',
    targetWeightDescription: 'Poids cible'
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
    other: 'Autre',
    exercise: 'Exercice',
    obliques: 'Obliques',
    forearms: 'Avant-bras',
    abductors: 'Abducteurs',
    adductors: 'Adducteurs',
    quadriceps: 'Quadriceps',
    trapezius: 'Trapèze',
    hamstrings: 'Ischio-jambiers',
    calves: 'Mollets'
  },

  // Measurements screen
  measurements: {
    title: 'Mesures',
    invalidDate: 'Date invalide',
    dateFormatError: 'Erreur de formatage de date:',
    neck: 'Cou',
    shoulders: 'Épaules',
    chest: 'Poitrine',
    arms: 'Bras',
    forearms: 'Avant-bras',
    waist: 'Taille',
    hips: 'Hanches',
    thighs: 'Cuisses',
    calves: 'Mollets',
    history: 'Historique',
    historyOf: 'Historique {part}',
    noData: 'Aucune donnée',
    notEnoughData: 'Plus de données nécessaires pour le graphique',
    noHistoryData: 'Aucune donnée d\'historique disponible',
    noDataForSelection: 'Aucune donnée pour cette sélection',
    inputMode: 'Saisie',
    historyMode: 'Historique',
    lastUpdate: 'Dernière mise à jour'
  },

  // Exercise details screen
  exerciseDetails: {
    estimated_1rm: '1RM estimé',
    last_session: 'Dernière séance'
  },

  // Routine history
  routineHistory: {
    title: 'Historique de la routine',
    summary: 'Résumé',
    exercises: 'exercices',
    preparation: 'Préparation',
    rest: 'Repos',
    work: 'Travail',
    muscles: 'Muscles',
    exerciseList: 'Exercices',
    notes: 'Notes',
    noHistory: 'Pas encore d\'historique pour cette routine'
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
  exercise_core_hangingKneeRaises: 'Relevés de genoux suspendu',
  exercise_core_sidePlank: 'Planche latérale',
  exercise_core_obliqueCrunches: 'Crunchs obliques',
  exercise_core_woodChops: 'Mouvements de bûcheron',

  // Exercise names - Obliques
  exercise_obliques_russianTwist: 'Twists russes',
  exercise_obliques_sidePlank: 'Planche latérale',
  exercise_obliques_obliqueCrunches: 'Crunchs obliques',
  exercise_obliques_woodChops: 'Mouvements de bûcheron',

  // Exercise names - Forearms
  exercise_forearms_wristCurls: 'Flexions de poignets',
  exercise_forearms_reverseCurls: 'Curls inversés',
  exercise_forearms_farmerWalk: 'Marche du fermier',
  exercise_forearms_gripTraining: 'Entraînement de préhension',

  // Exercise names - Abductors
  exercise_legs_sideLunges: 'Fentes latérales',
  exercise_legs_clamshells: 'Coquillages',
  exercise_legs_hipAbduction: 'Abduction de hanche',
  exercise_legs_lateralWalks: 'Marches latérales',

  // Exercise names - Adductors
  exercise_legs_sumoSquats: 'Squats sumo',
  exercise_legs_hipAdduction: 'Adduction de hanche',
  exercise_legs_innerThighLifts: 'Relevés de cuisse interne',
  exercise_legs_adductorMachine: 'Machine adducteurs',

  // Exercise names - Quadriceps
  exercise_legs_frontSquat: 'Squat avant',
  exercise_legs_bulgarianSplitSquat: 'Squat bulgare',

  // Exercise names - Trapezius
  exercise_back_uprightRow: 'Rowing debout',
  exercise_back_facePulls: 'Tractions faciales',

  // Exercise names - Hamstrings
  exercise_legs_legCurls: 'Curls de jambes',
  exercise_legs_romanianDeadlift: 'Soulevé de terre roumain',
  exercise_legs_goodMornings: 'Bonjour',
  exercise_legs_gluteHamRaises: 'Relevés fessiers-jambiers',

  // Exercise names - Calves
  exercise_legs_jumpingJacks: 'Jumping jacks',
  exercise_legs_calfRaises: 'Relevés de mollets',
  exercise_legs_seatedCalfRaises: 'Relevés de mollets assis',
  exercise_legs_boxJumps: 'Sauts sur box',

  // Exercise names - Cardio
  exercise_cardio_running: 'Course à pied',
  exercise_cardio_cycling: 'Vélo',
  exercise_cardio_rowing: 'Aviron',
  exercise_cardio_jumpingJacks: 'Jumping jacks',
  exercise_cardio_burpees: 'Burpees',

  // Contact section
  contact: {
    title: 'Me contacter',
    name: 'Votre nom',
    namePlaceholder: 'Entrez votre nom',
    email: 'Votre email',
    emailPlaceholder: 'Entrez votre adresse email',
    message: 'Votre message',
    messagePlaceholder: 'Entrez votre message',
    send: 'Envoyer',
    success: 'Message envoyé avec succès',
    error: 'Erreur lors de l\'envoi du message',
    errors: {
      nameRequired: 'Le nom est requis',
      emailRequired: 'L\'email est requis',
      emailInvalid: 'L\'email n\'est pas valide',
      messageRequired: 'Le message est requis'
    }
  },

  // Routine screen
  routine: {
    createTitle: 'Nouvelle routine',
    editTitle: 'Modifier la routine',
    title: 'Titre',
    titlePlaceholder: 'Entrez le titre de la routine',
    titleDescription: 'Donnez un nom à votre routine d\'entraînement',
    description: 'Description',
    descriptionPlaceholder: 'Entrez une description pour votre routine',
    descriptionDescription: 'Ajoutez une description détaillée de votre routine',
    selectExercises: 'Sélectionner les exercices',
    addExercise: 'Ajouter un exercice',
    noExerciseSelected: 'Aucun exercice sélectionné',
    addExerciseToStart: 'Ajoutez un exercice pour commencer',
    saved: 'Routine enregistrée !',
    updated: 'Routine mise à jour !',
    configureSeries: 'Configurer les séries',
    seriesConfiguration: 'Configuration des séries',
    withLoad: 'Avec charge',
    seriesType: 'Type de série',
    warmUp: 'Échauffement',
    workingSet: 'Série de travail',
    warmUpDescription: 'Série d\'échauffement',
    workingSetDescription: 'Série de travail',
    selectRestTime: 'Sélectionner le temps de repos',
    addSeries: 'Ajouter une série',
    usePreviousValues: 'Utiliser les valeurs précédentes',
    optionalNote: 'Note optionnelle',
    selectDuration: 'Sélectionner la durée',
    withLoad: 'Avec charge',
    seriesLabel: 'Série',
    // Exercise Rest Configuration
    exerciseRestTitle: 'Temps entre exercices',
    exerciseRestDescription: 'Configurez le temps de repos entre chaque exercice de votre routine',
    beginnerMode: 'Mode débutant',
    beginnerModeDescription: 'Temps commun pour tous les exercices',
    advancedMode: 'Mode avancé',
    advancedModeDescription: 'Temps personnalisé par exercice',
    commonExerciseRest: 'Temps de repos commun',
    // Preparation Time Configuration
    preparationTitle: 'Temps de préparation',
    preparationDescription: 'Configurez un temps de préparation avant chaque exercice',
    enablePreparation: 'Activer le temps de préparation',
    preparationTime: 'Durée de préparation',
    preparationTimeDescription: 'Temps de préparation en secondes'
  },

  // Routines
  routines: {
    title: 'Mes routines',
    emptyState: {
      title: 'Aucune routine',
      description: 'Créez votre première routine d\'entraînement',
      button: 'Créer une routine'
    },
    noFavorites: {
      title: 'Aucun favori',
      description: 'Vous avez des routines mais aucune n\'est marquée comme favorite',
    },
    item: {
      new: 'Nouveau',
      exercises: 'exercices',
      exercise: 'exercice',
      minutes: 'min',
      hours: 'h',
      series: 'séries',
      usages: 'utilisations',
      usage: 'utilisation',
      lastUsed: 'Dernière utilisation :',
      createdOn: 'Créée le :',
      actions: 'Actions',
      edit: 'Modifier',
      share: 'Partager',
      delete: 'Supprimer',
      start: 'Démarrer',
      deleteConfirmTitle: 'Supprimer la routine',
      deleteConfirmMessage: 'Êtes-vous sûr de vouloir supprimer la routine "{routineName}" ? Cette action est irréversible.'
    }
  },

  // Calendar
  calendar: {
    weekOf: 'Semaine du',
    today: 'Aujourd\'hui',
    months: {
      0: 'Janvier',
      1: 'Février',
      2: 'Mars',
      3: 'Avril',
      4: 'Mai',
      5: 'Juin',
      6: 'Juillet',
      7: 'Août',
      8: 'Septembre',
      9: 'Octobre',
      10: 'Novembre',
      11: 'Décembre'
    }
  },

  // Exercise Selection
  exerciseSelection: {
    title: 'Sélectionner un exercice',
    searchPlaceholder: 'Rechercher des exercices...',
    selectByMuscle: 'Sélectionner par groupe musculaire',
    rotate: 'Pivoter',
    quickAccess: 'Accès rapide',
    exercises: 'exercices'
  },

  // Exercise List
  exerciseList: {
    exercisesFor: 'Exercices pour',
    searchResults: 'Résultats de recherche',
    allExercises: 'Tous les exercices',
    searchPlaceholder: 'Rechercher des exercices...',
    clearAll: 'Tout effacer',
    noExercisesFound: 'Aucun exercice trouvé',
    addCustomExercise: 'Ajouter un exercice personnalisé'
  },

  // Onboarding
  onboarding: {
    // Navigation
    step: 'Étape',
    of: 'sur',
    next: 'Suivant',
    finish: 'Terminer',
    skip: 'Passer',
    continue: 'Continuer',
    
    // Composants communs
    session: 'séance',
    sessions: 'séances',
    
    // Écran 0: Accueil initial Gainizi
    initialWelcome: {
      title: 'Bienvenue sur Gainizi',
      subtitle: 'Votre coach numérique pour suivre vos entraînements',
      buttonText: 'Commencer',
      languageLabel: 'Langue'
    },
    
    // Écran 1: Sélection de langue
    languageSelection: {
      title: 'Choisissez votre langue',
    },
    
    // Écran 1: Sélection de thème
    themeSelection: {
      title: 'Choisissez votre thème',
      lightTheme: 'Thème clair',
      lightDescription: 'Interface lumineuse et claire',
      darkTheme: 'Thème sombre',
      darkDescription: 'Interface sombre, idéale pour les yeux',
      systemTheme: 'Automatique',
      systemDescription: 'Suit les paramètres de votre appareil',
      footerNote: 'Vous pourrez changer le thème à tout moment dans les paramètres'
    },
    
    // Écran 2: Explication des données
    dataExplanation: {
      title: 'Personnalisons votre expérience',
      subtitle: 'Ces informations nous aident à personnaliser votre expérience et à améliorer l\'application grâce à des données d\'analyse anonymisées',
      personalizedGoals: 'Objectifs personnalisés',
      personalizedGoalsDesc: 'Nous utilisons vos objectifs pour créer des programmes d\'entraînement adaptés à vos besoins spécifiques.',
      adaptedLevel: 'Niveau sportif adapté',
      adaptedLevelDesc: 'Votre niveau nous permet de proposer des exercices et intensités appropriés pour votre progression.',
      smartRecommendations: 'Recommandations intelligentes',
      smartRecommendationsDesc: 'Vos préférences nous aident à suggérer les meilleurs exercices et routines pour vous.',
      secureData: 'Données sécurisées',
      secureDataDesc: 'Vos informations restent privées: par défaut elles sont stockées localement sur votre appareil. Si vous créez un compte ou activez la synchronisation, vos données de séance peuvent être chiffrées et synchronisées sur nos serveurs.',
      privacyGuaranteed: 'Confidentialité garantie :',
      privacyNote: 'Nous utilisons uniquement des données d\'analyse anonymisées pour améliorer l\'application. Vos séances restent sur votre téléphone par défaut ; si vous activez la synchronisation, elles sont transmises de façon sécurisée à nos serveurs.',
      startConfiguration: 'Commencer la configuration',
      footerNote: 'Vous pourrez modifier ces informations à tout moment dans les paramètres'
    },
    
    // Sélecteur de date
    datePicker: {
      day: 'Jour',
      month: 'Mois',
      year: 'Année',
      confirm: 'Confirmer',
      cancel: 'Annuler'
    },
    
    // Écran 1: Profil de base
    basicProfile: {
      title: 'Profil de base',
      subtitle: 'Commençons par apprendre à vous connaître',
      name: 'Nom ou pseudo',
      namePlaceholder: 'Entrez votre nom',
      gender: 'Genre',
      genderDescription: 'Comment vous identifiez-vous ?',
      male: 'Homme',
      female: 'Femme',
      other: 'Autre',
      biologicalSex: 'Sexe biologique',
      biologicalSexDescription: 'Nécessaire pour la carte corporelle et les calculs physiologiques',
      biologicalMale: 'Homme',
      biologicalFemale: 'Femme',
      birthDate: 'Date de naissance',
      height: 'Taille (cm)',
      weight: 'Poids (kg)',
      heightPlaceholder: '175',
      weightPlaceholder: '70',
      selectDate: 'Sélectionner une date'
    },
    
    // Écran 2: Objectifs & niveau
    goalsLevel: {
      title: 'Objectifs & niveau',
      subtitle: 'Définissons vos objectifs et votre niveau',
      primaryGoal: 'Objectif principal',
      muscleGain: 'Prise de muscle',
      weightLoss: 'Perte de poids',
      fitness: 'Remise en forme',
      fitnessLevel: 'Niveau sportif',
      beginner: 'Débutant',
      intermediate: 'Intermédiaire',
      advanced: 'Avancé'
    },
    
    // Écran 3: Préférences d'entraînement
    workoutPrefs: {
      title: 'Préférences d\'entraînement',
      subtitle: 'Personnalisons votre expérience d\'entraînement',
      weeklyWorkouts: 'Séances par semaine',
      equipment: 'Équipement disponible',
      gym: 'Salle de sport',
      home: 'Maison',
      limited: 'Matériel limité',
      priorityMuscles: 'Groupes musculaires prioritaires',
      legs: 'Jambes',
      back: 'Dos',
      arms: 'Bras',
      chest: 'Pectoraux',
      shoulders: 'Épaules',
      core: 'Abdominaux',
      fullBody: 'Corps entier'
    },
    
    // Écran 4: Paramètres d'application
    appSettings: {
      title: 'Paramètres d\'application',
      subtitle: 'Configurons l\'application selon vos préférences',
      language: 'Langue',
      french: 'Français',
      english: 'Anglais',
      units: 'Unité de mesure',
      metric: 'Métrique (kg/cm)',
      imperial: 'Impérial (lbs/inches)',
      nutritionTracking: 'Suivi nutrition',
      nutritionDesc: 'Activer le suivi de la nutrition',
      rpeTracking: 'Utiliser le RPE',
      rpeDesc: 'Activer l\'échelle de perception de l\'effort (RPE) pour évaluer l\'intensité de vos exercices',
      philosophyToggle: 'Afficher philosophie',
      philosophyDesc: 'Affiche une carte d\'inspiration avec une citation quotidienne sur l\'écran d\'accueil'
    },
    
    // Écran de confirmation
    welcome: {
      title: 'Bienvenue {name} 👋',
      subtitle: 'Votre profil est prêt !',
      message: 'Vous pouvez maintenant commencer votre parcours fitness avec une expérience personnalisée.',
      motivation: 'Votre parcours fitness personnalisé commence maintenant. Nous avons hâte de vous accompagner dans l\'atteinte de vos objectifs !',
      tutorialTitle: 'Besoin d\'aide pour commencer ?',
      tutorialDescription: 'Découvrez nos guides et tutoriels pour optimiser votre expérience fitness.',
      tutorialLink: 'Voir les tutoriels',
      startJourney: 'Commencer l\'aventure',
      startButton: 'Commencer l\'aventure'
    },
    
    // Validation
    validation: {
      nameRequired: 'Le nom est requis',
      heightRequired: 'La taille est requise',
      weightRequired: 'Le poids est requis',
      birthDateRequired: 'La date de naissance est requise',
      invalidHeight: 'Taille invalide (100-250 cm)',
      invalidWeight: 'Poids invalide (30-300 kg)',
      selectAtLeastOne: 'Sélectionnez au moins une option'
    }
  },

  // Citations inspirantes
  quotes: {
    strength: 'La force ne vient pas de la capacité physique. Elle vient d\'une volonté indomptable.',
    discipline: 'La discipline est le pont entre les objectifs et l\'accomplissement.',
    progress: 'Le progrès est impossible sans changement, et ceux qui ne peuvent pas changer leur esprit ne peuvent rien changer.',
    consistency: 'Le succès n\'est pas toujours une question de grandeur. Il s\'agit de cohérence. Un travail dur cohérent mène au succès.',
    mindset: 'Dans un état d\'esprit de croissance, les défis sont passionnants plutôt que menaçants.'
  },

  // Messages émotionnels pour la page d'accueil
  home: {
    quickAccess: 'Accès rapide',
    emotional: {
      greeting: 'Salut {name} ! 👋',
      // Pilier 1: Citation → Philosophie → Inspiration
      philosophy: 'Philosophie',
      inspiration: 'Inspiration',
      
      // Pilier 2: Semaine → Discipline → Satisfaction
      weeklyDiscipline: 'Discipline Hebdomadaire',
      sessions: 'séances',
      daysStreak: 'jours consécutifs',
      discipline: {
        complete: 'Discipline exemplaire ! 🏆',
        excellent: 'Excellente constance ! 💪',
        good: 'Belle régularité ! 👍',
        progress: 'En progression ! 📈',
        start: 'Commençons ensemble ! 🚀'
      },
      satisfaction: {
        complete: 'Accompli',
        high: 'Satisfait',
        medium: 'En route',
        building: 'Construction'
      },
      
      // Pilier 3: Dernière séance → Performance → Fierté
      lastPerformance: 'Dernière Performance',
      musclesWorked: 'Muscles travaillés',
      newRecord: 'Nouveau Record !',
      pride: {
        record: 'Performance exceptionnelle ! 🔥',
        exceptional: 'Force impressionnante ! 💥',
        strong: 'Solide performance ! 💪',
        solid: 'Bon travail accompli ! 👏',
        progress: 'Progression constante ! 📊'
      },
      performance: {
        record: 'Record',
        exceptional: 'Exceptionnel',
        strong: 'Fort',
        solid: 'Solide',
        building: 'Progression'
      },
      
      // Pilier 4: Objectif → Défi → Motivation
      weeklyChallenge: 'Défi Hebdomadaire',
      progress: 'Progression',
      defaultGoal: 'Atteindre mes objectifs fitness',
      oneMore: 'Plus qu\'une séance ! 🎯',
      sessionsLeft: 'Encore {count} séances',
      challenge: {
        conquered: 'Défi conquis ! Vous êtes incroyable ! 🏆',
        final: 'Dernière ligne droite ! Vous y êtes presque ! 🔥',
        close: 'Si proche du but ! Continuez ! 💪',
        halfway: 'À mi-parcours ! Excellent rythme ! 📈',
        begin: 'Le défi commence ! Montrez votre force ! ⚡'
      },
      motivation: {
        achieved: 'Accompli',
        final: 'Ultime',
        close: 'Proche',
        momentum: 'Élan',
        ignite: 'Allumer'
      },
      
      // Pilier 5: Routine → Personnalisation → Confiance + Récompense → Résultats → Plaisir
      personalization: 'Personnalisation',
      routines: 'Routines',
      custom: 'Perso',
      workouts: 'Séances',
      enjoyment: 'plaisir',
      createHint: 'Touchez pour créer une nouvelle routine',
      confidence: {
        expert: 'Vous êtes devenu un expert ! 🎓',
        experienced: 'Expérience solide acquise ! 💼',
        growing: 'Confiance grandissante ! 🌱',
        building: 'Construction de l\'expertise ! 🔨',
        starting: 'Début du parcours ! 🌟'
      },
      personalization: {
        master: 'Maître créateur de routines ! 🎨',
        creator: 'Créateur passionné ! ✨',
        adapter: 'Adaptateur intelligent ! 🔧',
        beginner: 'Premiers pas créatifs ! 🎯',
        explorer: 'Explorateur curieux ! 🔍'
      },
      pleasure: {
        joy: 'Joie',
        satisfaction: 'Satisfaction',
        content: 'Contentement',
        progress: 'Progression',
        discovery: 'Découverte'
      },
      
      // Bouton d'action émotionnel
      action: {
        continue: 'Continuez l\'Excellence',
        keepGoing: 'Votre élan est parfait',
        unleash: 'Libérez Votre Énergie',
        energyReady: 'Votre force déborde',
        focus: 'Canalisez Votre Focus',
        mindReady: 'Votre esprit est prêt',
        gentle: 'Démarrage en Douceur',
        easyStart: 'Respectons votre rythme',
        transform: 'Transformez-Vous',
        readyToGrow: 'Prêt à grandir'
      },
      mood: {
        motivated: 'Motivé',
        tired: 'Fatigué',
        energetic: 'Énergique',
        focused: 'Concentré'
      }
    }
  }
};
