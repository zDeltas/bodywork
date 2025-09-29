import '@testing-library/jest-native/extend-expect';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-svg (used by lucide-react-native) with simple components
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Mock = (props) => React.createElement(View, props, props.children);
  // Return a proxy so any imported SVG element (Svg, Path, G, Defs, etc.) is a noop component
  const handler = new Proxy({ __esModule: true, default: Mock }, {
    get: (_, prop) => {
      if (prop === '__esModule') return true;
      return Mock;
    },
  });
  return handler;
});

// Mock lucide-react-native icons to simple View components
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Icon = (props) => React.createElement(View, props, props.children);
  return new Proxy({}, {
    get: () => Icon,
  });
});

// Mock react-native-body-highlighter
jest.mock('react-native-body-highlighter', () => {
  const React = require('react');
  const { View } = require('react-native');
  const MockBody = (props) => React.createElement(View, props, props.children);
  return {
    __esModule: true,
    default: MockBody,
  };
});

// Mock Expo modules
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
}));

// Mock React Native modules with minimal implementation
jest.mock('react-native', () => {
  const mockComponent = 'View';
  return {
    Alert: {
      alert: jest.fn(),
    },
    Platform: {
      OS: 'ios',
      select: jest.fn((obj) => obj.ios),
    },
    View: mockComponent,
    Text: mockComponent,
    ScrollView: mockComponent,
    TouchableOpacity: mockComponent,
    FlatList: mockComponent,
    StyleSheet: {
      create: jest.fn((styles) => styles),
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 812 })),
    },
    Animated: {
      View: mockComponent,
      timing: jest.fn(() => ({
        start: jest.fn(),
      })),
      Value: jest.fn(() => ({
        setValue: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
      })),
    },
  };
});

// Mock React Native Reanimated with a handcrafted stub to avoid deep internal requires
jest.mock('react-native-reanimated', () => {
  const { Animated } = require('react-native');
  const Noop = () => ({});
  const AnimationPreset = { duration: () => AnimationPreset, delay: () => AnimationPreset };
  return {
    __esModule: true,
    default: {
      ...Animated,
      createAnimatedComponent: (Component) => Component,
      addWhitelistedUIProps: () => {},
      call: () => {},
    },
    // Commonly used layout/entry presets in the app
    FadeIn: AnimationPreset,
    FadeOut: AnimationPreset,
    SlideInRight: AnimationPreset,
    SlideInLeft: AnimationPreset,
    SlideInDown: AnimationPreset,
    SlideInUp: AnimationPreset,
    SlideOutRight: AnimationPreset,
    SlideOutLeft: AnimationPreset,
    SlideOutDown: AnimationPreset,
    SlideOutUp: AnimationPreset,
    Easing: { linear: Noop, ease: Noop, inOut: Noop },
    runOnJS: (fn) => fn,
    useSharedValue: (v) => ({ value: v }),
    useAnimatedStyle: () => ({}),
    withTiming: (toValue) => toValue,
    withSpring: (toValue) => toValue,
    withDelay: (_delay, value) => value,
  };
});

// Provide global worklet init no-op for reanimated
global.__reanimatedWorkletInit = () => {};

// Silence Animated helper warnings/errors in RN during tests (guarded for RN version)
try {
  // Only mock if the module exists in this RN version
  require.resolve('react-native/Libraries/Animated/NativeAnimatedHelper');
  jest.doMock('react-native/Libraries/Animated/NativeAnimatedHelper', () => ({}));
} catch (_) {
  // no-op for versions without this helper path
}

// Mock Gesture Handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList: View,
    gestureHandlerRootHOC: jest.fn((component) => component),
    Directions: {},
  };
});

// Mock custom hooks - useHaptics with direct export
jest.mock('@/app/hooks/useHaptics', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    success: jest.fn().mockResolvedValue(undefined),
    error: jest.fn().mockResolvedValue(undefined),
    impactLight: jest.fn().mockResolvedValue(undefined),
    impactMedium: jest.fn().mockResolvedValue(undefined),
    impactHeavy: jest.fn().mockResolvedValue(undefined),
    selection: jest.fn().mockResolvedValue(undefined),
    isEnabled: true,
    setEnabled: jest.fn(),
  })),
}));

jest.mock('@/app/hooks/useSettings', () => {
  const mockReturn = {
    settings: {
      weightUnit: 'kg',
      gender: 'male',
      language: 'fr',
      theme: 'dark',
      rpeMode: 'ask'
    },
    updateSettings: () => Promise.resolve(),
  };
  
  return {
    __esModule: true,
    default: () => mockReturn,
    useSettings: () => mockReturn,
  };
});

jest.mock('@/app/hooks/useStorage', () => {
  return {
    __esModule: true,
    default: () => ({
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.resolve(),
      clearAll: () => Promise.resolve(),
      getAllKeys: () => Promise.resolve([]),
    }),
  };
});

