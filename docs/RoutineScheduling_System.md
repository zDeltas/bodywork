# Système de Planification des Routines

## Vue d'ensemble

J'ai créé un système complet de planification des routines basé sur l'interface fournie par l'utilisateur. Ce système permet aux utilisateurs de programmer leurs routines sur des jours spécifiques de la semaine et d'afficher ces routines dans la carte "Routines du jour" de l'écran d'accueil.

## Architecture du système

### 1. **Types et interfaces**

#### **DayOfWeek** (types/common.ts)
```typescript
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
```

#### **RoutineSchedule** (types/common.ts)
```typescript
export interface RoutineSchedule {
  routineId: string;
  routineTitle: string;
  scheduledDays: DayOfWeek[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}
```

#### **Routine étendue** (types/common.ts)
```typescript
export interface Routine {
  // ... propriétés existantes
  scheduledDays?: DayOfWeek[];
  isScheduled?: boolean;
}
```

### 2. **Service de planification**

#### **RoutineScheduleService** (app/services/routineSchedule.ts)
Service principal pour gérer la persistance et la logique métier des planifications :

**Fonctionnalités principales :**
- `getSchedules()` : Récupérer toutes les planifications
- `saveSchedule()` : Sauvegarder/mettre à jour une planification
- `deleteSchedule()` : Supprimer une planification
- `getScheduleByRoutineId()` : Obtenir la planification d'une routine
- `getScheduledRoutinesForDay()` : Routines planifiées pour un jour donné
- `getTodayScheduledRoutines()` : Routines planifiées pour aujourd'hui
- `getDayOfWeekFromDate()` : Convertir une date en jour de semaine
- `toggleScheduleActive()` : Activer/désactiver une planification

**Stockage :** AsyncStorage avec clé `routine_schedules`

### 3. **Hook de planification**

#### **useRoutineSchedule** (app/hooks/useRoutineSchedule.ts)
Hook React pour gérer l'état et les opérations de planification :

**État géré :**
- `schedules` : Liste des planifications
- `loading` : État de chargement
- `error` : Erreurs éventuelles

**Méthodes exposées :**
- `saveSchedule()` : Sauvegarder avec rechargement automatique
- `deleteSchedule()` : Supprimer avec rechargement automatique
- `toggleScheduleActive()` : Basculer l'état actif
- `getScheduleByRoutineId()` : Recherche par ID de routine
- `getScheduledRoutinesForDay()` : Filtrage par jour
- `getTodayScheduledRoutines()` : Routines d'aujourd'hui
- `refresh()` : Rechargement manuel

**Optimisations :**
- Rechargement automatique avec `useFocusEffect`
- Gestion d'état avec `useState` et `useCallback`
- Nettoyage des effets pour éviter les fuites mémoire

### 4. **Interface utilisateur**

#### **RoutineScheduleModal** (app/components/routines/RoutineScheduleModal.tsx)
Modale de planification basée sur l'image fournie :

**Fonctionnalités :**
- **Sélections rapides** : Aucun, Semaine (Lun-Ven), Week-end (Sam-Dim)
- **Sélection individuelle** : Boutons pour chaque jour de la semaine
- **Interface responsive** : Grille 3x3 pour les jours avec labels courts/longs
- **Résumé dynamique** : Affichage du nombre de jours et liste des jours sélectionnés
- **Validation** : Empêche la sauvegarde sans sélection
- **Support modification** : Édition des planifications existantes

**Design :**
- Style cohérent avec le design system Gainizi
- Couleurs adaptatives selon l'état de sélection
- Animations et transitions fluides
- Interface accessible avec labels appropriés

**Props :**
```typescript
interface RoutineScheduleModalProps {
  visible: boolean;
  routine: Routine | null;
  onClose: () => void;
  onSave: (schedule: RoutineSchedule) => void;
  existingSchedule?: RoutineSchedule | null;
}
```

### 5. **Intégration avec DailyRoutineCard**

#### **Modifications apportées :**

**Interface mise à jour :**
```typescript
interface DailyRoutineCardProps {
  hasRoutineToday: boolean;
  routines: Array<{
    id: string;
    name: string;
    muscleGroups: string[];
    estimatedDuration?: number;
    lastPerformance?: { reps: number; weight: number; };
    isCompleted: boolean;
  }>;
  isCompleted?: boolean;
  onPress?: () => void;
}
```

