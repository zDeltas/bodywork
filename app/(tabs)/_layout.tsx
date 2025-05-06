import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { router, Tabs } from 'expo-router';
import { Calendar, ChartLine as LineChart, Clock, Plus, Ruler, Settings } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback } from 'react';

SplashScreen.preventAutoHideAsync();

function TabLayout() {
  const { theme } = useTheme();
  const styles = useStyles();

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

  const handleAddButtonPress = () => {
    const today = new Date().toISOString().split('T')[0];
    router.push({
      pathname: '/screens/workout/new',
      params: { selectedDate: today }
    });
  };

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.text.secondary,
          tabBarStyle: {
            backgroundColor: theme.colors.background.card,
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            height: 60,
            paddingBottom: 10
          },
          tabBarLabelStyle: {
            fontFamily: 'Inter-Regular',
            fontSize: 12
          },
          headerShown: false
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Workouts',
            tabBarIcon: ({ color, size }) => (
              <Calendar size={size} color={color} />
            )
          }}
        />
        <Tabs.Screen
          name="timer"
          options={{
            title: 'Timer',
            tabBarIcon: ({ color, size }) => (
              <Clock size={size} color={color} />
            )
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: 'Stats',
            tabBarIcon: ({ color, size }) => (
              <LineChart size={size} color={color} />
            )
          }}
        />
        <Tabs.Screen
          name="measurements"
          options={{
            title: 'Measures',
            tabBarIcon: ({ color, size }) => (
              <Ruler size={size} color={color} />
            )
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <Settings size={size} color={color} />
            )
          }}
        />
      </Tabs>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleAddButtonPress}
        activeOpacity={0.8}
      >
        <Plus color={theme.colors.text.primary} size={28} />
      </TouchableOpacity>
    </View>
  );
}

// Define styles using the current theme
const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    floatingButton: {
      position: 'absolute',
      width: 60,
      height: 60,
      borderRadius: theme.borderRadius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      bottom: 70,
      right: theme.spacing.base,
      ...theme.shadows.primary,
      shadowColor: theme.colors.primary,
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 5,
      zIndex: 999
    }
  });
};

export default TabLayout;
