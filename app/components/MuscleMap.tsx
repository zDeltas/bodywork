import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { router } from 'expo-router';
import Body, { ExtendedBodyPart, Slug } from 'react-native-body-highlighter';
import { differenceInHours } from 'date-fns';
import { useSettings } from '@/hooks/useSettings';

const AnimatedText = Animated.createAnimatedComponent(Text);

interface Workout {
  id: string;
  exercise: string;
  muscleGroup: string;
  weight: number;
  reps: number;
  sets: number;
  date: string;
}

interface MuscleMapProps {
  workouts: Workout[];
}

const muscleSlugs: Record<string, Slug> = {
  CHEST: "chest" as Slug,
  ABS: "abs" as Slug,
  BICEPS: "biceps" as Slug,
  UPPER_BACK: "upper-back" as Slug,
  LOWER_BACK: "lower-back" as Slug,
  TRICEPS: "triceps" as Slug,
  DELTOIDS: "deltoids" as Slug,
  TRAPEZIUS: "trapezius" as Slug,
  QUADRICEPS: "quadriceps" as Slug,
  CALVES: "calves" as Slug,
  HAMSTRING: "hamstring" as Slug,
  GLUTEAL: "gluteal" as Slug,
  FOREARM: "forearm" as Slug,
  ADDUCTORS: "adductors" as Slug,
  HAIR: "hair" as Slug,
  NECK: "neck" as Slug,
  HANDS: "hands" as Slug,
  FEET: "feet" as Slug,
  HEAD: "head" as Slug,
  ANKLES: "ankles" as Slug,
  TIBIALIS: "tibialis" as Slug,
  OBLIQUES: "obliques" as Slug,
  KNEES: "knees" as Slug,
};

const muscleGroupToSlug: Record<string, Slug> = {
  'Chest': muscleSlugs.CHEST,
  'Back': muscleSlugs.UPPER_BACK,
  'Legs': muscleSlugs.QUADRICEPS,
  'Shoulders': muscleSlugs.DELTOIDS,
  'Biceps': muscleSlugs.BICEPS,
  'Triceps': muscleSlugs.TRICEPS,
  'Core': muscleSlugs.ABS,
};

export default function MuscleMap({ workouts }: MuscleMapProps) {
  const [selectedView, setSelectedView] = useState<'front' | 'back'>('front');
  const { settings } = useSettings();

  const frontTextOpacity = useSharedValue(1);
  const backTextOpacity = useSharedValue(0);
  const rotationValue = useSharedValue(0);

  const handleViewChange = (view: 'front' | 'back') => {
    setSelectedView(view);
    frontTextOpacity.value = withTiming(view === 'front' ? 1 : 0);
    backTextOpacity.value = withTiming(view === 'back' ? 1 : 0);
    rotationValue.value = withSpring(view === 'front' ? 0 : 180);
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${rotationValue.value}deg` }],
  }));

  // Calculer l'état de repos des muscles
  const calculateMuscleRestState = (muscleGroup: string): number => {
    const now = new Date();
    const muscleWorkouts = workouts.filter(w => w.muscleGroup === muscleGroup);
    
    if (muscleWorkouts.length === 0) return 3; // Plus de 72h (gris)
    
    const lastWorkout = muscleWorkouts.reduce((latest, current) => {
      const currentDate = new Date(current.date);
      const latestDate = new Date(latest.date);
      return currentDate > latestDate ? current : latest;
    });
    
    const hoursSinceLastWorkout = differenceInHours(now, new Date(lastWorkout.date));
    
    if (hoursSinceLastWorkout < 24) return 1; // 0-24h (rouge)
    if (hoursSinceLastWorkout < 72) return 2; // 24-72h (bordeaux)
    return 3; // Plus de 72h (gris)
  };

  // Convertir en format ExtendedBodyPart avec les états de repos
  const bodyData: ExtendedBodyPart[] = Object.entries(muscleGroupToSlug).map(([group, slug]) => ({
    slug: slug as Slug,
    intensity: calculateMuscleRestState(group)
  }));

  return (
    <View style={styles.container}>
      <View style={styles.viewToggle}>
        <Pressable
          style={[styles.toggleButton, selectedView === 'front' && styles.toggleButtonActive]}
          onPress={() => handleViewChange('front')}>
          <AnimatedText style={[styles.toggleText]}>
            Vue de face
          </AnimatedText>
        </Pressable>
        <Pressable
          style={[styles.toggleButton, selectedView === 'back' && styles.toggleButtonActive]}
          onPress={() => handleViewChange('back')}>
          <AnimatedText style={[styles.toggleText]}>
            Vue de dos
          </AnimatedText>
        </Pressable>
      </View>
      <Animated.View style={[styles.bodyContainer, containerStyle]}>
        <Body
          data={bodyData}
          side={selectedView}
          gender={settings.gender}
        />
      </Animated.View>
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>État de repos des muscles</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.legendText}>0-24h</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#7f1d1d' }]} />
            <Text style={styles.legendText}>24-72h</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#4b5563' }]} />
            <Text style={styles.legendText}>72h+</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  viewToggle: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#333',
    borderRadius: 20,
    padding: 4,
  },
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
  },
  toggleButtonActive: {
    backgroundColor: '#fd8f09',
  },
  toggleText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  bodyContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    width: '100%',
  },
  legendTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    color: '#fff',
    fontFamily: 'Inter-Regular',
    fontSize: 14,
  },
});
