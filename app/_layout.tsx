import 'react-native-reanimated';
import 'react-native-svg';
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View } from 'react-native';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <GestureHandlerRootView>
      <View style={{ flex: 1 }}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="workout/new" options={{ presentation: 'modal' }} />
        </Stack>
      </View>
    </GestureHandlerRootView>
  );
}
