import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/AuthContext';
import { colors } from '../../lib/theme';

function InfoRow({ icon, label, value, last }) {
  return (
    <View style={[styles.row, !last && styles.rowDivider]}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={colors.leaf} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export default function Settings() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const name = user?.name?.trim() || 'HydroVerde user';
  const email = user?.email ?? '—';
  const initial = name.charAt(0).toUpperCase();
  const version = Constants.expoConfig?.version ?? '1.0.0';

  const logout = async () => {
    await signOut();
    router.replace('/auth/login');
  };

  const confirmLogout = () => {
    // Alert.alert has no web implementation, so log out directly there.
    if (Platform.OS === 'web') {
      logout();
      return;
    }
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.profileText}>
            <Text style={styles.profileName} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.profileEmail} numberOfLines={1}>
              {email}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.group}>
          <InfoRow icon="person-outline" label="Name" value={name} />
          <InfoRow icon="mail-outline" label="Email" value={email} last />
        </View>

        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.group}>
          <InfoRow icon="leaf-outline" label="App" value="HydroVerde" />
          <InfoRow icon="information-circle-outline" label="Version" value={version} last />
        </View>

        <Pressable
          onPress={confirmLogout}
          accessibilityRole="button"
          accessibilityLabel="Log out"
          style={({ pressed }) => [styles.logout, pressed && styles.logoutPressed]}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  container: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32 },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.5,
    marginBottom: 24,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.mist,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 20,
    padding: 18,
    marginBottom: 28,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.leaf,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  profileText: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '700', color: colors.ink },
  profileEmail: { fontSize: 14, color: colors.muted, marginTop: 2 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  group: {
    backgroundColor: colors.bg,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 18,
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.line },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { fontSize: 15, fontWeight: '600', color: colors.ink },
  rowValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 15,
    color: colors.muted,
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#FBEAE8',
  },
  logoutPressed: { opacity: 0.7 },
  logoutText: { color: colors.error, fontSize: 16, fontWeight: '700' },
});
