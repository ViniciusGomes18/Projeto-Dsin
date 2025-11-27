import React, { useState } from 'react';
import { View, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import RoundIconButton from '../src/components/RoundIconButton';
import { sendTicketPhoto } from '../src/services/api';

const PALETTE = {
  green: '#22c55e',
  red: '#ef4444',
  yellow: '#F1B420',
  grayBar: 'rgba(0,0,0,0.35)',
};

export default function ReviewScreen() {
  const { uri } = useLocalSearchParams<{ uri?: string }>();
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);

  const sendToAnalysis = async () => {
    if (!uri || isSending) return;

    try {
      setIsSending(true);
      const result = await sendTicketPhoto(uri);

      if (!result.success) {
        Alert.alert('Erro', result.message ?? 'Falha ao enviar a foto para análise.');
        return;
      }

      router.replace('/TicketListScreen?sent=1');
    } catch (err: any) {
      Alert.alert(
        'Erro',
        err?.message ?? 'Ocorreu um erro ao enviar a foto para análise.'
      );
    } finally {
      setIsSending(false);
    }
  };

  if (!uri) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri }}
        style={[styles.photo, { transform: [{ scaleX: 1 }] }]}
        resizeMode="cover"
      />

      <View style={styles.actions}>
        <RoundIconButton
          lib="mat"
          name="close"
          bg={PALETTE.red}
          onPress={() => router.back()}
        />
        <RoundIconButton
          lib="ion"
          name="cloud-upload-outline"
          bg={PALETTE.yellow}
          color="#2F3C46"
          onPress={sendToAnalysis}
        />
      </View>

      {isSending && (
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.25)',
          }}
        >
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  photo: { flex: 1 },
  actions: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'rgba(0,0,0,0.25)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});
