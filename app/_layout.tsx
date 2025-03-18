import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Platform } from 'react-native';
import { MiniPlayer } from '../components/MiniPlayer'; 
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

// Only import RevenueCat on non-web platforms
let Purchases: any = null;
if (Platform.OS !== 'web') {
  Purchases = require('react-native-purchases').default;
}

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export default function RootLayout() {
  useFrameworkReady();
  
  useEffect(() => {
    if (Platform.OS === 'web') {
      window.frameworkReady?.();
    }

    // Initialize RevenueCat only on non-web platforms
    if (Platform.OS !== 'web' && Purchases) {
      Purchases.configure({
        apiKey: "appl_EYsheXCNxAJiyPftuWKbuqgXucs",
        appUserID: null // Let RevenueCat generate a user ID
      });
    }
  }, []);

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        
        {/* Add MiniPlayer component to display currently playing audio */}
        <MiniPlayer />
        
        <StatusBar style="light" />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});