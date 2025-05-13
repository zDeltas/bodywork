import React, { useState } from 'react';
import { StyleSheet, TextInput, View, ViewStyle } from 'react-native';
import Text from '@/app/components/ui/Text';
import { useTheme } from '@/app/hooks/useTheme';
import { Exercise, WorkoutSummary } from '@/app/types/common';
import { Button } from '@/app/components/ui/Button';

interface WorkoutFormProps {
  onSubmit: (workout: WorkoutSummary) => void;
}

const WorkoutForm: React.FC<WorkoutFormProps> = ({ onSubmit }) => {
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExercise, setCurrentExercise] = useState<Exercise>({
    name: '',
    sets: 0,
    reps: 0,
    weight: 0
  });

  const { theme } = useTheme();
  const styles = useStyles(theme);

  const handleAddExercise = () => {
    if (currentExercise.name && currentExercise.sets > 0 && currentExercise.reps > 0) {
      setExercises([...exercises, currentExercise]);
      setCurrentExercise({
        name: '',
        sets: 0,
        reps: 0,
        weight: 0
      });
    }
  };

  const handleSubmit = () => {
    if (workoutName && exercises.length > 0) {
      onSubmit({
        id: Date.now().toString(),
        name: workoutName,
        exercises: exercises,
        duration: 0
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text variant="subheading">Workout Name</Text>
        <TextInput
          style={styles.input}
          value={workoutName}
          onChangeText={setWorkoutName}
          placeholder="Enter workout name"
          placeholderTextColor={theme.colors.text.secondary}
        />
      </View>

      <View style={styles.section}>
        <Text variant="subheading">Add Exercise</Text>
        <TextInput
          style={styles.input}
          value={currentExercise.name}
          onChangeText={(text) =>
            setCurrentExercise({ ...currentExercise, name: text })
          }
          placeholder="Exercise name"
          placeholderTextColor={theme.colors.text.secondary}
        />
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.numberInput]}
            value={currentExercise.sets.toString()}
            onChangeText={(text) =>
              setCurrentExercise({ ...currentExercise, sets: parseInt(text) || 0 })
            }
            placeholder="Sets"
            keyboardType="numeric"
            placeholderTextColor={theme.colors.text.secondary}
          />
          <TextInput
            style={[styles.input, styles.numberInput]}
            value={currentExercise.reps.toString()}
            onChangeText={(text) =>
              setCurrentExercise({ ...currentExercise, reps: parseInt(text) || 0 })
            }
            placeholder="Reps"
            keyboardType="numeric"
            placeholderTextColor={theme.colors.text.secondary}
          />
          <TextInput
            style={[styles.input, styles.numberInput]}
            value={currentExercise.weight.toString()}
            onChangeText={(text) =>
              setCurrentExercise({ ...currentExercise, weight: parseInt(text) || 0 })
            }
            placeholder="Weight (kg)"
            keyboardType="numeric"
            placeholderTextColor={theme.colors.text.secondary}
          />
        </View>
        <Button
          variant="primary"
          title="Add Exercise"
          onPress={handleAddExercise}
          style={styles.button}
        />
      </View>

      {exercises.length > 0 && (
        <View style={styles.section}>
          <Text variant="subheading">Exercises</Text>
          {exercises.map((exercise, index) => (
            <View key={index} style={styles.exerciseItem}>
              <Text variant="body">{exercise.name}</Text>
              <Text variant="caption">
                {exercise.sets} sets × {exercise.reps} reps
                {exercise.weight > 0 && ` × ${exercise.weight}kg`}
              </Text>
            </View>
          ))}
        </View>
      )}

      <Button
        variant="primary"
        title="Create Workout"
        onPress={handleSubmit}
        style={{ ...styles.button, ...styles.submitButton }}
      />
    </View>
  );
};

const useStyles = (theme: any) => StyleSheet.create({
  container: {
    padding: 16
  },
  section: {
    marginBottom: 24
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border.default,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.input
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  numberInput: {
    flex: 1,
    marginHorizontal: 4
  },
  button: {
    marginTop: 8
  },
  submitButton: {
    marginTop: 16
  },
  exerciseItem: {
    backgroundColor: theme.colors.background.card,
    padding: 12,
    borderRadius: 8,
    marginVertical: 4
  }
});

export default WorkoutForm; 
