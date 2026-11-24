import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import SensorDashboard from '../components/SensorDashboard';
import { useAuth } from '../lib/AuthContext';
import { getRelayStates, setRelayStates } from '../lib/api';
import { colors } from '../lib/theme';
 
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
 
export default function HomeScreen() {
  const router = useRouter();
  const { user, loading, token, signOut } = useAuth();
  const [fanOn, setFanOn] = useState(false);
  const [relayBusy, setRelayBusy] = useState(false);
 
  useEffect(() => {
    if (!token) return;

    let active = true;
    const refreshRelayState = () => {
      getRelayStates(token)
        .then((states) => {
          if (active) setFanOn(Boolean(states.relay_4));
        })
        .catch(() => {});
    };

    refreshRelayState();
    const interval = setInterval(refreshRelayState, 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [token]);
 
  if (loading) return null;
  if (!user) return <Redirect href="/auth/login" />;
 
  const firstName = user?.name?.trim()?.split(' ')[0] ?? 'There';
 
  const handleLogout = async () => {
    await signOut();
    router.replace('/auth/login');
  };
 
  const toggleFan = async () => {
    if (!token || relayBusy) return;
    const nextState = !fanOn;
    setRelayBusy(true);
    try {
      const states = await setRelayStates(token, { relay_4: nextState });
      setFanOn(Boolean(states.relay_4));
    } catch {
      // Keep the previous UI state if the server request fails.
    } finally {
      setRelayBusy(false);
    }
  };
 
  return (
    <SafeAreaView style={styles.safeArea}>
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
 
        <ScrollView
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.name}>{firstName}</Text>
 
          <Text style={styles.section}>Greenhouse status</Text>
          <SensorDashboard />

          <Text style={styles.section}>Manual fan control</Text>
          <View style={styles.fanControl}>
            <View>
              <Text style={styles.fanLabel}>Fan</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: fanOn ? colors.leaf : colors.muted }]} />
                <Text style={[styles.fanStatus, { color: fanOn ? colors.leaf : colors.muted }]}>
                  {fanOn ? 'TURNED ON' : 'TURNED OFF'}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={toggleFan}
              disabled={relayBusy}
              accessibilityRole="button"
              accessibilityLabel={fanOn ? 'Turn fan off' : 'Turn fan on'}
              style={({ pressed }) => [
                styles.fanButton,
                fanOn && styles.fanButtonActive,
                pressed && styles.fanButtonPressed,
                relayBusy && styles.fanButtonDisabled,
              ]}
            >
              {relayBusy
                ? <ActivityIndicator size="small" color="#fff" />
                : <Ionicons name="power" size={24} color="#fff" />}
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
 
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  body: { paddingTop: 24, paddingBottom: 40 },
  section: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
    marginTop: 28,
    marginBottom: 12,
  },
  greeting: { fontSize: 22, color: colors.muted, fontWeight: '500' },
  name: {
    fontSize: 44,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -1,
    marginTop: 2,
  },
  fanControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.mist,
    marginTop: 16,
  },
  fanLabel: {
    fontSize: 16,
    color: colors.ink,
    fontWeight: '500',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 7,
  },
  fanButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.muted,
  },
  fanButtonActive: {
    backgroundColor: colors.leaf,
  },
  fanButtonPressed: {
    opacity: 0.8,
  },
  fanButtonDisabled: {
    opacity: 0.6,
  },
  fanStatus: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
});

