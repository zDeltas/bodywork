import { Tabs, router } from 'expo-router';
import { BookCheck, Clock, CircleUser, History, Home as HomeIcon, Calendar } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useEffect } from 'react';
import { setupFeedbackQueueHandlers } from '@/app/services/feedback/queue';
import { useOnboardingStatus } from '@/app/providers/OnboardingProvider';

function TabLayout() {
  const { theme } = useTheme();
  const { isOnboardingCompleted, isLoading } = useOnboardingStatus();

  useEffect(() => {
    const teardown = setupFeedbackQueueHandlers();
    return () => {
      if (typeof teardown === 'function') teardown();
    };
  }, []);

  useEffect(() => {
    if (!isLoading && !isOnboardingCompleted) {
      console.log('[TabLayout] Onboarding not completed, redirecting to onboarding...');
      const timer = setTimeout(() => {
        router.replace('/screens/onboarding/OnboardingScreen');
      }, 50);
      return () => clearTimeout(timer);
    } else if (!isLoading && isOnboardingCompleted) {
      console.log('[TabLayout] Onboarding completed, staying in main app');
    }
  }, [isLoading, isOnboardingCompleted]);

  return (
      <Tabs
        initialRouteName="index"
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.text.secondary,
          tabBarStyle: {
            backgroundColor: theme.colors.background.card,
            borderTopWidth: 0,
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
            title: 'Home',
            tabBarIcon: ({ color, size }) => <HomeIcon size={size} color={color} />
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
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
  );
}

export default TabLayout;
