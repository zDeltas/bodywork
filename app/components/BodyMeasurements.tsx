import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import Svg, { Line } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Body from 'react-native-body-highlighter';
import { VictoryAxis, VictoryChart, VictoryLine } from 'victory-native';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { Calendar } from 'react-native-calendars';
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/hooks/useTheme';

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

// Define styles using the current theme
const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.main
    },
    header: {
      padding: theme.spacing.lg,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colors.background.card,
      marginBottom: theme.spacing.sm
    },
    dateSelector: {
      backgroundColor: theme.colors.background.button,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      minWidth: 180,
      height: 50,
      justifyContent: 'center'
    },
    dateText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.base,
      textAlign: 'center'
    },
    weightContainer: {
      backgroundColor: theme.colors.background.button,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      flexDirection: 'row',
      alignItems: 'baseline',
      height: 50,
      justifyContent: 'center',
      minWidth: 120
    },
    weightValue: {
      fontSize: 32,
      color: theme.colors.text.warning,
      fontFamily: theme.typography.fontFamily.semiBold,
      backgroundColor: 'transparent',
      textAlign: 'center'
    },
    weightLabel: {
      fontSize: 16,
      color: theme.colors.text.warning,
      marginLeft: 6,
      fontFamily: theme.typography.fontFamily.regular
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
      zIndex: 3
    },
    measurementValue: {
      backgroundColor: theme.colors.background.button,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      ...theme.shadows.sm,
      minHeight: 36
    },
    measurementText: {
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.sm,
      textAlign: 'center'
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
      backgroundColor: theme.colors.background.card,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      width: '100%',
      maxWidth: 400,
      elevation: 5,
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
      borderBottomColor: theme.colors.border.default,
      paddingBottom: theme.spacing.md,
      marginBottom: theme.spacing.md
    },
    modalTitle: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.fontSize.xl,
      fontFamily: theme.typography.fontFamily.semiBold,
      textAlign: 'center'
    },
    modalInput: {
      backgroundColor: theme.colors.background.input,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize['2xl'],
      textAlign: 'center',
      marginVertical: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
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
      backgroundColor: theme.colors.primary
    },
    modalCancelButton: {
      backgroundColor: theme.colors.background.button
    },
    modalHistoryButton: {
      backgroundColor: theme.colors.info
    },
    modalCloseButton: {
      backgroundColor: theme.colors.background.button,
      marginTop: theme.spacing.md,
      color: theme.colors.text.primary,
      alignSelf: 'center'
    },
    modalButtonText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold,
      fontSize: theme.typography.fontSize.base
    },
    chartContainer: {
      backgroundColor: theme.colors.background.input,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginVertical: theme.spacing.md
    },
    noDataText: {
      color: theme.colors.text.secondary,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.base,
      textAlign: 'center',
      marginVertical: theme.spacing.lg
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
    },
    touchArea: {
      position: 'absolute',
      width: 30,
      height: 30,
      borderRadius: 15,
      zIndex: 2
    }
  });
};

