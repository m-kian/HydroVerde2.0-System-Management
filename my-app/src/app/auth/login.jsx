import { useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AuthField from '../../components/AuthField';
import { useAuth } from '../../lib/AuthContext';
import { colors } from '../../lib/theme';

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const next = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Enter your password.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      await signIn({ email, password });
      router.replace('/homescreen');
    } catch (e) {
      setErrors({ form: e.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.mark}>
          <Ionicons name="water" size={34} color="#fff" />
        </View>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in to check on your crops.</Text>

        {!!errors.form && <Text style={styles.formError}>{errors.form}</Text>}

        <AuthField
          label="Email" value={email} onChangeText={setEmail} error={errors.email}
          placeholder="you@example.com" keyboardType="email-address" autoComplete="email"
        />
        <AuthField
          label="Password" value={password} onChangeText={setPassword} error={errors.password}
          placeholder="Your password" secure
        />

        <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={submit} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log in</Text>}
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.muted}>New to HydroVerde? </Text>
          <Link href="/auth/register" style={styles.link}>Create an account</Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { flexGrow: 1, justifyContent: 'center', padding: 28 },
  mark: {
    width: 64, height: 64, borderRadius: 20, backgroundColor: colors.leaf,
    alignItems: 'center', justifyContent: 'center', marginBottom: 28,
  },
  title: { fontSize: 30, fontWeight: '800', color: colors.ink, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: colors.muted, marginTop: 6, marginBottom: 28 },
  formError: {
    backgroundColor: '#FBEAE8', color: colors.error, padding: 12,
    borderRadius: 12, marginBottom: 16, fontSize: 14,
  },
  button: {
    height: 54, borderRadius: 14, backgroundColor: colors.leaf,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
  },
  pressed: { backgroundColor: colors.leafDark },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  muted: { color: colors.muted, fontSize: 15 },
  link: { color: colors.leaf, fontSize: 15, fontWeight: '700' },
});
