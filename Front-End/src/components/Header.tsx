import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  showBack?: boolean;
  rightSlot?: React.ReactNode;
  onBackPress?: () => void;
  useLogoutIcon?: boolean;
};

const SIDE_SIZE = 36;

export default function Header({
  showBack = false,
  rightSlot,
  onBackPress,
  useLogoutIcon = false,
}: Props) {
  const router = useRouter();

  const handleLeftPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const iconName = useLogoutIcon ? 'log-out-outline' : 'arrow-back';

  return (
    <View style={styles.container}>
      {showBack ? (
        <TouchableOpacity
          onPress={handleLeftPress}
          style={styles.sideBtn}
          hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
          accessibilityRole="button"
          accessibilityLabel={useLogoutIcon ? 'Sair' : 'Voltar'}
        >
          <Ionicons name={iconName} size={22} color="#fff" />
        </TouchableOpacity>
      ) : (
        <View style={styles.sidePlaceholder} />
      )}

      <View style={styles.center}>
        <Image
          source={require('../../assets/dsin/Dsin.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.sideBox}>
        {rightSlot ?? <View style={styles.sidePlaceholder} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 70,
    backgroundColor: '#3D4F5A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  sideBox: {
    width: SIDE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideBtn: {
    width: SIDE_SIZE,
    height: SIDE_SIZE,
    borderRadius: SIDE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidePlaceholder: {
    width: SIDE_SIZE,
    height: SIDE_SIZE,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 110,
    height: 40,
  },
});
