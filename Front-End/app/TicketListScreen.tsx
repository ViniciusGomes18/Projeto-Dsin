import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SectionList,
  FlatList,
  Alert,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Header from '../src/components/Header';
import { getTickets } from '../src/services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';


const Colors = {
  bg: '#EEF1F4',
  headerRow: '#E5E7EA',
  card: '#FFFFFF',
  textDark: '#1C2430',
  textMuted: '#5D6B78',
  border: '#E3E7ED',
  shadow: 'rgba(16, 24, 40, 0.08)',
  blue: '#D6EBFF',
  blueText: '#1473E6',
  green: '#E3F7E8',
  greenText: '#2E7D32',
  orange: '#FFEED6',
  orangeText: '#C77800',
  red: '#FFE3E3',
  redText: '#C62828',
  inputBg: '#FFFFFF',
  inputBorder: '#D6DADF',
};

type Priority = 'Em Análise' | 'Baixa' | 'Média' | 'Urgente';

type Ticket = {
  id: string;
  vehicle: string;
  plate: string;
  reason: string;
  date: string;
  priority: Priority;
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return { day: '--/--/----', time: '--:--' };
  }
  const day = d.toLocaleDateString('pt-BR');
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return { day, time };
}

function dateKey(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '--/--';
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}`;
}

function normalize(s: string) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function matchesPlate(q: string, t: Ticket) {
  return normalize(t.plate).includes(normalize(q));
}
function matchesVehicle(q: string, t: Ticket) {
  return normalize(t.vehicle).includes(normalize(q));
}
function matchesReason(q: string, t: Ticket) {
  return normalize(t.reason).includes(normalize(q));
}
function matchesDate(q: string, t: Ticket) {
  const { day } = fmtDate(t.date);
  const ymd = day.split('/').reverse().join('-');
  const norm = q.replace(/\s+/g, '');
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(norm)) return day === norm;
  if (/^\d{2}\/\d{2}$/.test(norm)) return day.startsWith(norm);
  if (/^\d{4}-\d{2}-\d{2}$/.test(norm)) return ymd === norm;
  return false;
}
function matchesTime(q: string, t: Ticket) {
  const { time } = fmtDate(t.date);
  const norm = q.replace(/\s+/g, '');
  if (/^\d{2}:\d{2}$/.test(norm)) return time.startsWith(norm);
  return false;
}
function formatDateLabel(d: Date | null) {
  if (!d) return 'dd/mm/aaaa';
  return d.toLocaleDateString('pt-BR');
}

function formatTimeLabel(d: Date | null) {
  if (!d) return '--:--';
  return d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

type SuggestionKind = 'Placa' | 'Veículo' | 'Motivo' | 'Data' | 'Hora';
type Suggestion = { value: string; kind: SuggestionKind };

function uniqueBy<T>(arr: T[], key: (x: T) => string) {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const it of arr) {
    const k = key(it);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(it);
    }
  }
  return out;
}

function buildSuggestions(q: string, data: Ticket[], limit = 12): Suggestion[] {
  const nq = normalize(q);
  if (!nq) return [];

  const byPlate: Suggestion[] = data
    .map((t) => t.plate)
    .filter((p) => normalize(p).startsWith(nq))
    .map((v) => ({ value: v, kind: 'Placa' }));

  const byVehicle: Suggestion[] = data
    .map((t) => t.vehicle)
    .filter((v) => normalize(v).startsWith(nq))
    .map((v) => ({ value: v, kind: 'Veículo' }));

  const byReason: Suggestion[] = data
    .map((t) => t.reason)
    .filter((v) => normalize(v).startsWith(nq))
    .map((v) => ({ value: v, kind: 'Motivo' }));

  const byDate: Suggestion[] = data
    .map((t) => fmtDate(t.date).day)
    .filter((d) => d.startsWith(q) || d.replace(/\//g, '').startsWith(nq))
    .map((v) => ({ value: v, kind: 'Data' }));

  const byTime: Suggestion[] = data
    .map((t) => fmtDate(t.date).time)
    .filter((h) => h.startsWith(q))
    .map((v) => ({ value: v, kind: 'Hora' }));

  const all = uniqueBy<Suggestion>(
    [...byPlate, ...byVehicle, ...byReason, ...byDate, ...byTime],
    (x) => `${x.kind}|${x.value}`
  );

  return all.slice(0, limit);
}

type ListItemProps = { item: Ticket; onPress: () => void };

const ListItem = ({ item, onPress }: ListItemProps) => {
  const { day, time } = fmtDate(item.date);
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.colVehicle}>
            <Text style={styles.vehicle} numberOfLines={2}>
              {item.vehicle}
            </Text>
          </View>

          <View style={styles.colPlate}>
            <Text style={styles.plate}>{item.plate}</Text>
          </View>

          <View style={styles.colDate}>
            <Text style={styles.dateDay}>{day}</Text>
            <Text style={styles.dateTime}>{time}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
const TableHeader = () => (
  <View style={styles.tableHeader}>
    <Text style={[styles.th, { flex: 2 }]}>Veículo</Text>
    <Text style={[styles.th, { flex: 1.9 }]}>Placa</Text>
    <Text style={[styles.th, { flex: 0.8 }]}>Data</Text>
  </View>
);

const SectionHeader = ({ title }: { title: string }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionText}>{title}</Text>
  </View>
);

const SuggestionChip = ({ kind }: { kind: SuggestionKind }) => {
  const map: Record<SuggestionKind, string> = {
    Placa: 'Placa',
    Veículo: 'Veículo',
    Motivo: 'Motivo',
    Data: 'Data',
    Hora: 'Hora',
  };
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{map[kind]}</Text>
    </View>
  );
};

export default function TicketListScreen() {
  const [query, setQuery] = useState('');
  const [showSug, setShowSug] = useState(true);
  const [data, setData] = useState<Ticket[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showSentBanner, setShowSentBanner] = useState(false);

  const [showFilters, setShowFilters] = useState(false);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [pickerTarget, setPickerTarget] = useState<
    'startDate' | 'endDate' | 'startTime' | 'endTime' | null
  >(null);

  const openPicker = (mode: 'date' | 'time', target: typeof pickerTarget) => {
    setPickerMode(mode);
    setPickerTarget(target);
    setPickerVisible(true);
  };

  const handlePickerChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === 'dismissed') {
      setPickerVisible(false);
      return;
    }
    if (!date || !pickerTarget) {
      setPickerVisible(false);
      return;
    }

    switch (pickerTarget) {
      case 'startDate':
        setStartDate(date);
        break;
      case 'endDate':
        setEndDate(date);
        break;
      case 'startTime':
        setStartTime(date);
        break;
      case 'endTime':
        setEndTime(date);
        break;
    }

    setPickerVisible(false);
  };

  const handleClearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setStartTime(null);
    setEndTime(null);
  };

  const handleApplyFilters = () => {
    setShowFilters(false);
  };

  const router = useRouter();
  const { sent } = useLocalSearchParams<{ sent?: string }>();

  const loadTickets = async () => {
    try {
      setRefreshing(true);

      const apiData = await getTickets();

      const mapped: Ticket[] = (apiData as any[]).map((t) => ({
        id: String(t.id),
        vehicle: t.vehicle,
        plate: t.plate,
        reason: t.reason,
        date: t.date || new Date().toISOString(),
        priority: (t.priority as Priority) ?? 'Em Análise',
      }));

      setData(mapped);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Erro', 'Não foi possível carregar as multas.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    if (sent === '1') {
      setShowSentBanner(true);
      loadTickets();
    }
  }, [sent]);

  useEffect(() => {
    if (!showSentBanner) return;

    const timer = setTimeout(() => setShowSentBanner(false), 4000);
    return () => clearTimeout(timer);
  }, [showSentBanner]);

    const filtered = useMemo(() => {
    const q = query.trim();
    let base: Ticket[] = data;

    // filtro de texto (placa, veículo, motivo, data, hora)
    if (q) {
      base = data.filter(
        (t) =>
          matchesPlate(q, t) ||
          matchesVehicle(q, t) ||
          matchesReason(q, t) ||
          matchesDate(q, t) ||
          matchesTime(q, t),
      );
    }

    const hasDateFilter = !!startDate || !!endDate;
    const hasTimeFilter = !!startTime || !!endTime;

    if (!hasDateFilter && !hasTimeFilter) {
      return base;
    }

    return base.filter((t) => {
      const d = new Date(t.date);
      if (Number.isNaN(d.getTime())) return false;

      // DATA (só ano/mês/dia)
      if (hasDateFilter) {
        const onlyDate = new Date(
          d.getFullYear(),
          d.getMonth(),
          d.getDate(),
        ).getTime();

        if (startDate) {
          const s = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate(),
          ).getTime();
          if (onlyDate < s) return false;
        }

        if (endDate) {
          const e = new Date(
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate(),
          ).getTime();
          if (onlyDate > e) return false;
        }
      }

      if (hasTimeFilter) {
        const minutes = d.getHours() * 60 + d.getMinutes();

        if (startTime) {
          const sm = startTime.getHours() * 60 + startTime.getMinutes();
          if (minutes < sm) return false;
        }

        if (endTime) {
          const em = endTime.getHours() * 60 + endTime.getMinutes();
          if (minutes > em) return false;
        }
      }

      return true;
    });
  }, [query, data, startDate, endDate, startTime, endTime]);

  const suggestions = useMemo(() => buildSuggestions(query, data), [query, data]);

  const sections = useMemo(() => {
    const map = new Map<string, Ticket[]>();
    for (const t of filtered) {
      const key = dateKey(t.date);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => {
        const [da, ma] = a.split('/').map(Number);
        const [db, mb] = b.split('/').map(Number);
        if (ma !== mb) return mb - ma;
        return db - da;
      })
      .map(([title, data]) => ({ title, data }));
  }, [filtered]);

  const applySuggestion = (s: Suggestion) => {
    setQuery(s.value);
    setShowSug(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#3D4F5A" />
      <View style={styles.screen}>
        <Header
          showBack
          rightSlot={
            <TouchableOpacity
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#FFC800',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.15)',
              }}
              onPress={() => router.push('/captureScreen')}
              hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Abrir câmera"
            >
              <Ionicons name="camera-outline" size={20} color="#EAF0F5" />
            </TouchableOpacity>
          }
        />

        {showSentBanner && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>
              Foto enviada. Multa em processamento...
            </Text>
          </View>
        )}

        <View style={styles.searchRow}> 
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color={Colors.textMuted} />
            <TextInput
              placeholder="Buscar placa, datas, veículos..."
              placeholderTextColor={Colors.textMuted}
              value={query}
              onChangeText={(t) => {
                setQuery(t);
                setShowSug(true);
              }}
              style={styles.input}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity 
            style={styles.filterBtn}
            onPress={() => setShowFilters((prev) => !prev)}
          >
            <MaterialIcons name="filter-list" size={22} color={Colors.textDark} />
          </TouchableOpacity>
        </View>
               {showFilters && (
          <View style={styles.filtersContainer}>
            <Text style={styles.filterTitle}>Data</Text>
            <View style={styles.filterRow}>
              <TouchableOpacity
                style={styles.inputLike}
                onPress={() => openPicker('date', 'startDate')}
              >
                <Text style={styles.inputLikeLabel}>De</Text>
                <Text style={styles.inputLikeValue}>
                  {formatDateLabel(startDate)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.inputLike}
                onPress={() => openPicker('date', 'endDate')}
              >
                <Text style={styles.inputLikeLabel}>Até</Text>
                <Text style={styles.inputLikeValue}>
                  {formatDateLabel(endDate)}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.filterTitle}>Horário</Text>
            <View style={styles.filterRow}>
              <TouchableOpacity
                style={styles.inputLike}
                onPress={() => openPicker('time', 'startTime')}
              >
                <Text style={styles.inputLikeLabel}>De</Text>
                <Text style={styles.inputLikeValue}>
                  {formatTimeLabel(startTime)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.inputLike}
                onPress={() => openPicker('time', 'endTime')}
              >
                <Text style={styles.inputLikeLabel}>Até</Text>
                <Text style={styles.inputLikeValue}>
                  {formatTimeLabel(endTime)}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.filterActions}>
              <TouchableOpacity
                style={[styles.filterButton, styles.clearFilterButton]}
                onPress={handleClearFilters}
              >
                <Text style={styles.clearFilterText}>Limpar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterButton, styles.applyFilterButton]}
                onPress={handleApplyFilters}
              >
                <Text style={styles.applyFilterText}>Aplicar filtros</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {pickerVisible && (
          <DateTimePicker
            mode={pickerMode}
            value={new Date()}
            is24Hour
            onChange={handlePickerChange}
          />
        )}
        {showSug && suggestions.length > 0 && (
          <View style={styles.suggestBox}>
            <FlatList
              keyboardShouldPersistTaps="handled"
              data={suggestions}
              keyExtractor={(it, i) => it.kind + it.value + i}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestItem}
                  onPress={() => applySuggestion(item)}
                >
                  <SuggestionChip kind={item.kind} />
                  <Text numberOfLines={1} style={styles.suggestText}>
                    {item.value}
                  </Text>
                </TouchableOpacity>
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}

        <TableHeader />

        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled={false}
          SectionSeparatorComponent={() => <View style={{ height: 6 }} />}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderSectionHeader={({ section }) => (
            <SectionHeader title={section.title} />
          )}
          renderItem={({ item }) => (
            <ListItem
              item={item}
              onPress={() =>
                router.push(`/TicketDetailsScreen?id=${item.id}` as any)
              }
            />
          )}
          ListEmptyComponent={
            <View style={{ padding: 24, alignItems: 'center' }}>
              <Text style={{ color: Colors.textMuted }}>Nenhum resultado</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 24 }}
          style={{ flex: 1 }}
          onScrollBeginDrag={() => setShowSug(false)}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadTickets} />
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#3D4F5A',
  },
  screen: { flex: 1, backgroundColor: Colors.bg },

  banner: {
    marginTop: 8,
    marginHorizontal: 12,
    marginBottom: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#DBEAFE',
  },
  bannerText: {
    color: '#1D4ED8',
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginTop: 8,
    marginBottom: 6,
    gap: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    gap: 8,
    height: 42,
  },
  input: { flex: 1, color: Colors.textDark, paddingVertical: 0 },

  filterBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.inputBg,
    borderColor: Colors.inputBorder,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  suggestBox: {
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  suggestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  suggestText: {
    maxWidth: 200,
    color: Colors.textDark,
    fontSize: 12,
  },

  chip: {
    backgroundColor: '#E0E7FF',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#3730A3',
  },

  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 50,
    paddingVertical: 6,
    backgroundColor: Colors.headerRow,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    marginTop: 5,
  },
  th: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: Colors.textMuted,
  },

  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionText: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 8,
    elevation: 2,
    borderColor: Colors.border,
    borderWidth: 1,
    marginHorizontal: 12,
  },
  row: { flexDirection: 'row', alignItems: 'center' },

  colVehicle: { flex: 1.4, paddingRight: 4 },
  colPlate: { flex: 1.0, paddingRight: 4 },
  colDate: { flex: 1.0 },
  colPrio: { flex: 1.0, alignItems: 'flex-end' },

  vehicle: {
    color: Colors.textDark,
    fontWeight: '700',
    fontSize: 13,
    lineHeight: 17,
  },
  plate: {
    color: Colors.textDark,
    fontWeight: '700',
    fontSize: 13,
    lineHeight: 17,
  },
  reason: { color: Colors.textDark, fontSize: 12, textAlign: 'center' },

  dateDay: { color: Colors.textDark, fontSize: 13, textAlign: 'left' },
  dateTime: { color: Colors.textDark, fontSize: 13, textAlign: 'left' },

    filtersContainer: {
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  filterTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 4,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  inputLike: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  inputLikeLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  inputLikeValue: {
    fontSize: 13,
    color: Colors.textDark,
    marginTop: 2,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearFilterButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#FFFFFF',
  },
  applyFilterButton: {
    backgroundColor: Colors.blueText,
  },
  clearFilterText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  applyFilterText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
