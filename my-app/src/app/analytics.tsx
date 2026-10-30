import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../lib/AuthContext';
import { colors } from '../lib/theme';
import { getHistoricalData, getSensorData } from '../lib/iotService';

export default function Analytics() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const historicalData = getHistoricalData();
  const currentSensorData = getSensorData();

  if (loading) return null;
  if (!user) return <Redirect href="/auth/login" />;

  const SimpleBarChart = ({ data, color, maxValue }: { data: any[]; color: string; maxValue: number }) => {
    const barWidth = 24;
    const gap = 12;
    const chartHeight = 120;

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartBars}>
          {data.map((item, index) => {
            const height = (item.value / maxValue) * chartHeight;
            const displayValue = typeof item.value === 'number' ? Math.round(item.value) : item.value;
            return (
              <View key={index} style={styles.barWrapper}>
                <View style={[styles.bar, { height, backgroundColor: color }]} />
                <Text style={styles.barValue}>{displayValue}</Text>
                <Text style={styles.barLabel}>{item.day}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const StatCard = ({ label, value, icon, color }: { label: string; value: string; icon: any; color: string }) => (
    <View style={styles.summaryCard}>
      <View style={[styles.summaryIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={10}
              style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
            >
              <Ionicons name="arrow-back" size={24} color={colors.ink} />
            </Pressable>
            <Text style={styles.title}>Analytics</Text>
            <View style={styles.placeholder} />
          </View>

          <Text style={styles.sectionTitle}>Weekly Summary</Text>
          <View style={styles.summaryGrid}>
            <StatCard label="Avg Water Level" value={Math.round(currentSensorData.water_level) + '%'} icon="water" color="#2196F3" />
            <StatCard label="Avg pH Level" value={String(currentSensorData.ph_level.toFixed(1))} icon="flask" color="#9C27B0" />
            <StatCard label="Avg Temperature" value={currentSensorData.temperature.toFixed(1) + '°C'} icon="thermometer" color="#FF5722" />
            <StatCard label="Growth Rate" value="+12%" icon="trending-up" color={colors.leaf} />
          </View>

          <Text style={styles.sectionTitle}>Water Level (Last 7 Days)</Text>
          <View style={styles.chartCard}>
            <SimpleBarChart data={historicalData.water_level} color="#2196F3" maxValue={100} />
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#2196F3' }]} />
                <Text style={styles.legendText}>Water Level %</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>pH Level (Last 7 Days)</Text>
          <View style={styles.chartCard}>
            <SimpleBarChart data={historicalData.ph_level} color="#9C27B0" maxValue={8} />
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#9C27B0' }]} />
                <Text style={styles.legendText}>pH Level</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Temperature (Last 7 Days)</Text>
          <View style={styles.chartCard}>
            <SimpleBarChart data={historicalData.temperature} color="#FF5722" maxValue={30} />
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#FF5722' }]} />
                <Text style={styles.legendText}>Temperature °C</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Resource Consumption</Text>
          <View style={styles.resourceCard}>
            <View style={styles.resourceItem}>
              <View style={[styles.resourceIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="water-outline" size={28} color="#2196F3" />
              </View>
              <View style={styles.resourceInfo}>
                <Text style={styles.resourceLabel}>Total Water Used</Text>
                <Text style={styles.resourceValue}>45L</Text>
              </View>
            </View>
            <View style={styles.resourceItem}>
              <View style={[styles.resourceIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="leaf-outline" size={28} color={colors.leaf} />
              </View>
              <View style={styles.resourceInfo}>
                <Text style={styles.resourceLabel}>Nutrient Consumption</Text>
                <Text style={styles.resourceValue}>2.3L</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  scrollView: { flex: 1 },
  container: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: { backgroundColor: colors.line },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: -0.3,
  },
  placeholder: { width: 40 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: colors.mist,
    borderRadius: 16,
    padding: 16,
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  summaryLabel: { fontSize: 12, color: colors.muted, marginBottom: 4 },
  summaryValue: { fontSize: 20, fontWeight: '700', color: colors.ink },
  chartCard: {
    backgroundColor: colors.mist,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  chartContainer: { alignItems: 'center' },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    width: '100%',
  },
  barWrapper: { alignItems: 'center' },
  bar: {
    width: 24,
    borderRadius: 6,
  },
  barValue: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 4,
  },
  barLabel: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 4,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 13,
    color: colors.muted,
  },
  resourceCard: {
    backgroundColor: colors.mist,
    borderRadius: 16,
    padding: 16,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  resourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  resourceInfo: { flex: 1 },
  resourceLabel: { fontSize: 14, color: colors.muted, marginBottom: 2 },
  resourceValue: { fontSize: 18, fontWeight: '700', color: colors.ink },
});
