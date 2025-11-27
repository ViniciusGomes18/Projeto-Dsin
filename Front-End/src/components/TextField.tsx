import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';

export default function TextField(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor="#9aa4aa"
      {...props}
      style={[styles.input, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#2F3C46',
    marginBottom: 12,
  },
});
