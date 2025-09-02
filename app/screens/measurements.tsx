import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import Header from '@/app/components/layout/Header';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useTheme } from '@/app/hooks/useTheme';
import Text from '@/app/components/ui/Text';
import { Ruler } from 'lucide-react-native';
import { useMeasurements } from '@/app/hooks/useMeasurements';
import MeasurementBody, { MeasurementKey } from '@/app/components/measurements/MeasurementBodyMap';
import MeasurementModal from '@/app/components/measurements/MeasurementModal';
import MeasurementHistoryModal from '@/app/components/measurements/MeasurementHistoryModal';
import WeightModal from '@/app/components/measurements/WeightModal';
import MeasurementHistory from '@/app/components/measurements/MeasurementHistory';

// Measurement keys used across the UI
const MEASUREMENT_KEYS: MeasurementKey[] = [
  'neck',
  'shoulders',
  'chest',
  'arms',
  'forearms',
  'waist',
  'hips',
  'thighs',
  'calves'
];

export default function MeasurementsScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();

  const {
    measurements,
    weekDates,
    selectedDate,
    setSelectedDate,
    modal,
    openMeasurementModal,
    closeMeasurementModal,
    updateMeasurement,
    getHistory,
    historyModal,
    openHistoryModal,
    closeHistoryModal,
    getWeightHistory,
    weightHistory,
    openWeightHistoryModal,
    showWeightModal,
    openWeightModal,
    closeWeightModal,
    updateWeight,
    loading,
    allMeasurements
  } = useMeasurements();

  const [viewMode, setViewMode] = useState<'input' | 'history'>('input');

  useEffect(() => {
    setViewMode('input');
  }, [selectedDate]);

  const getMeasurementTranslationKey = (key: string) => `measurements.${key}`;

  const renderDateWeight = () => (
    <View style={styles.dateHeader}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
        {weekDates.map((date, index) => (
          <TouchableOpacity
            key={date}
            style={[styles.dateItem, selectedDate === date && styles.selectedDateItem]}
            onPress={() => setSelectedDate(date)}
          >
            <Text
              style={[
                styles.dateText,
                selectedDate === date && styles.selectedDateText
              ]}
            >
              {new Date(date).toLocaleDateString(undefined, {
                weekday: 'short',
                day: '2-digit'
              })}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.weightButton} onPress={openWeightModal}>
        <Ruler size={20} color={theme.colors.primary} />
        <Text style={styles.weightButtonText}>{t('measurements.weight')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderViewToggle = () => (
    <View style={styles.toggleContainer}>
      <TouchableOpacity
        style={[styles.toggleButton, viewMode === 'history' && styles.activeToggle]}
        onPress={() => setViewMode('history')}
      >
        <Text style={[styles.toggleText, viewMode === 'history' && styles.activeToggleText]}>
          {t('measurements.historyMode')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.toggleButton, viewMode === 'input' && styles.activeToggle]}
        onPress={() => setViewMode('input')}
      >
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
        points={MEASUREMENT_KEYS.map((key) => ({
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
      onAddMeasurement={(key) => {
        if (key === 'weight') {
          openWeightModal();
        } else {
          openMeasurementModal(key);
        }
      }}
    />
  );

  return (
    <View style={styles.container}>
      <Header title={t('measurements.title')} showBackButton={true} onBack={() => router.back()} />
      {renderViewToggle()}
      <ScrollView style={styles.content}>
        {viewMode === 'input' ? renderInputMode() : renderHistoryMode()}
      </ScrollView>
      {/* Modale de saisie des mesures */}
      <MeasurementModal
        open={modal.open}
        keyName={modal.key || ''}
        value={modal.key ? measurements.measurements[modal.key] : 0}
        onClose={closeMeasurementModal}
        onSave={(key: string, value: number) => updateMeasurement(key as MeasurementKey, value)}
        onShowHistory={(key: string) => openHistoryModal(key as MeasurementKey)}
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

const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.main
    },
    content: {
      flex: 1
    },
    dateHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.background.card,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.default
    },
    dateScroll: {
      flex: 1,
      marginRight: theme.spacing.md
    },
    dateItem: {
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      marginRight: theme.spacing.xs,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.background.main,
      borderWidth: 1,
      borderColor: theme.colors.border.default
    },
    selectedDateItem: {
      backgroundColor: theme.colors.primary + '20',
      borderColor: theme.colors.primary
    },
    dateText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.regular,
      color: theme.colors.text.primary
    },
    selectedDateText: {
      color: theme.colors.primary,
      fontFamily: theme.typography.fontFamily.semiBold
    },
    weightButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background.main,
      borderRadius: theme.borderRadius.full,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border.default
    },
    weightButtonText: {
      marginLeft: theme.spacing.xs,
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular
    },
    toggleContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background.card,
      padding: theme.spacing.xs,
      margin: theme.spacing.md,
      borderRadius: theme.borderRadius.full,
      borderWidth: 1,
      borderColor: theme.colors.border.default
    },
    toggleButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      alignItems: 'center',
      borderRadius: theme.borderRadius.full
    },
    activeToggle: {
      backgroundColor: theme.colors.primary + '20'
    },
    toggleText: {
      color: theme.colors.text.secondary,
      fontFamily: theme.typography.fontFamily.regular
    },
    activeToggleText: {
      color: theme.colors.primary,
      fontFamily: theme.typography.fontFamily.semiBold
    }
  });
};
