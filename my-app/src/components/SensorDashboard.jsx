import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../lib/theme';
import { useSensors } from '../lib/useSensors';

const STALE_AFTER_MS = 2 * 60 * 1000;

const fmt = (v, digits = 0) => (v == null || Number.isNaN(Number(v)) ? '--' : Number(v).toFixed(digits));

function ago(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

function Card({ icon, label, value, unit, active }) {
  return (
    <View style={styles.card}>
      <Ionicons name={icon} size={22} color={active === false ? colors.muted : colors.leaf} />
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>
        {value}
        {unit ? <Text style={styles.unit}> {unit}</Text> : null}
      </Text>
    </View>
  );
}

function LiveBadge({ live, stale }) {
  const color = !live ? colors.muted : stale ? colors.error : colors.leaf;
  const text = !live ? 'Offline' : stale ? 'No new data' : 'Live';
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.badgeText, { color }]}>{text}</Text>
    </View>
  );
}

export default function SensorDashboard() {
  const { reading: r, live } = useSensors();
  const now = useNow();
  if (!r) {
    return (
      <View>
        <LiveBadge live={live} stale={false} />
        <Text style={styles.empty}>Waiting for sensor data…</Text>
      </View>
    );
  }

  const age = now - new Date(r.created_at).getTime();
  const stale = age > STALE_AFTER_MS;

  return (
    <View>
      <View style={styles.statusRow}>
        <LiveBadge live={live} stale={stale} />
        {r.device_id ? <Text style={styles.device}>{r.device_id}</Text> : null}
      </View>
      <View style={styles.grid}>
        <Card icon="flask-outline" label="pH" value={fmt(r.ph, 2)} />
        <Card icon="thermometer-outline" label="Temperature" value={fmt(r.temperature, 1)} unit="°C" />
        <Card icon="water-outline" label="Humidity" value={fmt(r.humidity)} unit="%" />
        <Card icon="beaker-outline" label="Water level" value={fmt(r.water_level)} unit="%" />
      </View>
      <View style={[styles.card, styles.wide]}>
        <Ionicons name="umbrella-outline" size={22} color={r.shade_net_active ? colors.leaf : colors.muted} />
        <Text style={styles.label}>Shade net motor</Text>
        <Text style={[styles.value, { color: r.shade_net_active ? colors.leaf : colors.muted }]}>
          {r.shade_net_active == null ? '--' : r.shade_net_active ? 'Active' : 'Inactive'}
        </Text>
      </View>
      <Text style={[styles.stamp, stale && { color: colors.error }]}>
        Updated {ago(age)} · {new Date(r.created_at).toLocaleTimeString()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  device: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '48%',
    backgroundColor: colors.mist,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  wide: { width: '100%', marginTop: 12 },
  label: { fontSize: 13, color: colors.muted, fontWeight: '600' },
  value: { fontSize: 28, fontWeight: '800', color: colors.ink },
  unit: { fontSize: 16, fontWeight: '600', color: colors.muted },
  stamp: { marginTop: 12, fontSize: 12, color: colors.muted, textAlign: 'center' },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 12 },
});
