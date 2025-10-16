# Mise à jour du flux de création de routine

## Modification demandée

L'utilisateur souhaitait que le bouton "Enregistrer" à l'étape 2 (ajout des exercices) devienne "Suivant" et mène vers l'écran de planification au lieu de terminer directement la création.

## Modifications apportées

### 1. **Ajout d'une étape 3 de planification**

#### **Nouveaux imports** (app/screens/routines/new.tsx)
```typescript
import { RoutineScheduleModal } from '@/app/components/routines';
import { useRoutineSchedule } from '@/app/hooks/useRoutineSchedule';
```

#### **Nouveaux états**
```typescript
const [showScheduleModal, setShowScheduleModal] = useState(false);
const [savedRoutineId, setSavedRoutineId] = useState<string | null>(null);
const { saveSchedule } = useRoutineSchedule();
```

### 2. **Modification de la logique de sauvegarde**

#### **Fonction handleSaveRoutine modifiée**
```typescript
const handleSaveRoutine = useCallback(async () => {
  // ... validation et création de la routine
  
  const routineId = isEditMode ? (id as string) : generateRoutineId();
  await storageService.saveRoutine(routineToSave);
  setSavedRoutineId(routineId);
  
  if (isEditMode) {
    // Mode édition : retour direct à la liste
    showSuccess(t('routine.updated'));
    router.push('/(tabs)/routines');
  } else {
    // Nouvelle routine : passage à l'étape de planification
    setStep(3);
  }
}, [/* dépendances */]);
```

### 3. **Modification du bouton étape 2**

#### **Avant**
```typescript
<Button
  title={isEditMode ? t('common.update') : t('common.save')}
  onPress={handleSaveRoutine}
  style={styles.primaryButton}
  disabled={!isRoutineSaveReady}
/>
```

#### **Après**
```typescript
<Button
  title={isEditMode ? t('common.update') : t('common.next')}
  onPress={handleSaveRoutine}
  style={styles.primaryButton}
  disabled={!isRoutineSaveReady}
/>
```

### 4. **Création de l'étape 3 - Planification**

#### **Interface de planification**
```typescript
const renderStep3 = useMemo(() => (
  <View style={{ flex: 1 }}>
    <View style={styles.sectionTitleContainer}>
      <Timer color={theme.colors.text.secondary} size={22} style={styles.sectionTitleIcon} />
      <Text variant="heading" style={styles.titleLabel}>
        {t('schedule.planRoutine')}
      </Text>
    </View>

    <View style={styles.exerciseRestSection}>
      <Text variant="body" style={styles.sectionDescription}>
        {t('schedule.description').replace('"test"', `"${routine.title}"`)}
      </Text>

      <View style={styles.scheduleActions}>
        <Button
          title={t('schedule.save')}
          onPress={() => setShowScheduleModal(true)}
          style={styles.primaryButton}
        />
        
        <Button
          title={t('routine.skipScheduling')}
          onPress={handleSkipScheduling}
          style={styles.secondaryButton}
        />
      </View>
    </View>

    <RoutineScheduleModal
      visible={showScheduleModal}
      routine={savedRoutineId ? { id: savedRoutineId, title: routine.title } : null}
      onClose={() => setShowScheduleModal(false)}
      onSave={handleScheduleSave}
    />
  </View>
), [/* dépendances */]);
```

### 5. **Gestion des actions de planification**

#### **Sauvegarde de la planification**
```typescript
const handleScheduleSave = useCallback(async (schedule: any) => {
  try {
    await saveSchedule(schedule);
    showSuccess(t('routine.saved'));
    router.push('/(tabs)/routines');
  } catch (error) {
    console.error('Error saving schedule:', error);
    showError(t('common.error'));
  }
}, [saveSchedule, showSuccess, showError, t, router]);
```

#### **Passer la planification**
```typescript
const handleSkipScheduling = useCallback(() => {
  showSuccess(t('routine.saved'));
  router.push('/(tabs)/routines');
}, [showSuccess, t, router]);
```

### 6. **Ajout des traductions**

#### **Français** (translations/fr.ts)
```typescript
routine: {
  // ... traductions existantes
  skipScheduling: 'Passer la planification'
}

schedule: {
  // ... traductions existantes
  save: 'Planifier la routine'
}
```

#### **Anglais** (translations/en.ts)
```typescript
routine: {
  // ... traductions existantes
  skipScheduling: 'Skip scheduling'
}

schedule: {
  // ... traductions existantes
  save: 'Schedule routine'
}
```

### 7. **Styles ajoutés**

```typescript
scheduleActions: {
  flexDirection: 'column',
  gap: theme.spacing.sm,
  marginTop: theme.spacing.lg
}
```

## Nouveau flux utilisateur

### **Pour une nouvelle routine :**
1. **Étape 1** : Configuration générale (titre, description, repos, préparation)
2. **Étape 2** : Ajout des exercices → Bouton "Suivant"
3. **Étape 3** : Planification → Choix entre "Planifier la routine" ou "Passer la planification"

### **Pour l'édition d'une routine existante :**
1. **Étape 1** : Configuration générale
2. **Étape 2** : Modification des exercices → Bouton "Mettre à jour" (retour direct)

## Avantages de cette approche

### **UX améliorée**
- **Flux logique** : Création → Configuration → Planification
- **Flexibilité** : Possibilité de planifier ou passer cette étape
- **Cohérence** : Intégration naturelle avec le système de planification

### **Architecture propre**
- **Réutilisation** : Utilise le système de planification existant
- **Séparation** : Logique distincte pour création vs édition
- **Extensibilité** : Facilite l'ajout d'étapes futures

### **Fonctionnalités préservées**
- **Mode édition** : Comportement inchangé (retour direct)
- **Validation** : Toutes les validations existantes conservées
- **Performance** : Pas d'impact sur les performances

## Résultat

Le flux de création de routine guide maintenant naturellement l'utilisateur vers la planification, tout en préservant la flexibilité de passer cette étape. L'intégration avec le système de planification existant est transparente et cohérente.
