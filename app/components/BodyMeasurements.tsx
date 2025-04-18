import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, ScrollView, Dimensions, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import Svg, { Line, Circle } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Body from 'react-native-body-highlighter';
import { VictoryChart, VictoryLine, VictoryTheme, VictoryAxis } from 'victory-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { Calendar } from 'react-native-calendars';

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
    front: { 
      x: number; 
      y: number; 
      side: 'left' | 'right';
      labelX?: number;
      labelY?: number;
    };
    back?: { 
      x: number; 
      y: number; 
      side: 'left' | 'right';
      labelX?: number;
      labelY?: number;
    };
  };
}

interface HistoryData {
  date: string;
  value: number;
}

const windowWidth = Dimensions.get('window').width;
const bodyWidth = windowWidth * 1.8;
const bodyHeight = bodyWidth * 0.8;

export default function BodyMeasurements() {
  // Current measurement state
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
      neck: 0,
    },
  });

  // All historical measurements
  const [allMeasurements, setAllMeasurements] = useState<Measurement[]>([]);

  // UI state
  const [selectedView, setSelectedView] = useState<'front' | 'back'>('front');
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>('male');
  const [activeInput, setActiveInput] = useState<MeasurementKey | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<MeasurementPoint | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState<HistoryData[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Animation values
  const frontTextOpacity = useSharedValue(1);
  const backTextOpacity = useSharedValue(0);
  const rotationValue = useSharedValue(0);

  // Handle view change (front/back)
  const handleViewChange = (view: 'front' | 'back') => {
    setSelectedView(view);
    frontTextOpacity.value = withTiming(view === 'front' ? 1 : 0);
    backTextOpacity.value = withTiming(view === 'back' ? 1 : 0);
    rotationValue.value = withSpring(view === 'front' ? 0 : 180);
  };

  useEffect(() => {
    // Charger les mesures sauvegardées au démarrage
    const loadMeasurements = async () => {
      try {
        const stored = await AsyncStorage.getItem('bodyMeasurements');
        if (stored) {
          const allStoredMeasurements = JSON.parse(stored);
          setAllMeasurements(allStoredMeasurements);

          // Find measurement for selected date or use the most recent one
          const measurementForDate = allStoredMeasurements.find(
            (m: Measurement) => m.date === selectedDate
          );

          if (measurementForDate) {
            setMeasurements(measurementForDate);
          } else if (allStoredMeasurements.length > 0) {
            // Sort by date (newest first) and get the most recent
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

  const measurementPoints: MeasurementPoint[] = [
    { 
      label: 'Cou', 
      key: 'neck', 
      color: '#4ade80',
      position: {
        front: { x: bodyWidth * 0.3, y: bodyHeight * 0.18, side: 'left' }
      }
    },
    { 
      label: 'Épaules', 
      key: 'shoulders', 
      color: '#4ade80',
      position: {
        front: { x: bodyWidth * 0.32, y: bodyHeight * 0.23, side: 'right' }
      }
    },
    { 
      label: 'Poitrine', 
      key: 'chest', 
      color: '#4ade80',
      position: {
        front: { x: bodyWidth * 0.28, y: bodyHeight * 0.3, side: 'right' }
      }
    },
    {
      label: 'Bras',
      key: 'arms',
      color: '#818cf8',
      position: {
        front: { x: bodyWidth * 0.22, y: bodyHeight * 0.3, side: 'left' }
      }
    },
    { 
      label: 'Avant-bras', 
      key: 'forearms', 
      color: '#818cf8',
      position: {
        front: { x: bodyWidth * 0.19, y: bodyHeight * 0.42, side: 'left' }
      }
    },
    { 
      label: 'Taille', 
      key: 'waist',
      color: '#4ade80',
      position: {
        front: { x: bodyWidth * 0.28, y: bodyHeight * 0.38, side: 'right' }
      }
    },
    { 
      label: 'Hanches', 
      key: 'hips', 
      color: '#4ade80',
      position: {
        front: { x: bodyWidth * 0.28, y: bodyHeight * 0.45, side: 'right' }
      }
    },
    { 
      label: 'Cuisses', 
      key: 'thighs', 
      color: '#fbbf24',
      position: {
        front: { x: bodyWidth * 0.26, y: bodyHeight * 0.55, side: 'left' }
      }
    },
    { 
      label: 'Mollets', 
      key: 'calves', 
      color: '#fbbf24',
      position: {
        front: { x: bodyWidth * 0.26, y: bodyHeight * 0.75, side: 'left' }
      }
    },
  ];

  // Fonction pour ajuster la position des points
  const adjustPointPositions = (points: MeasurementPoint[], view: 'front' | 'back') => {
    const adjustedPoints = [...points];
    const LABEL_OFFSET = 100; // Augmentation de la distance entre le point et le label
    const MIN_VERTICAL_SPACING = 30; // Espacement vertical minimum entre les labels
    const LABEL_HEIGHT = 40; // Hauteur estimée d'un label

    // Trier les points par position verticale (y)
    const sortedPoints = [...adjustedPoints].sort((a, b) => {
      const posA = a.position[view];
      const posB = b.position[view];
      if (!posA || !posB) return 0;
      return posA.y - posB.y;
    });

    // Positionner les labels
    for (let i = 0; i < sortedPoints.length; i++) {
      const point = sortedPoints[i];
      const pos = point.position[view];
      if (!pos) continue;

      // Position horizontale du label
      if (pos.side === 'left') {
        pos.labelX = pos.x - LABEL_OFFSET;
      } else {
        pos.labelX = pos.x + LABEL_OFFSET;
      }

      // Position verticale initiale du label
      pos.labelY = pos.y;

      // Ajuster la position verticale pour éviter les chevauchements
      if (i > 0) {
        const prevPoint = sortedPoints[i - 1];
        const prevPos = prevPoint.position[view];
        if (prevPos && prevPos.labelY !== undefined) {
          const minY = prevPos.labelY + MIN_VERTICAL_SPACING;
          if (pos.labelY < minY) {
            pos.labelY = minY;
          }
        }
      }
    }

    return adjustedPoints;
  };

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
  });

  // Create animated components
  const AnimatedText = Animated.createAnimatedComponent(Text);

  // Animated styles for view toggle
  const frontTextStyle = useAnimatedStyle(() => ({
    opacity: frontTextOpacity.value,
  }));

  const backTextStyle = useAnimatedStyle(() => ({
    opacity: backTextOpacity.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${rotationValue.value}deg` }],
  }));

  // Filter measurement points for current view
  const visiblePoints = measurementPoints.filter(point =>
    point.position[selectedView] !== undefined
  );

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Date invalide";
      }

      const formattedDate = date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    } catch (error) {
      console.error("Erreur de formatage de date:", error);
      return "Date invalide";
    }
  };

  const capitalizedDate = formatDate(selectedDate);

  const updateMeasurement = (key: MeasurementKey, value: string) => {
    const numValue = parseFloat(value) || 0;
    const updatedMeasurements = {
      ...measurements,
      measurements: {
        ...measurements.measurements,
        [key]: numValue,
      },
    };
    setMeasurements(updatedMeasurements);
    setInputValue(value);
    // Sauvegarder immédiatement après la mise à jour
    saveMeasurements(updatedMeasurements);
  };

  const handleInputFocus = (point: MeasurementPoint) => {
    setActiveInput(point.key);
    setInputValue(measurements.measurements[point.key] > 0 ? 
      measurements.measurements[point.key].toString() : '');
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
        // Conserver les anciennes valeurs pour les mesures non mises à jour
        const existingMeasurements = storedMeasurements[existingIndex].measurements;
        const updatedMeasurementsData = {
          ...updatedMeasurements,
          measurements: {
            ...existingMeasurements,
            ...updatedMeasurements.measurements
          }
        };
        storedMeasurements[existingIndex] = updatedMeasurementsData;
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

  const handleInputBlur = async () => {
    setActiveInput(null);
    await saveMeasurements(measurements);
  };

  const handleWeightChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setMeasurements(prev => ({
      ...prev,
      weight: numValue,
    }));
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setShowDatePicker(false);

    // Create a new measurement for this date if it doesn't exist
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
          neck: 0,
        },
      };
      setMeasurements(newMeasurement);
      // Save the new measurement
      saveMeasurements(newMeasurement);
    }
  };

  const handleMeasurementPointPress = (point: MeasurementPoint) => {
    console.log('Point pressed:', point.label); // Pour le débogage
    setSelectedPoint(point);
    setInputValue(measurements.measurements[point.key] > 0 ? 
      measurements.measurements[point.key].toString() : '');
    setShowModal(true);
  };

  // Handle body part press
  const handleBodyPartPress = (bodyPart: any) => {
    // Find the measurement point that corresponds to the body part
    const muscleSlug = bodyPart.slug;
    const point = measurementPoints.find(p => {
      // Map body part slugs to measurement keys
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
          [selectedPoint.key]: numValue,
        },
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

  const renderMeasurementValue = (point: MeasurementPoint) => {
    const value = measurements.measurements[point.key];
    const isActive = activeInput === point.key;

    return (
      <TouchableOpacity
        style={styles.measurementValue}
        onPress={() => handleMeasurementPointPress(point)}
      >
        <Text style={[styles.measurementText, { color: point.color }]}>
          {value > 0 ? `${value} cm` : '•••'}
        </Text>
      </TouchableOpacity>
    );
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header with date and weight */}
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
      <View style={styles.bodyContainer}>
        <Animated.View style={[styles.silhouette, containerStyle]}>
          <Body
            gender={selectedGender}
            side={selectedView}
            data={[]}
            scale={1.5}
            onBodyPartPress={handleBodyPartPress}
          />
        </Animated.View>

        {/* Measurement points */}
        <Svg width={windowWidth} height={bodyHeight} style={StyleSheet.absoluteFill}>
          {adjustPointPositions(visiblePoints, selectedView).map((point, index) => {
            const position = point.position[selectedView];
            if (!position) return null;

            return (
              <React.Fragment key={index}>
                <Line
                  x1={position.x}
                  y1={position.y}
                  x2={position.labelX}
                  y2={position.labelY}
                  stroke={point.color}
                  strokeWidth="2"
                  strokeDasharray={position.side === 'left' ? "5,5" : undefined}
                />
              </React.Fragment>
            );
          })}
        </Svg>

        {/* Interactive points */}
        {adjustPointPositions(visiblePoints, selectedView).map((point, index) => {
          const position = point.position[selectedView];
          if (!position) return null;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.measurementPoint,
                {
                  left: position.side === 'left' ? position.x - 50 - 8 : position.x + 50 - 8,
                  top: position.y - 8,
                }
              ]}
              onPress={() => {
                console.log('Point pressed:', point.label);
                handleMeasurementPointPress(point);
              }}
            >
              <View style={[styles.pointCircle, { backgroundColor: point.color }]} />
            </TouchableOpacity>
          );
        })}

        {/* Measurement labels */}
        {adjustPointPositions(visiblePoints, selectedView).map((point, index) => {
          const position = point.position[selectedView];
          if (!position || position.labelX === undefined || position.labelY === undefined) return null;

          return (
            <TouchableOpacity
              key={`label-${index}`}
              style={[
                styles.measurementLabel,
                {
                  left: position.labelX,
                  top: position.labelY - 10,
                }
              ]}
              onPress={() => handleMeasurementPointPress(point)}
            >
              <View style={styles.measurementValue}>
                <Text style={[styles.measurementText, { color: point.color }]}>
                  {measurements.measurements[point.key] > 0 ?
                    `${measurements.measurements[point.key]} cm` :
                    point.label}
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
              <Text style={styles.modalTitle}>
                {selectedPoint ? selectedPoint.label : ''}
              </Text>
            </View>

            <TextInput
              style={styles.modalInput}
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

      {/* History modal */}
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
                  scale={{ x: "time" }}
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
                      },
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
              <Text style={styles.modalButtonText}>Fermer</Text>
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
                  // Mark dates with measurements
                  acc[measurement.date] = {
                    marked: true,
                    dotColor: '#fd8f09'
                  };
                  // Mark selected date
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
                monthTextColor: '#fff',
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
    backgroundColor: '#0a0a0a',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  dateSelector: {
    backgroundColor: '#2a2a2a',
    padding: 10,
    borderRadius: 8,
    minWidth: 150,
  },
  dateText: {
    color: '#fff',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
  },
  weightContainer: {
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  weightValue: {
    fontSize: 32,
    color: '#ef4444',
    fontFamily: 'Inter-SemiBold',
    backgroundColor: 'transparent',
    textAlign: 'center',
  },
  weightLabel: {
    fontSize: 16,
    color: '#ef4444',
    marginLeft: 4,
    fontFamily: 'Inter-Regular',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#1a1a1a',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#333',
    borderRadius: 20,
    padding: 4,
    alignSelf: 'center',
    marginVertical: 10,
  },
  genderToggle: {
    flexDirection: 'row',
    backgroundColor: '#333',
    borderRadius: 20,
    padding: 4,
  },
  bodyContainer: {
    height: bodyHeight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    marginTop: 10,
  },
  silhouette: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  measurementLabel: {
    position: 'absolute',
    minWidth: 60,
    zIndex: 1,
  },
  measurementValue: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  measurementText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    color: '#fff',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 8,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    minWidth: 80,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  historyModalContent: {
    width: '90%',
    maxWidth: 500,
  },
  datePickerContent: {
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 15,
    marginBottom: 15,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 15,
    color: '#fff',
    fontFamily: 'Inter-Regular',
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    marginVertical: 5,
    flex: 1,
  },
  modalSaveButton: {
    backgroundColor: '#fd8f09',
  },
  modalCancelButton: {
    backgroundColor: '#333',
  },
  modalHistoryButton: {
    backgroundColor: '#0891b2',
  },
  modalCloseButton: {
    backgroundColor: '#333',
    marginTop: 15,
    alignSelf: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  // Chart styles
  chartContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
  },
  noDataText: {
    color: '#ccc',
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  measurementPoint: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  pointCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
