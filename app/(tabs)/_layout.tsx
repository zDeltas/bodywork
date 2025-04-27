import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { CurvedBottomBar } from 'react-native-curved-bottom-bar';
import { Calendar, ChartLine as LineChart, Clock, Plus, Ruler, Settings } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import WorkoutScreen from '@/app/(tabs)/index';
import TimerScreen from '@/app/(tabs)/timer';
import StatsScreen from '@/app/(tabs)/stats';
import MeasurementsScreen from '@/app/(tabs)/measurements';
import SettingsScreen from '@/app/(tabs)/settings';
import { useTheme } from '@/hooks/useTheme';
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold, useFonts } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback } from 'react';

interface RenderTabBarProps {
  routeName: string;
  selectedTab: string;
  navigate: (routeName: string) => void;
}

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const { theme } = useTheme();
  const styles = useStyles();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  const _renderIcon = (routeName: string, selectedTab: string) => {
    const isSelected = routeName === selectedTab;
    const color = isSelected ? theme.colors.primary : theme.colors.text.secondary;
    const size = 24;

    switch (routeName) {
      case 'index':
        return <Calendar size={size} color={color} />;
      case 'timer':
        return <Clock size={size} color={color} />;
      case 'stats':
        return <LineChart size={size} color={color} />;
      case 'measurements':
        return <Ruler size={size} color={color} />;
      case 'settings':
        return <Settings size={size} color={color} />;
      default:
        return null;
    }
  };

  const handleAddButtonPress = () => {
    const today = new Date().toISOString().split('T')[0];
    router.push({
      pathname: '/workout/new',
      params: { selectedDate: today }
    });
  };

  const renderTabBar = ({ routeName, selectedTab, navigate }: RenderTabBarProps) => {
    return (
      <TouchableOpacity onPress={() => navigate(routeName)} style={styles.tabbarItem}>
        {_renderIcon(routeName, selectedTab)}
      </TouchableOpacity>
    );
  };

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <CurvedBottomBar.Navigator
        type="DOWN"
        style={styles.bottomBar}
        height={65}
        bgColor={theme.colors.background.card}
        initialRouteName="index"
        circlePosition="RIGHT"
        renderCircle={() => (
          <Animated.View style={styles.btnCircleUp}>
            <Plus
              color={theme.colors.text.primary}
              size={28}
              onPress={handleAddButtonPress}
            />
          </Animated.View>
        )}
        tabBar={renderTabBar}>
        <CurvedBottomBar.Screen
          name="index"
          position="LEFT"
          component={WorkoutScreen}
          options={{ headerShown: false }}
        />
        <CurvedBottomBar.Screen
          name="timer"
          position="LEFT"
          component={TimerScreen}
          options={{ headerShown: false }}
        />
        <CurvedBottomBar.Screen
          name="stats"
          position="LEFT"
          component={StatsScreen}
          options={{ headerShown: false }}
        />
        <CurvedBottomBar.Screen
          name="measurements"
          position="LEFT"
          component={MeasurementsScreen}
          options={{ headerShown: false }}
        />
        <CurvedBottomBar.Screen
          name="settings"
          position="LEFT"
          component={SettingsScreen}
          options={{ headerShown: false }}
        />
      </CurvedBottomBar.Navigator>
    </View>
  );
}

// Define styles using the current theme
const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    bottomBar: {
      backgroundColor: theme.colors.background.main,
    },
    btnCircleUp: {
      width: 60,
      height: 60,
      borderRadius: theme.borderRadius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      bottom: theme.spacing.lg,
      ...theme.shadows.primary,
      shadowColor: theme.colors.primary,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 5,
    },
    tabbarItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
};
