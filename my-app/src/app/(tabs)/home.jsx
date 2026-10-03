import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/AuthContext';
import { colors } from '../../lib/theme';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatToday() {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function Home() {
  const { user } = useAuth();
  const firstName = user?.name?.trim()?.split(' ')[0] ?? 'There';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.brand}>
            <View style={styles.mark}>
              <Ionicons name="water" size={20} color="#fff" />
            </View>
            <Text style={styles.brandName}>HydroVerde</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.date}>{formatToday()}</Text>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit>
            {firstName}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Your garden</Text>
        <View style={styles.card}>
          <View style={styles.cardIcon}>
            <Ionicons name="leaf-outline" size={28} color={colors.leaf} />
          </View>
          <Text style={styles.cardTitle}>No crops yet</Text>
          <Text style={styles.cardBody}>
            Once you start adding crops, their status will show up here.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  container: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 32 },
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
  hero: { marginTop: 40, marginBottom: 36 },
  date: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.leaf,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  greeting: { fontSize: 22, color: colors.muted, fontWeight: '500' },
  name: {
    fontSize: 44,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -1,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.mist,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: colors.ink },
  cardBody: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
});
