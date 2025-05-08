import React from 'react';
import { LayoutChangeEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Body from 'react-native-body-highlighter';
import Svg, { Line } from 'react-native-svg';
import { useTheme } from '@/app/hooks/useTheme';

export type MeasurementKey =
  'neck' | 'shoulders' | 'chest' | 'arms' | 'forearms' | 'waist' | 'hips' | 'thighs' | 'calves';

interface MeasurementPoint {
  key: MeasurementKey;
  label: string;
  color: string;
}

interface Props {
  points: MeasurementPoint[];
  values: Record<MeasurementKey, number>;
  onPointPress: (key: MeasurementKey) => void;
}

const BODY_POINTS: Record<MeasurementKey, {
  x: number;
  y: number;
  side: 'left' | 'right';
  measureLine: { x1: number; y1: number; x2: number; y2: number };
}> = {
  // Cou - au milieu haut
  neck: {
    x: 0.2, y: 0.15, side: 'left',
    measureLine: { x1: 0.43, y1: 0.19, x2: 0.57, y2: 0.19 }
  },
  // Épaules - ligne horizontale sur les deltoïdes
  shoulders: {
    x: 0.8, y: 0.15, side: 'right',
    measureLine: { x1: 0.28, y1: 0.22, x2: 0.73, y2: 0.22 }
  },
  // Poitrine - ligne horizontale au niveau des pectoraux
  chest: {
    x: 0.8, y: 0.25, side: 'right',
    measureLine: { x1: 0.36, y1: 0.28, x2: 0.64, y2: 0.28 }
  },
  // Bras - sur le biceps gauche
  arms: {
    x: 0.2, y: 0.25, side: 'left',
    measureLine: { x1: 0.25, y1: 0.31, x2: 0.33, y2: 0.33 }
  },
  // Avant-bras - sur l'avant-bras gauche
  forearms: {
    x: 0.2, y: 0.35, side: 'left',
    measureLine: { x1: 0.20, y1: 0.38, x2: 0.29, y2: 0.40 }
  },
  // Taille - ligne horizontale au nombril
  waist: {
    x: 0.8, y: 0.35, side: 'right',
    measureLine: { x1: 0.37, y1: 0.39, x2: 0.63, y2: 0.39 }
  },
  // Hanches - ligne horizontale au bassin
  hips: {
    x: 0.8, y: 0.45, side: 'right',
    measureLine: { x1: 0.35, y1: 0.44, x2: 0.65, y2: 0.44 }
  },
  // Cuisses - sur le quadriceps gauche
  thighs: {
    x: 0.2, y: 0.45, side: 'left',
    measureLine: { x1: 0.33, y1: 0.54, x2: 0.49, y2: 0.54 }
  },
  // Mollets - sur le mollet gauche
  calves: {
    x: 0.2, y: 0.55, side: 'left',
    measureLine: { x1: 0.34, y1: 0.76, x2: 0.45, y2: 0.76 }
  }
};

const BUTTON_OFFSET = {
  left: 50,   // Distance à gauche
  right: 50,  // Distance à droite
  y: 0        // Ajustement vertical
};

const MeasurementBody: React.FC<Props> = ({ points, values, onPointPress }) => {
  const { theme } = useTheme();
  const [bodyLayout, setBodyLayout] = React.useState<{ width: number; height: number }>({ width: 200, height: 400 });
  const [btnPositions, setBtnPositions] = React.useState<{ [k in MeasurementKey]?: { x: number; y: number } }>({});

  const getButtonPosition = (key: MeasurementKey) => {
    const { width, height } = bodyLayout;
    const bodyPt = BODY_POINTS[key];

    if (bodyPt.side === 'left') {
      return {
        x: (bodyPt.x * width) - BUTTON_OFFSET.left,
        y: bodyPt.y * height + BUTTON_OFFSET.y
      };
    }
    // right
    return {
      x: (bodyPt.x * width) + BUTTON_OFFSET.right,
      y: bodyPt.y * height + BUTTON_OFFSET.y
    };
  };

  React.useEffect(() => {
    const newPositions: { [k in MeasurementKey]?: { x: number; y: number } } = {};
    points.forEach((pt) => {
      newPositions[pt.key] = getButtonPosition(pt.key);
    });
    setBtnPositions(newPositions);
    // eslint-disable-next-line
  }, [bodyLayout.width, bodyLayout.height, points]);

  const getMeasurementLineEndpoint = (measureLine: {
    x1: number;
    y1: number;
    x2: number;
    y2: number
  }, side: 'left' | 'right') => {
    const { width, height } = bodyLayout;

    if (side === 'left') {
      return {
        x: measureLine.x1 * width,
        y: measureLine.y1 * height
      };
    }

    return {
      x: measureLine.x2 * width,
      y: measureLine.y2 * height
    };
  };

  return (
    <View style={styles.container}>
      <View style={styles.bodyContainer}>
        <View
          style={{ width: 200, height: 400 }}
          onLayout={(e: LayoutChangeEvent) => {
            setBodyLayout({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height });
          }}
        >
          <Body gender="male" data={[]} scale={1.0} />
          {/* SVG pour les lignes */}
          <Svg style={StyleSheet.absoluteFill} width={bodyLayout.width} height={bodyLayout.height}>
            {points.map((pt) => {
              const bodyPt = BODY_POINTS[pt.key];
              const btnPt = btnPositions[pt.key];
              if (!btnPt) return null;

              const lineEndpoint = getMeasurementLineEndpoint(bodyPt.measureLine, bodyPt.side);

              return (
                <React.Fragment key={pt.key}>
                  <Line
                    x1={bodyPt.measureLine.x1 * bodyLayout.width}
                    y1={bodyPt.measureLine.y1 * bodyLayout.height}
                    x2={bodyPt.measureLine.x2 * bodyLayout.width}
                    y2={bodyPt.measureLine.y2 * bodyLayout.height}
                    stroke={pt.color}
                    strokeWidth={2}
                  />

                  <Line
                    x1={lineEndpoint.x}
                    y1={lineEndpoint.y}
                    x2={btnPt.x + (bodyPt.side === 'left' ? 15 : -15)}
                    y2={btnPt.y}
                    stroke={pt.color}
                    strokeWidth={2}
                    strokeDasharray="4,2"
                  />
                </React.Fragment>
              );
            })}
          </Svg>

          {/* Boutons positionnés dynamiquement */}
          {points.map((pt) => {
            const btnPt = btnPositions[pt.key];
            if (!btnPt) return null;
            const value = values[pt.key];
            return (
              <View key={pt.key} style={{ position: 'absolute', left: btnPt.x - 15, top: btnPt.y - 15 }}>
                <TouchableOpacity
                  style={[styles.btn, {
                    borderColor: pt.color,
                    backgroundColor: theme.colors.background.card
                  }]}
                  onPress={() => onPointPress(pt.key)}
                >
                  <Text style={{ color: pt.color, fontWeight: 'bold', fontSize: 14 }}>
                    {value > 0 ? value : '-'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24
  },
  bodyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 240, // Un peu plus large pour laisser de la place aux boutons
    height: 420
  },
  btn: {
    borderWidth: 2,
    borderRadius: 30,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2
  }
});

export default MeasurementBody; 
