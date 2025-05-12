import React, { useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import Header from '@/app/components/Header';
import { BarChart, Calendar as CalendarIcon, ChevronDown, ListPlus, Scale } from 'lucide-react-native';
import MeasurementBody, { MeasurementKey } from './MeasurementBodyMap';
import MeasurementModal from './MeasurementModal';
import MeasurementHistoryModal from './MeasurementHistoryModal';
import MeasurementHistory from './MeasurementHistory';
import WeightModal from './WeightModal';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from 'react-native-calendars';
import { MeasurementTranslationKey } from '@/translations';
import useMeasurements from '@/app/hooks/useMeasurements';

const MEASUREMENT_KEYS: MeasurementKey[] = [
  'neck', 'shoulders', 'chest', 'arms', 'forearms', 'waist', 'hips', 'thighs', 'calves'
];

const getMeasurementTranslationKey = (key: MeasurementKey): MeasurementTranslationKey => {
  return `measurements.${key}` as MeasurementTranslationKey;
};

// Les modes de vue disponibles
type ViewMode = 'history' | 'input';

export default function MeasurementsView() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<ViewMode>('history');
  const [modal, setModal] = useState<{ key: MeasurementKey | null, open: boolean }>({ key: null, open: false });
  const [historyModal, setHistoryModal] = useState<{ key: MeasurementKey | null, open: boolean }>({
    key: null,
    open: false
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [showWeightModal, setShowWeightModal] = useState(false);

  // Utiliser le hook centralisé
  const {
    measurements,
    allMeasurements,
    loading,
    error,
    updateMeasurement,
    updateWeight,
    setSelectedDate
  } = useMeasurements();

  const openMeasurementModal = (key: MeasurementKey) => setModal({ key, open: true });
  const closeMeasurementModal = () => setModal({ key: null, open: false });

  const openHistoryModal = (key: MeasurementKey) => setHistoryModal({ key, open: true });
  const closeHistoryModal = () => setHistoryModal({ key: null, open: false });

  const openWeightModal = () => setShowWeightModal(true);
  const closeWeightModal = () => setShowWeightModal(false);

  const openWeightHistoryModal = () => {
    setHistoryModal({ key: null, open: true });
  };

  const onCalendarDayPress = (day: { dateString: string }) => {
    setShowCalendar(false);
    setSelectedDate(day.dateString);
  };

  const getHistory = (key: MeasurementKey) =>
    allMeasurements
      .filter(m => m.measurements[key] > 0)
      .map(m => ({ date: m.date, value: m.measurements[key] }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getWeightHistory = () =>
    allMeasurements
      .filter(m => m.weight > 0)
      .map(m => ({ date: m.date, value: m.weight }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Styles
  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.main
    },
    content: {
      flex: 1
    },
    measurementInputContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 16,
      marginBottom: 8
    },
    inputCard: {
      flex: 1,
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: 12,
      marginHorizontal: 4,
      ...theme.shadows.sm
    },
    inputHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8
    },
    inputLabel: {
      marginLeft: 6,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
      fontSize: 14
    },
    dateDisplay: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 6
    },
    dateText: {
      color: theme.colors.text.primary,
      fontSize: 16
    },
    weightInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 2
    },
    weightInput: {
      flex: 1,
      color: theme.colors.text.primary,
      borderColor: theme.colors.border.default,
      borderWidth: 1,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: 12,
      paddingVertical: 6,
      textAlign: 'center',
      fontSize: 16
    },
    unitBadge: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginLeft: 8,
      alignItems: 'center',
      justifyContent: 'center'
    },
    unitText: {
      color: theme.colors.text.primary,
      fontWeight: 'bold',
      fontSize: 12
    },
    calendarOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.7)'
    },
    calendarModal: {
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: 24,
      width: 340,
      maxWidth: '90%'
    },
    calendarCloseButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      paddingVertical: 10,
      marginTop: 16,
      alignItems: 'center'
    },
    calendarCloseText: {
      color: theme.colors.text.primary,
      fontWeight: 'bold'
    },
    viewToggle: {
      flexDirection: 'row',
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.background.card,
      padding: 4,
      margin: 16,
      ...theme.shadows.sm
    },
    toggleButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: theme.borderRadius.full,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    },
    activeToggle: {
      backgroundColor: theme.colors.primary
    },
    toggleText: {
      color: theme.colors.text.secondary,
      marginLeft: 6
    },
    activeToggleText: {
      color: theme.colors.text.primary,
      fontWeight: 'bold'
    }
  }), [theme]);

  const renderDateWeight = () => (
    <View style={styles.measurementInputContainer}>
      {/* Date selection */}
      <TouchableOpacity
        style={styles.inputCard}
        onPress={() => setShowCalendar(true)}
      >
        <View style={styles.inputHeader}>
          <CalendarIcon size={18} color={theme.colors.primary} />
          <Text style={styles.inputLabel}>Date</Text>
        </View>
        <View style={styles.dateDisplay}>
          <Text style={styles.dateText}>
            {format(new Date(measurements.date), 'dd MMMM yyyy', { locale: fr })}
          </Text>
          <ChevronDown size={18} color={theme.colors.text.secondary} />
        </View>
      </TouchableOpacity>

      {/* Weight input */}
      <TouchableOpacity
        style={styles.inputCard}
        onPress={openWeightModal}
      >
        <View style={styles.inputHeader}>
          <Scale size={18} color={theme.colors.primary} />
          <Text style={styles.inputLabel}>{t('workout.weight')}</Text>
        </View>
        <View style={styles.dateDisplay}>
          <Text style={styles.dateText}>
            {measurements.weight > 0 ? `${measurements.weight} kg` : '-'}
          </Text>
          <ChevronDown size={18} color={theme.colors.text.secondary} />
        </View>
      </TouchableOpacity>

      {/* Calendar modal */}
      <Modal
        visible={showCalendar}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCalendar(false)}
      >
        <View style={styles.calendarOverlay}>
          <View style={styles.calendarModal}>
            <Calendar
              current={measurements.date}
              onDayPress={onCalendarDayPress}
              markedDates={{ [measurements.date]: { selected: true, selectedColor: theme.colors.primary } }}
              theme={{
                backgroundColor: theme.colors.background.card,
                calendarBackground: theme.colors.background.card,
                textSectionTitleColor: theme.colors.text.primary,
                selectedDayBackgroundColor: theme.colors.primary,
                selectedDayTextColor: theme.colors.text.primary,
                todayTextColor: theme.colors.primary,
                dayTextColor: theme.colors.text.primary,
                textDisabledColor: theme.colors.text.disabled,
                dotColor: theme.colors.primary,
                selectedDotColor: theme.colors.text.primary,
                arrowColor: theme.colors.primary,
                monthTextColor: theme.colors.text.primary,
                indicatorColor: theme.colors.primary
              }}
            />
            <TouchableOpacity
              style={styles.calendarCloseButton}
              onPress={() => setShowCalendar(false)}
            >
              <Text style={styles.calendarCloseText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );

  const renderViewToggle = () => (
    <View style={styles.viewToggle}>
      <TouchableOpacity
        style={[styles.toggleButton, viewMode === 'history' && styles.activeToggle]}
        onPress={() => setViewMode('history')}
      >
        <BarChart size={18} color={viewMode === 'history' ? theme.colors.text.primary : theme.colors.text.secondary} />
        <Text style={[styles.toggleText, viewMode === 'history' && styles.activeToggleText]}>
          {t('measurements.historyMode')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.toggleButton, viewMode === 'input' && styles.activeToggle]}
        onPress={() => setViewMode('input')}
      >
        <ListPlus size={18} color={viewMode === 'input' ? theme.colors.text.primary : theme.colors.text.secondary} />
        <Text style={[styles.toggleText, viewMode === 'input' && styles.activeToggleText]}>
          {t('measurements.inputMode')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderInputMode = () => (
    <>
      {renderDateWeight()}
      <MeasurementBody
        points={MEASUREMENT_KEYS.map(key => ({
          key,
          label: t(getMeasurementTranslationKey(key)),
          color: theme.colors.measurement[key]
        }))}
        values={measurements.measurements}
        onPointPress={openMeasurementModal}
      />
    </>
  );

  const renderHistoryMode = () => (
    <MeasurementHistory
      measurements={allMeasurements}
      isLoading={loading}
    />
  );

  return (
    <View style={styles.container}>
      <Header
        title={t('measurements.title')}
        showBackButton={false}
      />
      {renderViewToggle()}
      <ScrollView style={styles.content}>
        {viewMode === 'input' ? renderInputMode() : renderHistoryMode()}
      </ScrollView>
      {/* Modale de saisie des mesures */}
      <MeasurementModal
        open={modal.open}
        keyName={modal.key}
        value={modal.key ? measurements.measurements[modal.key] : 0}
        onClose={closeMeasurementModal}
        onSave={updateMeasurement}
        onShowHistory={openHistoryModal}
      />
      {/* Modale de saisie du poids */}
      <WeightModal
        open={showWeightModal}
        value={measurements.weight}
        onClose={closeWeightModal}
        onSave={updateWeight}
        onShowHistory={openWeightHistoryModal}
      />
      {/* Modale d'historique */}
      <MeasurementHistoryModal
        open={historyModal.open}
        keyName={historyModal.key}
        onClose={closeHistoryModal}
        history={historyModal.key ? getHistory(historyModal.key) : getWeightHistory()}
      />
    </View>
  );
} 
