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
    biceps: number;
    triceps: number;
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
    front: { x: number; y: number; side: 'left' | 'right' };
    back?: { x: number; y: number; side: 'left' | 'right' };
  };
}

interface HistoryData {
  date: string;
  value: number;
}

const windowWidth = Dimensions.get('window').width;
const bodyWidth = windowWidth * 1.2;
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
      biceps: 0,
      triceps: 0,
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
        front: { x: bodyWidth * 0.5, y: bodyHeight * 0.12, side: 'right' },
        back: { x: bodyWidth * 0.5, y: bodyHeight * 0.12, side: 'right' }
      }
    },
    { 
      label: 'Épaules', 
      key: 'shoulders', 
      color: '#4ade80',
      position: {
        front: { x: bodyWidth * 0.5, y: bodyHeight * 0.17, side: 'right' },
        back: { x: bodyWidth * 0.5, y: bodyHeight * 0.17, side: 'right' }
      }
    },
    { 
      label: 'Poitrine', 
      key: 'chest', 
      color: '#4ade80',
      position: {
        front: { x: bodyWidth * 0.5, y: bodyHeight * 0.22, side: 'right' }
      }
    },
    { 
      label: 'Biceps', 
      key: 'biceps', 
      color: '#818cf8',
      position: {
        front: { x: bodyWidth * 0.25, y: bodyHeight * 0.25, side: 'left' }
      }
    },
    { 
      label: 'Triceps', 
      key: 'triceps', 
      color: '#818cf8',
      position: {
        back: { x: bodyWidth * 0.25, y: bodyHeight * 0.25, side: 'left' }
      }
    },
    { 
      label: 'Avant-bras', 
      key: 'forearms', 
      color: '#818cf8',
      position: {
        front: { x: bodyWidth * 0.25, y: bodyHeight * 0.35, side: 'left' },
        back: { x: bodyWidth * 0.25, y: bodyHeight * 0.35, side: 'left' }
      }
    },
    { 
      label: 'Taille', 
      key: 'waist', 
      color: '#4ade80',
      position: {
        front: { x: bodyWidth * 0.5, y: bodyHeight * 0.32, side: 'right' },
        back: { x: bodyWidth * 0.5, y: bodyHeight * 0.32, side: 'right' }
      }
    },
    { 
      label: 'Hanches', 
      key: 'hips', 
      color: '#4ade80',
      position: {
        front: { x: bodyWidth * 0.5, y: bodyHeight * 0.42, side: 'right' },
        back: { x: bodyWidth * 0.5, y: bodyHeight * 0.42, side: 'right' }
      }
    },
    { 
      label: 'Cuisses', 
      key: 'thighs', 
      color: '#fbbf24',
      position: {
        front: { x: bodyWidth * 0.3, y: bodyHeight * 0.55, side: 'left' },
        back: { x: bodyWidth * 0.3, y: bodyHeight * 0.55, side: 'left' }
      }
    },
    { 
      label: 'Mollets', 
      key: 'calves', 
      color: '#fbbf24',
      position: {
        front: { x: bodyWidth * 0.3, y: bodyHeight * 0.75, side: 'left' },
        back: { x: bodyWidth * 0.3, y: bodyHeight * 0.75, side: 'left' }
      }
    },
  ];

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
    setMeasurements(prev => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        [key]: numValue,
      },
    }));
    setInputValue(value);
  };

  const handleInputFocus = (point: MeasurementPoint) => {
    setActiveInput(point.key);
    setInputValue(measurements.measurements[point.key] > 0 ? 
      measurements.measurements[point.key].toString() : '');
  };

  const saveMeasurements = async (updatedMeasurements: Measurement) => {
    try {
      // Get all stored measurements
      const stored = await AsyncStorage.getItem('bodyMeasurements');
      let storedMeasurements = stored ? JSON.parse(stored) : [];

      // Check if a measurement for this date already exists
      const existingIndex = storedMeasurements.findIndex(
        (m: Measurement) => m.date === updatedMeasurements.date
      );

      if (existingIndex >= 0) {
        // Update existing measurement
        storedMeasurements[existingIndex] = updatedMeasurements;
      } else {
        // Add new measurement
        storedMeasurements.push(updatedMeasurements);
      }

      // Sort by date (newest first)
      storedMeasurements.sort(
        (a: Measurement, b: Measurement) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      // Save all measurements
      await AsyncStorage.setItem('bodyMeasurements', JSON.stringify(storedMeasurements));

      // Update state
      setAllMeasurements(storedMeasurements);
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
          biceps: 0,
          triceps: 0,
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
        'biceps': 'biceps',
        'triceps': 'triceps',
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
      setMeasurements(prev => ({
        ...prev,
        measurements: {
          ...prev.measurements,
          [selectedPoint.key]: numValue,
        },
      }));
      saveMeasurements({
        ...measurements,
        measurements: {
          ...measurements.measurements,
          [selectedPoint.key]: numValue,
        },
      });
    }
    setShowModal(false);
  };

  const loadHistoryData = (key: MeasurementKey) => {
    const history = allMeasurements.map(m => ({
      date: m.date,
      value: m.measurements[key] || 0
    })).filter(item => item.value > 0);

    // Sort by date (oldest first for charts)
    history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setHistoryData(history);
    setShowHistory(true);
  };

  const renderMeasurementValue = (point: MeasurementPoint) => {
    const value = measurements.measurements[point.key];
    const isActive = activeInput === point.key;

    if (isActive) {
      return (
        <TextInput
          style={[styles.input, { color: point.color }]}
          value={inputValue}
          onChangeText={(newValue) => updateMeasurement(point.key, newValue)}
          keyboardType="numeric"
          autoFocus
          onBlur={handleInputBlur}
          onFocus={() => handleInputFocus(point)}
          placeholder="0"
          placeholderTextColor="#666"
        />
      );
    }

    return (
      <TouchableOpacity
        style={styles.measurementValue}
        onPress={() => handleInputFocus(point)}
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

      {/* View toggle */}
      <View style={styles.viewToggle}>
        <Pressable
          style={[styles.toggleButton, selectedView === 'front' && styles.toggleButtonActive]}
          onPress={() => handleViewChange('front')}>
          <AnimatedText style={[styles.toggleText, frontTextStyle]}>
            Vue de face
          </AnimatedText>
        </Pressable>
        <Pressable
          style={[styles.toggleButton, selectedView === 'back' && styles.toggleButtonActive]}
          onPress={() => handleViewChange('back')}>
          <AnimatedText style={[styles.toggleText, backTextStyle]}>
            Vue de dos
          </AnimatedText>
        </Pressable>
      </View>

      {/* Body visualization */}
      <View style={styles.bodyContainer}>
        <Animated.View style={[styles.silhouette, containerStyle]}>
          <Body
            gender={selectedGender}
            side={selectedView}
            scale={1.5}
            data={[]}
            onBodyPartPress={handleBodyPartPress}
          />
        </Animated.View>

        {/* Measurement points */}
        <Svg width={windowWidth} height={bodyHeight} style={StyleSheet.absoluteFill}>
          {visiblePoints.map((point, index) => {
            const position = point.position[selectedView];
            if (!position) return null;

            return (
              <React.Fragment key={index}>
                <Line
                  x1={position.side === 'left' ? position.x - 50 : position.x + 50}
                  y1={position.y}
                  x2={position.x}
                  y2={position.y}
                  stroke={point.color}
                  strokeWidth="2"
                  strokeDasharray={position.side === 'left' ? "5,5" : undefined}
                />
                <Circle
                  cx={position.side === 'left' ? position.x - 50 : position.x + 50}
                  cy={position.y}
                  r="8"
                  fill={point.color}
                  onPress={() => handleMeasurementPointPress(point)}
                />
                <View
                  style={[
                    styles.measurementLabel,
                    {
                      position: 'absolute',
                      left: position.side === 'left' ? position.x - 120 : position.x + 60,
                      top: position.y - 10,
                    }
                  ]}
                >
                  <TouchableOpacity
                    style={styles.measurementValue}
                    onPress={() => handleMeasurementPointPress(point)}
                  >
                    <Text style={[styles.measurementText, { color: point.color }]}>
                      {measurements.measurements[point.key] > 0 ?
                        `${measurements.measurements[point.key]} cm` :
                        point.label}
                    </Text>
                  </TouchableOpacity>
                </View>
              </React.Fragment>
            );
          })}
        </Svg>
      </View>

      {/* Measurement input modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
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
          </View>
        </View>
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
                      data: { stroke: selectedPoint ? selectedPoint.color : '#6366f1' },
                    }}
                  />
                </VictoryChart>
              </View>
            ) : (
              <Text style={styles.noDataText}>
                Pas assez de données pour afficher un graphique
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
                    dotColor: '#6366f1'
                  };
                  // Mark selected date
                  if (measurement.date === selectedDate) {
                    acc[measurement.date] = {
                      ...acc[measurement.date],
                      selected: true,
                      selectedColor: '#6366f1'
                    };
                  }
                  return acc;
                }, { [selectedDate]: { selected: true, selectedColor: '#6366f1' } } as Record<string, any>)
              }
              theme={{
                backgroundColor: '#1a1a1a',
                calendarBackground: '#1a1a1a',
                textSectionTitleColor: '#fff',
                selectedDayBackgroundColor: '#6366f1',
                selectedDayTextColor: '#fff',
                todayTextColor: '#6366f1',
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
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
  },
  toggleButtonActive: {
    backgroundColor: '#6366f1',
  },
  toggleText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
  },
  bodyContainer: {
    height: bodyHeight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    position: 'relative',
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
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 400,
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
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    marginVertical: 5,
  },
  modalSaveButton: {
    backgroundColor: '#6366f1',
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
});
