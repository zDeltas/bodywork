import 'react-native-reanimated';
import React from 'react';
import { Stack } from 'expo-router';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform } from 'react-native';
import { SettingsProvider } from '@/hooks/useSettings';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <SettingsProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1 }}>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: Platform.OS === 'ios' ? 'default' : 'fade',
                contentStyle: { backgroundColor: 'transparent' }
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="workout/new"
                options={{
                  presentation: 'modal',
                  animation: Platform.OS === 'ios' ? 'slide_from_bottom' : 'fade'
                }}
              />
              <Stack.Screen
                name="goal/new"
                options={{
                  presentation: 'modal',
                  animation: Platform.OS === 'ios' ? 'slide_from_bottom' : 'fade'
                }}
              />
            </Stack>
          </SafeAreaView>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </SettingsProvider>
  );
}
