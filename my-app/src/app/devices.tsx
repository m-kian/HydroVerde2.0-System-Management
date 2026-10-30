import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../lib/AuthContext';
import { colors } from '../lib/theme';
import AnimatedButton from '../components/AnimatedButton';
import { getDeviceStatus } from '../lib/iotService';

export default function Devices() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const deviceStatus = getDeviceStatus();

  if (loading) return null;
  if (!user) return <Redirect href="/auth/login" />;

  const DeviceCard = ({ 
    name, 
    icon, 
    online, 
    lastActive, 
    health,
    color 
  }: { 
    name: string; 
    icon: any; 
    online: boolean; 
    lastActive: string; 
    health: string;
    color: string;
  }) => (
    <View style={styles.deviceCard}>
      <View style={styles.deviceHeader}>
        <View style={[styles.deviceIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={[styles.statusDot, { backgroundColor: online ? colors.leaf : colors.error }]} />
      </View>
      <Text style={styles.deviceName}>{name}</Text>
      <Text style={styles.deviceInfo}>Last active: {lastActive}</Text>
      <View style={[styles.healthBadge, { 
        backgroundColor: health === 'Good' ? '#E8F5E9' : health === 'Warning' ? '#FFF3E0' : '#FFEBEE' 
      }]}>
        <Text style={[styles.healthText, { 
          color: health === 'Good' ? colors.leaf : health === 'Warning' ? '#FF9800' : colors.error 
        }]}>{health}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.container}>
          <View style={styles.header}>
            <AnimatedButton
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={colors.ink} />
            </AnimatedButton>
            <Text style={styles.title}>Devices</Text>
            <View style={styles.placeholder} />
          </View>

          <Text style={styles.sectionTitle}>Actuators</Text>
          <View style={styles.deviceGrid}>
            <DeviceCard
              name="Water Pump"
              icon="water"
              online={deviceStatus.water_pump.online}
              lastActive={deviceStatus.water_pump.lastActive}
              health={deviceStatus.water_pump.health}
              color="#2196F3"
            />
            <DeviceCard
              name="Nutrient Pump"
              icon="flask"
              online={deviceStatus.nutrient_pump.online}
              lastActive={deviceStatus.nutrient_pump.lastActive}
              health={deviceStatus.nutrient_pump.health}
              color={colors.leaf}
            />
            <DeviceCard
              name="Air Pump"
              icon="wind"
              online={deviceStatus.air_pump.online}
              lastActive={deviceStatus.air_pump.lastActive}
              health={deviceStatus.air_pump.health}
              color="#9C27B0"
            />
            <DeviceCard
              name="LED Light"
              icon="sunny"
              online={deviceStatus.led_light.online}
              lastActive={deviceStatus.led_light.lastActive}
              health={deviceStatus.led_light.health}
              color="#FFC107"
            />
            <DeviceCard
              name="Fan"
              icon="fan"
              online={deviceStatus.fan.online}
              lastActive={deviceStatus.fan.lastActive}
              health={deviceStatus.fan.health}
              color="#607D8B"
            />
            <DeviceCard
              name="Valve"
              icon="swap-horizontal"
              online={deviceStatus.valve.online}
              lastActive={deviceStatus.valve.lastActive}
              health={deviceStatus.valve.health}
              color="#FF9800"
            />
          </View>

          <Text style={styles.sectionTitle}>Sensors</Text>
          <View style={styles.deviceGrid}>
            <DeviceCard
              name="pH Sensor"
              icon="flask"
              online={deviceStatus.ph_sensor.online}
              lastActive={deviceStatus.ph_sensor.lastActive}
              health={deviceStatus.ph_sensor.health}
              color="#9C27B0"
            />
            <DeviceCard
              name="Temperature Sensor"
              icon="thermometer"
              online={deviceStatus.temp_sensor.online}
              lastActive={deviceStatus.temp_sensor.lastActive}
              health={deviceStatus.temp_sensor.health}
              color="#FF5722"
            />
            <DeviceCard
              name="Water Level Sensor"
              icon="water"
              online={deviceStatus.water_sensor.online}
              lastActive={deviceStatus.water_sensor.lastActive}
              health={deviceStatus.water_sensor.health}
              color="#2196F3"
            />
          </View>

          <Text style={styles.infoText}>
            Monitor device status and health. Contact support if devices show offline or warning status.
          </Text>
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
  deviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  deviceCard: {
    width: '48%',
    backgroundColor: colors.mist,
    borderRadius: 16,
    padding: 16,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  deviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: 4,
  },
  deviceInfo: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 8,
  },
  healthBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  healthText: {
    fontSize: 11,
    fontWeight: '700',
  },
  infoText: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 16,
  },
});
