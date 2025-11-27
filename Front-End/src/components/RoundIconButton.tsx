import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

type Lib = 'ion' | 'mat' | 'mci';
type Props = {
  lib?: Lib;
  name: string;
  size?: number;
  color?: string;
  bg?: string;
  style?: ViewStyle;
  onPress?: () => void;
};

export default function RoundIconButton({
  lib = 'ion',
  name,
  size = 26,
  color = '#ffffff',
  bg = 'rgba(0,0,0,0.35)',
  style,
  onPress,
}: Props) {
  const Icon =
    lib === 'mat' ? MaterialIcons : lib === 'mci' ? MaterialCommunityIcons : Ionicons;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[styles.btn, { backgroundColor: bg }, style]}>
      <Icon name={name as any} size={size} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
  },
});
