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
    delete: 'Delete',
    ok: 'OK',
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
    series: 'series'
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
    restPeriod72plus: '72h+'
  },

  // Workout screen
  workout: {
    noWorkoutsToday: 'No workouts recorded today',
    startWorkout: 'Start a workout',
    weight: 'Weight',
    reps: 'Reps',
    sets: 'Sets',
    rpe: 'RPE',
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
    seriesType: 'Series Type',
    warmUp: 'Warm-up',
    workingSet: 'Working Set',
    warmUpDescription: 'Warm-up series (RPE not considered)',
    workingSetDescription: 'Working series (RPE important)',
    addSeries: 'Add Series',
    series: 'Series',
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
    quick: 'Quick',
    standard: 'Standard',
    long: 'Long',
    veryLong: 'Very Long',
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

  // Time periods
  periods: {
    oneMonth: '1 month',
    threeMonths: '3 months',
    sixMonths: '6 months'
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
    exercise: 'Exercise'
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
    title: 'Title',
    titlePlaceholder: 'Enter routine title',
    description: 'Description',
    descriptionPlaceholder: 'Enter a description for your routine',
    selectExercises: 'Select Exercises',
    addExercise: 'Add Exercise',
    noExerciseSelected: 'No exercise selected',
    addExerciseToStart: 'Add an exercise to get started',
    saved: 'Routine saved!',
    configureSeries: 'Configure Series',
    seriesType: 'Series Type',
    warmUp: 'Warm Up',
    workingSet: 'Working Set',
    warmUpDescription: 'Warm up series',
    workingSetDescription: 'Working set series',
    selectRestTime: 'Select Rest Time',
    addSeries: 'Add Series',
    usePreviousValues: 'Use Previous Values',
    optionalNote: 'Optional Note'
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
      description: 'You have routines but none are marked as favorites',
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
      start: 'Start'
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
  }
};
