import React, { useState } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, TextInputProps } from 'react-native';
import TextField from './TextField';

const EYE_ON  = require('@/assets/dsin/eyeOn.png');
const EYE_OFF = require('@/assets/dsin/eyeOff.png');

export default function PasswordField({ style, ...rest }: TextInputProps) {
  const [hidden, setHidden] = useState(true);
  return (
    <View style={{ position: 'relative' }}>
      <TextField {...rest} secureTextEntry={hidden} style={[{ paddingRight: 40 }, style]} />
      <TouchableOpacity onPress={() => setHidden((s) => !s)} style={styles.eye}>
        <Image source={hidden ? EYE_OFF : EYE_ON} style={{ width: 22, height: 22 }} resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  eye: { position: 'absolute', right: 8, top: 9, height: 22, width: 22, alignItems: 'center', justifyContent: 'center' },
});
