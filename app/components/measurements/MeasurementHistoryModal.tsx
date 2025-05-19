import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import { MeasurementKey } from './MeasurementBodyMap';
import { TranslationKey, MeasurementTranslationKey } from '@/translations';
import Modal from '@/app/components/ui/Modal';

interface Props {
  open: boolean;
  keyName: MeasurementKey | null;
  onClose: () => void;
  history: { date: string; value: number }[];
}

const MeasurementHistoryModal: React.FC<Props> = ({ open, keyName, onClose, history }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  // Détermine l'unité à afficher
  const getUnit = (keyName: string | null): string => {
    if (!keyName) return 'kg';
    return 'cm';
  };

  // Récupère le titre approprié
  const getTitle = (keyName: string | null): string => {
    if (!keyName) return t('workout.weight');
    return t(`measurements.${keyName}` as MeasurementTranslationKey);
  };

  // Formatage des valeurs pour éviter les valeurs extravagantes
  const formatValue = (value: number, keyName: string | null): number => {
    const decimals = keyName ? 0 : 1;
    return Number(value.toFixed(decimals));
  };

  return (
    <Modal
      visible={open}
      onClose={onClose}
      title={`${getTitle(keyName)} - ${t('measurements.history')}`}
      showCloseButton={true}
    >
      <FlatList
        data={history}
        keyExtractor={(item) => item.date}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={{ color: theme.colors.text.primary }}>{item.date}</Text>
            <Text style={{ color: theme.colors.text.primary }}>
              {formatValue(item.value, keyName)} {getUnit(keyName)}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: theme.colors.text.secondary }}>{t('measurements.noData')}</Text>
        }
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
});

export default MeasurementHistoryModal;
