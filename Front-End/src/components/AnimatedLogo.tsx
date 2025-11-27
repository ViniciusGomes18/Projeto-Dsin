import React, { useRef } from 'react';
import { Animated, Easing, Image, ImageSourcePropType, StyleProp, ViewStyle, StyleSheet } from 'react-native';
import { useOnceOnFocus } from '@/src/hooks/useOnceOnFocus';

type Props = {
  source: ImageSourcePropType;
  width?: number;
  height?: number;
  containerStyle?: StyleProp<ViewStyle>;
  fadeInMs?: number;
  stayMs?: number;
  fadeOutMs?: number;
  onFinish?: () => void;
};

export function AnimatedLogo({
  source, width = 140, height = 140, containerStyle,
  fadeInMs = 300, stayMs = 1500, fadeOutMs = 280, onFinish,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;

  useOnceOnFocus(() => {
    opacity.setValue(0);
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: fadeInMs, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.delay(stayMs),
      Animated.timing(opacity, { toValue: 0, duration: fadeOutMs, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]).start(() => onFinish?.());
    return () => { opacity.stopAnimation(); opacity.setValue(0); };
  });

  return (
    <Animated.View pointerEvents="none" style={[styles.centerFill, containerStyle, { opacity }]}>
      <Image source={source} style={{ width, height }} resizeMode="contain" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  centerFill: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
});
