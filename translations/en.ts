export default {
  // Common
  common: {
    loading: 'Loading...',
    close: 'Close',
    errorLoadingWorkouts: 'Error loading workouts:',
    errorSavingWorkouts: 'Error saving workouts:',
    appTitle: 'Gainizi',
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

  // Exercise Types (editor)
  exerciseTypes: {
    strength: 'Strength',
    cardio: 'Cardio',
    other: 'Other',
    strength_press: 'Press',
    strength_pull: 'Pull',
    strength_squat: 'Squat',
    strength_hinge: 'Hinge',
    strength_core: 'Core',
    cardio_run: 'Run',
    cardio_bike: 'Bike',
    cardio_row: 'Row',
  },

  // Home screen
  home: {
    greeting: 'Hey {name}',
    morningMotivation: 'Ready to start strong today? 💪',
    eveningMotivation: 'One last push for the road? 🔥',
    afternoonMotivation: 'Ready to sweat? 🔥',
    weekProgress: '{current}/{total} sessions',
    currentWeek: 'Current week',
    vsLastWeek: 'vs last week',
    totalVolume: 'Total volume',
    sessionsCompleted: 'Sessions completed',
    streak: 'Streak',
    streakDays: 'consecutive days',
    lastSession: 'Last session',
    seeDetails: 'See details',
    weeklyGoal: 'Weekly goal',
    almostThere: 'You\'re almost there 👊',
    oneMoreSession: '1 more session to reach your goal 🔥',
    goalAchieved: 'Goal achieved! 🎉',
    quickActions: 'Quick actions',
    viewExercise: 'View an exercise',
    startSession: 'Start my session',
    resumeSession: 'Resume my session',
    motivationalQuotes: [
      'Every rep brings you closer to your best version 💪',
      'The only bad workout is the one you don\'t do 🔥',
      'Your muscles grow when you sleep, but they\'re forged here 💪',
      'Today is the perfect day to get stronger 🚀',
      'Every drop of sweat is a step towards your goal 💦',
      'You are stronger than your excuses 💪',
      'Progress starts with the first step 🚀'
    ],
    muscleGroups: 'Muscle groups worked',
    duration: 'Duration',
    volume: 'Volume'
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
    title: 'Gainizi',
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
    preparationTimeDescription: 'Preparation time in seconds',
    skipScheduling: 'Skip scheduling',
    updateWithoutScheduling: 'Update without scheduling'
  },

  // Schedule (top-level)
  schedule: {
    title: 'Schedule Routine',
    planRoutine: 'Schedule Routine',
    description: 'When would you like to do "{routine}"? Select the days that work for you.',
    quickSelections: 'Quick selections',
    chooseDays: 'Choose days',
    summary: 'This routine will be scheduled {count} day(s) per week: {days}',
    infoNote: 'You can modify this schedule at any time from the settings.',
    save: 'Schedule routine',
    update: 'Update',
    error: {
      title: 'Error',
      noDaysSelected: 'Please select at least one day.'
    },
    quick: {
      none: 'None',
      weekdays: 'Weekdays',
      weekend: 'Weekend'
    },
    days: {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',
      mondayShort: 'Mon',
      tuesdayShort: 'Tue',
      wednesdayShort: 'Wed',
      thursdayShort: 'Thu',
      fridayShort: 'Fri',
      saturdayShort: 'Sat',
      sundayShort: 'Sun'
    }
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
      rpeDesc: 'Enable Rate of Perceived Exertion (RPE) scale to assess exercise intensity',
      philosophyToggle: 'Show philosophy',
      philosophyDesc: 'Display an inspiration card with a daily quote on the home screen'
    },
    
    // Welcome Screen
    welcome: {
      title: 'Welcome {name} 👋',
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
  },

  // Inspirational quotes
  quotes: {
    strength: 'Strength does not come from physical capacity. It comes from an indomitable will.',
    discipline: 'Discipline is the bridge between goals and accomplishment.',
    progress: 'Progress is impossible without change, and those who cannot change their minds cannot change anything.',
    consistency: 'Success isn\'t always about greatness. It\'s about consistency. Consistent hard work leads to success.',
    mindset: 'In a growth mindset, challenges are exciting rather than threatening.'
  },

  // Emotional messages for home screen
  home: {
    quickAccess: 'Quick Access',
    
    // Weekly Discipline & Challenge - Distinct micro-copy
    weeklyDiscipline: {
      title: 'Weekly Discipline',
      adherenceRate: 'Adherence rate',
      streakWeeks: 'consecutive weeks',
      onTime: 'On-time',
      microCopy: '{completed}/{planned} planned sessions held • 🔥 Streak {streak} wks.',
      cta: {
        planWeek: 'Plan my week',
        catchUp: 'Catch up a session',
        maintain: 'Stay on track'
      },
      messages: {
        exemplary: 'Exemplary consistency! 🏆',
        excellent: 'Excellent adherence! 💪',
        good: 'Great regularity! 👍',
        progress: 'Making progress! 📈',
        restart: 'Let\'s get back on track! 🚀'
      }
    },
    
    weeklyChallenge: {
      title: 'Weekly Challenge',
      microCopy: 'Challenge {current}/{target} {unit} • {days} days left ⚡',
      units: {
        sessions: 'sessions',
        volume: 'kg',
        pr: 'PR'
      },
      cta: {
        newChallenge: 'New challenge',
        startSession: 'Start session #{number}',
        continue: 'Continue challenge'
      },
      messages: {
        conquered: 'Challenge conquered! 🏆',
        final: 'Final stretch! 🔥',
        close: 'So close to the goal! 💪',
        halfway: 'Halfway there! 📈',
        begin: 'Challenge begins! ⚡'
      }
    },

    // New Gainizi cards
    adherence: {
      title: 'Planning Adherence',
      subtitle: 'Stay true to your program',
      sessionsHeld: 'sessions held',
      regularWeeks: 'regular weeks',
      excellent: 'Excellent discipline 💪',
      good: 'You\'re on the right track 🚀',
      building: 'Keep it up 👊',
      restart: 'Try to keep the pace 👊'
    },

    challenge: {
      title: 'Weekly Challenge',
      subtitle: 'Reach your goal before Sunday!',
      progress: 'Progress',
      sessions: 'sessions',
      exercises: 'exercises',
      completed: 'Challenge completed! 🏆',
      almostThere: 'Almost there ⚡',
      halfway: 'Halfway through! 🔥',
      building: 'Taking shape! 💪',
      start: 'The challenge begins! 🔥',
      sessionsLeft: '{count} more session to succeed',
      daysLeft: '{count} days left'
    },

    gainizi: {
      title: 'Gainizi Dashboard',
      subtitle: 'Smart tracking of your performance'
    },

    dailyRoutine: {
      title: 'Today\'s Sessions',
      estimatedDuration: 'Estimated duration',
      lastTime: 'Last time',
      startSession: 'Start my session',
      resumeSession: 'Resume my session',
      viewSession: 'View session',
      startNewSession: 'Start a session',
      createRoutine: 'Create a routine',
      allCompleted: 'All done 🎉',
      noRoutineMessage: 'No session planned for today. Ready to create your own session?',
      sessionCompletedMessage: 'Well done! You completed today\'s session 🎉',
      viewPlanning: 'View my planning',
      routinesPlanned: 'sessions planned',
      totalDuration: 'Total duration',
      progress: 'Progress',
      motivationalReady: 'Ready to train? 💪',
      motivationalContinue: 'Keep your consistency streak going 🔥',
      motivationalCompleted: 'Great consistency today! 🔥',
      motivationalRest: 'Enjoy your rest day ☀️'
    },

    weeklyRoutines: {
      title: 'This Week\'s Planned Sessions',
      weekProgress: 'Week: {completed}/{target} sessions completed',
      targetReached: 'Target reached! Keep the momentum going 🔥',
      weekCompleted: 'Week completed ✅ {completed}/{target} sessions — excellent consistency 👏',
      oneMore: '1 more to complete your goal 💪',
      twoMore: '2 more to complete your goal 💪',
      keepGoing: '{remaining} more to complete your goal 💪',
      weekEnded: 'Week ended! Prepare for the next one 📅',
      planNextWeek: 'Plan next week',
      viewRoutines: 'View my sessions',
      viewProgramming: 'View my programming',
      restDay: 'Rest ☀️'
    },

    schedule: {
      title: 'Schedule Routine',
      planRoutine: 'Schedule Routine',
      description: 'When would you like to do "test"? Select the days that work for you.',
      quickSelections: 'Quick selections',
      chooseDays: 'Choose days',
      summary: 'This routine will be scheduled {count} day(s) per week: {days}',
      infoNote: 'You can modify this schedule at any time from the settings.',
      save: 'Schedule routine',
      update: 'Update',
      error: {
        title: 'Error',
        noDaysSelected: 'Please select at least one day.'
      },
      quick: {
        none: 'None',
        weekdays: 'Weekdays',
        weekend: 'Weekend'
      },
      days: {
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday',
        mondayShort: 'Mon',
        tuesdayShort: 'Tue',
        wednesdayShort: 'Wed',
        thursdayShort: 'Thu',
        fridayShort: 'Fri',
        saturdayShort: 'Sat',
        sundayShort: 'Sun'
      }
    },

    
    emotional: {
      greeting: 'Hey {name}! 👋',
      // Pillar 1: Quote → Philosophy → Inspiration
      philosophy: 'Philosophy',
      inspiration: 'Inspiration',
      
      // Pillar 2: Week → Discipline → Satisfaction
      weeklyDiscipline: 'Weekly Discipline',
      sessions: 'sessions',
      daysStreak: 'consecutive days',
      discipline: {
        complete: 'Exemplary discipline! 🏆',
        excellent: 'Excellent consistency! 💪',
        good: 'Great regularity! 👍',
        progress: 'Making progress! 📈',
        start: 'Let\'s start together! 🚀'
      },
      satisfaction: {
        complete: 'Accomplished',
        high: 'Satisfied',
        medium: 'On track',
        building: 'Building'
      },
      
      // Pillar 3: Last session → Performance → Pride
      lastPerformance: 'Last Performance',
      musclesWorked: 'Muscles worked',
      newRecord: 'New Record!',
      pride: {
        record: 'Exceptional performance! 🔥',
        exceptional: 'Impressive strength! 💥',
        strong: 'Solid performance! 💪',
        solid: 'Good work done! 👏',
        progress: 'Steady progress! 📊'
      },
      performance: {
        record: 'Record',
        exceptional: 'Exceptional',
        strong: 'Strong',
        solid: 'Solid',
        building: 'Progress'
      },
      
      // Pillar 4: Goal → Challenge → Motivation (Legacy - to remove)
      weeklyChallenge: 'Weekly Challenge',
      progress: 'Progress',
      defaultGoal: 'Achieve my fitness goals',
      oneMore: 'Just one more session! 🎯',
      sessionsLeft: '{count} sessions left',
      challenge: {
        conquered: 'Challenge conquered! You\'re incredible! 🏆',
        final: 'Final stretch! You\'re almost there! 🔥',
        close: 'So close to the goal! Keep going! 💪',
        halfway: 'Halfway there! Excellent pace! 📈',
        begin: 'Challenge begins! Show your strength! ⚡'
      },
      motivation: {
        achieved: 'Achieved',
        final: 'Ultimate',
        close: 'Close',
        momentum: 'Momentum',
        ignite: 'Ignite'
      },
      
      // Pillar 5: Routine → Personalization → Confidence + Reward → Results → Pleasure
      personalization: 'Personalization',
      routines: 'Routines',
      custom: 'Custom',
      workouts: 'Workouts',
      enjoyment: 'enjoyment',
      createHint: 'Tap to create a new routine',
      confidence: {
        expert: 'You\'ve become an expert! 🎓',
        experienced: 'Solid experience gained! 💼',
        growing: 'Growing confidence! 🌱',
        building: 'Building expertise! 🔨',
        starting: 'Beginning the journey! 🌟'
      },
      personalization: {
        master: 'Routine creation master! 🎨',
        creator: 'Passionate creator! ✨',
        adapter: 'Smart adapter! 🔧',
        beginner: 'First creative steps! 🎯',
        explorer: 'Curious explorer! 🔍'
      },
      pleasure: {
        joy: 'Joy',
        satisfaction: 'Satisfaction',
        content: 'Content',
        progress: 'Progress',
        discovery: 'Discovery'
      },
      
      // Emotional action button
      action: {
        continue: 'Continue Excellence',
        keepGoing: 'Your momentum is perfect',
        unleash: 'Unleash Your Energy',
        energyReady: 'Your strength overflows',
        focus: 'Channel Your Focus',
        mindReady: 'Your mind is ready',
        gentle: 'Gentle Start',
        easyStart: 'Respecting your pace',
        transform: 'Transform Yourself',
        readyToGrow: 'Ready to grow'
      },
      mood: {
        motivated: 'Motivated',
        tired: 'Tired',
        energetic: 'Energetic',
        focused: 'Focused'
      }
    }
  }
};
