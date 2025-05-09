import React, { useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { VictoryAxis, VictoryChart, VictoryLine, VictoryScatter, VictoryTheme } from 'victory-native';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTheme } from '@/app/hooks/useTheme';
import { useTranslation } from '@/app/hooks/useTranslation';
import { MeasurementKey } from './MeasurementBodyMap';
import { BarChart3, Clock } from 'lucide-react-native';
import { WorkoutDateUtils } from '@/app/types/workout';

type Measurement = {
  date: string;
  weight: number;
  measurements: Record<MeasurementKey, number>;
};

interface MeasurementHistoryProps {
  measurements: Measurement[];
}

const MeasurementHistory: React.FC<MeasurementHistoryProps> = ({
                                                                 measurements
                                                               }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [selectedMeasurement, setSelectedMeasurement] = useState<MeasurementKey | 'weight' | null>(null);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);

  const sortedMeasurements = useMemo(() => {
    return [...measurements].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [measurements]);

  const getLastMeasurementValue = (key: MeasurementKey | 'weight') => {
    if (sortedMeasurements.length === 0) return { value: 0, date: '' };

    const today = WorkoutDateUtils.getDatePart(new Date().toISOString());

    const measurementsSortedByDateProximity = [...sortedMeasurements].sort((a, b) => {
      const diffA = Math.abs(new Date(a.date).getTime() - new Date(today).getTime());
      const diffB = Math.abs(new Date(b.date).getTime() - new Date(today).getTime());
      return diffA - diffB;
    });

    if (key === 'weight') {
      const withValue = measurementsSortedByDateProximity.find(m => m.weight > 0);
      return withValue
        ? { value: withValue.weight, date: withValue.date }
        : { value: 0, date: '' };
    }

    const withValue = measurementsSortedByDateProximity.find(m => m.measurements[key] > 0);
    return withValue
      ? { value: withValue.measurements[key], date: withValue.date }
      : { value: 0, date: '' };
  };

  const getHistoryData = (key: MeasurementKey | 'weight') => {
    let data;
    if (key === 'weight') {
      data = sortedMeasurements
        .filter(m => m.weight > 0)
        .map(m => ({
          x: new Date(m.date),
          y: m.weight,
          date: m.date
        }));
    } else {
      data = sortedMeasurements
        .filter(m => m.measurements[key] > 0)
        .map(m => ({
          x: new Date(m.date),
          y: m.measurements[key],
          date: m.date
        }));
    }

    return data.sort((a, b) => a.x.getTime() - b.x.getTime());
  };

  type ProgressStatus = 'positive' | 'negative' | 'neutral';

  const getProgressVisuals = (status: ProgressStatus) => {
    switch (status) {
      case 'positive':
        return {
          color: theme.colors.success,
          bgColor: theme.colors.success + '20',
          symbol: '▲'
        };
      case 'negative':
        return {
          color: theme.colors.error,
          bgColor: theme.colors.error + '20',
          symbol: '▼'
        };
      case 'neutral':
      default:
        return {
          color: theme.colors.text.secondary,
          bgColor: theme.colors.border.default + '40',
          symbol: '•'
        };
    }
  };

  // Options de toutes les mesures
  const measurementOptions = useMemo(() => {
    const options: Array<{ key: MeasurementKey | 'weight', label: string }> = [
      { key: 'weight', label: t('workout.weightKg') }
    ];

    ['neck', 'shoulders', 'chest', 'arms', 'forearms', 'waist', 'hips', 'thighs', 'calves'].forEach(key => {
      options.push({
        key: key as MeasurementKey,
        label: (t as any)(`measurements.${key}`)
      });
    });

    return options;
  }, [t]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
  };

  const formatShortDate = (date: Date) => {
    return format(date, 'dd/MM', { locale: fr });
  };

  const formatDateLabel = (dateString: string) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
  };

  const getMeasurementLabel = (key: MeasurementKey | 'weight') => {
    if (key === 'weight') {
      return t('workout.weightKg');
    }
    return t(`measurements.${key}`);
  };

  const formatValue = (value: number, key: MeasurementKey | 'weight') => {
    const decimal = key === 'weight' ? 1 : 0;
    return value.toFixed(decimal);
  };

  const getUnit = (key: MeasurementKey | 'weight') => {
    return key === 'weight' ? 'kg' : 'cm';
  };

  const showHistoryModal = (key: MeasurementKey | 'weight') => {
    setSelectedMeasurement(key);
    setHistoryModalVisible(true);
  };

  const getChartDomain = (key: MeasurementKey | 'weight', data: Array<{ x: Date, y: number }>) => {
    if (data.length === 0) return { min: 0, max: 100 };

    const values = data.map(d => d.y);
    const min = Math.min(...values);
    const max = Math.max(...values);

    const range = max - min;
    const padding = Math.max(range * 0.1, 1);

    if (key === 'weight') {
      return { 
        min: Math.max(min - padding, 0),
        max: Math.min(max + padding, 200)
      };
    } else {
      return { 
        min: Math.max(min - padding, 0),
        max: Math.min(max + padding, 200)
      };
    }
  };

  const getProgressData = (key: MeasurementKey | 'weight') => {
    const data = getHistoryData(key);
    if (data.length < 2) return { value: 0, status: 'neutral' as const };

    const lastIndex = data.length - 1;
    const currentValue = data[lastIndex].y;
    const previousValue = data[lastIndex - 1].y;

    const diff = currentValue - previousValue;

    const threshold = key === 'weight' ? 0.1 : 1; // 0.1kg pour le poids, 1cm pour les mesures

    if (Math.abs(diff) < threshold) {
      return { value: 0, status: 'neutral' as const };
    }

    // Pour le poids, une diminution est positive, pour les mesures, une augmentation est positive
    const isPositive = key === 'weight' ? diff < 0 : diff > 0;

    return {
      value: Math.abs(diff),
      status: isPositive ? 'positive' as const : 'negative' as const
    };
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 8
    },
    cardGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      padding: 12
    },
    card: {
      width: '48%',
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: 0,
      marginBottom: 16,
      overflow: 'hidden',
      ...theme.shadows.sm
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: theme.colors.background.button + '30',
      borderTopLeftRadius: theme.borderRadius.lg,
      borderTopRightRadius: theme.borderRadius.lg
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
      width: '70%'
    },
    historyButton: {
      width: 26,
      height: 26,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.background.main,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.sm
    },
    cardDivider: {
      height: 1,
      backgroundColor: theme.colors.border.default,
      width: '100%',
      opacity: 0.5
    },
    cardContent: {
      padding: 12
    },
    dataRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 10
    },
    leftColumn: {
      flex: 0.5,
      alignItems: 'flex-start',
      justifyContent: 'center'
    },
    rightColumn: {
      flex: 0.5,
      alignItems: 'flex-end',
      justifyContent: 'center'
    },
    valueContainer: {
      alignItems: 'center',
      marginBottom: 6
    },
    valueRow: {
      flexDirection: 'row',
      alignItems: 'baseline'
    },
    value: {
      fontSize: 26,
      fontWeight: 'bold',
      color: theme.colors.primary
    },
    unit: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginLeft: 4,
      fontWeight: '500'
    },
    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginBottom: 4,
      backgroundColor: theme.colors.background.button + '40',
      paddingVertical: 3,
      paddingHorizontal: 6,
      borderRadius: theme.borderRadius.sm
    },
    dateLabel: {
      fontSize: 10,
      color: theme.colors.text.secondary,
      marginLeft: 4
    },
    labelLastUpdate: {
      fontSize: 9,
      color: theme.colors.text.disabled,
      textAlign: 'center',
      marginBottom: 4
    },
    chartWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 5,
      paddingHorizontal: 2
    },
    trendIndicator: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: theme.colors.background.button,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.sm
    },
    trendText: {
      fontSize: 12,
      fontWeight: 'bold'
    },
    progressBadge: {
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: theme.borderRadius.sm,
      marginTop: 2,
      alignSelf: 'flex-end'
    },
    progressText: {
      fontSize: 12,
      textAlign: 'center',
      fontWeight: '500'
    },
    progressSubText: {
      fontSize: 8,
      textAlign: 'center',
      color: theme.colors.text.secondary,
      fontStyle: 'italic'
    },
    viewMore: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end'
    },
    viewMoreText: {
      fontSize: 14,
      color: theme.colors.primary,
      marginRight: 4
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16
    },
    modalContent: {
      width: '90%',
      maxWidth: 340,
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: 16,
      maxHeight: '80%',
      ...theme.shadows.lg
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text.primary
    },
    modalDivider: {
      height: 1,
      backgroundColor: theme.colors.border.default,
      width: '100%',
      marginVertical: 8
    },
    closeButton: {
      padding: 8,
      backgroundColor: theme.colors.background.button,
      borderRadius: theme.borderRadius.full,
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center'
    },
    chartContainer: {
      height: 220,
      marginVertical: 8,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center'
    },
    progressContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginBottom: 12
    },
    progressValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.primary // Default color, will be overridden in component
    },
    progressLabel: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginLeft: 4
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      height: 200
    },
    emptyStateText: {
      color: theme.colors.text.secondary,
      fontSize: 16,
      textAlign: 'center'
    },
    emptyCard: {
      alignItems: 'center',
      justifyContent: 'center',
      height: 120
    },
    unitLabel: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginBottom: 8
    },
    progressBadgeText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: theme.colors.text.primary
    }
  });

  if (measurements.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>{t('measurements.noHistoryData')}</Text>
        </View>
      </View>
    );
  }

  const renderMeasurementCard = (option: { key: MeasurementKey | 'weight', label: string }) => {
    const key = option.key;
    const lastData = getLastMeasurementValue(key);
    const progress = getProgressData(key);
    const historyData = getHistoryData(key);
    const unit = getUnit(key);

    const progressVisuals = getProgressVisuals(progress.status);

    const domain = getChartDomain(key, historyData);

    return (
      <View key={key} style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{option.label}</Text>
          <TouchableOpacity style={styles.historyButton} onPress={() => showHistoryModal(key)}>
            <BarChart3 size={14} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardContent}>
          <View style={styles.dataRow}>
            <View style={styles.leftColumn}>
              <View style={styles.valueRow}>
                <Text style={styles.value}>{formatValue(lastData.value, key)}</Text>
                <Text style={styles.unit}>{unit}</Text>
              </View>
            </View>

            <View style={styles.rightColumn}>
              {lastData.date ? (
                <View style={styles.dateRow}>
                  <Clock size={10} color={theme.colors.text.secondary} />
                  <Text style={styles.dateLabel}>{formatDateLabel(lastData.date)}</Text>
                </View>
              ) : null}

              {/* Affichage de la progression UNIQUEMENT pour les mensurations (pas pour le poids) */}
              {historyData.length >= 2 && key !== 'weight' && (
                <View style={[
                  styles.progressBadge, 
                  { backgroundColor: progressVisuals.bgColor }
                ]}>
                  <Text style={[
                    styles.progressText, 
                    { color: progressVisuals.color }
                  ]}>
                    {progressVisuals.symbol} {progress.value > 0 
                      ? `${formatValue(progress.value, key)} ${unit}` 
                      : "Stable"}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {historyData.length > 1 ? (
            <View style={styles.chartWrapper}>
              <VictoryChart
                padding={{ top: 5, bottom: 20, left: 25, right: 5 }}
                height={90}
                width={140}
                theme={VictoryTheme.material}
                domainPadding={{ y: [2, 2] }}
              >
                <VictoryLine
                  data={historyData}
                  style={{
                    data: { 
                      stroke: theme.colors.primary, 
                      strokeWidth: 2 
                    }
                  }}
                  animate={{ duration: 300, easing: "exp" }}
                  interpolation="monotoneX"
                />
                <VictoryScatter
                  data={historyData}
                  size={3}
                  style={{
                    data: { 
                      fill: theme.colors.background.card, 
                      stroke: theme.colors.primary, 
                      strokeWidth: 1.5
                    }
                  }}
                />
                <VictoryAxis
                  style={{
                    axis: { stroke: 'transparent' },
                    ticks: { stroke: 'transparent' },
                    tickLabels: { fill: 'transparent' },
                    grid: { stroke: 'transparent' }
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  domain={[domain.min, domain.max]}
                  tickFormat={() => ''}
                  style={{
                    axis: { stroke: 'transparent' },
                    grid: { 
                      stroke: theme.colors.border.default, 
                      strokeDasharray: '2,2',
                      strokeOpacity: 0.5
                    },
                    ticks: { stroke: 'transparent' },
                    tickLabels: { fill: 'transparent' }
                  }}
                  tickCount={3}
                />
              </VictoryChart>

              {/* Indicateur de tendance uniquement pour les mensurations */}
              {key !== 'weight' && (
                <View style={[
                  styles.trendIndicator,
                  { backgroundColor: progressVisuals.bgColor }
                ]}>
                  <Text style={[
                    styles.trendText, 
                    { color: progressVisuals.color }
                  ]}>
                    {progress.status === 'positive' ? '↗' : progress.status === 'negative' ? '↘' : '↔'}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyStateText}>{t('measurements.noData')}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderHistoryModal = () => {
    if (!selectedMeasurement) return null;

    const chartData = getHistoryData(selectedMeasurement);
    const progressData = getProgressData(selectedMeasurement);
    const progressColor = progressData.status === 'positive'
      ? theme.colors.primary
      : theme.colors.text.warning;

    let dateRangeText = '';
    if (chartData.length >= 2) {
      const lastIndex = chartData.length - 1;
      const currentDate = format(chartData[lastIndex].x, 'dd/MM', { locale: fr });
      const previousDate = format(chartData[lastIndex - 1].x, 'dd/MM', { locale: fr });
      dateRangeText = `(${previousDate} → ${currentDate})`;
    }

    return (
      <Modal
        visible={historyModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setHistoryModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalContent}
            activeOpacity={1}
            onPress={e => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {getMeasurementLabel(selectedMeasurement)} - {t('measurements.history')}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setHistoryModalVisible(false)}
              >
                <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: 'bold' }}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalDivider} />

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 8 }}
            >
              {/* Affichage de la progression uniquement pour les mensurations */}
              {chartData.length > 1 && selectedMeasurement !== 'weight' && (
                <View style={styles.progressContainer}>
                  <Text
                    style={{
                      ...styles.progressValue,
                      color: progressColor
                    }}
                  >
                    {progressData.status === 'positive' ? '+' : '-'}{progressData.value.toFixed(1)}
                    {getUnit(selectedMeasurement)}
                  </Text>
                  <Text style={styles.progressLabel}>
                    {dateRangeText}
                  </Text>
                </View>
              )}

              {chartData.length > 0 ? (
                <View style={styles.chartContainer}>
                  <Text style={styles.unitLabel}>
                    {getUnit(selectedMeasurement)}
                  </Text>
                  <VictoryChart
                    theme={VictoryTheme.material}
                    height={180}
                    width={260}
                    padding={{ top: 5, bottom: 30, left: 35, right: 5 }}
                    domainPadding={{ y: [5, 5] }}
                    scale={{ x: 'time' }}
                  >
                    <VictoryAxis
                      tickFormat={(date: Date) => formatShortDate(date)}
                      style={{
                        axis: { stroke: theme.colors.text.secondary },
                        ticks: { stroke: theme.colors.text.secondary, size: 3 },
                        tickLabels: {
                          fill: theme.colors.text.secondary,
                          fontSize: 7,
                          angle: -30,
                          textAnchor: 'end'
                        }
                      }}
                    />
                    <VictoryAxis
                      dependentAxis
                      tickFormat={(value: number) => `${value}`}
                      style={{
                        axis: { stroke: theme.colors.text.secondary },
                        ticks: { stroke: theme.colors.text.secondary, size: 3 },
                        tickLabels: {
                          fill: theme.colors.text.secondary,
                          fontSize: 7
                        }
                      }}
                    />
                    <VictoryLine
                      data={chartData}
                      style={{
                        data: {
                          stroke: theme.colors.primary,
                          strokeWidth: 2
                        }
                      }}
                      interpolation="monotoneX"
                    />
                    <VictoryScatter
                      data={chartData}
                      size={5}
                      style={{
                        data: {
                          fill: theme.colors.background.card,
                          stroke: theme.colors.primary,
                          strokeWidth: 2
                        }
                      }}
                    />
                  </VictoryChart>
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>
                    {t('measurements.noDataForSelection')}
                  </Text>
                </View>
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.cardGrid}>
        {measurementOptions.map(option => renderMeasurementCard(option))}
      </View>
      {renderHistoryModal()}
    </ScrollView>
  );
};

export default MeasurementHistory; 
