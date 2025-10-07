import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft, PlayCircle, Info, Shield, Activity } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/app/hooks/useTheme';
import Text from '@/app/components/ui/Text';

export default function ExerciseTutorialScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useStyles();
  const params = useLocalSearchParams<{ name?: string; key?: string; primaryMuscle?: string; secondaryMuscles?: string }>();

  const exerciseName = params.name || 'Exercise';
  const primaryMuscle = params.primaryMuscle || '';
  const secondaryMuscles = (params.secondaryMuscles || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color={theme.colors.text.primary} size={24} />
        </TouchableOpacity>
        <Text variant="heading" style={styles.title}>{exerciseName}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 48 }}>
        {/* Focus musculaire */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Activity size={22} color={theme.colors.primary} />
            <Text style={styles.cardTitle}>Focus musculaire</Text>
          </View>
          {primaryMuscle ? (
            <View style={styles.chipsRow}>
              <View style={[styles.chip, styles.chipPrimary]}>
                <Text style={styles.chipTextPrimary}>Principal: {primaryMuscle}</Text>
              </View>
              {secondaryMuscles.map((m) => (
                <View key={m} style={styles.chip}>
                  <Text style={styles.chipText}>Secondaire: {m}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.paragraph}>Groupes musculaires principaux et secondaires.</Text>
          )}
        </View>

        {/* Tutoriel */}
        <View style={styles.card}>
          <View style={styles.row}>
            <PlayCircle size={22} color={theme.colors.primary} />
            <Text style={styles.cardTitle}>Tutoriel</Text>
          </View>
          <Text style={styles.paragraph}>1) Positionnez-vous correctement: posture neutre, gainage léger.</Text>
          <Text style={styles.paragraph}>2) Amorçage contrôlé: démarrez le mouvement sans à-coups.</Text>
          <Text style={styles.paragraph}>3) Phase excentrique lente (2-3s), concentrique dynamique et contrôlée.</Text>
          <Text style={styles.paragraph}>4) Amplitude confortable: pleine amplitude si sans douleur.</Text>
          <Text style={styles.paragraph}>5) Verrouillage propre, pas d'hyper-extension.</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push({ pathname: '/screens/ExerciseDetails', params: { exercise: params.key || exerciseName } })}
          >
            <Text style={styles.primaryButtonText}>Voir les statistiques détaillées</Text>
          </TouchableOpacity>
        </View>

        {/* Conseils rapides */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Info size={22} color={theme.colors.primary} />
            <Text style={styles.cardTitle}>Conseils rapides</Text>
          </View>
          <Text style={styles.bullet}>• Echauffez-vous 5-10 minutes (mobilité + activation)</Text>
          <Text style={styles.bullet}>• Respiration: inspirez en descente, expirez à l'effort</Text>
          <Text style={styles.bullet}>• Tempo conseillé: 3-1-1 (excentrique-pause-concentrique)</Text>
          <Text style={styles.bullet}>• Stabilité: scapulas fixées, gainage engagé</Text>
        </View>

        {/* Sécurité */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Shield size={22} color={theme.colors.primary} />
            <Text style={styles.cardTitle}>Sécurité & erreurs fréquentes</Text>
          </View>
          <Text style={styles.bullet}>• Evitez le dos cambré excessif ou les épaules qui montent</Text>
          <Text style={styles.bullet}>• Ne sacrifiez pas la technique pour plus de charge</Text>
          <Text style={styles.bullet}>• Si douleur articulaire: réduisez l'amplitude/charge</Text>
          <Text style={styles.bullet}>• Utilisez un spotter ou sécurités en rack si nécessaire</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const useStyles = () => {
  const { theme } = useTheme();
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.main,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.default,
    },
    backButton: {
      padding: theme.spacing.sm,
    },
    title: {
      flex: 1,
      textAlign: 'center',
      color: theme.colors.text.primary,
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    card: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      ...theme.shadows.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    cardTitle: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
    },
    paragraph: {
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.md,
    },
    chipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    chip: {
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.background.button,
    },
    chipPrimary: {
      backgroundColor: theme.colors.primary + '1A',
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    chipText: {
      color: theme.colors.text.secondary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.sm,
    },
    chipTextPrimary: {
      color: theme.colors.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.sm,
    },
    bullet: {
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xs,
    },
    primaryButton: {
      marginTop: theme.spacing.sm,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.full,
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
    },
    primaryButtonText: {
      color: theme.colors.background.main,
      fontFamily: theme.typography.fontFamily.semiBold,
    },
  });
};
