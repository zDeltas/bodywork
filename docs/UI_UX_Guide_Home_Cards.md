# Guide UI/UX - Cartes Home Gainizi

## Vue d'ensemble

Ce guide détaille les spécifications exactes des cartes home de l'application Bodywork pour permettre une reproduction fidèle du design et de l'expérience utilisateur.

## Architecture générale

### Structure des composants
```
GainiziCardsSection.tsx (Conteneur)
├── PlanningAdherenceCard.tsx (Carte 1 - Discipline)
└── WeeklyChallengeCardNew.tsx (Carte 2 - Motivation)
```

### Layout global
- **Disposition** : Cartes empilées verticalement (pleine largeur)
- **Espacement** : `theme.spacing.md` entre les cartes
- **Marges** : `theme.spacing.lg` horizontales pour chaque carte
- **Section** : Titre centré avec sous-titre explicatif

---

## 1. PlanningAdherenceCard - Carte Discipline

### Objectif UX
- **Rôle** : Valoriser la constance et la régularité
- **Tonalité** : Calme, confiante, valorisante
- **Ressenti** : Satisfaction, confiance en sa discipline

### Structure visuelle

#### Header (Centré)
```
[Icône Calendar] Adhérence au planning
```
- **Icône** : `Calendar` (lucide-react-native), taille 22px
- **Titre** : "Adhérence au planning" - variant `subheading`, bold
- **Couleur** : Dynamique selon performance (voir couleurs adaptatives)
- **Alignement** : Centré avec flexDirection row

#### Sous-titre
```
Ta discipline moyenne sur les X dernières semaines
```
- **Style** : variant `caption`, italique, centré
- **Couleur** : `theme.colors.text.secondary`
- **Margin** : `theme.spacing.lg` en bas

#### Indicateur principal
```
[CheckCircle] 3/4 séances respectées • 75%
```
- **Icône** : `CheckCircle`, taille 18px, couleur dynamique
- **Format** : `{completedSessions}/{plannedSessions} séances respectées • {adherenceRate}%`
- **Styles** :
  - Nombre complété : Bold, couleur dynamique, taille lg
  - Total : Bold, couleur secondaire, taille lg
  - Label : Couleur secondaire, taille md

#### Barre de progression
- **Hauteur** : 12px (plus fine que le défi)
- **Background** : `theme.colors.background.input`
- **Fill** : Couleur dynamique, largeur = `adherenceRate%`
- **Border radius** : `theme.borderRadius.full`

#### Message motivationnel
```
Tu es au top de ta forme ! Ta régularité s'améliore encore 🔥
```
- **Style** : variant `body`, semibold, centré, taille lg
- **Couleur** : Couleur dynamique selon performance
- **Contenu** : Message généré par système intelligent (voir logique)

#### Badge streak (conditionnel)
```
[TrendingUp] 🔥 X semaines de régularité
```
- **Condition** : Affiché si `streakWeeks >= 2`
- **Background** : Couleur dynamique + transparence 15%
- **Icône** : `TrendingUp`, taille 16px
- **Style** : Padding lg/sm, border radius full, centré

### Couleurs adaptatives

| Niveau | Seuil | Couleur | Code |
|--------|-------|---------|------|
| **Excellente** | ≥85% | Vert | `theme.colors.success` |
| **Bonne** | 70-84% | Turquoise | `#4CC9F0` |
| **Moyenne** | 50-69% | Orange | `theme.colors.warning` |
| **Faible** | <50% | Gris | `theme.colors.secondary` |
| **Débutant** | 0 sessions | Turquoise | `#4CC9F0` |

### Messages motivationnels

#### Système de niveaux
- **Excellente (≥85%)** : "Tu es au top de ta forme ! Ta régularité s'améliore encore 🔥"
- **Bonne (70-84%)** : "Très bonne régularité ! Tu as trouvé ton rythme 🎯"
- **Moyenne (50-69%)** : "Tu peux faire mieux ! Accroche-toi, ça va payer 🚀"
- **Faible (<50%)** : "Allez, on se remet en selle ! Tu en es capable 💪"

