import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, subDays } from 'date-fns';
import { getDailyNutrition, getFoodLogs, TEST_USER_ID, deleteFoodLog, getUserHabits, createHabit, deleteHabit, Habit } from '../../lib/supabase';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Line, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { HabitTracker } from '../../components/HabitTracker';

const screenWidth = Dimensions.get('window').width;
// Reduce the height to make the chart more compact
const chartHeight = 180; // Reduced from 220
// Adjust padding to prevent labels from hanging off the edges
const chartPadding = { top: 20, right: 25, bottom: 30, left: 45 };
const chartWidth = screenWidth - 40 - chartPadding.left - chartPadding.right;
const chartInnerHeight = chartHeight - chartPadding.top - chartPadding.bottom;

function LineChart({ data, labels }) {
  if (!data.length) return null;

  const maxValue = Math.max(...data);
  const minValue = Math.min(0, Math.min(...data));
  const yRange = maxValue - minValue;

  const getX = (i: number) => (i * chartWidth) / (data.length - 1) + chartPadding.left;
  const getY = (value: number) => 
    chartHeight - 
    chartPadding.bottom - 
    ((value - minValue) / yRange) * chartInnerHeight;

  // Create the path data with smooth curves
  let pathD = `M ${getX(0)} ${getY(data[0])}`;
  for (let i = 1; i < data.length; i++) {
    const x = getX(i);
    const y = getY(data[i]);
    const prevX = getX(i - 1);
    const prevY = getY(data[i - 1]);
    
    // Calculate control points for smooth curve
    const controlPoint1X = prevX + (x - prevX) * 0.5;
    const controlPoint1Y = prevY;
    const controlPoint2X = prevX + (x - prevX) * 0.5;
    const controlPoint2Y = y;
    
    pathD += ` C ${controlPoint1X} ${controlPoint1Y} ${controlPoint2X} ${controlPoint2Y} ${x} ${y}`;
  }

  // Create gradient path for area under the curve
  const areaPathD = `${pathD} L ${getX(data.length - 1)} ${chartHeight - chartPadding.bottom} L ${getX(0)} ${chartHeight - chartPadding.bottom} Z`;

  return (
    <View style={styles.chartContainer}>
      <Svg width={screenWidth - 40} height={chartHeight}>
        <Defs>
          <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#A163F6" stopOpacity="0.3" />
            <Stop offset="1" stopColor="#A163F6" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Grid lines - reduce to 3 lines for a more compact look */}
        {[0, 0.5, 1].map((ratio) => {
          const y = chartPadding.top + (chartInnerHeight * ratio);
          return (
            <Line
              key={ratio}
              x1={chartPadding.left}
              y1={y}
              x2={chartWidth + chartPadding.left}
              y2={y}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
          );
        })}

        {/* Y-axis line */}
        <Line
          x1={chartPadding.left}
          y1={chartPadding.top}
          x2={chartPadding.left}
          y2={chartHeight - chartPadding.bottom}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="1"
        />

        {/* X-axis line */}
        <Line
          x1={chartPadding.left}
          y1={chartHeight - chartPadding.bottom}
          x2={chartWidth + chartPadding.left}
          y2={chartHeight - chartPadding.bottom}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="1"
        />

        {/* Area under the curve */}
        <Path
          d={areaPathD}
          fill="url(#areaGradient)"
        />

        {/* Line */}
        <Path
          d={pathD}
          fill="none"
          stroke="#A163F6"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points - make them slightly smaller */}
        {data.map((value, i) => (
          <React.Fragment key={i}>
            {/* Outer circle */}
            <Circle
              cx={getX(i)}
              cy={getY(value)}
              r="5"
              fill="rgba(30, 30, 30, 0.8)"
              stroke="#A163F6"
              strokeWidth="2"
            />
            {/* Inner circle */}
            <Circle
              cx={getX(i)}
              cy={getY(value)}
              r="2.5"
              fill="#A163F6"
            />
          </React.Fragment>
        ))}

        {/* X-axis labels - ensure proper positioning */}
        {labels.map((label, i) => (
          <SvgText
            key={i}
            x={getX(i)}
            y={chartHeight - 10}
            fontSize="11"
            fill="rgba(255, 255, 255, 0.6)"
            textAnchor="middle"
          >
            {label}
          </SvgText>
        ))}

        {/* Y-axis labels - show just min, middle, max */}
        {[0, maxValue * 0.5, maxValue].map((value, i) => (
          <SvgText
            key={i}
            x={chartPadding.left - 10}
            y={getY(value) + 4}
            fontSize="10"
            fill="rgba(255, 255, 255, 0.6)"
            textAnchor="end"
          >
            {Math.round(value)}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

export default function AnalyticsScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weeklyData, setWeeklyData] = useState({
    calories: [],
    dates: [],
  });
  const [todaysFoodLog, setTodaysFoodLog] = useState([]);
  const [dailyNutrition, setDailyNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [habits, setHabits] = useState<Habit[]>([]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load weekly data
      const weeklyNutrition = await loadWeeklyData();
      setWeeklyData(weeklyNutrition);

      // Load today's food log
      const today = new Date();
      const logs = await getFoodLogs(TEST_USER_ID, today.toISOString());
      setTodaysFoodLog(logs);

      // Load today's nutrition summary
      const nutrition = await getDailyNutrition(TEST_USER_ID, today.toISOString());
      setDailyNutrition(nutrition);
      
      // Load habits
      const userHabits = await getUserHabits(TEST_USER_ID);
      setHabits(userHabits);
    } catch (err) {
      console.error('Error loading analytics data:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const loadWeeklyData = async () => {
    const dates = [];
    const caloriesData = [];

    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const nutrition = await getDailyNutrition(TEST_USER_ID, date.toISOString());
      
      dates.push(format(date, 'EEE'));
      caloriesData.push(nutrition.calories);
    }

    return {
      dates,
      calories: caloriesData,
    };
  };

  const handleDeleteFoodLog = async (logId: string) => {
    Alert.alert(
      'Delete Food Log',
      'Are you sure you want to delete this food log?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteFoodLog(logId);
              await loadData(); // Refresh data after deletion
            } catch (err) {
              console.error('Error deleting food log:', err);
              Alert.alert('Error', 'Failed to delete food log');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };
  
  const handleAddHabit = async (habit: Partial<Habit>) => {
    try {
      setLoading(true);
      await createHabit(TEST_USER_ID, habit);
      // Reload habits
      const userHabits = await getUserHabits(TEST_USER_ID);
      setHabits(userHabits);
    } catch (err) {
      console.error('Error adding habit:', err);
      Alert.alert('Error', 'Failed to add habit');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteHabit = async (habitId: string) => {
    try {
      setLoading(true);
      await deleteHabit(habitId);
      // Reload habits
      const userHabits = await getUserHabits(TEST_USER_ID);
      setHabits(userHabits);
    } catch (err) {
      console.error('Error deleting habit:', err);
      Alert.alert('Error', 'Failed to delete habit');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#A163F6" />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Analytics</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Calorie Intake</Text>
          <LineChart
            data={weeklyData.calories}
            labels={weeklyData.dates}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Nutrition</Text>
          <View style={styles.nutritionGrid}>
            {/* Row 1: Calories and Protein */}
            <View style={styles.nutritionRow}>
              {/* Calories Card */}
              <View style={[styles.nutritionCard, styles.caloriesCard]}>
                <View style={styles.nutritionIconContainer}>
                  <Ionicons name="flame" size={18} color="#ffffff" />
                </View>
                <View style={styles.nutritionContent}>
                  <Text style={styles.nutritionLabel}>Calories</Text>
                  <Text style={styles.nutritionValue}>{dailyNutrition.calories}</Text>
                </View>
              </View>
              
              {/* Protein Card */}
              <View style={[styles.nutritionCard, styles.proteinCard]}>
                <View style={styles.nutritionIconContainer}>
                  <Ionicons name="restaurant" size={18} color="#ffffff" />
                </View>
                <View style={styles.nutritionContent}>
                  <Text style={styles.nutritionLabel}>Protein</Text>
                  <Text style={styles.nutritionValue}>{dailyNutrition.protein}g</Text>
                </View>
              </View>
            </View>
            
            {/* Row 2: Carbs and Fat */}
            <View style={styles.nutritionRow}>
              {/* Carbs Card */}
              <View style={[styles.nutritionCard, styles.carbsCard]}>
                <View style={styles.nutritionIconContainer}>
                  <Ionicons name="nutrition" size={18} color="#ffffff" />
                </View>
                <View style={styles.nutritionContent}>
                  <Text style={styles.nutritionLabel}>Carbs</Text>
                  <Text style={styles.nutritionValue}>{dailyNutrition.carbs}g</Text>
                </View>
              </View>
              
              {/* Fat Card */}
              <View style={[styles.nutritionCard, styles.fatCard]}>
                <View style={styles.nutritionIconContainer}>
                  <Ionicons name="water" size={18} color="#ffffff" />
                </View>
                <View style={styles.nutritionContent}>
                  <Text style={styles.nutritionLabel}>Fat</Text>
                  <Text style={styles.nutritionValue}>{dailyNutrition.fat}g</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        
        {/* Habit Tracker Section */}
        <HabitTracker 
          habits={habits}
          onAddHabit={handleAddHabit}
          onDeleteHabit={handleDeleteHabit}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Food Log</Text>
          {todaysFoodLog.length === 0 ? (
            <Text style={styles.emptyText}>No food logged today</Text>
          ) : (
            todaysFoodLog.map((food) => (
              <View key={food.id} style={styles.foodItem}>
                <View style={styles.foodInfo}>
                  <Text style={styles.foodName}>{food.food_name}</Text>
                  <Text style={styles.foodDetails}>
                    {food.serving_size} {food.serving_unit}
                  </Text>
                </View>
                <View style={styles.foodActions}>
                  <Text style={styles.foodCalories}>{food.calories} cal</Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteFoodLog(food.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
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
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
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
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#A163F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  chartContainer: {
    alignItems: 'center', // Center the chart horizontally
    marginHorizontal: -5, // Offset the extra padding to keep container size
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12, // Reduced from 16 to make more compact
  },
  // Updated compact nutrition layout styles
  nutritionGrid: {
    width: '100%',
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  nutritionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48.5%', // Slightly less than half to ensure gap on small screens
    height: 60, // Reduced height for mobile
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  nutritionContent: {
    marginLeft: 8,
    flex: 1,
  },
  nutritionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  nutritionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  // Color styles for each card
  caloriesCard: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)', // Red background
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  proteinCard: {
    backgroundColor: 'rgba(161, 99, 246, 0.2)', // Purple background
    shadowColor: '#A163F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  carbsCard: {
    backgroundColor: 'rgba(56, 232, 224, 0.2)', // Teal background
    shadowColor: '#38E8E0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  fatCard: {
    backgroundColor: 'rgba(93, 157, 250, 0.2)', // Blue background
    shadowColor: '#5D9DFA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  foodDetails: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  foodActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  foodCalories: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A163F6',
  },
  deleteButton: {
    padding: 8,
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});