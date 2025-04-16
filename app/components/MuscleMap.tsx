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

const AnimatedText = Animated.createAnimatedComponent(Text);

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

const initialMuscleData: ExtendedBodyPart[] = Object.entries({
  [muscleSlugs.CHEST]: 2,
  [muscleSlugs.ABS]: 0.6,
  [muscleSlugs.BICEPS]: 0.4,
  [muscleSlugs.UPPER_BACK]: 0.7,
  [muscleSlugs.TRICEPS]: 0.5,
  [muscleSlugs.DELTOIDS]: 0.3,
  [muscleSlugs.TRAPEZIUS]: 0.4,
  [muscleSlugs.QUADRICEPS]: 0.9,
  [muscleSlugs.CALVES]: 0.6,
  [muscleSlugs.HAMSTRING]: 0.7,
  [muscleSlugs.GLUTEAL]: 0.5,
}).map(([slug, value]) => ({
  slug: slug as Slug,
  intensity: value > 0.5 ? 2 : 1,
}));

export default function MuscleMap() {
  const [selectedView, setSelectedView] = useState<'front' | 'back'>('front');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

  const frontTextOpacity = useSharedValue(1);
  const backTextOpacity = useSharedValue(0);
  const rotationValue = useSharedValue(0);

  const handleViewChange = (view: 'front' | 'back') => {
    setSelectedView(view);
    frontTextOpacity.value = withTiming(view === 'front' ? 1 : 0);
    backTextOpacity.value = withTiming(view === 'back' ? 1 : 0);
    rotationValue.value = withSpring(view === 'front' ? 0 : 180);
  };

  const handleMusclePress = (bodyPart: ExtendedBodyPart) => {
    const muscleSlug = bodyPart.slug;
    setSelectedMuscle(muscleSlug as string);
    router.push({
      pathname: '/workout/new',
      params: { muscle: muscleSlug as string }
    });
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${rotationValue.value}deg` }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.viewToggle}>
        <Pressable
          style={[styles.toggleButton, selectedView === 'front' && styles.toggleButtonActive]}
          onPress={() => handleViewChange('front')}>
          <AnimatedText style={[styles.toggleText]}>
            Front View
          </AnimatedText>
        </Pressable>
        <Pressable
          style={[styles.toggleButton, selectedView === 'back' && styles.toggleButtonActive]}
          onPress={() => handleViewChange('back')}>
          <AnimatedText style={[styles.toggleText]}>
            Back View
          </AnimatedText>
        </Pressable>
      </View>
      <Animated.View style={[styles.bodyContainer, containerStyle]}>
        <Body
          data={initialMuscleData}
          onBodyPartPress={handleMusclePress}
          side={selectedView}
          gender="male"
        />
      </Animated.View>
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
    backgroundColor: '#6366f1',
  },
  toggleText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  bodyContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    width: '100%',
    height: '100%',
  }
});
