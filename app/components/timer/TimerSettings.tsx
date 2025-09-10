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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={styles.settingsTitle}>Réglages</Text>
            <TouchableOpacity onPress={() => { onClose(); haptics.impactLight(); }} style={styles.closeBtn}>
              <Text style={{ color: theme.colors.background.main, fontWeight: '700' }}>OK</Text>
            </TouchableOpacity>
          </View>

          {/* Prep row */}
          <TouchableOpacity style={styles.settingsRow} onPress={() => { setShowPrepPicker(true); haptics.selection(); }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.dot, { backgroundColor: '#FACC15' }]} />
              <Text style={styles.settingsLabel}>Préparation</Text>
            </View>
            <Text style={styles.settingsValue}>{formatDuration(prepTime)}</Text>
          </TouchableOpacity>

          {/* Work row */}
          <TouchableOpacity style={styles.settingsRow} onPress={() => { setShowWorkPicker(true); haptics.selection(); }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.dot, { backgroundColor: '#F97316' }]} />
              <Text style={styles.settingsLabel}>Travail</Text>
            </View>
            <Text style={styles.settingsValue}>{formatDuration(workTime)}</Text>
          </TouchableOpacity>

          {/* Rest row */}
          <TouchableOpacity style={styles.settingsRow} onPress={() => { setShowRestPicker(true); haptics.selection(); }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />
              <Text style={styles.settingsLabel}>Repos</Text>
            </View>
            <Text style={styles.settingsValue}>{formatDuration(restTime)}</Text>
          </TouchableOpacity>

          {/* Sets row */}
          <View style={styles.settingsRow}>
            <Text style={styles.settingsLabel}>Séries</Text>
            <View style={styles.rowActions}>
              <TouchableOpacity style={styles.stepperBtn} onPress={() => { onChangeSets(Math.max(1, sets - 1)); haptics.selection(); }}>
                <Minus size={18} color={theme.colors.text.primary} />
              </TouchableOpacity>
              <Text style={styles.settingsValue}>{sets}</Text>
              <TouchableOpacity style={styles.stepperBtn} onPress={() => { onChangeSets(sets + 1); haptics.selection(); }}>
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
    settingsOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    settingsCard: {
      backgroundColor: theme.colors.background.card,
      padding: theme.spacing.lg,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.2, shadowRadius: 8 }, android: { elevation: 12 } })
    },
    settingsTitle: { fontSize: theme.typography.fontSize.xl, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.text.primary },
    settingsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
    settingsLabel: { color: theme.colors.text.primary, fontFamily: theme.typography.fontFamily.semiBold, fontSize: theme.typography.fontSize.base, marginLeft: 8 },
    dot: { width: 10, height: 10, borderRadius: 5 },
    rowActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    settingsValue: { minWidth: 56, textAlign: 'center', color: theme.colors.text.primary, fontFamily: theme.typography.fontFamily.bold, fontSize: theme.typography.fontSize.base },
    stepperBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.background.button, alignItems: 'center', justifyContent: 'center' },
    closeBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: theme.colors.primary, borderRadius: 999 }
  });
