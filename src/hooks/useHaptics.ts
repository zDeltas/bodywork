import { useCallback, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HAPTICS_ENABLED_KEY = '@haptics_enabled';
const HAPTICS_COOLDOWN = 100; // ms

interface HapticsHook {
  success: () => Promise<void>;
  error: () => Promise<void>;
  impactLight: () => Promise<void>;
  impactMedium: () => Promise<void>;
  impactHeavy: () => Promise<void>;
  selection: () => Promise<void>;
  isEnabled: () => Promise<boolean>;
  setEnabled: (enabled: boolean) => Promise<void>;
}

export const useHaptics = (): HapticsHook => {
  const lastHapticTime = useRef<number>(0);

  const isEnabled = useCallback(async (): Promise<boolean> => {
    try {
      const value = await AsyncStorage.getItem(HAPTICS_ENABLED_KEY);
      return value === null ? true : value === 'true';
    } catch {
      return true; // Par défaut, les haptics sont activés
    }
  }, []);

  const setEnabled = useCallback(async (enabled: boolean): Promise<void> => {
    try {
      await AsyncStorage.setItem(HAPTICS_ENABLED_KEY, enabled.toString());
    } catch (error) {
      console.warn('Failed to save haptics preference:', error);
    }
  }, []);

  const triggerHaptic = useCallback(async (hapticFunction: () => Promise<void>): Promise<void> => {
    const now = Date.now();
    if (now - lastHapticTime.current < HAPTICS_COOLDOWN) {
      return;
    }

    const enabled = await isEnabled();
    if (!enabled) {
      return;
    }

    try {
      await hapticFunction();
      lastHapticTime.current = now;
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }, [isEnabled]);

  const success = useCallback(() => triggerHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)), [triggerHaptic]);
  const error = useCallback(() => triggerHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)), [triggerHaptic]);
  const impactLight = useCallback(() => triggerHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)), [triggerHaptic]);
  const impactMedium = useCallback(() => triggerHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)), [triggerHaptic]);
  const impactHeavy = useCallback(() => triggerHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)), [triggerHaptic]);
  const selection = useCallback(() => triggerHaptic(() => Haptics.selectionAsync()), [triggerHaptic]);

  return {
    success,
    error,
    impactLight,
    impactMedium,
    impactHeavy,
    selection,
    isEnabled,
    setEnabled
  };
}; 
