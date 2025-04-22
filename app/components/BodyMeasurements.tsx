import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Inter_400Regular, Inter_600SemiBold, useFonts } from '@expo-google-fonts/inter';
import Svg, { Line } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Body from 'react-native-body-highlighter';
import { VictoryAxis, VictoryChart, VictoryLine, VictoryTheme } from 'victory-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Calendar } from 'react-native-calendars';
import { useTranslation } from '@/hooks/useTranslation';

interface Measurement {
  date: string;
  weight: number;
  measurements: {
    chest: number;
    waist: number;
    hips: number;
    arms: number;
    forearms: number;
    shoulders: number;
    thighs: number;
    calves: number;
    neck: number;
  };
}

type MeasurementKey = keyof Measurement['measurements'];

interface MeasurementPoint {
  label: string;
  key: MeasurementKey;
  color: string;
  position: {
    x: number;
    y: number;
    side: 'left' | 'right';
    labelX?: number;
    labelY?: number;
    measurementLine?: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    };
  };
}

interface HistoryData {
  date: string;
  value: number;
}

// Initial values
const initialWindowWidth = Dimensions.get('window').width;
const initialBodyWidth = initialWindowWidth * 1.8;
const initialBodyHeight = initialBodyWidth * 0.8;

export default function BodyMeasurements() {
  const [measurements, setMeasurements] = useState<Measurement>({
    date: new Date().toISOString().split('T')[0],
    weight: 0,
    measurements: {
      chest: 0,
      waist: 0,
      hips: 0,
      arms: 0,
      forearms: 0,
      shoulders: 0,
      thighs: 0,
      calves: 0,
      neck: 0
    }
  });

  const { t } = useTranslation();

  const [allMeasurements, setAllMeasurements] = useState<Measurement[]>([]);
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male');
  const [inputValue, setInputValue] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<MeasurementPoint | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState<HistoryData[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Responsive dimensions
  const [windowWidth, setWindowWidth] = useState(initialWindowWidth);
  const [bodyWidth, setBodyWidth] = useState(initialBodyWidth);
  const [bodyHeight, setBodyHeight] = useState(initialBodyHeight);

  // Update dimensions when screen size changes
  useEffect(() => {
    const updateDimensions = ({ window }: { window: { width: number; height: number } }) => {
      const newWindowWidth = window.width;
      const newBodyWidth = newWindowWidth * 1.8;
      const newBodyHeight = newBodyWidth * 0.8;

      setWindowWidth(newWindowWidth);
      setBodyWidth(newBodyWidth);
      setBodyHeight(newBodyHeight);
    };

    const subscription = Dimensions.addEventListener('change', updateDimensions);

    return () => {
      subscription.remove();
    };
  }, []);

  const rotationValue = useSharedValue(0);


  useEffect(() => {
    const loadMeasurements = async () => {
      try {
        const stored = await AsyncStorage.getItem('bodyMeasurements');
        if (stored) {
          const allStoredMeasurements = JSON.parse(stored);
          setAllMeasurements(allStoredMeasurements);

          const measurementForDate = allStoredMeasurements.find(
            (m: Measurement) => m.date === selectedDate
          );

          if (measurementForDate) {
            setMeasurements(measurementForDate);
          } else if (allStoredMeasurements.length > 0) {
            const sortedMeasurements = [...allStoredMeasurements].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            setMeasurements(sortedMeasurements[0]);
            setSelectedDate(sortedMeasurements[0].date);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des mesures:', error);
      }
    };
    loadMeasurements();
  }, [selectedDate]);

  const measurementPoints: MeasurementPoint[] = useMemo(() => [
    {
      label: 'Cou',
      key: 'neck',
      color: '#4ade80',
      position: {
        x: bodyWidth * 0.20,
        y: bodyHeight * 0.15,
        side: 'right',
        measurementLine: {
          x1: bodyWidth * 0.26,
          y1: bodyHeight * 0.18,
          x2: bodyWidth * 0.30,
          y2: bodyHeight * 0.18
        }
      }
    },
    {
      label: 'Épaules',
      key: 'shoulders',
      color: '#4ade80',
      position: {
        x: bodyWidth * 0.20,
        y: bodyHeight * 0.23,
        side: 'right',
        measurementLine: {
          x1: bodyWidth * 0.19,
          y1: bodyHeight * 0.22,
          x2: bodyWidth * 0.37,
          y2: bodyHeight * 0.22
        }
      }
    },
    {
      label: 'Poitrine',
      key: 'chest',
      color: '#4ade80',
      position: {
        x: bodyWidth * 0.28,
        y: bodyHeight * 0.3,
        side: 'right',
        measurementLine: {
          x1: bodyWidth * 0.22,
          y1: bodyHeight * 0.28,
          x2: bodyWidth * 0.335,
          y2: bodyHeight * 0.28
        }
      }
    },
    {
      label: 'Bras',
      key: 'arms',
      color: '#818cf8',
      position: {
        x: bodyWidth * 0.22,
        y: bodyHeight * 0.3,
        side: 'left',
        measurementLine: {
          x1: bodyWidth * 0.18,
          y1: bodyHeight * 0.3,
          x2: bodyWidth * 0.22,
          y2: bodyHeight * 0.3
        }
      }
    },
    {
      label: 'Avant-bras',
      key: 'forearms',
      color: '#818cf8',
      position: {
        x: bodyWidth * 0.19,
        y: bodyHeight * 0.42,
        side: 'left',
        measurementLine: {
          x1: bodyWidth * 0.15,
          y1: bodyHeight * 0.39,
          x2: bodyWidth * 0.19,
          y2: bodyHeight * 0.39
        }
      }
    },
    {
      label: 'Taille',
      key: 'waist',
      color: '#4ade80',
      position: {
        x: bodyWidth * 0.28,
        y: bodyHeight * 0.38,
        side: 'right',
        measurementLine: {
          x1: bodyWidth * 0.22,
          y1: bodyHeight * 0.38,
          x2: bodyWidth * 0.34,
          y2: bodyHeight * 0.38
        }
      }
    },
    {
      label: 'Hanches',
      key: 'hips',
      color: '#4ade80',
      position: {
        x: bodyWidth * 0.28,
        y: bodyHeight * 0.45,
        side: 'right',
        measurementLine: {
          x1: bodyWidth * 0.22,
          y1: bodyHeight * 0.45,
          x2: bodyWidth * 0.34,
          y2: bodyHeight * 0.45
        }
      }
    },
    {
      label: 'Cuisses',
      key: 'thighs',
      color: '#fbbf24',
      position: {
        x: bodyWidth * 0.26,
        y: bodyHeight * 0.55,
        side: 'left',
        measurementLine: {
          x1: bodyWidth * 0.21,
          y1: bodyHeight * 0.55,
          x2: bodyWidth * 0.274,
          y2: bodyHeight * 0.55
        }
      }
    },
    {
      label: 'Mollets',
      key: 'calves',
      color: '#fbbf24',
      position: {
        x: bodyWidth * 0.26,
        y: bodyHeight * 0.75,
        side: 'left',
        measurementLine: {
          x1: bodyWidth * 0.214,
          y1: bodyHeight * 0.75,
          x2: bodyWidth * 0.26,
          y2: bodyHeight * 0.75
        }
      }
    }
  ], [bodyWidth, bodyHeight]);

  const adjustPointPositions = useCallback((points: MeasurementPoint[]) => {
    const adjustedPoints = [...points];
    const MIN_VERTICAL_SPACING = 40;
    const BUTTON_HEIGHT = 32;

    const leftPoints = adjustedPoints.filter(p => p.position?.side === 'left');
    const rightPoints = adjustedPoints.filter(p => p.position?.side === 'right');

    const sortedLeftPoints = [...leftPoints].sort((a, b) => {
      const posA = a.position;
      const posB = b.position;
      if (!posA || !posB) return 0;
      return posA.y - posB.y;
    });

    const sortedRightPoints = [...rightPoints].sort((a, b) => {
      const posA = a.position;
      const posB = b.position;
      if (!posA || !posB) return 0;
      return posA.y - posB.y;
    });

    let currentY = bodyHeight * 0.15;
    for (let i = 0; i < sortedLeftPoints.length; i++) {
      const point = sortedLeftPoints[i];
      const pos = point.position;
      if (!pos) continue;

      pos.labelX = windowWidth * 0.05;

      pos.labelY = currentY;
      currentY += BUTTON_HEIGHT + MIN_VERTICAL_SPACING;
    }

    currentY = bodyHeight * 0.1;
    for (let i = 0; i < sortedRightPoints.length; i++) {
      const point = sortedRightPoints[i];
      const pos = point.position;
      if (!pos) continue;

      pos.labelX = windowWidth * 0.8;

      pos.labelY = currentY;
      currentY += BUTTON_HEIGHT + MIN_VERTICAL_SPACING;
    }

    return [...sortedLeftPoints, ...sortedRightPoints];
  }, [bodyWidth, bodyHeight, windowWidth]);

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold
  });

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${rotationValue.value}deg` }]
  }));

  const visiblePoints = measurementPoints.filter(point =>
    point.position !== undefined
  );

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Date invalide';
      }

      const formattedDate = date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return 'Date invalide';
    }
  };

  const capitalizedDate = formatDate(selectedDate);

  const updateMeasurement = (key: MeasurementKey, value: string) => {
    const numValue = parseFloat(value) || 0;
    const updatedMeasurements = {
      ...measurements,
      measurements: {
        ...measurements.measurements,
        [key]: numValue
      }
    };
    setMeasurements(updatedMeasurements);
    setInputValue(value);
    saveMeasurements(updatedMeasurements);
  };

  const saveMeasurements = async (updatedMeasurements: Measurement) => {
    try {
      console.log('Saving measurements:', updatedMeasurements);
      const stored = await AsyncStorage.getItem('bodyMeasurements');
      let storedMeasurements = stored ? JSON.parse(stored) : [];

      const existingIndex = storedMeasurements.findIndex(
        (m: Measurement) => m.date === updatedMeasurements.date
      );

      if (existingIndex >= 0) {
        const existingMeasurements = storedMeasurements[existingIndex].measurements;
        storedMeasurements[existingIndex] = {
          ...updatedMeasurements,
          measurements: {
            ...existingMeasurements,
            ...updatedMeasurements.measurements
          }
        };
      } else {
        storedMeasurements.push(updatedMeasurements);
      }

      storedMeasurements.sort(
        (a: Measurement, b: Measurement) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      await AsyncStorage.setItem('bodyMeasurements', JSON.stringify(storedMeasurements));
      setAllMeasurements(storedMeasurements);
      console.log('Measurements saved successfully:', storedMeasurements);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleWeightChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setMeasurements(prev => ({
      ...prev,
      weight: numValue
    }));
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setShowDatePicker(false);

    const existingMeasurement = allMeasurements.find(m => m.date === date);
    if (!existingMeasurement) {
      const newMeasurement: Measurement = {
        date: date,
        weight: 0,
        measurements: {
          chest: 0,
          waist: 0,
          hips: 0,
          arms: 0,
          forearms: 0,
          shoulders: 0,
          thighs: 0,
          calves: 0,
          neck: 0
        }
      };
      setMeasurements(newMeasurement);
      saveMeasurements(newMeasurement);
    }
  };

  const handleMeasurementPointPress = (point: MeasurementPoint) => {
    setSelectedPoint(point);
    setInputValue(measurements.measurements[point.key] > 0 ?
      measurements.measurements[point.key].toString() : '');
    setShowModal(true);
  };

  const handleBodyPartPress = (bodyPart: any) => {
    const muscleSlug = bodyPart.slug;
    const point = measurementPoints.find(p => {
      const slugToKey: Record<string, MeasurementKey> = {
        'arms': 'arms',
        'chest': 'chest',
        'deltoids': 'shoulders',
        'quadriceps': 'thighs',
        'calves': 'calves',
        'neck': 'neck',
        'forearm': 'forearms',
        'abs': 'waist',
        'gluteal': 'hips'
      };

      return slugToKey[muscleSlug as string] === p.key;
    });

    if (point) {
      handleMeasurementPointPress(point);
    }
  };

  const handleModalSave = () => {
    if (selectedPoint) {
      const numValue = parseFloat(inputValue) || 0;
      const updatedMeasurements = {
        ...measurements,
        measurements: {
          ...measurements.measurements,
          [selectedPoint.key]: numValue
        }
      };
      setMeasurements(updatedMeasurements);
      saveMeasurements(updatedMeasurements);
    }
    setShowModal(false);
  };

  const loadHistoryData = (key: MeasurementKey) => {
    console.log('Loading history for:', key);
    console.log('All measurements:', allMeasurements);

    const history = allMeasurements
      .map(m => ({
        date: m.date,
        value: m.measurements[key] || 0
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    console.log('Filtered history:', history);
    setHistoryData(history);
    setShowHistory(true);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.dateSelector}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>{capitalizedDate}</Text>
        </TouchableOpacity>

        <View style={styles.weightContainer}>
          <TextInput
            style={[styles.weightValue, { minWidth: 80 }]}
            value={measurements.weight > 0 ? measurements.weight.toString() : ''}
            onChangeText={handleWeightChange}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#666"
            onBlur={() => saveMeasurements(measurements)}
          />
          <Text style={styles.weightLabel}>kg</Text>
        </View>
      </View>

      {/* Body visualization */}
      <View style={[styles.bodyContainer, { height: bodyHeight }]}>
        <Animated.View style={[styles.silhouette, containerStyle]}>
          <Body
            gender={selectedGender}
            data={[]}
            scale={1.5}
            onBodyPartPress={handleBodyPartPress}
          />
        </Animated.View>

        {/* Measurement points */}
        <Svg width={windowWidth} height={bodyHeight} style={StyleSheet.absoluteFill}>
          {adjustPointPositions(visiblePoints).map((point, index) => {
            const position = point.position;
            if (!position) return null;

            return (
              <React.Fragment key={index}>
                {position.measurementLine && position.labelX && position.labelY && (
                  <>
                    <Line
                      x1={position.measurementLine.x1}
                      y1={position.measurementLine.y1}
                      x2={position.measurementLine.x2}
                      y2={position.measurementLine.y2}
                      stroke={point.color}
                      strokeWidth="2"
                      strokeDasharray="3,3"
                    />

                    <Line
                      x1={(position.measurementLine.x1 + position.measurementLine.x2) / 2}
                      y1={position.measurementLine.y1}
                      x2={position.labelX + (position.side === 'left' ? 40 : 0)}
                      y2={position.labelY}
                      stroke={point.color}
                      strokeWidth="2"
                      strokeDasharray="3,3"
                    />
                  </>
                )}
              </React.Fragment>
            );
          })}
        </Svg>

        {/* Interactive touch areas for the body points */}
        {adjustPointPositions(visiblePoints).map((point, index) => {
          const position = point.position;
          if (!position) return null;

          return (
            <TouchableOpacity
              key={`touch-${index}`}
              style={{
                position: 'absolute',
                left: position.x - 15,
                top: position.y - 15,
                width: 30,
                height: 30,
                borderRadius: 15,
                zIndex: 2
              }}
              onPress={() => handleMeasurementPointPress(point)}
            />
          );
        })}

        {/* Measurement buttons */}
        {adjustPointPositions(visiblePoints).map((point, index) => {
          const position = point.position;
          if (!position || position.labelX === undefined || position.labelY === undefined) return null;

          const value = measurements.measurements[point.key];

          return (
            <TouchableOpacity
              key={`label-${index}`}
              style={[
                styles.measurementLabel,
                {
                  left: position.labelX,
                  top: position.labelY - 15,
                  marginBottom: 10
                }
              ]}
              onPress={() => handleMeasurementPointPress(point)}
            >
              <View style={[styles.measurementValue, { borderColor: point.color }]}>
                <Text style={[styles.measurementText, { color: point.color }]}>
                  {value > 0 ? (value <= 999 ? value : `${value} cm`) : '•'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Measurement input modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
        statusBarTranslucent
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowModal(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={[
                styles.modalTitle,
                selectedPoint ? { color: selectedPoint.color } : {}
              ]}>
                {selectedPoint ? selectedPoint.label : ''}
              </Text>
            </View>

            <TextInput
              style={[
                styles.modalInput,
                selectedPoint ? { borderColor: selectedPoint.color, borderWidth: 2 } : {}
              ]}
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#666"
              autoFocus
              selectTextOnFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalButtonText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleModalSave}
              >
                <Text style={styles.modalButtonText}>Enregistrer</Text>
              </TouchableOpacity>

              {selectedPoint && allMeasurements.length > 1 && (
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalHistoryButton]}
                  onPress={() => {
                    setShowModal(false);
                    loadHistoryData(selectedPoint.key);
                  }}
                >
                  <Text style={styles.modalButtonText}>Historique</Text>
                </TouchableOpacity>
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={showHistory}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowHistory(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.historyModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Historique {selectedPoint ? selectedPoint.label : ''}
              </Text>
            </View>

            {historyData.length > 1 ? (
              <View style={styles.chartContainer}>
                <VictoryChart
                  theme={VictoryTheme.material}
                  height={300}
                  width={windowWidth * 0.8}
                  padding={{ top: 50, bottom: 50, left: 50, right: 50 }}
                  scale={{ x: 'time' }}
                >
                  <VictoryAxis
                    tickFormat={(date) => {
                      const d = new Date(date);
                      return `${d.getDate()}/${d.getMonth() + 1}`;
                    }}
                    style={{
                      axis: { stroke: '#ccc' },
                      tickLabels: { fill: '#ccc', fontSize: 10 }
                    }}
                  />
                  <VictoryAxis
                    dependentAxis
                    tickFormat={(value) => `${value}cm`}
                    style={{
                      axis: { stroke: '#ccc' },
                      tickLabels: { fill: '#ccc', fontSize: 10 }
                    }}
                  />
                  <VictoryLine
                    data={historyData}
                    x="date"
                    y="value"
                    style={{
                      data: {
                        stroke: selectedPoint ? selectedPoint.color : '#fd8f09',
                        strokeWidth: 2
                      }
                    }}
                    interpolation="natural"
                  />
                </VictoryChart>
              </View>
            ) : (
              <Text style={styles.noDataText}>
                {historyData.length === 0 ? 'Aucune donnée disponible' : 'Pas assez de données pour afficher un graphique'}
              </Text>
            )}

            <TouchableOpacity
              style={[styles.modalButton, styles.modalCloseButton]}
              onPress={() => setShowHistory(false)}
            >
              <Text style={styles.modalButtonText}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date picker modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.datePickerContent]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner une date</Text>
            </View>

            <Calendar
              current={selectedDate}
              onDayPress={(day: { dateString: string; }) => handleDateChange(day.dateString)}
              markedDates={
                allMeasurements.reduce((acc, measurement) => {
                  acc[measurement.date] = {
                    marked: true,
                    dotColor: '#fd8f09'
                  };
                  if (measurement.date === selectedDate) {
                    acc[measurement.date] = {
                      ...acc[measurement.date],
                      selected: true,
                      selectedColor: '#fd8f09'
                    };
                  }
                  return acc;
                }, { [selectedDate]: { selected: true, selectedColor: '#fd8f09' } } as Record<string, any>)
              }
              theme={{
                backgroundColor: '#1a1a1a',
                calendarBackground: '#1a1a1a',
                textSectionTitleColor: '#fff',
                selectedDayBackgroundColor: '#fd8f09',
                selectedDayTextColor: '#fff',
                todayTextColor: '#fd8f09',
                dayTextColor: '#fff',
                textDisabledColor: '#444',
                monthTextColor: '#fff'
              }}
            />

            <TouchableOpacity
              style={[styles.modalButton, styles.modalCloseButton]}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.modalButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a'
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    marginBottom: 10
  },
  dateSelector: {
    backgroundColor: '#2a2a2a',
    padding: 14,
    borderRadius: 12,
    minWidth: 180,
    height: 50,
    justifyContent: 'center'
  },
  dateText: {
    color: '#fff',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center'
  },
  weightContainer: {
    backgroundColor: '#2a2a2a',
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'baseline',
    height: 50,
    justifyContent: 'center',
    minWidth: 120
  },
  weightValue: {
    fontSize: 32,
    color: '#ef4444',
    fontFamily: 'Inter-SemiBold',
    backgroundColor: 'transparent',
    textAlign: 'center'
  },
  weightLabel: {
    fontSize: 16,
    color: '#ef4444',
    marginLeft: 6,
    fontFamily: 'Inter-Regular'
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#1a1a1a'
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#333',
    borderRadius: 20,
    padding: 4,
    alignSelf: 'center',
    marginVertical: 10
  },
  genderToggle: {
    flexDirection: 'row',
    backgroundColor: '#333',
    borderRadius: 20,
    padding: 4
  },
  bodyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    marginTop: 10
  },
  silhouette: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  measurementLabel: {
    position: 'absolute',
    minWidth: 60,
    maxWidth: 80,
    zIndex: 3
  },
  measurementValue: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 10,
    minWidth: 60,
    maxWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
    height: 40,
    margin: 2
  },
  measurementText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    textAlign: 'center',
    color: '#fff',
    flexShrink: 1,
    flexWrap: 'nowrap'
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 8,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    minWidth: 80
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  historyModalContent: {
    width: '90%',
    maxWidth: 500,
    padding: 24
  },
  datePickerContent: {
    width: '90%',
    maxWidth: 400,
    padding: 24
  },
  modalHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 18,
    marginBottom: 18
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center'
  },
  modalInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    fontSize: 24,
    textAlign: 'center',
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#333',
    height: 60
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10
  },
  modalButton: {
    padding: 14,
    borderRadius: 10,
    minWidth: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
    flex: 1,
    height: 50
  },
  modalSaveButton: {
    backgroundColor: '#fd8f09'
  },
  modalCancelButton: {
    backgroundColor: '#333'
  },
  modalHistoryButton: {
    backgroundColor: '#0891b2'
  },
  modalCloseButton: {
    backgroundColor: '#333',
    marginTop: 15,
    color: '#fff',
    alignSelf: 'center'
  },
  modalButtonText: {
    color: '#ccc',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20
  },
  chartContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16
  },
  noDataText: {
    color: '#ccc',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20
  },
  measurementPoint: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1
  },
  pointCircle: {
    width: 12,
    height: 12,
    borderRadius: 6
  }
});
