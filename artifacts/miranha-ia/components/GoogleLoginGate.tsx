import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const AUTH_STORAGE_KEY = '@miranha/google-user';
const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const requiresLogin = process.env.EXPO_PUBLIC_REQUIRE_GOOGLE_LOGIN === 'true';

type GoogleUser = { id: string; email: string; name: string; picture: string };

export function GoogleLoginGate({ children }: PropsWithChildren) {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [checking, setChecking] = useState(requiresLogin);
  const [error, setError] = useState('');
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: webClientId ?? '',
    iosClientId,
    androidClientId,
  });

  useEffect(() => {
    if (!requiresLogin) return;
    void AsyncStorage.getItem(AUTH_STORAGE_KEY).then((stored) => {
      if (stored) setUser(JSON.parse(stored) as GoogleUser);
      setChecking(false);
    }).catch(() => setChecking(false));
  }, []);

  useEffect(() => {
    if (!requiresLogin || response?.type !== 'success') return;
    const idToken = response.authentication?.idToken;
    if (!idToken || !apiUrl) {
      setError('Configure EXPO_PUBLIC_API_URL e os Client IDs do Google.');
      return;
    }
    void fetch(`${apiUrl}/api/auth/google`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ idToken }),
    }).then(async (result) => {
      if (!result.ok) throw new Error('Google Login recusado pelo servidor.');
      const data = (await result.json()) as { user: GoogleUser };
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));
      setUser(data.user);
      setError('');
    }).catch((loginError: unknown) => {
      setError(loginError instanceof Error ? loginError.message : 'Não foi possível entrar com Google.');
    });
  }, [response]);

  if (!requiresLogin) return <>{children}</>;
  if (checking) return <View style={styles.center}><ActivityIndicator color="#e85d8f" /></View>;
  if (user) return <>{children}</>;

  return (
    <View style={styles.screen}>
      <View style={styles.mark}><Text style={styles.markText}>MI</Text></View>
      <Text style={styles.eyebrow}>ÁREA PRIVADA DO CASAL</Text>
      <Text style={styles.title}>Entre para abrir o seu Miranha.</Text>
      <Text style={styles.subtitle}>Use sua conta Google para proteger o acesso e manter o vínculo Spider somente entre vocês dois.</Text>
      <Pressable disabled={!request} onPress={() => void promptAsync()} style={styles.button}>
        <Text style={styles.buttonText}>Continuar com Google</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!apiUrl || (!webClientId && !iosClientId && !androidClientId) ? <Text style={styles.config}>O login será ativado quando os Client IDs Google e a API forem configurados.</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d0714' },
  screen: { flex: 1, padding: 28, justifyContent: 'center', backgroundColor: '#0d0714' },
  mark: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#e85d8f', marginBottom: 28 },
  markText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  eyebrow: { color: '#f6a3bf', letterSpacing: 2, fontSize: 11, fontWeight: '700', marginBottom: 12 },
  title: { color: '#fff', fontSize: 32, lineHeight: 38, fontWeight: '800', marginBottom: 14 },
  subtitle: { color: '#c7b9c9', fontSize: 15, lineHeight: 23, marginBottom: 28 },
  button: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', backgroundColor: '#fff' },
  buttonText: { color: '#241329', fontWeight: '800', fontSize: 15 },
  error: { color: '#ff9b9b', marginTop: 16, lineHeight: 20 },
  config: { color: '#897c8e', fontSize: 12, lineHeight: 18, marginTop: 20 },
});
