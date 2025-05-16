import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { storageService } from '@/app/services/storage';
import { useRouter } from 'expo-router';
import { useTheme } from '@/app/hooks/useTheme';
import { Play } from 'lucide-react-native';

type Routine = {
  id: string;
  title: string;
  description: string;
  exercises: Array<{
    name: string;
    key: string;
    series: Array<{
      weight: number;
      reps: number;
      note: string;
      rest: string;
      type: 'warmUp' | 'workingSet';
    }>;
  }>;
  createdAt: string;
};

export default function RoutinesListScreen() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useStyles(theme);

  useEffect(() => {
    const loadRoutines = async () => {
      const loadedRoutines = await storageService.getRoutines();
      console.log('Routines chargées:', JSON.stringify(loadedRoutines, null, 2));
      setRoutines(loadedRoutines);
    };
    loadRoutines();
  }, []);

  const handleStartRoutine = (routineId: string) => {
    router.push({
      pathname: '/screens/workout/session',
      params: { routineId }
    });
  };

  const renderRoutine = ({ item }: { item: Routine }) => (
    <View style={styles.routineCard}>
      <Text style={styles.routineTitle}>{item.title}</Text>
      {item.description && <Text style={styles.routineDescription}>{item.description}</Text>}
      <Text style={styles.routineExercises}>
        {item.exercises.length} exercice{item.exercises.length > 1 ? 's' : ''}
      </Text>
      <Text style={styles.routineDate}>
        Créée le {new Date(item.createdAt).toLocaleDateString()}
      </Text>
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => handleStartRoutine(item.id)}
      >
        <Play size={20} color={theme.colors.text.primary} />
        <Text style={styles.startButtonText}>Démarrer</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes routines</Text>
      <FlatList
        data={routines}
        renderItem={renderRoutine}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucune routine pour l'instant.</Text>}
      />
    </View>
  );
}

const useStyles = (theme: any) => StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16,
    backgroundColor: '#fff'
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 16 
  },
  routineCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  routineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  routineDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  routineExercises: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  routineDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 32,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  startButtonText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.base,
    fontWeight: '600',
  },
}); 