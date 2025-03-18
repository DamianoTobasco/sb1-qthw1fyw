import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PersonalDetailsScreen() {
  const router = useRouter();
  const [personalDetails, setPersonalDetails] = useState({
    name: 'John Doe',
    age: '27',
    height: '5\'5"',
    weight: '170',
    email: 'john.doe@example.com',
  });

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Personal Details',
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
          ),
        }}
      />
      
      <View style={styles.content}>
        <View style={styles.section}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={personalDetails.name}
              onChangeText={(text) =>
                setPersonalDetails({ ...personalDetails, name: text })
              }
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              value={personalDetails.age}
              keyboardType="numeric"
              onChangeText={(text) =>
                setPersonalDetails({ ...personalDetails, age: text })
              }
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Height</Text>
            <TextInput
              style={styles.input}
              value={personalDetails.height}
              onChangeText={(text) =>
                setPersonalDetails({ ...personalDetails, height: text })
              }
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Weight (lbs)</Text>
            <TextInput
              style={styles.input}
              value={personalDetails.weight}
              keyboardType="numeric"
              onChangeText={(text) =>
                setPersonalDetails({ ...personalDetails, weight: text })
              }
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={personalDetails.email}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={(text) =>
                setPersonalDetails({ ...personalDetails, email: text })
              }
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#A163F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  saveButton: {
    backgroundColor: '#A163F6',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#A163F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    padding: 8,
  },
});