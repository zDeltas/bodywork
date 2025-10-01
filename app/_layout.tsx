import 'react-native-reanimated';
import React from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { SettingsProvider } from '@/app/hooks/useSettings';
import { useFrameworkReady } from '@/app/hooks/useFrameworkReady';
import StorageProvider from './providers/StorageProvider';
import { SnackbarProvider } from '@/app/contexts/SnackbarContext';
import SnackbarContainer from '@/app/components/ui/SnackbarContainer';
import AuthProvider from '@/app/contexts/AuthContext';
 

export default function RootLayout() {
  useFrameworkReady();

  const getDefaultAnimation = Platform.OS === 'ios' ? 'default' : 'fade';
  const getSlideAnimation = Platform.OS === 'ios' ? 'slide_from_right' : 'slide_from_right';
  const getModalAnimation = Platform.OS === 'ios' ? 'slide_from_bottom' : 'slide_from_bottom';

  return (
    <StorageProvider>
      <SettingsProvider>
        <AuthProvider>
          <SnackbarProvider>
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
                      name="screens/profile"
                      options={{
                        headerShown: false,
                        animation: 'slide_from_right'
                      }}
                    />
                    <Stack.Screen
                      name="screens/workout/session"
                      options={{
                        headerShown: false,
                        animation: 'slide_from_right'
                      }}
                    />
                    <Stack.Screen
                      name="screens/gamification"
                      options={{
                        headerShown: false,
                        animation: 'slide_from_right'
                      }}
                    />
                    <Stack.Screen
                      name="screens/stats"
                      options={{
                        headerShown: false,
                        animation: 'slide_from_right'
                      }}
                    />
                    <Stack.Screen
                      name="screens/measurements"
                      options={{
                        headerShown: false,
                        animation: 'slide_from_right'
                      }}
                    />
                    <Stack.Screen
                      name="screens/my-account"
                      options={{
                        headerShown: false,
                        animation: 'slide_from_right'
                      }}
                    />
                    <Stack.Screen
                      name="screens/auth/WelcomeScreen"
                      options={{
                        headerShown: false,
                        animation: getSlideAnimation,
                        animationDuration: 300
                      }}
                    />
                    <Stack.Screen
                      name="screens/auth/EmailAuthScreen"
                      options={{
                        headerShown: false,
                        animation: getSlideAnimation,
                        animationDuration: 300
                      }}
                    />
                    <Stack.Screen
                      name="screens/auth/LoginScreen"
                      options={{
                        headerShown: false,
                        animation: getSlideAnimation,
                        animationDuration: 300
                      }}
                    />
                    <Stack.Screen
                      name="screens/auth/CheckEmailScreen"
                      options={{
                        headerShown: false,
                        animation: getSlideAnimation,
                        animationDuration: 300
                      }}
                    />
                    <Stack.Screen
                      name="screens/auth/ForgotPasswordScreen"
                      options={{
                        headerShown: false,
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
                      name="screens/exercise-selection"
                      options={{
                        presentation: 'modal',
                        animation: getModalAnimation,
                        animationDuration: 350
                      }}
                    />
                    <Stack.Screen
                      name="screens/exercise-list"
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
                  <SnackbarContainer />
                </SafeAreaView>
              </SafeAreaProvider>
            </GestureHandlerRootView>
          </SnackbarProvider>
        </AuthProvider>
      </SettingsProvider>
    </StorageProvider>
  );
}