#### Messages spéciaux
- **Progression positive** : "Belle progression ! Tu prends de très bonnes habitudes ⚡"
- **Streak exceptionnel** : "Discipline exemplaire ! Tu maintiens un rythme de champion 💪"
- **Débutant** : "C'est le moment de commencer ! Première séance = premier pas 🚀"
- **Reprise** : "Super, tu reprends le rythme ! Continue comme ça ⚡"

### Dimensions et espacement
```css
container: {
  backgroundColor: theme.colors.background.card,
  borderRadius: 24px, // Style Gainizi
  padding: theme.spacing.xl,
  marginHorizontal: theme.spacing.lg,
  borderWidth: 1,
  borderColor: theme.colors.background.input,
  ...theme.shadows.md
}
```

---

## 2. WeeklyChallengeCardNew - Carte Motivation

### Objectif UX
- **Rôle** : Stimuler l'action et créer de l'énergie
- **Tonalité** : Énergique, stimulante, encourageante
- **Ressenti** : Motivation, énergie, envie d'agir

### Structure visuelle

#### Header (Centré)
```
[Icône Dynamique] Défi hebdomadaire
```
- **Icône** : Dynamique selon progression (Trophy/Flame/Zap), taille 24px
- **Titre** : "Défi hebdomadaire" - variant `subheading`, bold
- **Couleur** : Dynamique selon progression
- **Alignement** : Centré avec flexDirection row

#### Sous-titre énergique
```
Atteins ton objectif avant dimanche !
```
- **Style** : variant `caption`, italique, centré, taille sm
- **Couleur** : `theme.colors.text.secondary`
- **Margin** : `theme.spacing.lg` en bas

#### Progression actuelle
```
2/4 séances
```
- **Format** : `{current}/{target} {unité}`
- **Style** : variant `subheading`, bold, taille xl, centré
- **Couleur** : Couleur dynamique selon progression
- **Unités** : sessions → "séances", volume → "kg", muscle_group → "exercices"

