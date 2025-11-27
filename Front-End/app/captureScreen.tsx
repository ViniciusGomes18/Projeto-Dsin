import React, { useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import RoundIconButton from '../src/components/RoundIconButton';

const { width } = Dimensions.get('window');
const PALETTE = {
  header: '#3D4F5A',
  yellow: '#F1B420',
  grayDark: '#2F3C46',
  scrim: 'rgba(0,0,0,0.35)',
};

export default function CaptureScreen() {
  const router = useRouter();
  const camRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [ready, setReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: PALETTE.grayDark }} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.fill, styles.center, { backgroundColor: PALETTE.grayDark }]}>
        <RoundIconButton name="camera" onPress={requestPermission} />
      </View>
    );
  }

  const takePicture = async () => {
    if (!ready || !camRef.current || isCapturing) return;

    setIsCapturing(true);
    try {
      const photo = await camRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: true,
        base64: false,
      });

      if (photo?.uri) {
        router.push({
          pathname: '/review',
          params: { uri: photo.uri },
        });
      }
    } catch (error) {
      console.log('Erro ao tirar foto', error);
      Alert.alert('Erro', 'Não foi possível capturar a foto.');
    } finally {
      setIsCapturing(false);
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Permita acesso à galeria para selecionar uma imagem.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    if (asset?.uri) {
      router.push({
        pathname: '/review',
        params: { uri: asset.uri },
      });
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={[styles.fill, { width }]}>
      <CameraView
        ref={camRef}
        style={styles.fill}
        facing="back"
        onCameraReady={() => setReady(true)}
      />

      <View style={styles.bottomBar}>
        <RoundIconButton name="arrow-back" onPress={handleBack} />

        <TouchableOpacity onPress={takePicture} activeOpacity={0.8} style={styles.shutter}>
          <View style={styles.shutterInner} />
        </TouchableOpacity>

        <RoundIconButton lib="mci" name="image-plus" onPress={pickFromGallery} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },

  shutter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 6,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
  },
});
