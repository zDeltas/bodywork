import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useCallback, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { router } from 'expo-router';
import { X } from 'lucide-react-native';
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

export default function NewWorkoutScreen() {
  const [selectedMuscle, setSelectedMuscle] = useState('');
  const [exercise, setExercise] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [sets, setSets] = useState('');

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
        date: new Date().toISOString(),
      };

      // Récupérer les workouts existants
      const existingWorkouts = await AsyncStorage.getItem('workouts');
      const workouts = existingWorkouts ? JSON.parse(existingWorkouts) : [];

      // Ajouter le nouveau workout
      workouts.push(workout);

      // Sauvegarder la liste mise à jour
      await AsyncStorage.setItem('workouts', JSON.stringify(workouts));

      // Notifier l'écran principal de la mise à jour
      router.push({
        pathname: '/(tabs)',
        params: { refresh: 'true' }
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      // Ici vous pourriez ajouter une alerte pour informer l'utilisateur de l'erreur
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
              onPress={() => setSelectedMuscle(muscle)}
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

        <Text style={styles.sectionTitle}>Exercise</Text>
        <TextInput
          style={styles.input}
          value={exercise}
          onChangeText={setExercise}
          placeholder="Enter exercise name"
          placeholderTextColor="#666"
        />

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
          style={styles.addButton}
          onPress={saveWorkout}
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
  addButtonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
});
