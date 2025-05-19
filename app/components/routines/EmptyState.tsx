import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowRight, Plus } from 'lucide-react-native';
import { Routine } from '@/app/types/routine';
import Button from '@/app/components/ui/Button';
import { useTheme } from '@/app/hooks/useTheme';

type EmptyStateProps = {
  onCreateRoutine: () => void;
  onAddPremadeRoutine: (routine: Routine) => void;
  premadeRoutines: Routine[];
};

export const EmptyState = React.memo(({
  onCreateRoutine,
  onAddPremadeRoutine,
  premadeRoutines
}: EmptyStateProps) => {
  const { theme } = useTheme();
  const styles = useStyles(theme);

  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Aucune routine pour l'instant</Text>
      <Text style={styles.emptyText}>
        Créez votre première routine d'entraînement ou choisissez parmi nos suggestions
      </Text>
      <View style={styles.emptyActions}>
        <Button
          title="Créer ma première routine"
          onPress={onCreateRoutine}
          style={styles.createButton}
          icon={<Plus size={20} color={theme.colors.background.main} />}
        />
        <Text style={styles.emptyOrText}>ou</Text>
        <View style={styles.premadeContainer}>
          <Text style={styles.premadeTitle}>Suggestions</Text>
          {premadeRoutines.map((routine) => (
            <TouchableOpacity
              key={routine.id}
              style={styles.premadeCard}
              onPress={() => onAddPremadeRoutine(routine)}
            >
              <View style={styles.premadeContent}>
                <Text style={styles.premadeCardTitle}>{routine.title}</Text>
                <Text style={styles.premadeCardDescription}>{routine.description}</Text>
                <View style={styles.premadeStats}>
                  <Text style={styles.premadeStat}>
                    {routine.exercises.length} exercices
                  </Text>
                  <Text style={styles.premadeStat}>
                    {routine.exercises.reduce((total, ex) => total + ex.series.length, 0)} séries
                  </Text>
                </View>
              </View>
              <ArrowRight size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
});

const useStyles = (theme: any) => StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 8,
    textAlign: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32
  },
  emptyActions: {
    width: '100%',
    alignItems: 'center'
  },
  emptyOrText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginVertical: 16
  },
  premadeContainer: {
    width: '100%',
    paddingHorizontal: 16
  },
  premadeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 12
  },
  premadeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    ...theme.shadows.sm
  },
  premadeContent: {
    flex: 1
  },
  premadeCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4
  },
  premadeCardDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 8
  },
  premadeStats: {
    flexDirection: 'row',
    gap: 12
  },
  premadeStat: {
    fontSize: 12,
    color: theme.colors.text.secondary
  },
  createButton: {
    backgroundColor: theme.colors.primary
  }
}); 