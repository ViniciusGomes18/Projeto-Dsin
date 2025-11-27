import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  Dimensions,
  Platform,
  Animated,
  StatusBar,
} from 'react-native';
import Header from '../src/components/Header';
import { useFadeOnFocus } from '../src/hooks/useFadeOnFocus';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const H_PADDING = 24;
const COL_GAP = 28;
const ROW_GAP = 26;
const TOP_SPACING = 28;
const BOTTOM_SPACING = 36;
const MAX_TILE = 128;
const ICON_SIZE = 36;

const { width } = Dimensions.get('window');
const tileSize = Math.min(
  Math.floor((width - H_PADDING * 2 - COL_GAP) / 2),
  MAX_TILE
);

const ITEMS = [
  { key: 'talao',        label: 'Talão Eletrônico',   src: require('../assets/dsin/phone.png') },
  { key: 'registro',     label: 'Registro de Multas', src: require('../assets/dsin/bo.png') },
  { key: 'recolhimento', label: 'Recolhimento',       src: require('../assets/dsin/noParking.png') },
  { key: 'infra',        label: 'Infraestrutura',     src: require('../assets/dsin/infra.png') },
  { key: 'transporte',   label: 'Transporte',         src: require('../assets/dsin/car.png') },
  { key: 'vaga',         label: 'Vaga Especial',      src: require('../assets/dsin/cadeira.png') },
];

export default function Dashboard() {
  const opacity = useFadeOnFocus(280);

  const handlePress = (key: string, label: string) => {
    if (key === 'talao') {
      router.push('/TicketListScreen');
      return;
    }

    alert(`Abrir: ${label}`);
  };

  const handleBackPress = () => {
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#3D4F5A" />
      <Header showBack onBackPress={handleBackPress} useLogoutIcon />

      <Animated.View style={{ flex: 1, opacity }}>
        <ImageBackground
          source={require('../assets/dsin/background.jpg')}
          resizeMode="cover"
          style={styles.bg}
          imageStyle={{ opacity: 1.0 }}
        >
          <View style={styles.content}>
            <View style={styles.grid}>
              {ITEMS.map((it) => (
                <TouchableOpacity
                  key={it.key}
                  activeOpacity={0.92}
                  onPress={() => handlePress(it.key, it.label)}
                  style={[styles.tile, { width: tileSize, height: tileSize }]}
                >
                  <Image source={it.src} style={styles.tileIcon} />
                  <Text style={styles.tileText}>{it.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ImageBackground>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#3D4F5A',
  },
  bg: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: TOP_SPACING,
    paddingBottom: BOTTOM_SPACING,
    alignItems: 'center',
  },
  grid: {
    width: '100%',
    maxWidth: 720,
    paddingHorizontal: H_PADDING,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: COL_GAP,
    rowGap: ROW_GAP,
  },
  tile: {
    backgroundColor: '#F1B420',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: Platform.select({ ios: 0.18, default: 0.22 }),
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  tileIcon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  tileText: {
    color: '#2F3C46',
    fontWeight: '700',
    textAlign: 'center',
  },
});
