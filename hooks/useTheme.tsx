import { useSettings } from './useSettings';
import darkTheme from '@/app/theme/theme';
import lightTheme from '@/app/theme/lightTheme';

/**
 * Hook to access the current theme based on user settings
 */
export const useTheme = () => {
  const { settings } = useSettings();
  
  // Return the appropriate theme based on the user's preference
  const theme = settings.theme === 'light' ? lightTheme : darkTheme;
  
  return {
    theme,
    isDarkMode: settings.theme === 'dark',
  };
};
