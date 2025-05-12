# Service de Stockage pour Bodywork

Ce service centralise toutes les opérations de stockage pour l'application Bodywork.

## Fonctionnalités

- Gestion centralisée du stockage avec AsyncStorage
- Typage fort pour toutes les données stockées
- Méthodes génériques et spécifiques pour chaque type de donnée
- Système de versionnage et de migration pour les évolutions futures
- Hooks React personnalisés pour faciliter l'utilisation dans les composants

## Structure

- `storage.ts` : Service principal de stockage
- `index.ts` : Point d'entrée pour l'exportation des services

## Types de données gérés

- Workouts : entraînements
- Goals : objectifs d'entraînement
- Measurements : mesures corporelles
- Settings : préférences utilisateur
- FavoriteExercises : exercices favoris
- RecentExercises : exercices récemment utilisés

## Utilisation

### Service de stockage direct

```typescript
import { storageService, StorageKeys } from '../services';

// Récupérer des données
const workouts = await storageService.getWorkouts();

// Enregistrer des données
await storageService.saveWorkout(workout);

// Supprimer des données
await storageService.deleteWorkout(id);
```

### Hooks React

```typescript
import { useWorkouts } from '../hooks/useWorkouts';
import { useGoals } from '../hooks/useGoals';
import { useSettings } from '../hooks/useSettings';
import { useMeasurements } from '../hooks/useMeasurements';
import { useExercises } from '../hooks/useExercises';

// Dans un composant React
function MyComponent() {
  // Utilisation des hooks
  const { workouts, saveWorkout } = useWorkouts();
  const { goals, addGoal } = useGoals(workouts);
  const { settings, updateSettings } = useSettings();
  const { measurements, saveMeasurement } = useMeasurements();
  const { favoriteExercises, toggleFavorite } = useExercises();
  
  // ...
}
```

## Migrations

Le service de stockage inclut un système de versionnage pour gérer les migrations futures. Lorsque la structure des données change, il suffit de mettre à jour la version du stockage et d'implémenter la logique de migration dans la méthode `migrateStorage`.

```typescript
// Dans storage.ts
const CURRENT_STORAGE_VERSION = '1.1'; // Nouvelle version

private async migrateStorage(fromVersion: string, toVersion: string): Promise<void> {
  if (fromVersion === '1.0' && toVersion === '1.1') {
    // Logique de migration spécifique
    const workouts = await this.getWorkouts();
    // Transformer les données...
    await this.setItem(StorageKeys.WORKOUTS, transformedWorkouts);
  }
}
``` 