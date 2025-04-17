import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useCallback, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { router, useLocalSearchParams } from 'expo-router';
import { X, Plus } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();

export const muscleGroups = [
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Core',
];

export const predefinedExercises = {
  'Chest': ['Bench Press', 'Incline Press', 'Decline Press', 'Dumbbell Fly', 'Cable Crossover'],
  'Back': ['Pull-ups', 'Lat Pulldown', 'Barbell Row', 'Dumbbell Row', 'T-Bar Row'],
  'Legs': ['Squat', 'Deadlift', 'Leg Press', 'Lunges', 'Leg Extension'],
  'Shoulders': ['Overhead Press', 'Lateral Raise', 'Front Raise', 'Rear Delt Fly', 'Shrugs'],
  'Biceps': ['Barbell Curl', 'Dumbbell Curl', 'Hammer Curl', 'Preacher Curl', 'Concentration Curl'],
  'Triceps': ['Tricep Pushdown', 'Skull Crushers', 'Overhead Extension', 'Dips', 'Close Grip Bench'],
  'Core': ['Plank', 'Russian Twists', 'Leg Raises', 'Crunches', 'Hanging Knee Raises'],
};

export default function NewWorkoutScreen() {
  const [selectedMuscle, setSelectedMuscle] = useState('');
  const [exercise, setExercise] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [sets, setSets] = useState('');
  const [isCustomExercise, setIsCustomExercise] = useState(false);
  const params = useLocalSearchParams();
  const selectedDate = params.selectedDate as string;

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const saveWorkout = async () => {
    try {
      const workout = {
        id: Date.now().toString(),
        muscleGroup: selectedMuscle,
        exercise,
        weight: parseFloat(weight) || 0,
        reps: parseInt(reps) || 0,
        sets: parseInt(sets) || 0,
        date: selectedDate ? `${selectedDate}T${new Date().toTimeString().split(' ')[0]}` : new Date().toISOString(),
      };

      const existingWorkouts = await AsyncStorage.getItem('workouts');
      const workouts = existingWorkouts ? JSON.parse(existingWorkouts) : [];
      workouts.push(workout);
      await AsyncStorage.setItem('workouts', JSON.stringify(workouts));

      router.push({
        pathname: '/(tabs)',
        params: { refresh: 'true' }
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <View style={styles.header}>
        <Text style={styles.title}>New Workout</Text>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <X color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Muscle Group</Text>
        <View style={styles.muscleGrid}>
          {muscleGroups.map((muscle) => (
            <TouchableOpacity
              key={muscle}
              style={[
                styles.muscleButton,
                selectedMuscle === muscle && styles.muscleButtonSelected,
              ]}
              onPress={() => {
                setSelectedMuscle(muscle);
                setExercise('');
                setIsCustomExercise(false);
              }}
            >
              <Text style={[
                styles.muscleButtonText,
                selectedMuscle === muscle && styles.muscleButtonTextSelected,
              ]}>
                {muscle}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedMuscle && (
          <>
            <Text style={styles.sectionTitle}>Exercise</Text>
            {!isCustomExercise ? (
              <View style={styles.exerciseGrid}>
                {predefinedExercises[selectedMuscle as keyof typeof predefinedExercises].map((ex) => (
                  <TouchableOpacity
                    key={ex}
                    style={[
                      styles.exerciseButton,
                      exercise === ex && styles.exerciseButtonSelected,
                    ]}
                    onPress={() => setExercise(ex)}
                  >
                    <Text style={[
                      styles.exerciseButtonText,
                      exercise === ex && styles.exerciseButtonTextSelected,
                    ]}>
                      {ex}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.customExerciseButton}
                  onPress={() => setIsCustomExercise(true)}
                >
                  <Plus color="#6366f1" size={20} />
                  <Text style={styles.customExerciseButtonText}>Custom Exercise</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.customExerciseContainer}>
                <TextInput
                  style={styles.input}
                  value={exercise}
                  onChangeText={setExercise}
                  placeholder="Enter exercise name"
                  placeholderTextColor="#666"
                />
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setIsCustomExercise(false)}
                >
                  <Text style={styles.backButtonText}>Back to Predefined</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              placeholder="0"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Reps</Text>
            <TextInput
              style={styles.input}
              value={reps}
              onChangeText={setReps}
              placeholder="0"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Sets</Text>
            <TextInput
              style={styles.input}
              value={sets}
              onChangeText={setSets}
              placeholder="0"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.addButton, (!exercise || !selectedMuscle) && styles.addButtonDisabled]}
          onPress={saveWorkout}
          disabled={!exercise || !selectedMuscle}
        >
          <Text style={styles.addButtonText}>Add Exercise</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#1a1a1a',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#fff',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    marginBottom: 12,
  },
  muscleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 8,
  },
  muscleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    marginRight: 8,
    marginBottom: 8,
  },
  muscleButtonSelected: {
    backgroundColor: '#6366f1',
  },
  muscleButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Regular',
  },
  muscleButtonTextSelected: {
    fontFamily: 'Inter-SemiBold',
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 8,
  },
  exerciseButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    marginRight: 8,
    marginBottom: 8,
  },
  exerciseButtonSelected: {
    backgroundColor: '#6366f1',
  },
  exerciseButtonText: {
    color: '#fff',
    fontFamily: 'Inter-Regular',
  },
  exerciseButtonTextSelected: {
    fontFamily: 'Inter-SemiBold',
  },
  customExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    marginRight: 8,
    marginBottom: 8,
    gap: 8,
  },
  customExerciseButtonText: {
    color: '#6366f1',
    fontFamily: 'Inter-Regular',
  },
  customExerciseContainer: {
    marginBottom: 24,
  },
  backButton: {
    marginTop: 8,
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#6366f1',
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  column: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#333',
  },
  addButtonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
});