jest.mock('@/app/hooks/useTranslation', () => {
  const mockReturn = {
    t: (key) => key,
    language: 'fr',
  };
  
  return {
    __esModule: true,
    default: () => mockReturn,
    useTranslation: () => mockReturn,
  };
});

// Mock useMeasurements hook
jest.mock('@/app/hooks/useMeasurements', () => {
  return jest.fn(() => ({
    allMeasurements: [],
    measurements: {
      date: new Date().toISOString().split('T')[0],
      weight: 0,
      bodyFat: 0,
      muscleMass: 0,
      visceralFat: 0,
      waterPercentage: 0,
    },
    loading: false,
    error: null,
    saveMeasurements: jest.fn().mockResolvedValue(undefined),
    deleteMeasurements: jest.fn().mockResolvedValue(undefined),
    updateMeasurement: jest.fn(),
  }));
});

// Mock useTheme hook
jest.mock('@/app/hooks/useTheme', () => {
  return jest.fn(() => ({
    theme: {
      colors: {
        primary: '#007AFF',
        secondary: '#5856D6',
        background: {
          primary: '#000000',
          secondary: '#1C1C1E',
          card: '#2C2C2E',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#8E8E93',
        },
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
      },
    },
  }));
});

// Mock storage service with all methods as Jest functions
jest.mock('@/app/services/storage', () => {
  const mockStorageService = {
    // Core methods
    initialize: jest.fn().mockResolvedValue(undefined),
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
    clearAll: jest.fn().mockResolvedValue(undefined),
    resetAllData: jest.fn().mockResolvedValue(undefined),
    getAllKeys: jest.fn().mockResolvedValue([]),
    
    // Workouts
    getWorkouts: jest.fn().mockResolvedValue([]),
    saveWorkout: jest.fn().mockResolvedValue(undefined),
    deleteWorkout: jest.fn().mockResolvedValue(undefined),
    
    // Goals
    getGoals: jest.fn().mockResolvedValue([]),
    saveGoal: jest.fn().mockResolvedValue(undefined),
    deleteGoal: jest.fn().mockResolvedValue(undefined),
    
    // Settings
    getSettings: jest.fn().mockResolvedValue({
      weightUnit: 'kg',
      gender: 'male',
      language: 'fr',
      theme: 'dark',
      rpeMode: 'ask'
    }),
    saveSettings: jest.fn().mockResolvedValue(undefined),
    
    // Measurements
    getMeasurements: jest.fn().mockResolvedValue([]),
    saveMeasurement: jest.fn().mockResolvedValue(undefined),
    deleteMeasurement: jest.fn().mockResolvedValue(undefined),
    
    // Routines
    getRoutines: jest.fn().mockResolvedValue([]),
    saveRoutine: jest.fn().mockResolvedValue(undefined),
    deleteRoutine: jest.fn().mockResolvedValue(undefined),
    
    // Routine Sessions
    getRoutineSessions: jest.fn().mockResolvedValue([]),
    saveRoutineSession: jest.fn().mockResolvedValue(undefined),
    deleteRoutineSession: jest.fn().mockResolvedValue(undefined),
    
    // Exercises
    getFavoriteExercises: jest.fn().mockResolvedValue([]),
    saveFavoriteExercises: jest.fn().mockResolvedValue(undefined),
    getRecentExercises: jest.fn().mockResolvedValue([]),
    saveRecentExercises: jest.fn().mockResolvedValue(undefined),
  };

  return {
    __esModule: true,
    default: mockStorageService,
    storageService: mockStorageService,
    StorageKeys: {
      WORKOUTS: 'workouts',
      GOALS: 'goals',
      MEASUREMENTS: 'measurements',
      SETTINGS: 'bodywork_settings',
      FAVORITE_EXERCISES: 'favoriteExercises',
      RECENT_EXERCISES: 'recentExercises',
      STORAGE_VERSION: 'storage_version',
      ROUTINES: 'routines',
      ROUTINE_SESSIONS: 'routine_sessions',
    },
  };
});

// Mock context providers (only the ones that exist)
jest.mock('@/app/contexts/SnackbarContext', () => ({
  useSnackbar: () => ({
    showSuccess: jest.fn(),
    showError: jest.fn(),
    showWarning: jest.fn(),
    showInfo: jest.fn(),
  }),
  SnackbarProvider: ({ children }) => children,
}));

// Global test utilities
global.mockDate = (dateString) => {
  const mockDate = new Date(dateString);
  const mockTime = mockDate.getTime();
  
  // Mock Date.now
  jest.spyOn(Date, 'now').mockReturnValue(mockTime);
  
  // Mock Date constructor
  const OriginalDate = Date;
  global.Date = jest.fn(() => mockDate);
  global.Date.now = jest.fn(() => mockTime);
  global.Date.UTC = OriginalDate.UTC;
  global.Date.parse = OriginalDate.parse;
  global.Date.prototype = OriginalDate.prototype;
};

global.restoreDate = () => {
  jest.restoreAllMocks();
};
