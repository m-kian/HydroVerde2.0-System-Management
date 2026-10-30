import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { colors } from '../lib/theme';
import AnimatedButton from '../components/AnimatedButton';
import { getActuatorStates, controlActuator, ACTUATOR_TYPES } from '../lib/iotService';

export default function Controls() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [actuatorStates, setActuatorStates] = useState(getActuatorStates());

  if (loading) return null;
  if (!user) return <Redirect href="/auth/login" />;

  const toggleActuator = (actuator: string) => {
    const newState = !actuatorStates[actuator];
    controlActuator(actuator, newState);
    setActuatorStates(prev => ({ ...prev, [actuator]: newState }));
  };

  const ActuatorCard = ({ 
    name, 
    icon, 
    state, 
    color, 
    onToggle 
  }: { 
    name: string; 
    icon: any; 
    state: boolean; 
    color: string; 
    onToggle: () => void;
  }) => (
    <View style={styles.actuatorCard}>
      <View style={styles.actuatorHeader}>
        <View style={[styles.actuatorIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={28} color={color} />
        </View>
        <Switch
          value={state}
          onValueChange={onToggle}
          trackColor={{ false: colors.line, true: color }}
          thumbColor={state ? '#fff' : colors.muted}
        />
      </View>
      <Text style={styles.actuatorName}>{name}</Text>
      <Text style={[styles.actuatorStatus, { color: state ? color : colors.muted }]}>
        {state ? 'ON' : 'OFF'}
      </Text>
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
            <Text style={styles.title}>Controls</Text>
            <View style={styles.placeholder} />
          </View>

          <Text style={styles.sectionTitle}>Water Management</Text>
          <View style={styles.actuatorGrid}>
            <ActuatorCard
              name="Water Pump"
              icon="water"
              state={actuatorStates.water_pump}
              color="#2196F3"
              onToggle={() => toggleActuator('water_pump')}
            />
            <ActuatorCard
              name="Nutrient Pump"
              icon="flask"
              state={actuatorStates.nutrient_pump}
              color={colors.leaf}
              onToggle={() => toggleActuator('nutrient_pump')}
            />
            <ActuatorCard
              name="Valve"
              icon="swap-horizontal"
              state={actuatorStates.valve}
              color="#FF9800"
              onToggle={() => toggleActuator('valve')}
            />
          </View>

          <Text style={styles.sectionTitle}>Environment Control</Text>
          <View style={styles.actuatorGrid}>
            <ActuatorCard
              name="Air Pump"
              icon="wind"
              state={actuatorStates.air_pump}
              color="#9C27B0"
              onToggle={() => toggleActuator('air_pump')}
            />
            <ActuatorCard
              name="LED Light"
              icon="sunny"
              state={actuatorStates.led_light}
              color="#FFC107"
              onToggle={() => toggleActuator('led_light')}
            />
            <ActuatorCard
              name="Fan"
              icon="fan"
              state={actuatorStates.fan}
              color="#607D8B"
              onToggle={() => toggleActuator('fan')}
            />
          </View>

          <Text style={styles.infoText}>
            Toggle switches to control actuators. Changes are applied immediately.
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
  actuatorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  actuatorCard: {
    width: '48%',
    backgroundColor: colors.mist,
    borderRadius: 16,
    padding: 16,
  },
  actuatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actuatorIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actuatorName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: 4,
  },
  actuatorStatus: {
    fontSize: 12,
    fontWeight: '700',
  },
  infoText: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 16,
  },
});
