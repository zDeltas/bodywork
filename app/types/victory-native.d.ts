declare module 'victory-native' {
  import React from 'react';
  import { ViewProps } from 'react-native';
  
  export const VictoryChart: React.FC<any>;
  export const VictoryLine: React.FC<any>;
  export const VictoryAxis: React.FC<any>;
  export const VictoryTheme: {
    material: any;
    grayscale: any;
  };
  export const VictoryScatter: React.FC<any>;
  export const VictoryBar: React.FC<any>;
  export const VictoryStack: React.FC<any>;
  export const VictoryTooltip: React.FC<any>;
  export const VictoryVoronoiContainer: React.FC<any>;
  export const VictoryLegend: React.FC<any>;
  
  export interface VictoryThemeInterface {
    material: any;
    grayscale: any;
  }
} 