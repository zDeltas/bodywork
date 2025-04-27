import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the shape of our settings
interface Settings {
  weightUnit: 'kg' | 'lb';
  gender: 'male' | 'female';
  language: 'en' | 'fr';
  theme: 'dark' | 'light';
}

// Default settings
const defaultSettings: Settings = {
  weightUnit: 'kg',
  gender: 'male',
  language: 'fr',
  theme: 'dark',
};

// Create context with default values
interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  updateSettings: async () => {},
  isLoading: true,
});

// Storage keys
const SETTINGS_STORAGE_KEY = 'bodywork_settings';

// Provider component
export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from storage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        if (storedSettings) {
          setSettings(JSON.parse(storedSettings));
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Update settings and persist to storage
  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Hook for using the settings context
export const useSettings = () => useContext(SettingsContext);
