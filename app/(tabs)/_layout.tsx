import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { BookCheck, Calendar, Clock, CircleUser } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect } from 'react';
import { setupFeedbackQueueHandlers } from '@/app/services/feedback/queue';

SplashScreen.preventAutoHideAsync();

function TabLayout() {
  const { theme } = useTheme();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Initialize feedback offline queue handlers (retry on startup and connectivity changes)
  useEffect(() => {
    const teardown = setupFeedbackQueueHandlers();
    return () => {
      if (typeof teardown === 'function') teardown();
    };
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <Tabs
        initialRouteName="index"
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.text.secondary,
          tabBarStyle: {
            backgroundColor: theme.colors.background.card,
            borderTopWidth: 0,
            height: theme.spacing['3xl'],
            paddingBottom: theme.spacing.sm,
            ...theme.shadows.sm
          },
          tabBarLabelStyle: {
            fontFamily: theme.typography.fontFamily.regular,
            fontSize: theme.typography.fontSize.xs
          },
          headerShown: false
        }}
      >
        <Tabs.Screen
          name="routines"
          options={{
            title: 'Routines',
            tabBarIcon: ({ color, size }) => <BookCheck size={size} color={color} />
          }}
        />
        <Tabs.Screen
          name="timer"
          options={{
            title: 'Timer',
            tabBarIcon: ({ color, size }) => <Clock size={size} color={color} />
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Workouts',
            tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => <CircleUser size={size} color={color} />
          }}
        />
      </Tabs>
    </View>
  );
}

export default TabLayout;
