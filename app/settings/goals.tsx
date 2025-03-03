import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase, TEST_USER_ID } from '../../lib/supabase';

type GoalPath = 'weight-loss' | 'muscle-gain' | 'maintenance' | 'endurance';
type TrainingIntensity = 'beginner' | 'intermediate' | 'advanced' | 'elite' | 'recovery';

interface GoalPreset {
  name: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  calorieMultiplier: number;
  proteinMultiplier: number;
  carbsMultiplier: number;
  fatsMultiplier: number;
  recommendedWorkouts: number;
}

const GOAL_PRESETS: Record<GoalPath, GoalPreset> = {
  'weight-loss': {
    name: 'Weight Loss',
    description: 'Gradual, sustainable fat loss while preserving muscle mass',
    icon: 'trending-down',
    calorieMultiplier: 0.8,
    proteinMultiplier: 1.2,
    carbsMultiplier: 0.7,
    fatsMultiplier: 0.8,
    recommendedWorkouts: 4,
  },
  'muscle-gain': {
    name: 'Muscle Gain',
    description: 'Build lean muscle mass with a focus on strength',
    icon: 'barbell',
    calorieMultiplier: 1.2,
    proteinMultiplier: 1.4,
    carbsMultiplier: 1.3,
    fatsMultiplier: 1.0,
    recommendedWorkouts: 5,
  },
  'maintenance': {
    name: 'Maintenance',
    description: 'Maintain current weight and body composition',
    icon: 'shield',
    calorieMultiplier: 1.0,
    proteinMultiplier: 1.0,
    carbsMultiplier: 1.0,
    fatsMultiplier: 1.0,
    recommendedWorkouts: 3,
  },
  'endurance': {
    name: 'Endurance',
    description: 'Optimize energy for endurance activities',
    icon: 'bicycle',
    calorieMultiplier: 1.3,
    proteinMultiplier: 1.1,
    carbsMultiplier: 1.5,
    fatsMultiplier: 0.9,
    recommendedWorkouts: 6,
  },
};

const INTENSITY_LEVELS: Record<TrainingIntensity, {
  name: string;
  description: string;
  multiplier: number;
  workoutsPerWeek: string;
}> = {
  'beginner': {
    name: 'Beginner',
    description: '2-3 workouts/week',
    multiplier: 0.8,
    workoutsPerWeek: '2-3',
  },
  'intermediate': {
    name: 'Intermediate',
    description: '3-4 workouts/week',
    multiplier: 1.0,
    workoutsPerWeek: '3-4',
  },
  'advanced': {
    name: 'Advanced',
    description: '4-5 workouts/week',
    multiplier: 1.2,
    workoutsPerWeek: '4-5',
  },
  'elite': {
    name: 'Elite',
    description: '5-6 workouts/week',
    multiplier: 1.4,
    workoutsPerWeek: '5-6',
  },
  'recovery': {
    name: 'Recovery',
    description: '1-2 workouts/week',
    multiplier: 0.6,
    workoutsPerWeek: '1-2',
  },
};

