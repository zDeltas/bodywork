# Guide UI/UX Design System - Gainizi

**Documentation des patterns UI/UX réutilisables**  
*Basé sur les écrans Home et Profile*

---

## Table des matières
1. [Principes de Design](#principes-de-design)
2. [Composants de Base](#composants-de-base)
3. [Patterns de Cartes](#patterns-de-cartes)
4. [Animations](#animations)
5. [Statistiques & Badges](#statistiques--badges)
6. [Navigation & Actions](#navigation--actions)
7. [Couleurs & Thème](#couleurs--thème)
8. [Typographie](#typographie)
9. [Espacement & Layout](#espacement--layout)

---

## 1. Principes de Design

### Philosophie Générale
- **Minimalisme Sophistiqué** : Réduction des couleurs vives, hiérarchie basée sur typographie et espacement
- **Approche Émotionnelle** : Transformer les données en ressentis (fierté, motivation, satisfaction)
- **Feedback Visuel Immédiat** : Animations fluides, transitions douces
- **Cohérence Visuelle** : Usage cohérent des couleurs et espacements

### Règles d'Or
1. ✅ **Toujours animer** les entrées de composants (fade-in, spring)
2. ✅ **Utiliser des badges** pour les informations importantes (streak, niveau, statut)
3. ✅ **Icônes colorées** dans des conteneurs avec fond transparent (couleur + '15')
4. ✅ **Bordures gauches** pour highlight les cartes importantes
5. ✅ **Haptic feedback** sur toutes les interactions

---

## 2. Composants de Base

### 2.1. StatCard (Carte de Statistique)

**Usage** : Afficher une statistique importante avec animation

```typescript
interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
}

const StatCard = ({ icon, value, label, color }: StatCardProps) => {
  const scaleAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.statCard, { transform: [{ scale: scaleAnim }] }]}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
        {icon}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
};
```

**Styles**
```typescript
statCard: {
  flex: 1,
  backgroundColor: theme.colors.background.card,
  borderRadius: theme.borderRadius.lg,
  padding: theme.spacing.md,
  alignItems: 'center',
  ...theme.shadows.sm
},
statIconContainer: {
  width: 44,
  height: 44,
  borderRadius: theme.borderRadius.full,
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing.sm
},
statValue: {
  fontSize: theme.typography.fontSize.xl,
  fontFamily: theme.typography.fontFamily.bold,
  color: theme.colors.text.primary,
  marginBottom: theme.spacing.xs / 2
},
statLabel: {
  fontSize: theme.typography.fontSize.xs,
  fontFamily: theme.typography.fontFamily.regular,
  color: theme.colors.text.secondary,
  textAlign: 'center'
}
```

**Exemples d'utilisation**
```typescript
<StatCard
  icon={<Dumbbell size={22} color={theme.colors.primary} />}
  value={15}
  label={t('profile.stats.thisWeek')}
  color={theme.colors.primary}
/>
```

---

### 2.2. FeatureCard (Carte de Fonctionnalité)

**Usage** : Élément de navigation avec icône, titre, description

```typescript
<TouchableOpacity 
  style={styles.featureCard}
  onPress={() => {
    haptics.impactLight();
    router.push('/screens/stats');
  }}
>
  <View style={[styles.featureIconContainer, { backgroundColor: theme.colors.secondary + '15' }]}>
    <TrendingUp size={24} color={theme.colors.secondary} />
  </View>
  <View style={styles.featureContent}>
    <Text style={styles.featureTitle}>{t('stats.title')}</Text>
    <Text style={styles.featureDesc}>{t('profile.statsDesc')}</Text>
  </View>
  <ChevronRight size={20} color={theme.colors.text.tertiary} />
</TouchableOpacity>
```

**Styles**
```typescript
featureCard: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: theme.colors.background.card,
  borderRadius: theme.borderRadius.lg,
  padding: theme.spacing.md,
  marginBottom: theme.spacing.sm,
  ...theme.shadows.sm
},
featureIconContainer: {
  width: 48,
  height: 48,
  borderRadius: theme.borderRadius.md,
  alignItems: 'center',
  justifyContent: 'center'
},
featureContent: {
  flex: 1,
  marginLeft: theme.spacing.md,
  marginRight: theme.spacing.sm
},
featureTitle: {
  fontSize: theme.typography.fontSize.base,
  fontFamily: theme.typography.fontFamily.semiBold,
  color: theme.colors.text.primary,
  marginBottom: theme.spacing.xs / 2
},
featureDesc: {
  fontSize: theme.typography.fontSize.sm,
  fontFamily: theme.typography.fontFamily.regular,
  color: theme.colors.text.secondary
}
```

---

### 2.3. ProfileHeader (Header de Profil)

**Usage** : Header utilisateur avec avatar, badges dynamiques

```typescript
<TouchableOpacity style={styles.profileHeader}>
  <View style={styles.profileHeaderContent}>
    <View style={styles.avatarContainer}>
      <Image source={{ uri: user.picture }} style={styles.avatarXLarge} />
      {stats.streak > 0 && (
        <View style={styles.streakBadge}>
          <Flame size={14} color={theme.colors.warning} />
          <Text style={styles.streakText}>{stats.streak}</Text>
        </View>
      )}
    </View>
    <View style={styles.profileHeaderInfo}>
      <Text style={styles.profileName}>{displayName}</Text>
      <Text style={styles.profileStatus}>{displayStatus}</Text>
      {stats.totalSessions > 0 && (
        <View style={styles.levelBadge}>
          <Zap size={14} color={theme.colors.warning} />
          <Text style={styles.levelText}>{t('profile.level')} {level}</Text>
        </View>
      )}
    </View>
  </View>
  <ChevronRight size={24} color={theme.colors.text.secondary} />
</TouchableOpacity>
```

**Styles Clés**
```typescript
profileHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: theme.colors.background.card,
  borderRadius: theme.borderRadius.xl,
  padding: theme.spacing.xl,
  marginBottom: theme.spacing.lg,
  ...theme.shadows.lg
},
avatarXLarge: {
  width: 72,
  height: 72,
  borderRadius: 36,
  borderWidth: 3,
  borderColor: theme.colors.primary + '30'
},
streakBadge: {
  position: 'absolute',
  bottom: -4,
  right: -4,
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: theme.colors.background.card,
  borderRadius: theme.borderRadius.full,
  paddingHorizontal: theme.spacing.xs,
  paddingVertical: 2,
  gap: 2,
  borderWidth: 2,
  borderColor: theme.colors.background.main,
  ...theme.shadows.sm
},
levelBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: theme.colors.warning + '15',
  alignSelf: 'flex-start',
  paddingHorizontal: theme.spacing.sm,
  paddingVertical: theme.spacing.xs / 2,
  borderRadius: theme.borderRadius.full,
  gap: theme.spacing.xs / 2,
  marginTop: theme.spacing.xs
}
```

---

## 3. Patterns de Cartes

### 3.1. Carte Standard
```typescript
<View style={styles.standardCard}>
  {/* Contenu */}
</View>

// Style
standardCard: {
  backgroundColor: theme.colors.background.card,
  borderRadius: theme.borderRadius.lg,
  padding: theme.spacing.md,
  ...theme.shadows.sm
}
```

### 3.2. Carte Highlight (avec bordure gauche)
```typescript
<TouchableOpacity style={[styles.featureCard, styles.highlightCard]}>
  {/* Contenu */}
</TouchableOpacity>

// Style
highlightCard: {
  borderLeftWidth: 3,
  borderLeftColor: theme.colors.secondary
}
```

### 3.3. Carte avec Badge
```typescript
<TouchableOpacity style={[styles.featureCard, styles.challengeCard]}>
  {/* Contenu */}
  <View style={styles.newBadge}>
    <Text style={styles.newBadgeText}>NEW</Text>
  </View>
</TouchableOpacity>

// Styles
challengeCard: {
  borderLeftWidth: 3,
  borderLeftColor: theme.colors.warning,
  position: 'relative'
},
newBadge: {
  backgroundColor: theme.colors.warning,
  paddingHorizontal: theme.spacing.sm,
  paddingVertical: theme.spacing.xs / 2,
  borderRadius: theme.borderRadius.full,
  position: 'absolute',
  top: theme.spacing.md,
  right: theme.spacing.md
}
```

### 3.4. Grille de Statistiques
```typescript
<View style={styles.statsGrid}>
  <StatCard {...props1} />
  <StatCard {...props2} />
  <StatCard {...props3} />
</View>

// Style
statsGrid: {
  flexDirection: 'row',
  gap: theme.spacing.md,
  marginBottom: theme.spacing.xl
}
```

### 3.5. Cartes Sociales Horizontales
```typescript
<View style={styles.socialRow}>
  <TouchableOpacity style={styles.socialCard}>
    <Instagram size={28} color="#E4405F" />
    <Text style={styles.socialLabel}>{t('profile.instagram')}</Text>
  </TouchableOpacity>
  {/* Autres cartes */}
</View>

// Styles
socialRow: {
  flexDirection: 'row',
  gap: theme.spacing.md
},
socialCard: {
  flex: 1,
  backgroundColor: theme.colors.background.card,
  borderRadius: theme.borderRadius.lg,
  padding: theme.spacing.lg,
  alignItems: 'center',
  gap: theme.spacing.sm,
  ...theme.shadows.sm
}
```

---

## 4. Animations

### 4.1. Fade-in (Entrée d'écran)
```typescript
const fadeAnim = useState(new Animated.Value(0))[0];

useEffect(() => {
  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 600,
    useNativeDriver: true
  }).start();
}, []);

// Usage
<Animated.ScrollView style={[styles.content, { opacity: fadeAnim }]}>
  {/* Contenu */}
</Animated.ScrollView>
```

### 4.2. Spring (Carte de statistique)
```typescript
const scaleAnim = useState(new Animated.Value(0))[0];

useEffect(() => {
  Animated.spring(scaleAnim, {
    toValue: 1,
    friction: 8,
    tension: 40,
    useNativeDriver: true
  }).start();
}, []);

// Usage
<Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
  {/* Contenu */}
</Animated.View>
```

### 4.3. Pulsation (Bouton CTA)
```typescript
const pulseAnim = useState(new Animated.Value(1))[0];

useEffect(() => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.05,
        duration: 1000,
        useNativeDriver: true
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true
      })
    ])
  ).start();
}, []);
```

---

## 5. Statistiques & Badges

### 5.1. Calcul du Streak
```typescript
const calculateStreak = (workouts: Workout[]) => {
  const sessionsByDate = new Map<string, boolean>();
  workouts.forEach(w => {
    const date = w.date.split('T')[0];
    sessionsByDate.set(date, true);
  });

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const sortedDates = Array.from(sessionsByDate.keys()).sort().reverse();
  
  for (let i = 0; i < sortedDates.length; i++) {
    const sessionDate = new Date(sortedDates[i]);
    sessionDate.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === streak) {
      streak++;
    } else if (daysDiff > streak) {
      break;
    }
  }
  
  return streak;
};
```

### 5.2. Badge de Streak
```typescript
{streak > 0 && (
  <View style={styles.streakBadge}>
    <Flame size={14} color={theme.colors.warning} />
    <Text style={styles.streakText}>{streak}</Text>
  </View>
)}
```

### 5.3. Badge de Niveau
```typescript
const level = Math.floor(totalSessions / 10) + 1;

{totalSessions > 0 && (
  <View style={styles.levelBadge}>
    <Zap size={14} color={theme.colors.warning} />
    <Text style={styles.levelText}>{t('profile.level')} {level}</Text>
  </View>
)}
```

---

## 6. Navigation & Actions

### 6.1. Navigation avec Haptic
```typescript
<TouchableOpacity 
  style={styles.card}
  onPress={() => {
    haptics.impactLight();
    router.push('/screens/target');
  }}
  activeOpacity={0.7}
>
  {/* Contenu */}
</TouchableOpacity>
```

### 6.2. Actions Rapides
```typescript
<View style={styles.quickActions}>
  <TouchableOpacity style={styles.actionButton} onPress={action1}>
    <Icon size={24} color={theme.colors.primary} />
    <Text style={styles.actionLabel}>{label1}</Text>
  </TouchableOpacity>
  {/* Autres actions */}
</View>
```

---

## 7. Couleurs & Thème

### 7.1. Couleurs Gainizi
```typescript
const colors = {
  primary: '#4CC9F0',      // Turquoise
  secondary: '#F72585',    // Rose
  success: '#10B981',      // Vert
  warning: '#F59E0B',      // Orange/Jaune
  error: '#EF4444'         // Rouge
};
```

### 7.2. Transparence pour Fonds d'Icônes
```typescript
// Toujours ajouter '15' pour 15% d'opacité
backgroundColor: theme.colors.primary + '15'
backgroundColor: theme.colors.success + '15'
backgroundColor: theme.colors.warning + '15'
```

### 7.3. Couleurs de Texte
```typescript
text: {
  primary: '#FFFFFF',     // Texte principal
  secondary: '#9CA3AF',   // Texte secondaire
  tertiary: '#6B7280'     // Texte tertiaire
}
```

---

## 8. Typographie

### 8.1. Hiérarchie
```typescript
// Titre de section
fontSize: theme.typography.fontSize.base,
fontFamily: theme.typography.fontFamily.bold,
color: theme.colors.text.primary

// Titre de carte
fontSize: theme.typography.fontSize.base,
fontFamily: theme.typography.fontFamily.semiBold,
color: theme.colors.text.primary

// Description
fontSize: theme.typography.fontSize.sm,
fontFamily: theme.typography.fontFamily.regular,
color: theme.colors.text.secondary

// Valeur de statistique
fontSize: theme.typography.fontSize.xl,
fontFamily: theme.typography.fontFamily.bold,
color: theme.colors.text.primary

// Label de statistique
fontSize: theme.typography.fontSize.xs,
fontFamily: theme.typography.fontFamily.regular,
color: theme.colors.text.secondary
```

---

## 9. Espacement & Layout

### 9.1. Marges Standards
```typescript
// Entre sections majeures
marginBottom: theme.spacing.xl * 1.5  // ~36px

// Entre cartes
marginBottom: theme.spacing.sm       // ~8px

// Entre grille de stats et section
marginBottom: theme.spacing.xl       // ~24px

// Padding de carte
padding: theme.spacing.md            // ~12px

// Padding de header
padding: theme.spacing.xl            // ~24px
```

### 9.2. Gap dans Flexbox
```typescript
// Grille de statistiques
gap: theme.spacing.md                // ~12px

// Cartes sociales
gap: theme.spacing.md                // ~12px

// Badge avec icône
gap: theme.spacing.xs / 2            // ~2px
```

### 9.3. ScrollView Pattern
```typescript
<Animated.ScrollView 
  style={[styles.content, { opacity: fadeAnim }]} 
  contentContainerStyle={styles.contentContainer}
>
  {/* Contenu */}
</Animated.ScrollView>

// Styles
content: {
  flex: 1
},
contentContainer: {
  padding: theme.spacing.lg,
  paddingBottom: 100
}
```

---

## Checklist de Création d'Écran

Lors de la création d'un nouvel écran, vérifier :

- [ ] Animation fade-in sur le ScrollView
- [ ] Haptic feedback sur toutes les interactions
- [ ] Icônes avec fond transparent coloré (color + '15')
- [ ] Ombres appropriées (sm/md/lg selon importance)
- [ ] Border radius cohérent (lg pour cartes, xl pour headers)
- [ ] Hiérarchie typographique claire
- [ ] Statistiques avec animations spring
- [ ] Badges positionnés correctement (absolute si overlay)
- [ ] Navigation avec activeOpacity={0.7}
- [ ] useMemo pour calculs coûteux
- [ ] useCallback pour fonctions passées en props
- [ ] Traductions pour tous les textes

---

## Exemples Complets

### Écran avec Statistiques
```typescript
export default function Screen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const haptics = useHaptics();
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true
    }).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header title={t('screen.title')} />
      <Animated.ScrollView 
        style={[styles.content, { opacity: fadeAnim }]}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Statistiques */}
        <View style={styles.statsGrid}>
          <StatCard {...} />
          <StatCard {...} />
          <StatCard {...} />
        </View>

        {/* Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('section.title')}</Text>
          <TouchableOpacity style={styles.featureCard} onPress={...}>
            {/* Contenu */}
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}
```

---

**Version** : 1.0  
**Dernière mise à jour** : 2025-10-20  
**Auteurs** : Équipe Gainizi
