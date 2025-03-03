import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Privacy Policy',
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
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.lastUpdated}>Last Updated: February 2025</Text>
          
          <Text style={styles.sectionTitle}>Our Commitment to Your Privacy</Text>
          <Text style={styles.paragraph}>
            At Evolve Health, we take your privacy seriously. This policy describes what personal information we collect and how it is used, stored, and protected.
          </Text>
          
          <Text style={styles.sectionTitle}>Information We Collect</Text>
          <Text style={styles.paragraph}>
            • Health and fitness data including workout history, food intake, and meditation sessions
          </Text>
          <Text style={styles.paragraph}>
            • Basic profile information including name, age, height, and weight
          </Text>
          <Text style={styles.paragraph}>
            • Device information and app usage statistics to improve the experience
          </Text>
          
          <Text style={styles.sectionTitle}>How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            • To provide personalized health and fitness recommendations
          </Text>
          <Text style={styles.paragraph}>
            • To track your progress towards your wellness goals
          </Text>
          <Text style={styles.paragraph}>
            • To improve our app features and functionality based on usage patterns
          </Text>
          <Text style={styles.paragraph}>
            • For research purposes with aggregated, anonymized data only
          </Text>
          
          <Text style={styles.sectionTitle}>Data Storage and Security</Text>
          <Text style={styles.paragraph}>
            All your information is stored securely in our encrypted database. We implement industry-standard security measures to protect your data from unauthorized access.
          </Text>
          <Text style={styles.paragraph}>
            Your health data is never sold to third parties for advertising purposes.
          </Text>
          
          <Text style={styles.sectionTitle}>Your Rights</Text>
          <Text style={styles.paragraph}>
            • You can access and export your personal data at any time
          </Text>
          <Text style={styles.paragraph}>
            • You may request deletion of your account and associated data
          </Text>
          <Text style={styles.paragraph}>
            • You can opt-out of anonymized data collection for research
          </Text>
          
          <Text style={styles.sectionTitle}>Third-Party Services</Text>
          <Text style={styles.paragraph}>
            Our app may contain links to third-party websites or services. This privacy policy applies only to our app. We encourage you to read the privacy policies of any third-party services you visit.
          </Text>
          
          <Text style={styles.sectionTitle}>Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.
          </Text>
          
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about this Privacy Policy, please contact us at:
          </Text>
          <Text style={styles.contactEmail}>privacy@evolvehealth.example.com</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  lastUpdated: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#A163F6',
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  contactEmail: {
    fontSize: 16,
    color: '#5D9DFA',
    marginTop: 8,
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
});