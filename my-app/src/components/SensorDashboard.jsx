import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../lib/theme';
import { useSensors } from '../lib/useSensors';
 
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
 
export default function SensorDashboard() {
  const r = useSensors();
  if (!r) return <Text style={styles.empty}>Waiting for sensor data…</Text>;
 
  return (
    <View>
      <View style={styles.grid}>
        <Card icon="flask-outline" label="pH" value={r.ph.toFixed(2)} />
        <Card icon="thermometer-outline" label="Temperature" value={r.temperature.toFixed(1)} unit="°C" />
        <Card icon="water-outline" label="Humidity" value={Math.round(r.humidity)} unit="%" />
        <Card icon="beaker-outline" label="Water level" value={Math.round(r.water_level)} unit="%" />
      </View>
      <View style={[styles.card, styles.wide]}>
        <Ionicons name="umbrella-outline" size={22} color={r.shade_net_active ? colors.leaf : colors.muted} />
        <Text style={styles.label}>Shade net motor</Text>
        <Text style={[styles.value, { color: r.shade_net_active ? colors.leaf : colors.muted }]}>
          {r.shade_net_active ? 'Active' : 'Inactive'}
        </Text>
      </View>
      <Text style={styles.stamp}>Updated {new Date(r.created_at).toLocaleTimeString()}</Text>
    </View>
  );
}
 
const styles = StyleSheet.create({
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
  empty: { color: colors.muted, textAlign: 'center' },
});
 
