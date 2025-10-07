import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Save, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import Text from '@/app/components/ui/Text';
import storageService from '@/app/services/storage';
import { muscleGroupKeys, MuscleGroupKey, getMuscleGroups } from '@/app/components/exercises';

// Supported kinds for custom exercises (subset of metadata used elsewhere)
const EXERCISE_KINDS = [
  'strength_press',
  'strength_pull',
  'strength_squat',
  'strength_hinge',
  'strength_core',
  'cardio_run',
  'cardio_bike',
  'cardio_row',
  'other',
] as const;

export default function ExerciseCustomEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ key?: string; muscleGroupLabel?: string }>();
  const editKey = params.key as string | undefined;
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = useStyles();

  const [name, setName] = useState('');
  const [primaryMuscle, setPrimaryMuscle] = useState<MuscleGroupKey | ''>('');
  const [secondaryMuscles, setSecondaryMuscles] = useState<MuscleGroupKey[]>([]);
  const [kind, setKind] = useState<typeof EXERCISE_KINDS[number]>('strength_press');
  const [defaultMet, setDefaultMet] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Picker modals
  const [primaryModalVisible, setPrimaryModalVisible] = useState(false);
  const [secondaryModalVisible, setSecondaryModalVisible] = useState(false);
  const [muscleSearch, setMuscleSearch] = useState('');

  // Type segmented control
  type MainType = 'strength' | 'cardio' | 'other';
  const [mainType, setMainType] = useState<MainType>('strength');
  const subtypes: Record<MainType, typeof EXERCISE_KINDS[number][]> = {
    strength: ['strength_press', 'strength_pull', 'strength_squat', 'strength_hinge', 'strength_core'],
    cardio: ['cardio_run', 'cardio_bike', 'cardio_row'],
    other: ['other'],
  };

  // Load existing if editing
  useEffect(() => {
    const load = async () => {
      if (!editKey) return;
      const list = await storageService.getCustomExercises();
      const ex = list.find((e) => e.key === editKey);
      if (ex) {
        setName(ex.name || '');
        setPrimaryMuscle(ex.primaryMuscle || '');
        setSecondaryMuscles(ex.secondaryMuscles || []);
        setKind(ex.kind || 'strength_press');
        setDefaultMet(ex.defaultMet ? String(ex.defaultMet) : '');
      }
    };
    load();
  }, [editKey]);

  // Preselect primary muscle from label passed by previous screen
  useEffect(() => {
    if (editKey) return; // don't override when editing existing
    const label = (params.muscleGroupLabel as string) || '';
    if (!label) return;
    const labels = getMuscleGroups(t as unknown as (key: string) => string);
    const idx = labels.findIndex((l) => l === label);
    if (idx >= 0) {
      const key = muscleGroupKeys[idx];
      setPrimaryMuscle(key);
    }
  }, [params.muscleGroupLabel, editKey, t]);

  const translatedMuscle = useCallback((key: MuscleGroupKey) => t(`muscleGroups.${key}` as any), [t]);

  const toggleSecondary = (m: MuscleGroupKey) => {
    setSecondaryMuscles((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  };

  const generateKey = (rawName: string) => {
    const slug = rawName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
    const ts = Date.now();
    return `custom_${slug}_${ts}`;
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Nom requis', "Merci d'indiquer un nom d'exercice");
      return;
    }
    if (!primaryMuscle) {
      Alert.alert('Muscle principal', 'Sélectionnez un muscle principal');
      return;
    }
    const payload = {
      key: editKey || generateKey(name),
      name: name.trim(),
      primaryMuscle,
      secondaryMuscles,
      kind,
      defaultMet: defaultMet ? Number(defaultMet) : undefined,
    };
    await storageService.saveCustomExercise(payload);
    Alert.alert('Enregistré', 'Exercice personnalisé sauvegardé');
    router.back();
  };

  const handleDelete = async () => {
    if (!editKey) return;
    Alert.alert('Supprimer', "Supprimer cet exercice ?", [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await storageService.deleteCustomExercise(editKey);
          router.back();
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <ArrowLeft color={theme.colors.text.primary} size={22} />
        </TouchableOpacity>
        <Text variant="heading" style={styles.title}>{editKey ? 'Modifier un exercice' : 'Nouvel exercice personnalisé'}</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 96 }}>
        {/* Name */}
        <Text style={styles.label}>Nom de l'exercice</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="ex: Développé haltères incliné"
          placeholderTextColor={theme.colors.text.secondary}
          style={styles.input}
        />

        {/* Primary muscle (picker) */}
        <Text style={styles.label}>Muscle principal</Text>
        <TouchableOpacity style={styles.selector} onPress={() => { setMuscleSearch(''); setPrimaryModalVisible(true); }}>
          <Text style={styles.selectorText}>
            {primaryMuscle ? translatedMuscle(primaryMuscle as MuscleGroupKey) : 'Choisir...'}
          </Text>
        </TouchableOpacity>

        {/* Secondary muscles (multi picker) */}
        <Text style={styles.label}>Muscles secondaires (optionnel)</Text>
        <TouchableOpacity style={styles.selector} onPress={() => { setMuscleSearch(''); setSecondaryModalVisible(true); }}>
          <Text style={styles.selectorText}>
            {secondaryMuscles.length ? `${secondaryMuscles.length} sélectionné(s)` : 'Ajouter...'}
          </Text>
        </TouchableOpacity>
        {!!secondaryMuscles.length && (
          <View style={styles.selectedChips}>
            {secondaryMuscles.map((m) => (
              <TouchableOpacity key={m} style={[styles.chip, styles.chipActive]} onPress={() => toggleSecondary(m)}>
                <Text style={[styles.chipText, styles.chipTextActive]}>{translatedMuscle(m)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Type segmented */}
        <Text style={styles.label}>Type</Text>
        <View style={styles.segmented}>
          {(['strength','cardio','other'] as MainType[]).map((mt) => (
            <TouchableOpacity key={mt} style={[styles.segment, mainType === mt && styles.segmentActive]} onPress={() => {
              setMainType(mt);
              setKind(subtypes[mt][0]);
            }}>
              <Text style={[styles.segmentText, mainType === mt && styles.segmentTextActive]}>{mt}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.chipsWrap}>
          {subtypes[mainType].map((k) => (
            <TouchableOpacity key={k} style={[styles.chip, kind === k && styles.chipActive]} onPress={() => setKind(k)}>
              <Text style={[styles.chipText, kind === k && styles.chipTextActive]}>{k}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Advanced */}
        <TouchableOpacity style={styles.advancedHeader} onPress={() => setShowAdvanced((v) => !v)}>
          <Text style={styles.label}>Options avancées</Text>
          <Text style={styles.advancedToggle}>{showAdvanced ? 'Masquer' : 'Afficher'}</Text>
        </TouchableOpacity>
        {showAdvanced && (
          <View>
            <Text style={styles.smallLabel}>MET par défaut (optionnel)</Text>
            <TextInput
              value={defaultMet}
              onChangeText={setDefaultMet}
              keyboardType="decimal-pad"
              placeholder="ex: 6.0"
              placeholderTextColor={theme.colors.text.secondary}
              style={styles.input}
            />
          </View>
        )}

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Enregistrer</Text>
        </TouchableOpacity>
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Primary muscle modal */}
      <Modal visible={primaryModalVisible} transparent animationType="fade" onRequestClose={() => setPrimaryModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.modalTitle}>Choisir le muscle principal</Text>
            <TextInput
              value={muscleSearch}
              onChangeText={setMuscleSearch}
              placeholder="Rechercher..."
              placeholderTextColor={theme.colors.text.secondary}
              style={styles.input}
            />
            <FlatList
              data={muscleGroupKeys.filter((m) => translatedMuscle(m).toLowerCase().includes(muscleSearch.toLowerCase()))}
              keyExtractor={(m) => m}
              renderItem={({ item }) => {
                const selected = primaryMuscle === item;
                return (
                  <TouchableOpacity style={[styles.modalRow, selected && styles.modalRowSelected]} onPress={() => { setPrimaryMuscle(item); setPrimaryModalVisible(false); }}>
                    <Text style={styles.modalRowText}>{translatedMuscle(item)}</Text>
                    <Text style={styles.modalRowSide}>{selected ? '✓' : ''}</Text>
                  </TouchableOpacity>
                );
              }}
              style={{ maxHeight: 320 }}
            />
            <View style={styles.modalActionsRow}>
              <View style={{ flex: 1 }} />
              <TouchableOpacity style={styles.modalClose} onPress={() => setPrimaryModalVisible(false)}>
                <Text style={styles.modalCloseText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Secondary muscles modal */}
      <Modal visible={secondaryModalVisible} transparent animationType="fade" onRequestClose={() => setSecondaryModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.modalTitle}>Ajouter des muscles secondaires</Text>
            <TextInput
              value={muscleSearch}
              onChangeText={setMuscleSearch}
              placeholder="Rechercher..."
              placeholderTextColor={theme.colors.text.secondary}
              style={styles.input}
            />
            <FlatList
              data={muscleGroupKeys.filter((m) => translatedMuscle(m).toLowerCase().includes(muscleSearch.toLowerCase()))}
              keyExtractor={(m) => m}
              renderItem={({ item }) => {
                const selected = secondaryMuscles.includes(item);
                const isPrimary = primaryMuscle === item;
                return (
                  <TouchableOpacity
                    style={[styles.modalRow, selected && styles.modalRowSelected, isPrimary && styles.modalRowDisabled]}
                    disabled={isPrimary}
                    onPress={() => toggleSecondary(item)}
                  >
                    <Text style={[styles.modalRowText, isPrimary && styles.modalRowTextDisabled]}>{translatedMuscle(item)}</Text>
                    <Text style={[styles.modalRowSide, isPrimary && styles.modalRowTextDisabled]}>{selected ? '✓' : (isPrimary ? '—' : '')}</Text>
                  </TouchableOpacity>
                );
              }}
              style={{ maxHeight: 320 }}
            />
            <View style={styles.modalActionsRow}>
              <TouchableOpacity style={styles.modalSecondaryBtn} onPress={() => setSecondaryMuscles([])}>
                <Text style={styles.modalSecondaryBtnText}>Effacer tout</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalClose} onPress={() => setSecondaryModalVisible(false)}>
                <Text style={styles.modalCloseText}>Terminer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.default,
    },
    iconBtn: {
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
    label: {
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
      marginTop: theme.spacing.md,
      fontFamily: theme.typography.fontFamily.semiBold,
    },
    input: {
      backgroundColor: theme.colors.background.input,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      color: theme.colors.text.primary,
    },
    chipsWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
    },
    chip: {
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.background.button,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
    },
    chipActive: {
      backgroundColor: theme.colors.primary + '22',
      borderColor: theme.colors.primary,
    },
    chipText: {
      color: theme.colors.text.secondary,
      fontFamily: theme.typography.fontFamily.regular,
    },
    chipTextActive: {
      color: theme.colors.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
    },
    saveBtn: {
      marginTop: theme.spacing.lg,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.full,
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
    },
    saveBtnText: {
      color: theme.colors.background.main,
      fontFamily: theme.typography.fontFamily.semiBold,
    },
    smallLabel: {
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xs,
      marginTop: theme.spacing.sm,
    },
    selector: {
      backgroundColor: theme.colors.background.input,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
      borderRadius: theme.borderRadius.full,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    selectorText: {
      color: theme.colors.text.primary,
    },
    selectedChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
    },
    segmented: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background.button,
      borderRadius: theme.borderRadius.full,
      padding: 4,
      marginBottom: theme.spacing.sm,
    },
    segment: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      alignItems: 'center',
      borderRadius: theme.borderRadius.full,
    },
    segmentActive: {
      backgroundColor: theme.colors.primary,
    },
    segmentText: {
      color: theme.colors.text.secondary,
      fontFamily: theme.typography.fontFamily.semiBold,
      textTransform: 'capitalize',
    },
    segmentTextActive: {
      color: theme.colors.text.primary,
    },
    advancedHeader: {
      marginTop: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    advancedToggle: {
      color: theme.colors.primary,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: theme.colors.background.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: theme.spacing.lg,
      maxHeight: '80%',
    },
    sheetHandle: {
      width: 40,
      height: 4,
      backgroundColor: theme.colors.text.secondary + '40',
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: theme.spacing.md,
    },
    modalTitle: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.lg,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
    modalActionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border.default,
    },
    modalSecondaryBtn: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.background.button,
      borderRadius: theme.borderRadius.full,
    },
    modalSecondaryBtnText: {
      color: theme.colors.text.secondary,
      fontFamily: theme.typography.fontFamily.regular,
    },
    modalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.default,
      borderRadius: theme.borderRadius.sm,
      marginVertical: 2,
    },
    modalRowSelected: {
      backgroundColor: theme.colors.primary + '11',
      borderColor: theme.colors.primary + '30',
    },
    modalRowDisabled: {
      backgroundColor: theme.colors.background.button + '50',
      opacity: 0.6,
    },
    modalRowText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular,
    },
    modalRowTextDisabled: {
      color: theme.colors.text.secondary,
    },
    modalRowSide: {
      color: theme.colors.primary,
      fontFamily: theme.typography.fontFamily.bold,
      fontSize: theme.typography.fontSize.lg,
      marginLeft: theme.spacing.md,
    },
    modalClose: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.full,
    },
    modalCloseText: {
      color: theme.colors.background.main,
      fontFamily: theme.typography.fontFamily.semiBold,
    },
  });
};
