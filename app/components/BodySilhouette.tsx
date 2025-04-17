import React from 'react';
import Svg, { Path, G } from 'react-native-svg';

interface BodySilhouetteProps {
  width: number;
  height: number;
}

export default function BodySilhouette({ width, height }: BodySilhouetteProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 200 400">
      <G fill="#2a2a2a" stroke="#333" strokeWidth="1">
        {/* Tête et cou */}
        <Path
          d="M85 30
             C85 15, 115 15, 115 30
             C115 40, 110 45, 110 50
             L110 70
             L90 70
             L90 50
             C90 45, 85 40, 85 30
             Z"
        />

        {/* Épaules et torse */}
        <Path
          d="M70 70
             C60 70, 40 80, 35 100
             L45 150
             C48 160, 55 165, 60 160
             L75 120
             C80 110, 90 105, 100 105
             C110 105, 120 110, 125 120
             L140 160
             C145 165, 152 160, 155 150
             L165 100
             C160 80, 140 70, 130 70
             Z"
        />

        {/* Abdominaux */}
        <Path
          d="M75 120
             C85 140, 115 140, 125 120
             L125 180
             C115 200, 85 200, 75 180
             Z
             M100 105
             L100 180
             M85 130
             L115 130
             M85 150
             L115 150
             M85 170
             L115 170"
          strokeWidth="0.5"
        />

        {/* Bras gauche */}
        <Path
          d="M35 100
             C30 120, 30 140, 35 160
             C25 180, 45 190, 55 170
             C50 150, 50 130, 55 110
             C45 90, 30 80, 35 100
             Z"
        />

        {/* Bras droit */}
        <Path
          d="M165 100
             C170 120, 170 140, 165 160
             C175 180, 155 190, 145 170
             C150 150, 150 130, 145 110
             C155 90, 170 80, 165 100
             Z"
        />

        {/* Hanches et jambes */}
        <Path
          d="M75 180
             C85 200, 115 200, 125 180
             L130 220
             C140 240, 145 280, 145 300
             C145 320, 135 340, 130 350
             C125 360, 115 360, 110 350
             L110 300
             L90 300
             L90 350
             C85 360, 75 360, 70 350
             C65 340, 55 320, 55 300
             C55 280, 60 240, 70 220
             Z"
        />

        {/* Définition musculaire des jambes */}
        <Path
          d="M70 220
             C80 240, 90 240, 90 220
             M110 220
             C120 240, 130 240, 130 220
             M65 260
             C75 280, 85 280, 85 260
             M115 260
             C125 280, 135 280, 135 260
             M60 300
             C70 320, 80 320, 80 300
             M120 300
             C130 320, 140 320, 140 300"
          strokeWidth="0.5"
        />

        {/* Barbe stylisée */}
        <Path
          d="M90 40
             C95 45, 105 45, 110 40"
          strokeWidth="0.5"
        />
      </G>
    </Svg>
  );
} 