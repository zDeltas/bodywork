import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Body, { ExtendedBodyPart, Slug } from 'react-native-body-highlighter';
import { colors } from '../../theme/theme';

const measurementSlugs: Record<string, Slug> = {
  CHEST: 'chest' as Slug,
  WAIST: 'abs' as Slug,
  HIPS: 'gluteal' as Slug,
  ARMS: 'biceps' as Slug,
  FOREARMS: 'forearm' as Slug,
  SHOULDERS: 'deltoids' as Slug,
  THIGHS: 'quadriceps' as Slug,
  CALVES: 'calves' as Slug,
  NECK: 'neck' as Slug,
};

interface MeasurementPoint {
  label: string;
  key: keyof typeof measurementSlugs;
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

interface MeasurementBodyMapProps {
  points: MeasurementPoint[];
  onPointPress: (point: MeasurementPoint) => void;
}

export const MeasurementBodyMap: React.FC<MeasurementBodyMapProps> = ({ points, onPointPress }) => {
  const data: ExtendedBodyPart[] = points.map((point) => ({
    slug: measurementSlugs[point.key],
    intensity: 1,
    color: point.color,
  }));

  return (
    <View style={styles.container}>
      <Body
        data={data}
        scale={1}
        onBodyPartPress={(part) => {
          const point = points.find((p) => measurementSlugs[p.key] === part.slug);
          if (point) {
            onPointPress(point);
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
});

export default MeasurementBodyMap; 