import React, { useState, useMemo, useCallback } from 'react';
import { Pressable, StyleSheet, View, LayoutChangeEvent, ScrollView, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Body from 'react-native-body-highlighter';
import { RotateCcw } from 'lucide-react-native';
import Svg, { Line, Text as SvgText, Rect } from 'react-native-svg';
import { useTheme } from '@/app/hooks/useTheme';
import useSettings from '@/app/hooks/useSettings';
import { useTranslation } from '@/app/hooks/useTranslation';
import * as Haptics from 'expo-haptics';
import Text from '@/app/components/ui/Text';

export type MuscleGroupKey =
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'core'
  | 'obliques'
  | 'forearms'
  | 'abductors'
  | 'adductors'
  | 'quadriceps'
  | 'trapezius'
  | 'hamstrings'
  | 'calves'
  | 'cardio';


interface InteractiveMuscleMapProps {
  onMuscleSelect: (muscleGroup: MuscleGroupKey) => void;
  selectedMuscle?: MuscleGroupKey;
}

const BODY_HEIGHT = 400;
const BODY_MAX_WIDTH = 340;
const LABEL_MAX_WIDTH = 0;
const MUSCLE_POINT_SIZE = 10;
const STROKE_WIDTH = 1.5;
const FONT_SIZE = 14;

interface MuscleLabel {
  labelX: number;
  labelY: number;
  muscleX: number;
  muscleY: number;
  label: string;
}

type MuscleLabels = Record<MuscleGroupKey, MuscleLabel>;

const frontMuscleLabels: Partial<MuscleLabels> = {
  shoulders: {
    labelX: 0.0, labelY: 0.16,
    muscleX: 0.39, muscleY: 0.235,
    label: 'Épaules'
  },
  chest: {
    labelX: 1.0, labelY: 0.22,
    muscleX: 0.55, muscleY: 0.27,
    label: 'Pectoraux'
  },
  biceps: {
    labelX: 0.0, labelY: 0.26,
    muscleX: 0.37, muscleY: 0.31,
    label: 'Biceps'
  },
  core: {
    labelX: 1.0, labelY: 0.32,
    muscleX: 0.5, muscleY: 0.37,
    label: 'Abdominaux'
  },
  obliques: {
    labelX: 1.0, labelY: 0.45,
    muscleX: 0.565, muscleY: 0.42,
    label: 'Obliques'
  },
  forearms: {
    labelX: 0.0, labelY: 0.43,
    muscleX: 0.335, muscleY: 0.4,
    label: 'Avant-bras'
  },
  abductors: {
    labelX: 0.0, labelY: 0.6,
    muscleX: 0.42, muscleY: 0.46,
    label: 'Abducteurs'
  },
  adductors: {
    labelX: 1.0, labelY: 0.55,
    muscleX: 0.52, muscleY: 0.55,
    label: 'Adducteurs'
  },
  quadriceps: {
    labelX: 1.0, labelY: 0.65,
    muscleX: 0.56, muscleY: 0.62,
    label: 'Quadriceps'
  },
  cardio: {
    labelX: 0.0, labelY: 0.85,
    muscleX: 0.0, muscleY: 0.0,
    label: 'Cardio'
  }
};

const backMuscleLabels: Partial<MuscleLabels> = {
  trapezius: {
    labelX: 1.0, labelY: 0.17,
    muscleX: 0.53, muscleY: 0.23,
    label: 'Trapèze'
  },
  triceps: {
    labelX: 1.0, labelY: 0.35,
    muscleX: 0.63, muscleY: 0.32,
    label: 'Triceps'
  },
  back: {
    labelX: 0.0, labelY: 0.30,
    muscleX: 0.45, muscleY: 0.35,
    label: 'Dorsaux'
  },
  hamstrings: {
    labelX: 0.0, labelY: 0.63,
    muscleX: 0.45, muscleY: 0.6,
    label: 'Ischio-jambiers'
  },
  calves: {
    labelX: 1.0, labelY: 0.7,
    muscleX: 0.57, muscleY: 0.75,
    label: 'Mollets'
  },
  cardio: {
    labelX: 0.0, labelY: 0.85,
    muscleX: 0.0, muscleY: 0.0,
    label: 'Cardio'
  }
};

export default function InteractiveMuscleMap({ onMuscleSelect, selectedMuscle }: InteractiveMuscleMapProps) {
  const [selectedView, setSelectedView] = useState<'front' | 'back'>('front');
  const [bodyLayout, setBodyLayout] = useState({ width: 200, height: BODY_HEIGHT });
  
  const { settings } = useSettings();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useStyles();

  const rotationValue = useSharedValue(0);
  const scaleValue = useSharedValue(1);

  const getMusclePosition = useCallback((percentX: number, percentY: number) => {
    const centerX = bodyLayout.width / 2;
    const centerY = bodyLayout.height / 2;
    const relativeX = (percentX - 0.5) * BODY_MAX_WIDTH;
    const relativeY = (percentY - 0.5) * BODY_HEIGHT;
    
    return { x: centerX + relativeX, y: centerY + relativeY };
  }, [bodyLayout.width, bodyLayout.height]);

  const getLabelPosition = useCallback((percentX: number, percentY: number) => {
    const availableWidth = Math.min(bodyLayout.width, BODY_MAX_WIDTH + (2 * LABEL_MAX_WIDTH));
    const labelX = percentX * availableWidth;
    const offsetX = (bodyLayout.width - availableWidth) / 2;
    
    return { x: offsetX + labelX, y: percentY * bodyLayout.height };
  }, [bodyLayout.width, bodyLayout.height]);

  const handleViewChange = useCallback(() => {
    const newView = selectedView === 'front' ? 'back' : 'front';
    setSelectedView(newView);
    rotationValue.value = withSpring(newView === 'front' ? 0 : 180);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [selectedView, rotationValue]);

  const handleMusclePress = useCallback((muscleGroup: MuscleGroupKey) => {
    onMuscleSelect(muscleGroup);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scaleValue.value = withSpring(0.95, {}, () => {
      scaleValue.value = withSpring(1);
    });
  }, [onMuscleSelect, scaleValue]);

  const handleLayoutChange = useCallback((e: LayoutChangeEvent) => {
    setBodyLayout({
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height
    });
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { rotateY: `${rotationValue.value}deg` },
      { scale: scaleValue.value }
    ]
  }));

  const currentLabels = useMemo(() => 
    selectedView === 'front' ? frontMuscleLabels : backMuscleLabels, 
    [selectedView]
  );


  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bodyContainer}>
          <View style={styles.bodyLayoutContainer} onLayout={handleLayoutChange}>
          <Animated.View style={[styles.bodyWrapper, containerStyle]}>
            <Body
              gender={settings.gender}
              data={[]}
              scale={1.0}
              side={selectedView}
            />
          </Animated.View>
          <Svg style={StyleSheet.absoluteFill} width={bodyLayout.width} height={bodyLayout.height}>
            {Object.entries(currentLabels).map(([muscleKey, labelData]) => {
              const isSelected = selectedMuscle === muscleKey;
              const labelPos = getLabelPosition(labelData.labelX, labelData.labelY);
              const musclePos = getMusclePosition(labelData.muscleX, labelData.muscleY);
              const strokeColor = theme.colors.text.primary;
              const halfPoint = MUSCLE_POINT_SIZE / 2;

              return (
                <React.Fragment key={muscleKey}>
                  {muscleKey !== 'cardio' && (
                    <>
                      <Line
                        x1={labelPos.x}
                        y1={labelPos.y + 6}
                        x2={musclePos.x}
                        y2={labelPos.y + 6}
                        stroke={strokeColor}
                        strokeWidth={STROKE_WIDTH}
                        strokeOpacity={0.7}
                        strokeDasharray="3,2"
                      />
                      <Line
                        x1={musclePos.x}
                        y1={labelPos.y + 6}
                        x2={musclePos.x}
                        y2={musclePos.y}
                        stroke={strokeColor}
                        strokeWidth={STROKE_WIDTH}
                        strokeOpacity={0.7}
                        strokeDasharray="3,2"
                      />
                      <Rect
                        x={musclePos.x - halfPoint}
                        y={musclePos.y - halfPoint}
                        width={MUSCLE_POINT_SIZE}
                        height={MUSCLE_POINT_SIZE}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={2}
                        strokeOpacity={0.8}
                        onPress={() => handleMusclePress(muscleKey as MuscleGroupKey)}
                      />
                    </>
                  )}
                </React.Fragment>
              );
            })}
          </Svg>
          
          {/* Labels natifs avec zones tactiles intégrées */}
          {Object.entries(currentLabels).map(([muscleKey, labelData]) => {
            const isSelected = selectedMuscle === muscleKey;
            const labelPos = getLabelPosition(labelData.labelX, labelData.labelY);
            const musclePos = getMusclePosition(labelData.muscleX, labelData.muscleY);
            const isLeftAligned = labelData.labelX < 0.5;
            const textColor = isSelected ? theme.colors.primary : theme.colors.text.primary;
            
            return (
              <React.Fragment key={`native-${muscleKey}`}>
                <TouchableOpacity
                  style={[
                    styles.nativeLabel,
                    {
                      left: isLeftAligned ? labelPos.x : labelPos.x - 100,
                      top: labelPos.y - 20,
                      alignItems: isLeftAligned ? 'flex-start' : 'flex-end',
                    }
                  ]}
                  onPress={() => handleMusclePress(muscleKey as MuscleGroupKey)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text
                    style={[
                      styles.labelText,
                      {
                        fontSize: FONT_SIZE,
                        color: textColor,
                        fontWeight: isSelected ? 'bold' : '600',
                      }
                    ]}
                  >
                    {labelData.label}
                  </Text>
                </TouchableOpacity>
                
                {/* Zone tactile du muscle (carré) */}
                {muscleKey !== 'cardio' && (
                  <TouchableOpacity
                    style={[
                      styles.muscleTouchArea,
                      {
                        left: musclePos.x - 11,
                        top: musclePos.y - 11,
                        width: 22,
                        height: 22,
                        backgroundColor: isSelected
                          ? `${theme.colors.primary}20`
                          : 'transparent',
                        borderRadius: 22,
                        borderWidth: isSelected ? 2 : 0,
                        borderColor: isSelected ? theme.colors.primary : 'transparent',
                      }
                    ]}
                    onPress={() => handleMusclePress(muscleKey as MuscleGroupKey)}
                    activeOpacity={0.6}
                    hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                  />
                )}
              </React.Fragment>
            );
          })}
          </View>
        </View>
      </ScrollView>

      <Pressable style={styles.rotateButton} onPress={handleViewChange}>
        <RotateCcw color={theme.colors.text.primary} size={20} />
        <Text variant="body" style={styles.rotateButtonText}>
          {t('exerciseSelection.rotate')}
        </Text>
      </Pressable>
    </View>
  );
}

const useStyles = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContainer: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingVertical: 24,
      alignItems: 'center',
    },
    bodyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    bodyLayoutContainer: {
      width: '100%',
      height: BODY_HEIGHT
    },
    bodyWrapper: {
      alignItems: 'center',
      justifyContent: 'center'
    },
    rotateButton: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background.card,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.full,
      borderWidth: 1,
      borderColor: theme.colors.border.default,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    rotateButtonText: {
      marginLeft: theme.spacing.sm,
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.semiBold
    },
    nativeLabel: {
      position: 'absolute',
      zIndex: 15,
      width: 100,
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    labelText: {
      fontFamily: 'System',
    },
    muscleTouchArea: {
      position: 'absolute',
      zIndex: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
};
