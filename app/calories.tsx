import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
};

const BMIChart = ({ bmi }) => {
  const categories = ['Underweight', 'Healthy', 'Overweight', 'Obese'];
  const ranges = [
    { min: 0, max: 18.5, color: '#3498db' },
    { min: 18.5, max: 24.9, color: '#2ecc71' },
    { min: 25, max: 29.9, color: '#f1c40f' },
    { min: 30, max: 40, color: '#e74c3c' },
  ];

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return 0;
    if (bmi < 24.9) return 1;
    if (bmi < 29.9) return 2;
    return 3;
  };

  const currentCategory = getBMICategory(bmi);

  return (
    <View style={styles.bmiContainer}>
      <Text style={styles.bmiTitle}>BMI Score: {bmi}</Text>
      <View style={styles.bmiChart}>
        {ranges.map((range, index) => (
          <View
            key={index}
            style={[
              styles.bmiBar,
              { backgroundColor: range.color },
              index === currentCategory && styles.bmiBarActive,
            ]}>
            <Text style={styles.bmiLabel}>{categories[index]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default function CaloriesScreen() {
  const router = useRouter();
  
  // Mock data
  const caloriesData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [1800, 2100, 1950, 2200, 1800, 2000, 1900],
        color: (opacity = 1) => `rgba(255, 107, 107, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const weightData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [180, 178, 176, 174, 172, 170],
        color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const todaysFoods = [
    { name: 'Oatmeal', calories: 300, time: '8:00 AM' },
    { name: 'Chicken Salad', calories: 450, time: '12:30 PM' },
    { name: 'Protein Shake', calories: 200, time: '3:00 PM' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Nutrition Analytics',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#000000" />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calorie Intake</Text>
          <LineChart
            data={caloriesData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Food Log</Text>
          {todaysFoods.map((food, index) => (
            <View key={index} style={styles.foodItem}>
              <View>
                <Text style={styles.foodName}>{food.name}</Text>
                <Text style={styles.foodTime}>{food.time}</Text>
              </View>
              <Text style={styles.foodCalories}>{food.calories} cal</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weight Progress</Text>
          <LineChart
            data={weightData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BMI Analysis</Text>
          <BMIChart bmi={23.5} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Goal Progress</Text>
          <View style={styles.goalCard}>
            <View style={styles.goalInfo}>
              <Text style={styles.goalText}>Current: 170 lbs</Text>
              <Text style={styles.goalText}>Target: 160 lbs</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '70%' }]} />
            </View>
            <Text style={styles.goalProgress}>70% to goal</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: '#000000',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  foodTime: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  foodCalories: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff6b6b',
  },
  bmiContainer: {
    alignItems: 'center',
  },
  bmiTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    color: '#000000',
  },
  bmiChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  bmiBar: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  },
  bmiBarActive: {
    opacity: 1,
  },
  bmiLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  goalCard: {
    padding: 16,
  },
  goalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  goalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2ecc71',
  },
  goalProgress: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: '#64748b',
  },
});