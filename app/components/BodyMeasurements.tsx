import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import Svg, { Line, Circle } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BodySilhouette from './BodySilhouette';

interface Measurement {
  date: string;
  weight: number;
  measurements: {
    chest: number;
    waist: number;
    hips: number;
    biceps: number;
    thighs: number;
    calves: number;
  };
}

type MeasurementKey = keyof Measurement['measurements'];

interface MeasurementPoint {
  x: number;
  y: number;
  label: string;
  value: number;
  color: string;
  side: 'left' | 'right';
  key: MeasurementKey;
}

const windowWidth = Dimensions.get('window').width;
const bodyWidth = windowWidth * 0.6;
const bodyHeight = bodyWidth * 2;

export default function BodyMeasurements() {
  const [measurements, setMeasurements] = useState<Measurement>({
    date: new Date().toISOString().split('T')[0],
    weight: 0,
    measurements: {
      chest: 0,
      waist: 0,
      hips: 0,
      biceps: 0,
      thighs: 0,
      calves: 0,
    },
  });

  const [activeInput, setActiveInput] = useState<MeasurementKey | null>(null);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    // Charger les mesures sauvegardées au démarrage
    const loadMeasurements = async () => {
      try {
        const stored = await AsyncStorage.getItem('bodyMeasurements');
        if (stored) {
          const lastMeasurement = JSON.parse(stored).pop();
          if (lastMeasurement) {
            setMeasurements(lastMeasurement);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des mesures:', error);
      }
    };
    loadMeasurements();
  }, []);

  const measurementPoints: MeasurementPoint[] = [
    { x: bodyWidth * 0.5, y: bodyHeight * 0.2, label: 'Poitrine', value: measurements.measurements.chest, color: '#4ade80', side: 'right', key: 'chest' },
    { x: bodyWidth * 0.5, y: bodyHeight * 0.3, label: 'Taille', value: measurements.measurements.waist, color: '#4ade80', side: 'right', key: 'waist' },
    { x: bodyWidth * 0.5, y: bodyHeight * 0.4, label: 'Hanches', value: measurements.measurements.hips, color: '#4ade80', side: 'right', key: 'hips' },
    { x: bodyWidth * 0.25, y: bodyHeight * 0.25, label: 'Biceps', value: measurements.measurements.biceps, color: '#818cf8', side: 'left', key: 'biceps' },
    { x: bodyWidth * 0.3, y: bodyHeight * 0.5, label: 'Cuisses', value: measurements.measurements.thighs, color: '#fbbf24', side: 'left', key: 'thighs' },
    { x: bodyWidth * 0.3, y: bodyHeight * 0.7, label: 'Mollets', value: measurements.measurements.calves, color: '#fbbf24', side: 'left', key: 'calves' },
  ];

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
  });

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

  const handleInputBlur = async () => {
    setActiveInput(null);
    // Sauvegarder les mesures quand on quitte un input
    try {
      const stored = await AsyncStorage.getItem('bodyMeasurements');
      const allMeasurements = stored ? JSON.parse(stored) : [];
      const lastMeasurement = allMeasurements.pop(); // Enlever la dernière mesure
      allMeasurements.push(measurements); // Ajouter la mesure mise à jour
      await AsyncStorage.setItem('bodyMeasurements', JSON.stringify(allMeasurements));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleWeightChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setMeasurements(prev => ({
      ...prev,
      weight: numValue,
    }));
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
      <View style={styles.header}>
        <View style={styles.weightContainer}>
          <TextInput
            style={[styles.weightValue, { minWidth: 80 }]}
            value={measurements.weight > 0 ? measurements.weight.toString() : ''}
            onChangeText={handleWeightChange}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#666"
          />
          <Text style={styles.weightLabel}>kg</Text>
        </View>
      </View>

      <View style={styles.bodyContainer}>
        <View style={styles.silhouette}>
          <BodySilhouette width={bodyWidth} height={bodyHeight} />
        </View>
        
        <Svg width={windowWidth} height={bodyHeight} style={StyleSheet.absoluteFill}>
          {measurementPoints.map((point, index) => (
            <React.Fragment key={index}>
              <Line
                x1={point.side === 'left' ? point.x - 50 : point.x + 50}
                y1={point.y}
                x2={point.x}
                y2={point.y}
                stroke={point.color}
                strokeWidth="2"
                strokeDasharray={point.side === 'left' ? "5,5" : undefined}
              />
              <Circle
                cx={point.side === 'left' ? point.x - 50 : point.x + 50}
                cy={point.y}
                r="6"
                fill={point.color}
              />
              <View
                style={[
                  styles.measurementLabel,
                  {
                    position: 'absolute',
                    left: point.side === 'left' ? point.x - 120 : point.x + 60,
                    top: point.y - 10,
                  }
                ]}
              >
                {renderMeasurementValue(point)}
              </View>
            </React.Fragment>
          ))}
        </Svg>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    alignItems: 'center',
    padding: 20,
  },
  weightContainer: {
    backgroundColor: '#1a1a1a',
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
  bodyContainer: {
    height: bodyHeight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    position: 'relative',
  },
  silhouette: {
    position: 'absolute',
    width: bodyWidth,
    height: bodyHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  measurementLabel: {
    position: 'absolute',
    minWidth: 60,
  },
  measurementValue: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  measurementText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    textAlign: 'center',
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
}); 