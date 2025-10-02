export default {
  // Common
  common: {
    loading: 'Loading...',
    close: 'Close',
    errorLoadingWorkouts: 'Error loading workouts:',
    errorSavingWorkouts: 'Error saving workouts:',
    appTitle: 'Body Work',
    noWorkoutForDate: 'No workout recorded for this date',
    date: 'Date',
    noDataAvailable: 'No data available for this period',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    reset: 'Reset',
    save: 'Save',
    update: 'Update',
    delete: 'Delete',
    ok: 'OK',
    back: 'Back',
    warning: 'Warning',
    info: 'Information',
    use: 'Use',
    select: 'Select',
    note: 'Note',
    custom: 'Custom',
    inConstruction: 'Under Construction',
    featureComingSoon: 'This feature is coming soon!',
    next: 'Next',
    finish: 'Finish',
    or: 'or',
    exercises: 'exercises',
    series: 'series',
    seconds: 'seconds',
    enabled: 'Enabled',
    disabled: 'Disabled',
    day: 'Day',
    month: 'Month',
    year: 'Year',
    confirm: 'Confirm'
  },

  // Feedback modal
  feedback: {
    title: 'Your feedback matters',
    score: 'Score (0-10)',
    scoreLabelLow: 'Needs improvement',
    scoreLabelMid: 'Good',
    scoreLabelHigh: 'Excellent',
    liked: 'What you liked',
    missing: 'What is missing',
    suggestion: 'Suggestion',
    email: 'Contact email',
    emailInvalid: 'Invalid email',
    emailHint: 'Your email is optional and used only to reply to you.',
    optional: 'Optional',
    consent: 'I agree to be contacted',
    send: 'Send',
    sentSuccess: 'Thanks for your feedback!',
    offlineQueued: "Offline: your feedback will be sent when you're back online.",
    failedQueued: 'Send failed, will retry later.',
    chips: {
      liked: {
        ui: 'Clear UI',
        performance: 'Performance',
        features: 'Features',
        simplicity: 'Simplicity',
      },
      missing: {
        stats: 'Stats',
        exercises: 'Exercises',
        customization: 'Customization',
        export: 'Export',
      }
    }
  },

  // Periods
  periods: {
    sevenDays: '7 days',
    fourteenDays: '14 days',
    oneMonth: '1 month',
    threeMonths: '3 months'
  },

  // Session
  session: {
    takeBreath: 'Catch your breath',
    letsGo: 'Let\'s go!',
    keepGoing: 'Keep going!',
    halfwayThere: 'Halfway there!',
    almostDone: 'Almost done!',
    finalPush: 'Final push!',
    series: 'Series',
    exercise: 'Exercise',
    restTime: 'Rest time',
    workoutTime: 'Workout time',
    skipRest: 'Skip rest',
    next: 'Next',
    exerciseNow: 'Time to exercise',
    restNow: 'Rest between series',
    restBetweenExercises: 'Rest between exercises',
    preparationNow: 'Preparation'
  },

  // Settings screen
  settings: {
    title: 'Settings',
    loadingSettings: 'Loading settings...',
    preferences: 'Preferences',
    exportData: 'Export Data',
    exportToCSV: 'Export to CSV',
    noWorkoutsToExport: 'No workouts to export',
    exportSuccess: 'Export successful',
    sharingNotAvailable: 'Sharing is not available on this device',
    exportError: 'Error exporting workouts',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    weightUnit: 'Weight unit',
    application: 'Application',
    about: 'About',
    language: 'Language',
    english: 'English',
    french: 'French',
    theme: 'Theme',
    dark: 'Dark',
    light: 'Light',
    resetData: 'Reset Data',
    resetDataConfirmation: 'Are you sure you want to reset all data? This action cannot be undone.',
    dataResetSuccess: 'All data has been successfully reset.',
    errorResettingData: 'An error occurred while resetting the data.',
    // RPE setting
    rpeMode: 'RPE Setting',
    rpeAsk: 'Ask RPE',
    rpeNever: 'Do not ask (default 7)',

    routines: {
      title: 'Routines',
      deleteAll: 'Delete All Routines',
      deleteAllConfirmation: 'Are you sure you want to delete all routines? This action cannot be undone.',
      deleteAllSuccess: 'All routines have been successfully deleted.',
      deleteAllError: 'An error occurred while deleting routines.'
    }
  },

  // About section
  about: {
    title: 'BodyWork',
    version: 'Version 1.0.0',
    description:
      'An application to track your workouts, measure your progress and achieve your fitness goals.',
    developer: 'Developer',
    contact: 'Contact',
    website: 'Website',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service'
  },

  // Contact section
  contact: {
    title: 'Contact Me',
    name: 'Your name',
    namePlaceholder: 'Enter your name',
    email: 'Your email',
    emailPlaceholder: 'Enter your email address',
    message: 'Your message',
    messagePlaceholder: 'Enter your message',
    send: 'Send',
    success: 'Message sent successfully',
    error: 'Error sending message',
    errors: {
      nameRequired: 'Name is required',
      emailRequired: 'Email is required',
      emailInvalid: 'Email is invalid',
      messageRequired: 'Message is required'
    }
  },

  // Muscle Map
  muscleMap: {
    frontView: 'Front view',
    backView: 'Back view',
    muscleRestState: 'Muscle rest state',
    restPeriod0to24: '0-24h',
    restPeriod24to72: '24-72h',
    restPeriod72plus: '72h+',
    lowIntensity: 'Low',
    mediumIntensity: 'Medium',
    highIntensity: 'High'
  },

  // Workout screen
  workout: {
    noWorkoutsToday: 'No workouts recorded today',
    startWorkout: 'Start a workout',
    weight: 'Weight',
    reps: 'Reps',
    duration: 'Duration',
    distance: 'Distance',
    sets: 'Sets',
    rpe: 'RPE',
    selectRpe: 'Select RPE',

    // Units
    unitType: 'Unit Type',
    repsAndWeight: 'Reps & Weight',
    seconds: 'seconds',
    minutes: 'minutes',
    meters: 'meters',
    kilometers: 'kilometers',
    warmUpSeries: 'Warm-up Series',
    workingSeries: 'Working Series',
    newWorkout: 'New Workout',
    customExercise: 'Custom Exercise',
    backToPredefined: 'Back to Predefined',
    weightKg: 'Weight (kg)',
    suggested: 'Suggested',
    rpeTitle: 'RPE (Rate of Perceived Exertion)',
    rpeDescription: '1 = Very easy, 10 = Maximum effort',
    addExercise: 'Add Exercise',
    searchExercises: 'Search Exercises...',
    selectDate: 'Select Date',
    selectExercise: 'Select Exercise',
    configuration: 'Configuration',
    series: 'Series',
    veryEasy: 'Very easy',
    maxEffort: 'Maximum effort',
    addSeries: 'Add Series',
    nextSeries: 'Next Series',
    workoutTime: 'Workout Time',
    exercise: 'Exercise',
    skipRest: 'Skip Rest',
    next: 'Next',
    letsGo: 'Let\'s Go!',
    keepGoing: 'Keep Going!',
    halfwayThere: 'Halfway There!',
    almostDone: 'Almost Done!',
    finalPush: 'Final Push!',
    takeBreath: 'Take a Breath',
    restTime: 'Rest Time',
    restShort: 'rest',
    workoutTime: 'Workout Time',
    seriesType: 'Series Type',
    warmUp: 'Warm-up',
    workingSet: 'Working Set',
    warmUpDescription: 'Warm-up series (RPE not considered)',
    workingSetDescription: 'Working series (RPE important)',
    addSeries: 'Add Series',
    series: 'Series',
    seriesPlural: 'Series',
    exerciseSelected: 'Exercise selected',
    optionalNote: 'Optional note',
    usePreviousValues: 'Use previous values',
    notApplicable: 'N/A',
    selectDate: 'Select a date',
    duplicateLastSeries: 'Duplicate last series',
    routineCompleted: 'Routine completed!',
    quitRoutine: 'Quit Routine',
    quitRoutineMessage: 'Are you sure you want to quit this routine? Your progress will be lost.',
    exercises: 'exercises',
    nextExercise: 'Next Exercise',
    upcomingExercises: 'Upcoming Exercises',
    lastSeriesMessage: 'This is your last series! Give it everything you\'ve got!',
    lastExerciseMessage: 'This is your last exercise! Finish strong!',
    noMoreExercises: 'No more exercises in this routine',
    loading: 'Loading...'
  },

  // Timer screen
  timer: {
    title: 'Timer',
    restTime: 'Rest Time',
    workTime: 'Work Time',
    stopwatch: 'Stopwatch',
    customTime: 'Custom Time',
    minutes: 'Minutes',
    seconds: 'Seconds',
    exerciseName: 'Exercise Name',
    enterExerciseName: 'Enter exercise name',
    exercise: 'Exercise',
    series: 'Series'
  },

  // Stats screen
  stats: {
    title: 'Statistics',
    overview: 'Overview',
    totalWorkouts: 'Total Workouts',
    totalExercises: 'Total Exercises',
    totalVolume: 'Total Volume',
    avgWorkoutTime: 'Avg. Workout Time',
    progressionTextNone: 'No progression data available',
    attendance: 'Attendance',
    series: 'Series',
    sessions: 'Sessions',
    goals: 'Goals',
    noGoalsYet: 'No goals set yet',
    addGoal: 'Add Goal',
    muscleDistribution: 'Muscle Distribution',
    oneMonth: '1 Month',
    threeMonths: '3 Months',
    sixMonths: '6 Months',
    period: 'Period:',
    muscleGroup: 'Muscle group:',
    allGroups: 'All groups',
    progressionText: '💪 You have progressed by {progress}% on {exercise}!',
    progressionTextMonth: '💪 You have progressed by {progress}% this month!',
    progressionNoData: '💪 Keep up the effort, progress will come!',
    oneRM: '1RM Progression',
    searchByExercise: 'Search by Exercise',
    volumePerWeek: 'Volume per week',
    repsPerSession: 'Reps per session',
    selectExercise: 'Select an exercise',
    allExercises: 'All exercises',
    volume: 'Volume',
    repetitions: 'Repetitions'
  },

  // Goals
  goals: {
    goalRemaining: '{remaining}kg remaining',
    goalAchieved: 'Goal achieved!',
    addGoal: 'Add a goal',
    newGoal: 'New Goal',
    currentWeight: 'Current Weight',
    targetWeight: 'Target Weight',
    selectExerciseForGoal: 'Select Exercise',
    deleteGoal: 'Delete Goal',
    deleteGoalConfirmation: 'Are you sure you want to delete the goal for {exercise}?',
    useLastWorkout: 'Use Last Workout',
    useSuggested: 'Use Suggested',
    exerciseNotFound: 'Exercise Not Found',
    exerciseNotFoundMessage:
      'You need to have workout history for this exercise before setting a goal.',
    pleaseCompleteAllFields: 'Please complete all fields',
    invalidWeightValues: 'Invalid weight values',
    errorSavingGoal: 'Error saving goal',
    goalDetails: 'Goal Details',
    currentWeightDescription: 'Current weight',
    targetWeightDescription: 'Target weight',
    completedSeries: 'Completed series'
  },

  // Exercise selector
  exerciseSelector: {
    searchExercise: 'Search for an exercise...',
    favorites: 'Favorites',
    recentExercises: 'Recent Exercises',
    noFavorites: 'No favorite exercises yet',
    noRecentExercises: 'No recent exercises',
    searchResults: 'Search Results',
    noExercisesInGroup: 'No exercises available in this muscle group'
  },

  // Muscle groups
  muscleGroups: {
    chest: 'Chest',
    back: 'Back',
    legs: 'Legs',
    arms: 'Arms',
    shoulders: 'Shoulders',
    biceps: 'Biceps',
    triceps: 'Triceps',
    core: 'Core',
    cardio: 'Cardio',
    other: 'Other',
    exercise: 'Exercise',
    obliques: 'Obliques',
    forearms: 'Forearms',
    abductors: 'Abductors',
    adductors: 'Adductors',
    quadriceps: 'Quadriceps',
    trapezius: 'Trapezius',
    hamstrings: 'Hamstrings',
    calves: 'Calves'
  },

  // Measurements screen
  measurements: {
    title: 'Measurements',
    invalidDate: 'Invalid date',
    dateFormatError: 'Date formatting error:',
    neck: 'Neck',
    shoulders: 'Shoulders',
    chest: 'Chest',
    arms: 'Arms',
    forearms: 'Forearms',
    waist: 'Waist',
    hips: 'Hips',
    thighs: 'Thighs',
    calves: 'Calves',
    history: 'History',
    historyOf: 'History of {part}',
    noData: 'No data',
    noHistoryData: 'No history data available',
    noDataForSelection: 'No data for this selection',
    inputMode: 'Input',
    historyMode: 'History',
    lastUpdate: 'Last update'
  },

  // Exercise details screen
  exerciseDetails: {
    estimated_1rm: 'Estimated 1RM',
    last_session: 'Last Session'
  },

  routineHistory: {
    title: 'Routine History',
    summary: 'Summary',
    exercises: 'exercises',
    preparation: 'Preparation',
    rest: 'Rest',
    work: 'Work',
    muscles: 'Muscles',
    exerciseList: 'Exercises',
    notes: 'Notes',
    noHistory: 'No history for this routine yet'
  },

  // Exercise names - Chest
  exercise_chest_benchPress: 'Bench Press',
  exercise_chest_inclineBenchPress: 'Incline Bench Press',
  exercise_chest_declineBenchPress: 'Decline Bench Press',
  exercise_chest_dumbbellFlyes: 'Dumbbell Flyes',
  exercise_chest_cableCrossover: 'Cable Crossover',

  // Exercise names - Back
  exercise_back_pullUps: 'Pull-ups',
  exercise_back_latPulldown: 'Lat Pulldown',
  exercise_back_barbellRow: 'Barbell Row',
  exercise_back_dumbbellRow: 'Dumbbell Row',
  exercise_back_tBarRow: 'T-Bar Row',

  // Exercise names - Legs
  exercise_legs_squat: 'Squat',
  exercise_legs_deadlift: 'Deadlift',
  exercise_legs_legPress: 'Leg Press',
  exercise_legs_lunges: 'Lunges',
  exercise_legs_legExtension: 'Leg Extension',

  // Exercise names - Shoulders
  exercise_shoulders_militaryPress: 'Military Press',
  exercise_shoulders_lateralRaises: 'Lateral Raises',
  exercise_shoulders_frontRaises: 'Front Raises',
  exercise_shoulders_rearDeltFlyes: 'Rear Delt Flyes',
  exercise_shoulders_shrugs: 'Shrugs',

  // Exercise names - Biceps
  exercise_biceps_barbellCurl: 'Barbell Curl',
  exercise_biceps_dumbbellCurl: 'Dumbbell Curl',
  exercise_biceps_hammerCurl: 'Hammer Curl',
  exercise_biceps_preacherCurl: 'Preacher Curl',
  exercise_biceps_concentrationCurl: 'Concentration Curl',

  // Exercise names - Triceps
  exercise_triceps_cableExtension: 'Cable Extension',
  exercise_triceps_skullCrushers: 'Skull Crushers',
  exercise_triceps_overheadExtension: 'Overhead Extension',
  exercise_triceps_dips: 'Dips',
  exercise_triceps_closegripBenchPress: 'Close-grip Bench Press',

  // Exercise names - Core
  exercise_core_plank: 'Plank',
  exercise_core_russianTwist: 'Russian Twist',
  exercise_core_legRaises: 'Leg Raises',
  exercise_core_crunches: 'Crunches',
  exercise_core_hangingKneeRaises: 'Hanging Knee Raises',
  exercise_core_sidePlank: 'Side Plank',
  exercise_core_obliqueCrunches: 'Oblique Crunches',
  exercise_core_woodChops: 'Wood Chops',

  // Exercise names - Obliques
  exercise_obliques_russianTwist: 'Russian Twist',
  exercise_obliques_sidePlank: 'Side Plank',
  exercise_obliques_obliqueCrunches: 'Oblique Crunches',
  exercise_obliques_woodChops: 'Wood Chops',

  // Exercise names - Forearms
  exercise_forearms_wristCurls: 'Wrist Curls',
  exercise_forearms_reverseCurls: 'Reverse Curls',
  exercise_forearms_farmerWalk: 'Farmer Walk',
  exercise_forearms_gripTraining: 'Grip Training',

  // Exercise names - Abductors
  exercise_legs_sideLunges: 'Side Lunges',
  exercise_legs_clamshells: 'Clamshells',
  exercise_legs_hipAbduction: 'Hip Abduction',
  exercise_legs_lateralWalks: 'Lateral Walks',

  // Exercise names - Adductors
  exercise_legs_sumoSquats: 'Sumo Squats',
  exercise_legs_hipAdduction: 'Hip Adduction',
  exercise_legs_innerThighLifts: 'Inner Thigh Lifts',
  exercise_legs_adductorMachine: 'Adductor Machine',

  // Exercise names - Quadriceps
  exercise_legs_frontSquat: 'Front Squat',
  exercise_legs_bulgarianSplitSquat: 'Bulgarian Split Squat',

  // Exercise names - Trapezius
  exercise_back_uprightRow: 'Upright Row',
  exercise_back_facePulls: 'Face Pulls',

  // Exercise names - Hamstrings
  exercise_legs_legCurls: 'Leg Curls',
  exercise_legs_romanianDeadlift: 'Romanian Deadlift',
  exercise_legs_goodMornings: 'Good Mornings',
  exercise_legs_gluteHamRaises: 'Glute Ham Raises',

  // Exercise names - Calves
  exercise_legs_jumpingJacks: 'Jumping jacks',
  exercise_legs_calfRaises: 'Calf Raises',
  exercise_legs_seatedCalfRaises: 'Seated Calf Raises',
  exercise_legs_boxJumps: 'Box Jumps',

  // Exercise names - Cardio
  exercise_cardio_running: 'Running',
  exercise_cardio_cycling: 'Cycling',
  exercise_cardio_rowing: 'Rowing',
  exercise_cardio_jumpingJacks: 'Jumping Jacks',
  exercise_cardio_burpees: 'Burpees',

  // Profile screen
  profile: {
    title: 'Profile',
    account: 'Account',
    myAccount: 'My Account',
    createAccount: 'Create Account',
    exportData: 'Export Data',
    resetData: 'Reset Data',
    social: 'Social',
    share: 'Share App',
    rate: 'Rate App',
    settings: 'Settings',
    appSettings: 'App Settings',
    instagram: 'Instagram',
    instagramHandle: '@gainiziapp',
    instagramModal: {
      title: 'Follow us on Instagram',
      message: 'Would you like to follow us on Instagram?',
      follow: 'Follow us',
      later: 'Later'
    },
    auth: {
      title: 'Sign in',
      description: 'Sign in to sync your data and access all features',
      signIn: 'Sign in',
      signOut: 'Sign out',
      continueWithGoogle: 'Continue with Google',
      continueWithApple: 'Continue with Apple',
      continueWithEmail: 'Continue with Email',
      notSignedIn: 'Not signed in'
    },
    challenges: {
      title: 'Challenges',
      comingSoon: 'Coming Soon',
      description: 'Complete challenges to earn badges and track your progress!',
      locked: 'Locked',
      unlocked: 'Unlocked'
    }
  },

  // Routine screen
  routine: {
    createTitle: 'New Routine',
    editTitle: 'Edit Routine',
    title: 'Title',
    titlePlaceholder: 'Enter routine title',
    titleDescription: 'Give a name to your workout routine',
    description: 'Description',
    descriptionPlaceholder: 'Enter a description for your routine',
    descriptionDescription: 'Add a detailed description of your routine',
    selectExercises: 'Select Exercises',
    addExercise: 'Add Exercise',
    noExerciseSelected: 'No exercise selected',
    addExerciseToStart: 'Add an exercise to get started',
    saved: 'Routine saved!',
    updated: 'Routine updated!',
    configureSeries: 'Configure Series',
    seriesType: 'Series Type',
    warmUp: 'Warm Up',
    workingSet: 'Working Set',
    warmUpDescription: 'Warm up series',
    workingSetDescription: 'Working set series',
    selectRestTime: 'Select Rest Time',
    addSeries: 'Add Series',
    usePreviousValues: 'Use Previous Values',
    optionalNote: 'Optional Note',
    selectDuration: 'Select duration',
    withLoad: 'With load',
    seriesLabel: 'Set',
    // Exercise Rest Configuration
    exerciseRestTitle: 'Rest Between Exercises',
    exerciseRestDescription: 'Configure rest time between each exercise in your routine',
    beginnerMode: 'Beginner Mode',
    beginnerModeDescription: 'Common time for all exercises',
    advancedMode: 'Advanced Mode',
    advancedModeDescription: 'Custom time per exercise',
    commonExerciseRest: 'Common rest time',
    // Preparation Time Configuration
    preparationTitle: 'Preparation Time',
    preparationDescription: 'Configure preparation time before each exercise',
    enablePreparation: 'Enable preparation time',
    preparationTime: 'Preparation duration',
    preparationTimeDescription: 'Preparation time in seconds'
  },

  // Routines
  routines: {
    title: 'My Routines',
    emptyState: {
      title: 'No routines yet',
      description: 'Create your first workout routine to get started',
      button: 'Create routine'
    },
    noFavorites: {
      title: 'No favorites',
      description: 'You have routines but none are marked as favorites'
    },
    item: {
      new: 'New',
      exercises: 'exercises',
      exercise: 'exercise',
      minutes: 'min',
      hours: 'h',
      series: 'series',
      usages: 'uses',
      usage: 'use',
      lastUsed: 'Last used:',
      createdOn: 'Created on:',
      actions: 'Actions',
      edit: 'Edit',
      share: 'Share',
      delete: 'Delete',
      start: 'Start',
      deleteConfirmTitle: 'Delete Routine',
      deleteConfirmMessage: 'Are you sure you want to delete the routine "{routineName}"? This action cannot be undone.'
    }
  },

  // Calendar
  calendar: {
    weekOf: 'Week of',
    today: 'Today',
    months: {
      0: 'January',
      1: 'February',
      2: 'March',
      3: 'April',
      4: 'May',
      5: 'June',
      6: 'July',
      7: 'August',
      8: 'September',
      9: 'October',
      10: 'November',
      11: 'December'
    }
  },

  // Exercise Selection
  exerciseSelection: {
    title: 'Select Exercise',
    searchPlaceholder: 'Search exercises...',
    selectByMuscle: 'Select by Muscle Group',
    rotate: 'Rotate',
    quickAccess: 'Quick Access',
    exercises: 'exercises'
  },

  // Exercise List
  exerciseList: {
    exercisesFor: 'Exercises for',
    searchResults: 'Search Results',
    allExercises: 'All Exercises',
    searchPlaceholder: 'Search exercises...',
    clearAll: 'Clear All',
    noExercisesFound: 'No exercises found',
    addCustomExercise: 'Add Custom Exercise'
  },

  // Onboarding
  onboarding: {
    // Navigation
    step: 'Step',
    of: 'of',
    next: 'Next',
    finish: 'Finish',
    skip: 'Skip',
    continue: 'Continue',
    
    // Common components
    session: 'session',
    sessions: 'sessions',
    
    // Screen 0: Initial Gainizi Welcome
    initialWelcome: {
      title: 'Welcome to Gainizi',
      subtitle: 'Your digital coach to track your workouts',
      buttonText: 'Get Started',
      languageLabel: 'Language'
    },
    
    // Screen 1: Language Selection
    languageSelection: {
      title: 'Choose your language',
    },
    
    // Screen 1: Theme Selection
    themeSelection: {
      title: 'Choose your theme',
      lightTheme: 'Light theme',
      lightDescription: 'Bright and clear interface',
      darkTheme: 'Dark theme',
      darkDescription: 'Dark interface, easy on the eyes',
      systemTheme: 'Automatic',
      systemDescription: 'Follows your device settings',
      footerNote: 'You can change the theme anytime in settings'
    },
    
    // Screen 2: Data Explanation
    dataExplanation: {
      title: 'Let\'s personalize your experience',
      subtitle: 'This information helps personalize your experience and improve the app with anonymized analytics data',
      personalizedGoals: 'Personalized goals',
      personalizedGoalsDesc: 'We use your goals to create workout programs tailored to your specific needs.',
      adaptedLevel: 'Adapted fitness level',
      adaptedLevelDesc: 'Your level allows us to suggest appropriate exercises and intensities for your progression.',
      smartRecommendations: 'Smart recommendations',
      smartRecommendationsDesc: 'Your preferences help us suggest the best exercises and routines for you.',
      secureData: 'Secure data',
      secureDataDesc: 'Your information remains private: by default it is stored locally on your device. If you create an account or enable sync, your session data may be encrypted and synced to our servers.',
      privacyGuaranteed: 'Privacy guaranteed:',
      privacyNote: 'We only use anonymized analytics to improve the app. Your sessions stay on your phone by default; if you enable sync, they are transmitted securely to our servers.',
      startConfiguration: 'Start configuration',
      footerNote: 'You can modify this information anytime in settings'
    },
    
    // Date picker
    datePicker: {
      day: 'Day',
      month: 'Month',
      year: 'Year',
      confirm: 'Confirm',
      cancel: 'Cancel'
    },
    
    // Screen 1: Basic Profile
    basicProfile: {
      title: 'Basic Profile',
      subtitle: 'Let\'s start by getting to know you',
      name: 'Name or username',
      namePlaceholder: 'Enter your name',
      gender: 'Gender',
      genderDescription: 'How do you identify yourself?',
      male: 'Male',
      female: 'Female',
      other: 'Other',
      biologicalSex: 'Biological Sex',
      biologicalSexDescription: 'Required for body map and physiological calculations',
      biologicalMale: 'Male',
      biologicalFemale: 'Female',
      birthDate: 'Birth date',
      height: 'Height (cm)',
      weight: 'Weight (kg)',
      heightPlaceholder: '175',
      weightPlaceholder: '70',
      selectDate: 'Select date'
    },
    
    // Screen 2: Goals & Level
    goalsLevel: {
      title: 'Goals & Level',
      subtitle: 'Let\'s define your goals and level',
      primaryGoal: 'Primary goal',
      muscleGain: 'Muscle gain',
      weightLoss: 'Weight loss',
      fitness: 'Fitness',
      fitnessLevel: 'Fitness level',
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced'
    },
    
    // Screen 3: Workout Preferences
    workoutPrefs: {
      title: 'Workout Preferences',
      subtitle: 'Let\'s customize your workout experience',
      weeklyWorkouts: 'Workouts per week',
      equipment: 'Available equipment',
      gym: 'Gym',
      home: 'Home',
      limited: 'Limited equipment',
      priorityMuscles: 'Priority muscle groups',
      legs: 'Legs',
      back: 'Back',
      arms: 'Arms',
      chest: 'Chest',
      shoulders: 'Shoulders',
      core: 'Core',
      fullBody: 'Full body'
    },
    
    // Screen 4: App Settings
    appSettings: {
      title: 'App Settings',
      subtitle: 'Let\'s configure the app to your preferences',
      language: 'Language',
      french: 'French',
      english: 'English',
      units: 'Units',
      metric: 'Metric (kg/cm)',
      imperial: 'Imperial (lbs/inches)',
      nutritionTracking: 'Nutrition tracking',
      nutritionDesc: 'Enable nutrition tracking',
      rpeTracking: 'Use RPE',
      rpeDesc: 'Enable Rate of Perceived Exertion (RPE) scale to assess exercise intensity'
    },
    
    // Welcome Screen
    welcome: {
      title: 'Welcome {name} 👋',
      subtitle: 'Your profile is ready!',
      message: 'You can now start your fitness journey with a personalized experience.',
      motivation: 'Your personalized fitness journey starts now. We can\'t wait to help you achieve your goals!',
      tutorialTitle: 'Need help getting started?',
      tutorialDescription: 'Discover our guides and tutorials to optimize your fitness experience.',
      tutorialLink: 'View tutorials',
      startJourney: 'Start the adventure',
      startButton: 'Start the adventure'
    },
    
    // Validation
    validation: {
      nameRequired: 'Name is required',
      heightRequired: 'Height is required',
      weightRequired: 'Weight is required',
      birthDateRequired: 'Birth date is required',
      invalidHeight: 'Invalid height (100-250 cm)',
      invalidWeight: 'Invalid weight (30-300 kg)',
      selectAtLeastOne: 'Select at least one option'
    }
  }
};