export default function GoalsScreen() {
  const router = useRouter();
  const [selectedPath, setSelectedPath] = useState<GoalPath>('maintenance');
  const [intensity, setIntensity] = useState<TrainingIntensity>('intermediate');
  const [loading, setLoading] = useState(false);

  // Base metrics (these would come from user profile in production)
  const baseMetrics = {
    weight: 170, // lbs
    height: 70, // inches
    age: 30,
    activityLevel: 1.5, // moderately active
    gender: 'male',
  };

  // Calculate base metabolic rate (BMR) using Mifflin-St Jeor equation
  const calculateBMR = () => {
    const weightKg = baseMetrics.weight * 0.453592;
    const heightCm = baseMetrics.height * 2.54;
    
    if (baseMetrics.gender === 'male') {
      return (10 * weightKg) + (6.25 * heightCm) - (5 * baseMetrics.age) + 5;
    }
    return (10 * weightKg) + (6.25 * heightCm) - (5 * baseMetrics.age) - 161;
  };

  // Calculate daily calorie needs
  const calculateDailyCalories = () => {
    const bmr = calculateBMR();
    const tdee = bmr * baseMetrics.activityLevel;
    const preset = GOAL_PRESETS[selectedPath];
    const intensityFactor = INTENSITY_LEVELS[intensity].multiplier;
    return Math.round(tdee * preset.calorieMultiplier * intensityFactor);
  };

  // Calculate macronutrient targets
  const calculateMacros = () => {
    const calories = calculateDailyCalories();
    const preset = GOAL_PRESETS[selectedPath];
    const intensityFactor = INTENSITY_LEVELS[intensity].multiplier;
    const weightKg = baseMetrics.weight * 0.453592;

    return {
      protein: Math.round(weightKg * preset.proteinMultiplier * intensityFactor),
      carbs: Math.round((calories * 0.4) / 4 * preset.carbsMultiplier * intensityFactor),
      fats: Math.round((calories * 0.25) / 9 * preset.fatsMultiplier * intensityFactor),
    };
  };

  const handleApplyRecommendations = async () => {
    setLoading(true);
    try {
      const calories = calculateDailyCalories();
      const macros = calculateMacros();
      
      const { error } = await supabase
        .from('user_goals')
        .upsert({
          user_id: TEST_USER_ID,
          goal_path: selectedPath,
          training_intensity: intensity,
          daily_calories: calories,
          protein_target: macros.protein,
          carbs_target: macros.carbs,
          fats_target: macros.fats,
          recommended_workouts: GOAL_PRESETS[selectedPath].recommendedWorkouts,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      Alert.alert(
        'Success',
        'Your personalized goals have been updated!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error updating goals:', error);
      Alert.alert('Error', 'Failed to update goals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const macros = calculateMacros();
  const calories = calculateDailyCalories();

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'AI Goal Optimization',
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView style={styles.content}>
        <Text style={styles.subtitle}>Select your fitness journey</Text>
        
        <View style={styles.pathsContainer}>
          {(Object.entries(GOAL_PRESETS) as [GoalPath, GoalPreset][]).map(([path, preset]) => (
            <TouchableOpacity
              key={path}
              style={[
                styles.pathCard,
                selectedPath === path && styles.pathCardSelected,
              ]}
              onPress={() => setSelectedPath(path)}
            >
              <View style={[
                styles.pathIcon,
                selectedPath === path && styles.pathIconSelected
              ]}>
                <Ionicons 
                  name={preset.icon} 
                  size={24} 
                  color={selectedPath === path ? '#ffffff' : '#A163F6'} 
                />
              </View>
              <Text style={[
                styles.pathName,
                selectedPath === path && styles.pathNameSelected,
              ]}>
                {preset.name}
              </Text>
              <Text style={[
                styles.pathDescription,
                selectedPath === path && styles.pathDescriptionSelected,
              ]}>
                {preset.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Training Intensity</Text>
          <View style={styles.intensityContainer}>
            {(Object.entries(INTENSITY_LEVELS) as [TrainingIntensity, typeof INTENSITY_LEVELS[TrainingIntensity]][]).map(([level, data]) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.intensityButton,
                  intensity === level && styles.intensityButtonActive,
                ]}
                onPress={() => setIntensity(level)}
              >
                <Text style={[
                  styles.intensityName,
                  intensity === level && styles.intensityNameActive,
                ]}>
                  {data.name}
                </Text>
                <Text style={[
                  styles.intensityDescription,
                  intensity === level && styles.intensityDescriptionActive,
                ]}>
                  {data.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI-Optimized Goals</Text>
          
          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Ionicons name="flame" size={24} color="#A163F6" />
              <Text style={styles.goalTitle}>Daily Calories</Text>
            </View>
            <Text style={styles.goalValue}>{calories} kcal</Text>
          </View>

          <View style={styles.macrosContainer}>
            <View style={[styles.macroCard, { backgroundColor: 'rgba(161, 99, 246, 0.15)' }]}>
              <Ionicons name="restaurant" size={24} color="#A163F6" />
              <Text style={styles.macroValue}>{macros.protein}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>

            <View style={[styles.macroCard, { backgroundColor: 'rgba(56, 232, 224, 0.15)' }]}>
              <Ionicons name="nutrition" size={24} color="#38E8E0" />
              <Text style={styles.macroValue}>{macros.carbs}g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>

            <View style={[styles.macroCard, { backgroundColor: 'rgba(93, 157, 250, 0.15)' }]}>
              <Ionicons name="water" size={24} color="#5D9DFA" />
              <Text style={styles.macroValue}>{macros.fats}g</Text>
              <Text style={styles.macroLabel}>Fats</Text>
            </View>
          </View>

          <View style={styles.workoutRecommendation}>
            <Ionicons name="calendar" size={24} color="rgba(255, 255, 255, 0.7)" />
            <Text style={styles.workoutText}>
              Recommended: {GOAL_PRESETS[selectedPath].recommendedWorkouts} workouts per week
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleApplyRecommendations}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Updating...' : 'Apply AI Recommendations'}
          </Text>
        </TouchableOpacity>
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
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 20,
  },
  pathsContainer: {
    marginBottom: 24,
  },
  pathCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: 'rgba(161, 99, 246, 0.3)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  pathCardSelected: {
    backgroundColor: '#A163F6',
    borderColor: '#A163F6',
    shadowColor: '#A163F6',
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 5,
  },
  pathIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(161, 99, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  pathIconSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  pathName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  pathNameSelected: {
    color: '#ffffff',
  },
  pathDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  pathDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  section: {
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#A163F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  intensityContainer: {
    gap: 12,
  },
  intensityButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  intensityButtonActive: {
    backgroundColor: 'rgba(161, 99, 246, 0.2)',
    borderColor: '#A163F6',
  },
  intensityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  intensityNameActive: {
    color: '#ffffff',
  },
  intensityDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  intensityDescriptionActive: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  goalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  goalValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    textShadowColor: 'rgba(161, 99, 246, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  macroCard: {
    width: '31%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  macroValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginVertical: 8,
  },
  macroLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  workoutRecommendation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  workoutText: {
    marginLeft: 12,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  saveButton: {
    backgroundColor: '#A163F6',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#A163F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.5,
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