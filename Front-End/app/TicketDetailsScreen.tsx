import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

import Header from '../src/components/Header';
import { getTicketById } from '../src/services/api';

const Colors = {
  bg: '#EEF1F4',
  card: '#FFFFFF',
  textDark: '#1C2430',
  textMuted: '#5D6B78',
  border: '#E3E7ED',
};

type TicketDetail = {
  id: string;
  plate: string;
  vehicleModel: string;
  vehicleColor: string;
  violationCode: string;
  violationDescription: string;
  occurredAt: string;
  location?: string | null;
  driverName?: string | null;
  driverCpf?: string | null;
  status: string;
  severity: string;
  ticketImageBase64?: string | null;
};

export default function TicketDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const data = await getTicketById(String(id));
        setTicket(data);
      } catch (err) {
        console.log('Erro ao carregar detalhes da multa:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#3D4F5A" />
        <View style={styles.screen}>
          <Header showBack />
          <View style={styles.center}>
            <ActivityIndicator />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!ticket) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#3D4F5A" />
        <View style={styles.screen}>
          <Header showBack />
          <View style={styles.center}>
            <Text>Multa não encontrada.</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const dateObj = new Date(ticket.occurredAt);
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const yyyy = dateObj.getFullYear();
  const hh = String(dateObj.getHours()).padStart(2, '0');
  const min = String(dateObj.getMinutes()).padStart(2, '0');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#3D4F5A" />
      <View style={styles.screen}>
        <Header showBack />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Veículo */}
          <View style={styles.card}>
            <Text style={styles.title}>{ticket.vehicleModel}</Text>
            <Text style={styles.subtitle}>Cor: {ticket.vehicleColor}</Text>
            <Text style={styles.subtitle}>Placa: {ticket.plate}</Text>
          </View>

          {/* Situação */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Situação</Text>

            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>{ticket.status}</Text>

            <Text style={styles.label}>Gravidade</Text>
            <Text style={styles.value}>{ticket.severity}</Text>
          </View>

          {/* Motivo */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Motivo</Text>

            <Text style={styles.label}>Código</Text>
            <Text style={styles.value}>{ticket.violationCode}</Text>

            <Text style={styles.label}>Descrição</Text>
            <Text style={styles.value}>{ticket.violationDescription}</Text>
          </View>

          {/* Condutor */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Condutor</Text>

            <Text style={styles.label}>Nome</Text>
            <Text style={styles.value}>{ticket.driverName ?? '-'}</Text>

            <Text style={styles.label}>CPF</Text>
            <Text style={styles.value}>{ticket.driverCpf ?? '-'}</Text>
          </View>

          {/* Local / Data */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Local e data</Text>

            <Text style={styles.label}>Local</Text>
            <Text style={styles.value}>{ticket.location ?? '-'}</Text>

            <Text style={styles.value}>
              {dd}/{mm}/{yyyy} às {hh}:{min}
            </Text>
          </View>

          {/* Imagem */}
          {ticket.ticketImageBase64 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Foto do talão</Text>

              <Image
                source={{
                  uri: `data:image/jpeg;base64,${ticket.ticketImageBase64}`,
                }}
                resizeMode="cover"
                style={styles.image}
              />
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#3D4F5A',
  },
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textDark,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 6,
  },
  label: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  value: {
    fontSize: 13,
    color: Colors.textDark,
  },
  image: {
    marginTop: 8,
    width: '100%',
    height: 280,
    borderRadius: 12,
  },
});
