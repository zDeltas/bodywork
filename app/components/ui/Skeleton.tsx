import React, { useEffect } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useTheme } from '@/app/hooks/useTheme';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: any;
}

const Skeleton: React.FC<SkeletonProps> = ({
                                             width = '100%',
                                             height = 20,
                                             borderRadius = 4,
                                             style
                                           }) => {
  const { theme } = useTheme();
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true
      })
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, []);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['-100%', '100%']
  });

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.colors.background.button,
          overflow: 'hidden'
        },
        style
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            backgroundColor: theme.colors.background.card,
            transform: [{ translateX }]
          }
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative'
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3
  }
});

export default Skeleton;
