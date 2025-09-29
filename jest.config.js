module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.expo/',
    '<rootDir>/dist/',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@expo|expo|@react-navigation|@testing-library|react-native-reanimated|react-native-gesture-handler|react-native-svg|lucide-react-native|react-native-body-highlighter)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    // Focus on critical data system components only
    'app/services/**/*.{ts,tsx}',
    'app/utils/**/*.{ts,tsx}',
    'app/hooks/useRoutineForm.ts',
    'app/hooks/useSession.ts',
    'types/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.expo/**',
    '!**/coverage/**',
    // Exclude UI components and screens from coverage
    '!app/components/**',
    '!app/screens/**',
    '!app/contexts/**',
    '!app/providers/**',
    '!app/theme/**',
    '!app/data/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};