export default function BodyMeasurements() {
  const { theme } = useTheme();
  const styles = useStyles();
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
      color: theme.colors.measurement.neck,
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
      color: theme.colors.measurement.shoulders,
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
      color: theme.colors.measurement.chest,
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
      color: theme.colors.measurement.arms,
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
      color: theme.colors.measurement.forearms,
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
      color: theme.colors.measurement.waist,
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
      color: theme.colors.measurement.hips,
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
      color: theme.colors.measurement.thighs,
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
      color: theme.colors.measurement.calves,
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
  ], [bodyWidth, bodyHeight, theme.colors.measurement]);

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

  // Theme pour VictoryChart
  const chartTheme = {
    axis: {
      style: {
        axis: { stroke: theme.colors.border.default },
        tickLabels: {
          fill: theme.colors.text.secondary,
          fontSize: theme.typography.fontSize.xs,
          fontFamily: theme.typography.fontFamily.regular
        },
        grid: { stroke: theme.colors.border.default, strokeDasharray: '3,3' }
      }
    },
    line: {
      style: {
        data: {
          strokeWidth: 2
        }
      }
    }
  };

  // Theme pour Calendar
  const calendarTheme = {
    backgroundColor: theme.colors.background.card, // theme
    calendarBackground: theme.colors.background.card, // theme
    textSectionTitleColor: theme.colors.text.primary, // theme
    selectedDayBackgroundColor: theme.colors.primary, // theme
    selectedDayTextColor: theme.colors.text.primary, // theme
    todayTextColor: theme.colors.primary, // theme
    dayTextColor: theme.colors.text.primary, // theme
    textDisabledColor: theme.colors.text.disabled, // theme
    dotColor: theme.colors.primary, // theme
    selectedDotColor: theme.colors.text.primary, // theme
    arrowColor: theme.colors.primary, // theme
    monthTextColor: theme.colors.text.primary, // theme
    indicatorColor: theme.colors.primary, // theme
    textDayFontFamily: theme.typography.fontFamily.regular, // theme
    textMonthFontFamily: theme.typography.fontFamily.semiBold, // theme
    textDayHeaderFontFamily: theme.typography.fontFamily.regular, // theme
    textDayFontSize: theme.typography.fontSize.sm, // theme
    textMonthFontSize: theme.typography.fontSize.lg, // theme
    textDayHeaderFontSize: theme.typography.fontSize.xs // theme
  };

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
            style={styles.weightValue}
            value={measurements.weight > 0 ? measurements.weight.toString() : ''}
            onChangeText={handleWeightChange}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={theme.colors.text.disabled}
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

        {/* Measurement points SVG */}
        <Svg width={windowWidth} height={bodyHeight} style={StyleSheet.absoluteFill}>
          {adjustPointPositions(visiblePoints).map((point, index) => {
            const position = point.position;
            if (!position) return null;

            return (
              <React.Fragment key={index}>
                {position.measurementLine && position.labelX && position.labelY && (
                  <>
                    {/* Ligne mesure corps */}
                    <Line
                      x1={position.measurementLine.x1}
                      y1={position.measurementLine.y1}
                      x2={position.measurementLine.x2}
                      y2={position.measurementLine.y2}
                      stroke={point.color}
                      strokeWidth="2"
                      strokeDasharray="3,3"
                    />
                    {/* Ligne connecteur */}
                    <Line
                      x1={(position.measurementLine.x1 + position.measurementLine.x2) / 2}
                      y1={position.measurementLine.y1}
                      x2={position.labelX + (position.side === 'left' ? 40 : 0)}
                      y2={position.labelY}
                      stroke={point.color}
                      strokeWidth="1"
                      strokeDasharray="3,3"
                    />
                  </>
                )}
              </React.Fragment>
            );
          })}
        </Svg>

        {/* Interactive touch areas (garder invisibles) */}
        {adjustPointPositions(visiblePoints).map((point, index) => {
          const position = point.position;
          if (!position) return null;
          return (
            <TouchableOpacity
              key={`touch-${index}`}
              style={[styles.touchArea, { left: position.x - 15, top: position.y - 15 }]}
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
              style={[styles.measurementLabel, { left: position.labelX, top: position.labelY - 15 }]}
              onPress={() => handleMeasurementPointPress(point)}
            >
              <View style={[styles.measurementValue, { borderColor: point.color }]}>
                <Text style={[styles.measurementText, { color: point.color }]}>
                  {value > 0 ? (value <= 999 ? value.toFixed(1) : `${value} cm`) : '-'}
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
        <Pressable style={styles.modalOverlay} onPress={() => setShowModal(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, selectedPoint ? { color: selectedPoint.color } : {}]}>
                {selectedPoint ? selectedPoint.label : ''}
              </Text>
            </View>
            <TextInput
              style={[styles.modalInput, selectedPoint ? { borderColor: selectedPoint.color } : {}]}
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={theme.colors.text.disabled}
              autoFocus
              selectTextOnFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.modalCancelButton]}
                                onPress={() => setShowModal(false)}>
                <Text style={styles.modalButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalSaveButton]} onPress={handleModalSave}>
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
        <Pressable style={styles.modalOverlay} onPress={() => setShowHistory(false)}>
          <Pressable style={[styles.modalContent, styles.historyModalContent]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Historique {selectedPoint ? selectedPoint.label : ''}
              </Text>
            </View>
            {historyData.length > 1 ? (
              <View style={styles.chartContainer}>
                <VictoryChart
                  theme={chartTheme}
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
                  />
                  <VictoryAxis
                    dependentAxis
                    tickFormat={(value) => `${value}cm`}
                  />
                  <VictoryLine
                    data={historyData}
                    x="date"
                    y="value"
                    style={{ data: { stroke: selectedPoint ? selectedPoint.color : theme.colors.primary } }}
                    interpolation="natural"
                  />
                </VictoryChart>
              </View>
            ) : (
              <Text style={styles.noDataText}>
                {historyData.length === 0 ? 'Aucune donnée disponible' : 'Pas assez de données pour afficher un graphique'}
              </Text>
            )}
            <TouchableOpacity style={[styles.modalButton, styles.modalCloseButton]}
                              onPress={() => setShowHistory(false)}>
              <Text style={styles.modalButtonText}>{t('close')}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Date picker modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowDatePicker(false)}>
          <Pressable style={[styles.modalContent, styles.datePickerContent]} onPress={(e) => e.stopPropagation()}>
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
                    dotColor: theme.colors.primary
                  };
                  if (measurement.date === selectedDate) {
                    acc[measurement.date] = {
                      ...acc[measurement.date],
                      selected: true,
                      selectedColor: theme.colors.primary
                    };
                  }
                  return acc;
                }, { [selectedDate]: { selected: true, selectedColor: theme.colors.primary } } as Record<string, any>)
              }
              theme={calendarTheme}
            />
            <TouchableOpacity style={[styles.modalButton, styles.modalCloseButton]}
                              onPress={() => setShowDatePicker(false)}>
              <Text style={styles.modalButtonText}>Fermer</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

