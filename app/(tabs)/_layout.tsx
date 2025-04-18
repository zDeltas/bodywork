import { useRef } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { CurvedBottomBar } from 'react-native-curved-bottom-bar';
import { Dumbbell, ChartLine as LineChart, Settings, Clock, Ruler, Plus,Calendar } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import WorkoutScreen from '@/app/(tabs)/index';
import TimerScreen from '@/app/(tabs)/timer';
import StatsScreen from '@/app/(tabs)/stats';
import MeasurementsScreen from '@/app/(tabs)/measurements';
import SettingsScreen from '@/app/(tabs)/settings';

interface RenderTabBarProps {
  routeName: string;
  selectedTab: string;
  navigate: (routeName: string) => void;
}

export default function TabLayout() {
  const _renderIcon = (routeName: string, selectedTab: string) => {
    const isSelected = routeName === selectedTab;
    const color = isSelected ? '#fd8f09' : '#666';
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

  return (
    <CurvedBottomBar.Navigator
      type="DOWN"
      style={styles.bottomBar}
      height={65}
      bgColor="#1a1a1a"
      initialRouteName="index"
      circlePosition="RIGHT"
      renderCircle={() => (
        <Animated.View style={styles.btnCircleUp}>
          <Plus
            color="#fff"
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
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    backgroundColor: '#0a0a0a',
  },
  btnCircleUp: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fd8f09',
    shadowColor: '#fd8f09',
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  tabbarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
