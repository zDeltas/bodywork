import 'react-native-reanimated';
import React from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { SettingsProvider } from '@/app/hooks/useSettings';
import { useFrameworkReady } from '@/app/hooks/useFrameworkReady';

export default function RootLayout() {
  useFrameworkReady();

  const getDefaultAnimation = Platform.OS === 'ios' ? 'default' : 'fade';
  const getSlideAnimation = Platform.OS === 'ios' ? 'slide_from_right' : 'slide_from_right';
  const getModalAnimation = Platform.OS === 'ios' ? 'slide_from_bottom' : 'slide_from_bottom';

  return (
    <SettingsProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1 }}>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: getDefaultAnimation,
                animationDuration: 300,
                contentStyle: { backgroundColor: 'transparent' }
              }}
            >
              <Stack.Screen
                name="(tabs)"
                options={{
                  headerShown: false,
                  animation: getDefaultAnimation,
                  animationDuration: 250
                }}
              />
              <Stack.Screen
                name="screens/workout/new"
                options={{
                  presentation: 'modal',
                  animation: getModalAnimation,
                  animationDuration: 350
                }}
              />
              <Stack.Screen
                name="screens/goal/new"
                options={{
                  presentation: 'modal',
                  animation: getModalAnimation,
                  animationDuration: 350
                }}
              />
              <Stack.Screen
                name="screens/settings"
                options={{
                  presentation: 'card',
                  animation: getSlideAnimation,
                  animationDuration: 300
                }}
              />
              <Stack.Screen
                name="screens/contact"
                options={{
                  presentation: 'card',
                  animation: getSlideAnimation,
                  animationDuration: 300
                }}
              />
              <Stack.Screen
                name="+not-found"
                options={{
                  animation: getDefaultAnimation,
                  animationDuration: 200
                }}
              />
            </Stack>
          </SafeAreaView>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </SettingsProvider>
  );
}
