import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { colors } from '../lib/theme';
import AnimatedButton from '../components/AnimatedButton';
import { getSensorData, checkThresholds, simulateSensorUpdate } from '../lib/iotService';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}


export default function Dashboard() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [sensorData, setSensorData] = useState(getSensorData());
  const [alerts, setAlerts] = useState(checkThresholds());

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedData = simulateSensorUpdate();
      setSensorData(updatedData);
      setAlerts(checkThresholds());
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) return null;
  if (!user) return <Redirect href="/auth/login" />;

  const firstName = user?.name?.trim()?.split(' ')[0] ?? 'There';

  const handleLogout = async () => {
    await signOut();
    router.replace('/auth/login');
  };

  const StatCard = ({ icon, label, value, unit, color }: { icon: any; label: string; value: string | number; unit: string; color: string }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>
        {value}
        <Text style={styles.statUnit}>{unit}</Text>
      </Text>
    </View>
  );

  const AlertItem = ({ type, message, time }: { type: string; message: string; time: string }) => (
    <View style={styles.alertItem}>
      <View style={[styles.alertIcon, { backgroundColor: type === 'warning' ? '#FFF3E0' : '#E3F2FD' }]}>
        <Ionicons 
          name={type === 'warning' ? 'warning' : 'information-circle'} 
          size={20} 
          color={type === 'warning' ? '#FF9800' : '#2196F3'} 
        />
      </View>
      <View style={styles.alertContent}>
        <Text style={styles.alertMessage}>{message}</Text>
        <Text style={styles.alertTime}>{time}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.brand}>
              <View style={styles.mark}>
                <Ionicons name="water" size={20} color="#fff" />
              </View>
              <Text style={styles.brandName}>HydroVerde</Text>
            </View>
            <Pressable
              onPress={handleLogout}
              hitSlop={10}
              accessibilityLabel="Log out"
              style={({ pressed }) => [styles.logout, pressed && styles.logoutPressed]}
            >
              <Ionicons name="log-out-outline" size={22} color={colors.ink} />
            </Pressable>
          </View>

          <View style={styles.greetingSection}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.name}>{firstName}</Text>
            <View style={[styles.statusBadge, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="checkmark-circle" size={16} color={colors.leaf} />
              <Text style={[styles.statusText, { color: colors.leaf }]}>System Healthy</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>System Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard icon="water" label="Water Level" value={Math.round(sensorData.water_level)} unit="%" color="#2196F3" />
            <StatCard icon="flask" label="pH Level" value={sensorData.ph_level.toFixed(1)} unit="" color="#9C27B0" />
            <StatCard icon="thermometer" label="Temperature" value={sensorData.temperature.toFixed(1)} unit="°C" color="#FF5722" />
            <StatCard icon="leaf" label="Nutrients" value={Math.round(sensorData.nutrient_level)} unit="%" color={colors.leaf} />
          </View>

          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.alertsContainer}>
            {alerts.length > 0 ? alerts.map((alert: any, index: number) => (
              <AlertItem key={index} type={alert.type} message={alert.message} time="Just now" />
            )) : (
              <Text style={styles.noAlerts}>No alerts - System operating normally</Text>
            )}
          </View>

          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <AnimatedButton style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="water-outline" size={28} color="#2196F3" />
              </View>
              <Text style={styles.actionLabel}>Water Now</Text>
            </AnimatedButton>
            <AnimatedButton style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="flask-outline" size={28} color={colors.leaf} />
              </View>
              <Text style={styles.actionLabel}>Add Nutrients</Text>
            </AnimatedButton>
            <AnimatedButton style={styles.actionCard} onPress={() => router.push('/controls')}>
              <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="settings-outline" size={28} color="#FF9800" />
              </View>
              <Text style={styles.actionLabel}>Controls</Text>
            </AnimatedButton>
            <AnimatedButton style={styles.actionCard} onPress={() => router.push('/analytics')}>
              <View style={[styles.actionIcon, { backgroundColor: '#F3E5F5' }]}>
                <Ionicons name="analytics-outline" size={28} color="#9C27B0" />
              </View>
              <Text style={styles.actionLabel}>Analytics</Text>
            </AnimatedButton>
            <AnimatedButton style={styles.actionCard} onPress={() => router.push('/devices')}>
              <View style={[styles.actionIcon, { backgroundColor: '#E0F7FA' }]}>
                <Ionicons name="hardware-chip-outline" size={28} color="#00BCD4" />
              </View>
              <Text style={styles.actionLabel}>Devices</Text>
            </AnimatedButton>
            <AnimatedButton style={styles.actionCard} onPress={handleLogout}>
              <View style={[styles.actionIcon, { backgroundColor: '#FFEBEE' }]}>
                <Ionicons name="log-out-outline" size={28} color="#F44336" />
              </View>
              <Text style={styles.actionLabel}>Log Out</Text>
            </AnimatedButton>
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
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.leaf,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.3,
  },
  logout: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutPressed: { backgroundColor: colors.line },
  greetingSection: { marginBottom: 32 },
  greeting: { fontSize: 22, color: colors.muted, fontWeight: '500' },
  name: {
    fontSize: 44,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -1,
    marginTop: 2,
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: { fontSize: 14, fontWeight: '600' },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.mist,
    borderRadius: 16,
    padding: 16,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statLabel: { fontSize: 13, color: colors.muted, marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: '700', color: colors.ink },
  statUnit: { fontSize: 14, fontWeight: '500', color: colors.muted },
  alertsContainer: { marginBottom: 32 },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.mist,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertContent: { flex: 1 },
  alertMessage: { fontSize: 15, fontWeight: '600', color: colors.ink, marginBottom: 2 },
  alertTime: { fontSize: 13, color: colors.muted },
  noAlerts: { fontSize: 15, color: colors.muted, textAlign: 'center', paddingVertical: 20 },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: colors.mist,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  actionPressed: { backgroundColor: colors.line },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionLabel: { fontSize: 14, fontWeight: '600', color: colors.ink },
});
