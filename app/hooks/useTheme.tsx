import { useSettings } from './useSettings';
import darkTheme from '@/app/theme/theme';
import lightTheme from '@/app/theme/lightTheme';
import { useColorScheme } from 'react-native';

export const useTheme = () => {
  const { settings } = useSettings();
  const systemColorScheme = useColorScheme();

  let actualTheme: 'light' | 'dark';
  
  if (settings.theme === 'system') {
    actualTheme = systemColorScheme === 'light' ? 'light' : 'dark';
  } else {
    actualTheme = settings.theme;
  }

  const theme = actualTheme === 'light' ? lightTheme : darkTheme;

  return {
    theme,
    isDarkMode: actualTheme === 'dark',
    actualTheme,
    isSystemTheme: settings.theme === 'system'
  };
};

export default useTheme;
