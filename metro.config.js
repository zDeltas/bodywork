const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Create the base configuration
const config = getDefaultConfig(__dirname);
const { transformer, resolver } = config;
const {
  wrapWithReanimatedMetroConfig
} = require('react-native-reanimated/metro-config');

// Configure SVG Transformer
config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer')
};

// Configure extensions and paths
config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...resolver.sourceExts, 'svg'],
  extraNodeModules: {
    '@': path.resolve(__dirname, 'app')
  }
};

module.exports = wrapWithReanimatedMetroConfig(config);
