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

export default function Register() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Enter your name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Enter a valid email address.';
    if (form.password.length < 8) next.password = 'Use at least 8 characters.';
    if (form.confirm !== form.password) next.confirm = 'Passwords do not match.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      await signUp({ name: form.name, email: form.email, password: form.password });
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
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Start growing with HydroVerde.</Text>

        {!!errors.form && <Text style={styles.formError}>{errors.form}</Text>}

        <AuthField label="Name" value={form.name} onChangeText={set('name')} error={errors.name}
          placeholder="Your full name" autoCapitalize="words" autoComplete="name" />
        <AuthField label="Email" value={form.email} onChangeText={set('email')} error={errors.email}
          placeholder="you@example.com" keyboardType="email-address" autoComplete="email" />
        <AuthField label="Password" value={form.password} onChangeText={set('password')} error={errors.password}
          placeholder="At least 8 characters" secure />
        <AuthField label="Confirm password" value={form.confirm} onChangeText={set('confirm')} error={errors.confirm}
          placeholder="Re-enter your password" secure />

        <Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={submit} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create account</Text>}
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.muted}>Already have an account? </Text>
          <Link href="/auth/login" style={styles.link}>Log in</Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: { flexGrow: 1, justifyContent: 'center', padding: 28, paddingVertical: 48 },
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