**Support des routines multiples :**
- **Une routine** : Affichage détaillé (nom, groupes musculaires, durée, performance)
- **Routines multiples** : Affichage condensé avec statistiques globales
  - Nombre total de routines
  - Durée totale estimée
  - Progression (routines complétées/total)
  - Groupes musculaires combinés

**Navigation intelligente :**
- Routine unique → Navigation vers la routine spécifique
- Routines multiples → Navigation vers la première routine
- Aucune routine → Navigation vers l'écran des routines

### 6. **Intégration avec useHomeData**

#### **Modifications du hook :**

**Nouvelles dépendances :**
- `routineScheduleService` : Service de planification
- `routineSchedules` : État des planifications
- `routines` : État des routines

**Logique de calcul :**
```typescript
// Obtenir le jour de la semaine actuel
const todayDayOfWeek = routineScheduleService.getDayOfWeekFromDate(today);

// Trouver les routines planifiées pour aujourd'hui
const todayScheduledRoutines = routineSchedules.filter(schedule => 
  schedule.isActive && schedule.scheduledDays.includes(todayDayOfWeek)
);

// Construire les données des routines du jour
const todayRoutines = todayScheduledRoutines.map(schedule => {
  const routine = routines.find(r => r.id === schedule.routineId);
  // ... logique de construction des données
});
```

**Calculs automatiques :**
- Durée estimée basée sur `routine.totalTime` ou estimation (15min/exercice)
- Groupes musculaires extraits des exercices de la routine
- État de completion basé sur les sessions du jour
- Support des routines multiples avec agrégation des données

### 7. **Traductions complètes**

#### **Français (fr.ts) :**
```typescript
schedule: {
  title: 'Planifier la Routine',
  planRoutine: 'Planifier la Routine',
  description: 'Quand souhaitez-vous faire "test" ? Sélectionnez les jours qui vous conviennent.',
  quickSelections: 'Sélections rapides',
  chooseDays: 'Choisir les jours',
  summary: 'Cette routine sera programmée {count} jour(s) par semaine : {days}',
  // ... autres traductions
}

dailyRoutine: {
  // ... traductions existantes
  routinesPlanned: 'routines planifiées',
  totalDuration: 'Durée totale',
  progress: 'Progression'
}
```

#### **Anglais (en.ts) :**
```typescript
schedule: {
  title: 'Schedule Routine',
  planRoutine: 'Schedule Routine',
  description: 'When would you like to do "test"? Select the days that work for you.',
  // ... traductions correspondantes
}
```

## Flux d'utilisation

### 1. **Planification d'une routine :**
1. L'utilisateur accède à l'écran de modification d'une routine
2. Clic sur "Planifier la routine" ouvre `RoutineScheduleModal`
3. Sélection des jours via sélections rapides ou individuelles
4. Sauvegarde crée/met à jour un `RoutineSchedule`
5. Rechargement automatique des données

### 2. **Affichage des routines du jour :**
1. `useHomeData` charge les planifications et routines
2. Calcul des routines planifiées pour aujourd'hui
3. `DailyRoutineCard` affiche les routines avec support multi-routines
4. Navigation contextuelle selon le nombre de routines

### 3. **États gérés :**
- **Aucune routine planifiée** : Message d'encouragement + bouton "Démarrer une séance"
- **Routine(s) planifiée(s) non faite(s)** : Détails + bouton "Commencer ma séance"
- **Routine(s) terminée(s)** : Confirmation + bouton "Voir la séance"

## Avantages du système

### **Flexibilité :**
- Support des routines multiples par jour
- Planification flexible par jour de semaine
- Activation/désactivation des planifications

### **Performance :**
- Chargement optimisé avec `useFocusEffect`
- Calculs mémorisés avec `useMemo`
- Rechargement intelligent des données

### **UX/UI :**
- Interface intuitive basée sur l'image fournie
- Sélections rapides pour les cas d'usage courants
- Feedback visuel immédiat
- Messages contextuels selon l'état

### **Extensibilité :**
- Architecture modulaire et réutilisable
- Types TypeScript stricts
- Service séparé pour la logique métier
- Composants React optimisés

## Prochaines améliorations possibles

1. **Notifications** : Rappels pour les routines planifiées
2. **Récurrence avancée** : Planification bi-hebdomadaire, mensuelle
3. **Historique** : Suivi de l'adhérence aux planifications
4. **Synchronisation** : Backup cloud des planifications
5. **Templates** : Planifications prédéfinies (débutant, intermédiaire, avancé)

Le système est maintenant entièrement fonctionnel et prêt à être utilisé avec les vraies données de routines !
