import React from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// This file redirects to the onboarding flow for first-time users
export default function Index() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#A163F6" />
      <Redirect href="/(tabs)" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
});