#### Barre de progression épaisse
- **Hauteur** : 14px (plus épaisse que l'adhérence)
- **Background** : `theme.colors.background.input`
- **Fill** : Couleur dynamique, largeur = `progress * 100%`
- **Border radius** : `theme.borderRadius.full`

#### Pourcentage de progression
```
50% terminé
```
- **Format** : `{Math.round(progress * 100)}% terminé`
- **Style** : variant `body`, medium, taille sm, centré
- **Couleur** : Couleur dynamique selon progression

#### Message motivationnel énergique
```
Tu avances bien, continue 💥
```
- **Style** : variant `body`, bold, centré, taille lg
- **Couleur** : Couleur dynamique selon progression
- **Contenu** : Message généré selon progression (voir logique)

#### Badge temps restant
```
[Clock] 3 jours restants
```
- **Background** : Couleur dynamique + transparence 15%
- **Icône** : `Clock`, taille 16px
- **Style** : Padding lg/md, border radius full, centré
- **Format** : "X jours restants" ou "Encore X séance(s) pour réussir"

#### Bouton d'action (CTA)
```
Démarrer la séance #2
```
- **Background** : Couleur dynamique selon progression
- **Texte** : Blanc, bold, taille md
- **Padding** : md vertical, lg horizontal
- **Border radius** : full
- **Contenu** : Dynamique selon état (voir logique CTA)

### Couleurs adaptatives

| Progression | Seuil | Couleur | Code |
|-------------|-------|---------|------|
| **Réussi** | 100% | Rose | `#F72585` |
| **Presque au bout** | ≥75% | Vert | `theme.colors.success` |
| **En cours** | ≥1% | Turquoise | `#4CC9F0` |
| **Début** | 0% | Orange | `theme.colors.warning` |

### Icônes dynamiques

| Progression | Icône | Signification |
|-------------|-------|---------------|
| ≥100% | `Trophy` | Défi accompli |
| ≥50% | `Flame` | En feu, progression |
| <50% | `Zap` | Énergie, démarrage |

### Messages motivationnels

#### Messages selon progression
- **0%** : "Le défi commence ! Montrez votre force ⚡"
- **≥100%** : "Défi réussi ! Excellent travail 🏆"
- **≥75%** : "Presque au bout, ne lâche rien 🏁"
- **≥1%** : "Tu avances bien, continue 💥"

### Logique CTA (Call-to-Action)

| État | Texte du bouton |
|------|-----------------|
| Défi accompli (100%) | "Défi accompli ✅" |
| Sessions restantes | "Démarrer la séance #X" |
| Autre | "Continuer le défi →" |

### Dimensions et espacement
```css
container: {
  backgroundColor: theme.colors.background.card,
  borderRadius: 24px, // Style Gainizi
  padding: theme.spacing.xl,
  marginHorizontal: theme.spacing.lg,
  borderWidth: 1,
  borderColor: theme.colors.background.input,
  ...theme.shadows.md
}
```

---

## 3. GainiziCardsSection - Conteneur

### Structure
```jsx
<View style={styles.container}>
  {/* Header de section */}
  <View style={styles.sectionHeader}>
    <Text variant="heading">Tableau de bord Gainizi</Text>
    <Text variant="caption">Suivi intelligent de tes performances</Text>
  </View>
  
  {/* Cartes empilées */}
  <View style={styles.cardsContainer}>
    <PlanningAdherenceCard {...planningAdherence} />
    <WeeklyChallengeCardNew {...weeklyChallenge} />
  </View>
</View>
```

### Styles du conteneur
```css
container: {
  marginBottom: theme.spacing.xl
}

sectionHeader: {
  paddingHorizontal: theme.spacing.lg,
  marginBottom: theme.spacing.lg,
  alignItems: 'center'
}

sectionTitle: {
  color: theme.colors.text.primary,
  fontFamily: theme.typography.fontFamily.bold,
  textAlign: 'center',
  marginBottom: theme.spacing.xs
}

sectionSubtitle: {
  color: theme.colors.text.secondary,
  textAlign: 'center',
  fontStyle: 'italic'
}

cardsContainer: {
  flexDirection: 'column',
  gap: theme.spacing.md
}
```

---

## 4. Interactions et Navigation

### Comportements tactiles
- **activeOpacity** : 0.8 pour tous les TouchableOpacity
- **Feedback** : Réduction d'opacité au touch
- **Zones tactiles** : Cartes entières cliquables

### Navigation
- **PlanningAdherenceCard** → `/screens/stats` (Statistiques)
- **WeeklyChallengeCard** → `/screens/workout/new` (Nouvel entraînement)

### États de chargement
- Affichage conditionnel basé sur les données disponibles
- Gestion des états vides avec valeurs par défaut
- Messages d'erreur intégrés dans l'interface

---

## 5. Responsive et Accessibilité

### Responsive
- **Mobile** : Cartes empilées verticalement (défaut)
- **Tablette** : Même layout (spécification actuelle)
- **Espacement** : Adaptatif selon la taille d'écran

### Accessibilité
- **Contraste** : Couleurs respectant les ratios WCAG
- **Tailles** : Textes et icônes suffisamment grands
- **Navigation** : Support des lecteurs d'écran
- **Feedback** : Retours visuels clairs

---

## 6. Données et Logique Métier

### Interface PlanningAdherence
```typescript
interface PlanningAdherenceData {
  completedSessions: number;    // Sessions réalisées
  plannedSessions: number;      // Sessions planifiées
  adherenceRate: number;        // Pourcentage d'adhérence
  streakWeeks: number;          // Semaines consécutives
  weeksAnalyzed: number;        // Semaines analysées
  stabilityMessage: string;     // Message motivationnel
}
```

### Interface WeeklyChallenge
```typescript
interface WeeklyChallengeData {
  challengeType: 'sessions' | 'volume' | 'muscle_group';
  current: number;              // Progression actuelle
  target: number;               // Objectif à atteindre
  progress: number;             // 0-1 (pourcentage décimal)
  daysRemaining: number;        // Jours restants
  sessionsRemaining?: number;   // Sessions restantes (optionnel)
  challengeDescription: string; // Description du défi
  isCompleted?: boolean;        // Défi accompli
  specialMessage?: string;      // Message spécial
}
```

### Calculs KPI

#### Adhérence au planning
```typescript
// Taux d'adhérence
adherenceRate = (completedSessions / plannedSessions) * 100;

// Streak semaines (consécutives ≥ 75%)
for (let week of weeks) {
  const weekAdherence = (weekSessions / weekTarget) * 100;
  if (weekAdherence >= 75) streakWeeks++;
  else break;
}
```

#### Défi hebdomadaire
```typescript
// Progression
progress = Math.min(current / target, 1);

// Jours restants dans la semaine
daysRemaining = Math.ceil((endOfWeek - today) / (1000 * 60 * 60 * 24));
```

---

## 7. Thème et Design System

### Couleurs principales
```typescript
// Couleurs Gainizi
turquoise: '#4CC9F0'    // Couleur signature
rose: '#F72585'         // Accent énergique

// Couleurs thème
success: theme.colors.success      // Vert
warning: theme.colors.warning      // Orange
secondary: theme.colors.secondary  // Gris
```

### Typographie
```typescript
// Variants utilisés
heading: {              // Titres de section
  fontSize: 'xl',
  fontFamily: 'bold'
}

subheading: {           // Titres de carte
  fontSize: 'lg',
  fontFamily: 'bold'
}

body: {                 // Texte principal
  fontSize: 'md',
  fontFamily: 'medium'
}

caption: {              // Sous-titres
  fontSize: 'sm',
  fontFamily: 'regular'
}
```

### Espacements
```typescript
// Spacing scale
xs: 4px     // Petits espacements
sm: 8px     // Espacements moyens
md: 16px    // Espacements standards
lg: 24px    // Grands espacements
xl: 32px    // Très grands espacements
```

### Ombres et effets
```typescript
shadows: {
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  }
}

borderRadius: {
  lg: 16px,
  full: 999px
}
```

---

## 8. Performance et Optimisation

### React.memo
- Tous les composants utilisent `React.memo`
- `displayName` défini pour le debugging
- Props stables pour éviter les re-renders

### Mémorisation
- Calculs coûteux avec `useMemo`
- Callbacks avec `useCallback`
- Styles avec `useStyles()` hook

### Gestion d'état
- État minimal dans les composants
- Logique métier dans `useHomeData`
- Données calculées en amont

---

## 9. Tests et Validation

### Tests visuels
- Vérification des couleurs selon les seuils
- Validation des messages motivationnels
- Test des interactions tactiles

### Tests de données
- Validation des calculs KPI
- Test des cas limites (0%, 100%)
- Vérification de la cohérence des messages

### Tests d'accessibilité
- Contraste des couleurs
- Taille des zones tactiles
- Support des lecteurs d'écran

---

## 10. Maintenance et Évolution

### Extensibilité
- Nouveaux types de défis facilement ajoutables
- Messages motivationnels configurables
- Couleurs et thèmes personnalisables

### Localisation
- Support multilingue complet
- Messages traduits français/anglais
- Formats de dates et nombres localisés

### Monitoring
- Tracking des interactions utilisateur
- Métriques de performance
- Analyse de l'engagement

---

Ce guide fournit toutes les spécifications nécessaires pour reproduire fidèlement les cartes home Gainizi avec leur design, comportements et logique métier exacts.
