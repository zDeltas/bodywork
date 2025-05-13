import React from 'react';

declare module 'victory-native' {
  import React from 'react';

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

export type VictoryNativeTypes = {
  VictoryChart: React.FC<any>;
  VictoryLine: React.FC<any>;
  VictoryAxis: React.FC<any>;
  VictoryTheme: {
    material: any;
    grayscale: any;
  };
  VictoryScatter: React.FC<any>;
  VictoryBar: React.FC<any>;
  VictoryStack: React.FC<any>;
  VictoryTooltip: React.FC<any>;
  VictoryVoronoiContainer: React.FC<any>;
  VictoryLegend: React.FC<any>;
  VictoryThemeInterface: VictoryThemeInterface;
};

export default VictoryNativeTypes; 
