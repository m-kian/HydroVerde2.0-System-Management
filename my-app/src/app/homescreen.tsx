import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../lib/AuthContext';
import { colors } from '../lib/theme';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  if (loading) return null;
  if (!user) return <Redirect href="/auth/login" />;

  const firstName = user?.name?.trim()?.split(' ')[0] ?? 'There';

  const handleLogout = async () => {
    await signOut();
    router.replace('/auth/login');
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

        <View style={styles.body}>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.name}>{firstName}</Text>
        </View>
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
  body: { flex: 1, justifyContent: 'center', paddingBottom: 80 },
  greeting: { fontSize: 22, color: colors.muted, fontWeight: '500' },
  name: {
    fontSize: 44,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -1,
    marginTop: 2,
  },
});
