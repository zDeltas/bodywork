import React, { useState } from 'react';
import { Modal, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import Text from '@/app/components/ui/Text';
import { useTheme } from '@/app/hooks/useTheme';
import { Minus, Plus } from 'lucide-react-native';
import { TimerPickerModal } from 'react-native-timer-picker';
import { LinearGradient } from 'expo-linear-gradient';
import useHaptics from '@/app/hooks/useHaptics';

export interface TimerSettingsProps {
  visible: boolean;
  onClose: () => void;
  prepTime: number;
  workTime: number;
  restTime: number;
  sets: number;
  onChangePrep: (seconds: number) => void;
  onChangeWork: (seconds: number) => void;
  onChangeRest: (seconds: number) => void;
  onChangeSets: (sets: number) => void;
}

export default function TimerSettings(props: TimerSettingsProps) {
  const { visible, onClose, prepTime, workTime, restTime, sets, onChangePrep, onChangeWork, onChangeRest, onChangeSets } = props;
  const { theme } = useTheme();
  const haptics = useHaptics();

  const styles = useStyles(theme);

  const [showPrepPicker, setShowPrepPicker] = useState(false);
  const [showWorkPicker, setShowWorkPicker] = useState(false);
  const [showRestPicker, setShowRestPicker] = useState(false);

  const toHMS = (total: number) => ({ hours: Math.floor(total / 3600), minutes: Math.floor((total % 3600) / 60), seconds: total % 60 });

  const commonPickerStyles = {
    backgroundColor: theme.colors.background.card,
    pickerContainer: { backgroundColor: theme.colors.background.card },
    pickerItem: { color: theme.colors.text.primary, fontSize: theme.typography.fontSize['3xl'] },
    pickerLabel: { color: theme.colors.text.primary, fontSize: theme.typography.fontSize.xl, right: -20 },
    theme: 'dark' as const,
    pickerLabelContainer: { width: 60 },
    pickerItemContainer: { width: 150 },
    confirmButton: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.settingsOverlay}>
        <View style={styles.settingsCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg }}>
            <Text style={styles.settingsTitle}>Réglages</Text>
            <TouchableOpacity onPress={() => { onClose(); haptics.impactLight(); }} style={styles.closeBtn}>
              <Text style={{ color: theme.colors.background.main, fontWeight: '700' }}>OK</Text>
            </TouchableOpacity>
          </View>

          {/* Prep row */}
          <TouchableOpacity style={styles.settingsRow} onPress={() => { setShowPrepPicker(true); haptics.selection(); }} activeOpacity={0.7}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.dot, { backgroundColor: theme.colors.warning }]} />
              <Text style={styles.settingsLabel}>Préparation</Text>
            </View>
            <Text style={styles.settingsValue}>{formatDuration(prepTime)}</Text>
          </TouchableOpacity>

          {/* Work row */}
          <TouchableOpacity style={styles.settingsRow} onPress={() => { setShowWorkPicker(true); haptics.selection(); }} activeOpacity={0.7}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
              <Text style={styles.settingsLabel}>Travail</Text>
            </View>
            <Text style={styles.settingsValue}>{formatDuration(workTime)}</Text>
          </TouchableOpacity>

          {/* Rest row */}
          <TouchableOpacity style={styles.settingsRow} onPress={() => { setShowRestPicker(true); haptics.selection(); }} activeOpacity={0.7}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.dot, { backgroundColor: theme.colors.info }]} />
              <Text style={styles.settingsLabel}>Repos</Text>
            </View>
            <Text style={styles.settingsValue}>{formatDuration(restTime)}</Text>
          </TouchableOpacity>

          {/* Sets row */}
          <View style={styles.settingsRow}>
            <Text style={styles.settingsLabel}>Séries</Text>
            <View style={styles.rowActions}>
              <TouchableOpacity style={styles.stepperBtn} onPress={() => { onChangeSets(Math.max(1, sets - 1)); haptics.selection(); }} activeOpacity={0.7}>
                <Minus size={18} color={theme.colors.text.primary} />
              </TouchableOpacity>
              <Text style={styles.settingsValue}>{sets}</Text>
              <TouchableOpacity style={styles.stepperBtn} onPress={() => { onChangeSets(sets + 1); haptics.selection(); }} activeOpacity={0.7}>
                <Plus size={18} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Pickers */}
      <TimerPickerModal
        visible={showPrepPicker}
        setIsVisible={setShowPrepPicker}
        onCancel={() => setShowPrepPicker(false)}
        onConfirm={({ hours, minutes, seconds }) => { onChangePrep(hours * 3600 + minutes * 60 + seconds); setShowPrepPicker(false); }}
        cancelButtonText={'Annuler'}
        confirmButtonText={'OK'}
        closeOnOverlayPress={true}
        modalTitle={'Préparation'}
        styles={commonPickerStyles}
        hideHours={true}
        padWithNItems={1}
        minuteLabel="min"
        secondLabel="sec"
        LinearGradient={LinearGradient}
        Haptics={haptics}
        initialValue={toHMS(prepTime)}
      />

      <TimerPickerModal
        visible={showWorkPicker}
        setIsVisible={setShowWorkPicker}
        onCancel={() => setShowWorkPicker(false)}
        onConfirm={({ hours, minutes, seconds }) => { onChangeWork(hours * 3600 + minutes * 60 + seconds); setShowWorkPicker(false); }}
        cancelButtonText={'Annuler'}
        confirmButtonText={'OK'}
        closeOnOverlayPress={true}
        modalTitle={'Travail'}
        styles={commonPickerStyles}
        hideHours={true}
        padWithNItems={1}
        minuteLabel="min"
        secondLabel="sec"
        LinearGradient={LinearGradient}
        Haptics={haptics}
        initialValue={toHMS(workTime)}
      />

      <TimerPickerModal
        visible={showRestPicker}
        setIsVisible={setShowRestPicker}
        onCancel={() => setShowRestPicker(false)}
        onConfirm={({ hours, minutes, seconds }) => { onChangeRest(hours * 3600 + minutes * 60 + seconds); setShowRestPicker(false); }}
        cancelButtonText={'Annuler'}
        confirmButtonText={'OK'}
        closeOnOverlayPress={true}
        modalTitle={'Repos'}
        styles={commonPickerStyles}
        hideHours={true}
        padWithNItems={1}
        minuteLabel="min"
        secondLabel="sec"
        LinearGradient={LinearGradient}
        Haptics={haptics}
        initialValue={toHMS(restTime)}
      />
    </Modal>
  );
}

function formatDuration(totalSeconds: number) {
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}

const useStyles = (theme: any) =>
  StyleSheet.create({
    settingsOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end'
    },
    settingsCard: {
      backgroundColor: theme.colors.background.card,
      padding: theme.spacing.xl,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      ...theme.shadows.xl
    },
    settingsTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.bold,
      color: theme.colors.text.primary
    },
    settingsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.default
    },
    settingsLabel: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.base,
      marginLeft: theme.spacing.sm
    },
    dot: {
      width: 12,
      height: 12,
      borderRadius: theme.borderRadius.full
    },
    rowActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md
    },
    settingsValue: {
      minWidth: 64,
      textAlign: 'center',
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.bold,
      fontSize: theme.typography.fontSize.base
    },
    stepperBtn: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.background.button,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.sm
    },
    closeBtn: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.full,
      ...theme.shadows.sm
    }
  });
