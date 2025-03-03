import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const [burnedCaloriesEnabled, setBurnedCaloriesEnabled] = React.useState(false);
  const [liveActivityEnabled, setLiveActivityEnabled] = React.useState(false);

  const userMetrics = {
    age: 27,
    height: '5 ft 5 in',
    weight: '170 lbs',
  };

  const renderMetricItem = (label: string, value: string | number) => (
    <View style={styles.metricItem}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );

  const renderNavigationItem = (
    label: string,
    description?: string,
    route?: string
  ) => (
    <Link href={route || ''} asChild>
      <TouchableOpacity style={styles.navigationItem}>
        <View>
          <Text style={styles.navigationLabel}>{label}</Text>
          {description && (
            <Text style={styles.navigationDescription}>{description}</Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={24} color="rgba(255, 255, 255, 0.6)" />
      </TouchableOpacity>
    </Link>
  );

  const renderSwitchItem = (
    label: string,
    description: string,
    value: boolean,
    onValueChange: (value: boolean) => void
  ) => (
    <View style={styles.switchItem}>
      <View style={styles.switchContent}>
        <Text style={styles.switchLabel}>{label}</Text>
        <Text style={styles.switchDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: '#A163F6' }}
        thumbColor="#ffffff"
        ios_backgroundColor="rgba(255, 255, 255, 0.1)"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.section}>
          <View style={styles.metricsContainer}>
            {renderMetricItem('Age', userMetrics.age)}
            {renderMetricItem('Height', userMetrics.height)}
            {renderMetricItem('Current weight', userMetrics.weight)}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Customization</Text>
        <View style={styles.section}>
          {renderNavigationItem(
            'Personal details',
            undefined,
            '/settings/personal'
          )}
          {renderNavigationItem(
            'Adjust goals',
            'Calories, carbs, fats, and protein',
            '/settings/goals'
          )}
        </View>

        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.section}>
          {renderSwitchItem(
            'Burned Calories',
            'Add burned calories to daily goal',
            burnedCaloriesEnabled,
            setBurnedCaloriesEnabled
          )}
          {renderSwitchItem(
            'Live Activity',
            'Show your daily calories and macros on the lock screen',
            liveActivityEnabled,
            setLiveActivityEnabled
          )}
        </View>

        <Text style={styles.sectionTitle}>Legal</Text>
        <View style={styles.section}>
          {renderNavigationItem(
            'Terms and Conditions',
            undefined,
            '/settings/terms'
          )}
          {renderNavigationItem('Privacy Policy', undefined, '/settings/privacy')}
          {renderNavigationItem(
            'Support Email',
            undefined,
            '/settings/support'
          )}
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
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 24,
  },
  section: {
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    borderRadius: 20,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#A163F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  metricsContainer: {
    padding: 16,
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  metricLabel: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  metricValue: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
  },
  navigationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  navigationLabel: {
    fontSize: 17,
    color: '#ffffff',
  },
  navigationDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  switchContent: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 17,
    color: '#ffffff',
  },
  switchDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
});