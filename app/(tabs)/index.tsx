import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Dimensions, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { CustomCircularProgress } from '../../components/CircularProgress';
import { getDailyNutrition, getFoodLogs, TEST_USER_ID, getWaterIntake, updateWaterIntake, getLastLoginDate, supabase, updateLastLogin } from '../../lib/supabase';
import { useFocusEffect } from '@react-navigation/native';
import { IconRenderer } from '../../components/IconRenderer';
import { TypewriterTitle } from '../../components/TypewriterTitle';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { StreakCounter } from '../../components/StreakCounter';
import { format, isToday, differenceInCalendarDays } from 'date-fns';
import Svg, { Path, Circle, G, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Pie chart helper functions
const calculatePieChartPath = (startAngle: number, endAngle: number, radius: number) => {
  const x1 = radius * Math.cos(startAngle);
  const y1 = radius * Math.sin(startAngle);
  const x2 = radius * Math.cos(endAngle);
  const y2 = radius * Math.sin(endAngle);
  const largeArcFlag = endAngle - startAngle <= Math.PI ? '0' : '1';
  
  return `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
};

const MacrosPieChart = ({ protein, carbs, fat, size = 60 }) => {
  const total = protein + carbs + fat;
  if (total === 0) return null;
  
  const radius = size / 2;
  const center = size / 2;
  
  // Calculate angles for each macro
  const proteinAngle = (protein / total) * 2 * Math.PI;
  const carbsAngle = (carbs / total) * 2 * Math.PI;
  const fatAngle = (fat / total) * 2 * Math.PI;
  
  // Calculate paths
  const proteinPath = calculatePieChartPath(0, proteinAngle, radius);
  const carbsPath = calculatePieChartPath(proteinAngle, proteinAngle + carbsAngle, radius);
  const fatPath = calculatePieChartPath(proteinAngle + carbsAngle, 2 * Math.PI, radius);
  
  return (
    <Svg width={size} height={size} viewBox={`${-size/2} ${-size/2} ${size} ${size}`}>
      <G>
        {protein > 0 && (
          <Path d={proteinPath} fill="#4ade80" opacity={0.8} />
        )}
        {carbs > 0 && (
          <Path d={carbsPath} fill="#ff6b6b" opacity={0.8} />
        )}
        {fat > 0 && (
          <Path d={fatPath} fill="#fbbf24" opacity={0.8} />
        )}
        <Circle r={radius * 0.6} fill="#1e1e1e" />
      </G>
    </Svg>
  );
};
const DayCircle = ({ day, date, isActive, isToday }) => (
  <TouchableOpacity 
    style={[
      styles.dayCircle, 
      isActive && styles.activeDayCircle,
      isToday && styles.todayCircle
    ]}
  >
    <Text style={[styles.dayText, isActive && styles.activeDayText]}>{day}</Text>
    <Text style={[styles.dateText, isActive && styles.activeDateText]}>{date}</Text>
  </TouchableOpacity>
);

// Macro icon component to ensure consistent rendering
const MacroIcon = ({ iconName, backgroundColor, iconColor }) => (
  <View style={[styles.macroIcon, { backgroundColor }]}>
    <IconRenderer 
      name={iconName} 
      size={24} 
      color={iconColor}
      fallbackText={getMacroEmoji(iconName)} 
    />
  </View>
);

// Helper to get emoji fallbacks for macro icons
const getMacroEmoji = (iconName) => {
  switch (iconName) {
    case 'restaurant':
      return '🍗';
    case 'nutrition':
      return '🍚';
    case 'water':
      return '🥑';
    default:
      return '📊';
  }
};

export default function HomeScreen() {
  const router = useRouter();
  const [dailyNutrition, setDailyNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });
  const [loading, setLoading] = useState(true);
  const [waterIntake, setWaterIntake] = useState(0);
  const [waterGoal, setWaterGoal] = useState(64); // Default 64oz (8 cups)
  const [showWaterGoalModal, setShowWaterGoalModal] = useState(false);
  const [tempWaterGoal, setTempWaterGoal] = useState('64');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [waterDataLoaded, setWaterDataLoaded] = useState(false);
  const [streak, setStreak] = useState(0);
  const [animateStreak, setAnimateStreak] = useState(false);
  const [recentAiScans, setRecentAiScans] = useState([]);

  const days = [
    { day: 'S', date: '23', isActive: false },
    { day: 'M', date: '24', isActive: false },
    { day: 'T', date: '25', isActive: true, isToday: true },
    { day: 'W', date: '26', isActive: false },
    { day: 'T', date: '27', isActive: false },
    { day: 'F', date: '28', isActive: false },
    { day: 'S', date: '1', isActive: false },
  ];

  // Daily goals
  const goals = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
  };

  // Load data when component mounts
  useEffect(() => {
    loadDailyNutrition();
    loadWaterIntake();
    checkAndUpdateStreak();
    loadRecentAiScans();
  }, [selectedDate]);

  // Refresh data when screen comes into focus, but only if we haven't already loaded water data
  useFocusEffect(
    React.useCallback(() => {
      loadDailyNutrition();
      
      // Only load water intake if it hasn't been loaded yet or if the date changes
      if (!waterDataLoaded) {
        loadWaterIntake();
      }
      
      // Check streak on focus
      checkAndUpdateStreak();
      
      // Load recent AI scans
      loadRecentAiScans();
    }, [selectedDate, waterDataLoaded])
  );

  const loadDailyNutrition = async () => {
    try {
      setLoading(true);
      const nutrition = await getDailyNutrition(TEST_USER_ID, selectedDate.toISOString());
      setDailyNutrition(nutrition);
    } catch (error) {
      console.error('Error loading daily nutrition:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWaterIntake = async () => {
    try {
      const data = await getWaterIntake(TEST_USER_ID, selectedDate.toISOString());
      if (data) {
        setWaterIntake(data.amount || 0);
        setWaterGoal(data.goal || 64);
        setWaterDataLoaded(true); // Mark water data as loaded
      }
    } catch (error) {
      console.error('Error loading water intake:', error);
    }
  };

  const loadRecentAiScans = async () => {
    try {
      // Get today's food logs
      const today = new Date();
      const logs = await getFoodLogs(TEST_USER_ID, today.toISOString());
      
      // Filter for AI scanned foods (those with image_url or from scan-food modal)
      // For this demo, we'll just take the most recent 3 logs as "AI scans"
      const aiScannedFoods = logs
        .filter(log => log.food_name.length > 0)
        .slice(0, 3);
      
      setRecentAiScans(aiScannedFoods);
    } catch (error) {
      console.error('Error loading AI scans:', error);
    }
  };

  const checkAndUpdateStreak = async () => {
    try {
      // Get the last login date from the database
      const lastLoginDate = await getLastLoginDate(TEST_USER_ID);
      const today = new Date();
      
      if (!lastLoginDate) {
        // First time user, set streak to 1
        setStreak(1);
        // Update last login to today
        await updateLastLogin(TEST_USER_ID, today, 1);
        setAnimateStreak(true);
        setTimeout(() => setAnimateStreak(false), 2000);
        return;
      }
      
      // Check if the last login was yesterday
      const dayDifference = differenceInCalendarDays(today, lastLoginDate);
      
      if (isToday(lastLoginDate)) {
        // Already logged in today, just load the current streak
        const { data } = await supabase
          .from('user_activity')
          .select('streak')
          .eq('user_id', TEST_USER_ID)
          .single();
          
        if (data) {
          setStreak(data.streak);
        }
      } else if (dayDifference === 1) {
        // Last login was yesterday, increment streak
        const { data } = await supabase
          .from('user_activity')
          .select('streak')
          .eq('user_id', TEST_USER_ID)
          .single();
          
        const newStreak = (data?.streak || 0) + 1;
        setStreak(newStreak);
        await updateLastLogin(TEST_USER_ID, today, newStreak);
        
        // Trigger animation
        setAnimateStreak(true);
        setTimeout(() => setAnimateStreak(false), 2000);
      } else if (dayDifference > 1) {
        // Streak broken, reset to 1
        setStreak(1);
        await updateLastLogin(TEST_USER_ID, today, 1);
        
        // No animation for reset streak
      }
    } catch (error) {
      console.error('Error checking streak:', error);
      // Fallback to showing a default streak
      setStreak(1);
    }
  };

  const handleAddWater = async (ounces) => {
    const newAmount = waterIntake + ounces;
    setWaterIntake(newAmount);
    try {
      await updateWaterIntake(TEST_USER_ID, selectedDate.toISOString(), newAmount, waterGoal);
    } catch (error) {
      console.error('Error updating water intake:', error);
    }
  };

  const handleSaveWaterGoal = async () => {
    const newGoal = parseInt(tempWaterGoal, 10);
    if (isNaN(newGoal) || newGoal <= 0) {
      return;
    }
    
    setWaterGoal(newGoal);
    setShowWaterGoalModal(false);
    
    try {
      await updateWaterIntake(TEST_USER_ID, selectedDate.toISOString(), waterIntake, newGoal);
    } catch (error) {
      console.error('Error updating water goal:', error);
    }
  };

  const calculateRemaining = (current, goal) => {
    const remaining = goal - current;
    return remaining > 0 ? remaining : 0;
  };

  const calculatePercentage = (current, goal) => {
    return Math.min(Math.round((current / goal) * 100), 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <TypewriterTitle 
              staticText="Evolve Your " 
              words={['Mind', 'Health', 'Diet', 'Drive', 'Dedication', 'Goals']}
              typingSpeed={80}
              deletingSpeed={50}
              delayAfterWord={2000}
            />
          </View>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.daysContainer}
          contentContainerStyle={styles.daysContentContainer}
        >
          {days.map((day, index) => (
            <DayCircle key={index} {...day} />
          ))}
        </ScrollView>

        <Link href="/analytics" asChild>
          <TouchableOpacity>
            <View style={styles.calorieCard}>
              {/* Streak counter positioned in top right */}
              <View style={styles.streakCounterContainer}>
                <StreakCounter streak={streak} animate={animateStreak} />
              </View>
              
              <CustomCircularProgress
                size={200}
                width={15}
                fill={calculatePercentage(dailyNutrition.calories, goals.calories)}
                tintColor="#ffffff"
                backgroundColor="rgba(255, 255, 255, 0.08)"
                rotation={0}
              >
                {(fill) => (
                  <View style={styles.calorieTextContainer}>
                    <Text style={styles.calorieNumber}>
                      {calculateRemaining(dailyNutrition.calories, goals.calories)}
                    </Text>
                    <Text style={styles.calorieLabel}>Calories left</Text>
                  </View>
                )}
              </CustomCircularProgress>
            </View>
          </TouchableOpacity>
        </Link>

        <View style={styles.macrosContainer}>
          {/* Protein Progress Circle */}
          <View style={styles.macroProgressContainer}>
            <Text style={styles.macroTitle}>Protein</Text>
            <CustomCircularProgress
              size={110}
              width={10}
              fill={calculatePercentage(dailyNutrition.protein, goals.protein)}
              tintColor="#4ade80" // Changed to green
              backgroundColor="rgba(74, 222, 128, 0.15)" // Changed background to match
              rotation={0}
            >
              {(fill) => (
                <View style={styles.macroProgressTextContainer}>
                  <Text style={styles.macroCurrentValue}>{dailyNutrition.protein}g</Text>
                  <View style={styles.macroProgressDivider} />
                  <Text style={styles.macroGoalValue}>{goals.protein}g</Text>
                </View>
              )}
            </CustomCircularProgress>
            <Text style={styles.macroRemainingText}>
              {calculateRemaining(dailyNutrition.protein, goals.protein)}g left
            </Text>
          </View>

          {/* Carbs Progress Circle */}
          <View style={styles.macroProgressContainer}>
            <Text style={styles.macroTitle}>Carbs</Text>
            <CustomCircularProgress
              size={110}
              width={10}
              fill={calculatePercentage(dailyNutrition.carbs, goals.carbs)}
              tintColor="#ff6b6b" // Changed to red
              backgroundColor="rgba(255, 107, 107, 0.15)" // Changed background to match
              rotation={0}
            >
              {(fill) => (
                <View style={styles.macroProgressTextContainer}>
                  <Text style={styles.macroCurrentValue}>{dailyNutrition.carbs}g</Text>
                  <View style={styles.macroProgressDivider} />
                  <Text style={styles.macroGoalValue}>{goals.carbs}g</Text>
                </View>
              )}
            </CustomCircularProgress>
            <Text style={styles.macroRemainingText}>
              {calculateRemaining(dailyNutrition.carbs, goals.carbs)}g left
            </Text>
          </View>

          {/* Fat Progress Circle */}
          <View style={styles.macroProgressContainer}>
            <Text style={styles.macroTitle}>Fat</Text>
            <CustomCircularProgress
              size={110}
              width={10}
              fill={calculatePercentage(dailyNutrition.fat, goals.fat)}
              tintColor="#fbbf24" // Changed to yellow
              backgroundColor="rgba(251, 191, 36, 0.15)" // Changed background to match
              rotation={0}
            >
              {(fill) => (
                <View style={styles.macroProgressTextContainer}>
                  <Text style={styles.macroCurrentValue}>{dailyNutrition.fat}g</Text>
                  <View style={styles.macroProgressDivider} />
                  <Text style={styles.macroGoalValue}>{goals.fat}g</Text>
                </View>
              )}
            </CustomCircularProgress>
            <Text style={styles.macroRemainingText}>
              {calculateRemaining(dailyNutrition.fat, goals.fat)}g left
            </Text>
          </View>
        </View>

        {/* Recent AI Food Scans Section */}
        {recentAiScans.length > 0 && (
          <View style={styles.aiScansCard}>
            <View style={styles.aiScansContent}>
              <View style={styles.aiScansHeader}>
                <View style={styles.aiScansTitleContainer}>
                  <Text style={styles.aiScansTitle}>AI Food Analysis</Text>
                  <View style={styles.aiIconContainer}>
                    <Ionicons name="scan" size={16} color="#A163F6" />
                  </View>
                </View>
                <TouchableOpacity 
                  style={styles.scanMoreButton}
                  onPress={() => router.push('/modals/scan-food')}
                >
                  <Ionicons name="camera" size={16} color="#A163F6" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.aiScansList}>
                {recentAiScans.map((scan, index) => (
                  <View key={index} style={styles.aiScanItem}>
                    <View style={styles.aiScanLeft}>
                      <MacrosPieChart 
                        protein={scan.protein}
                        carbs={scan.carbs}
                        fat={scan.fat}
                        size={44}
                      />
                    </View>
                    <View style={styles.aiScanMiddle}>
                      <Text style={styles.aiScanName} numberOfLines={1}>
                        {scan.food_name}
                      </Text>
                      <Text style={styles.aiScanServing}>
                        {scan.serving_size} {scan.serving_unit}
                      </Text>
                    </View>
                    <View style={styles.aiScanRight}>
                      <Text style={styles.aiScanCalories}>{scan.calories}</Text>
                      <Text style={styles.aiScanCaloriesUnit}>cal</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Water Tracker */}
        <View style={styles.waterTrackerCard}>
          <View style={styles.waterTrackerHeader}>
            <Text style={styles.waterTrackerTitle}>Water Tracker</Text>
            <TouchableOpacity 
              style={styles.editGoalButton}
              onPress={() => {
                setTempWaterGoal(waterGoal.toString());
                setShowWaterGoalModal(true);
              }}
            >
              <View style={styles.settingsIconContainer}>
                <Ionicons name="settings-outline" size={20} color="rgba(255, 255, 255, 0.7)" />
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.waterTrackerContent}>
            <View style={styles.waterProgressContainer}>
              <CustomCircularProgress
                size={120}
                width={12}
                fill={calculatePercentage(waterIntake, waterGoal)}
                tintColor="#5D9DFA"
                backgroundColor="rgba(93, 157, 250, 0.15)"
                rotation={0}
              >
                {(fill) => (
                  <View style={styles.waterTextContainer}>
                    <Text style={styles.waterAmount}>{waterIntake}</Text>
                    <Text style={styles.waterUnit}>oz</Text>
                  </View>
                )}
              </CustomCircularProgress>
            </View>
            
            <View style={styles.waterInfoContainer}>
              <Text style={styles.waterGoalText}>
                Goal: {waterGoal} oz
              </Text>
              <Text style={styles.waterRemainingText}>
                {Math.max(0, waterGoal - waterIntake)} oz remaining
              </Text>
              
              <View style={styles.waterButtonsContainer}>
                <TouchableOpacity 
                  style={styles.waterButton}
                  onPress={() => handleAddWater(8)}
                >
                  <Text style={styles.waterButtonText}>+8 oz</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.waterButton}
                  onPress={() => handleAddWater(16)}
                >
                  <Text style={styles.waterButtonText}>+16 oz</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => router.push('/modals/add-food')}
      >
        <Ionicons name="add" size={28} color="#000000" />
      </TouchableOpacity>

      {/* Water Goal Modal */}
      <Modal
        visible={showWaterGoalModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Daily Water Goal</Text>
            
            <View style={styles.modalInputContainer}>
              <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                value={tempWaterGoal}
                onChangeText={setTempWaterGoal}
                placeholder="Enter oz"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
              <Text style={styles.modalInputUnit}>oz</Text>
            </View>
            
            <View style={styles.modalButtonsContainer}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowWaterGoalModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveWaterGoal}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 100, // Add extra padding at bottom to prevent content being hidden by tab bar
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  daysContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  daysContentContainer: {
    paddingRight: 20,
  },
  dayCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  todayCircle: {
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  activeDayCircle: {
    borderColor: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  activeDayText: {
    color: '#ffffff',
  },
  dateText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  activeDateText: {
    color: '#ffffff',
  },
  calorieCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    position: 'relative', // For positioning the streak counter
  },
  streakCounterContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  calorieTextContainer: {
    alignItems: 'center',
  },
  calorieNumber: {
    fontSize: 42,
    fontWeight: '700',
    color: '#ffffff',
  },
  calorieLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  // New Macro Circular Progress Styles
  macroProgressContainer: {
    alignItems: 'center',
    width: (width - 60) / 3,
  },
  macroTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  macroProgressTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroCurrentValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  macroProgressDivider: {
    width: 20,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginVertical: 6,
  },
  macroGoalValue: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  macroRemainingText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    textAlign: 'center',
  },
  // Old Macro Card Styles (kept for reference)
  macroCard: {
    width: (width - 56) / 3,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  macroNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  macroLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    marginBottom: 8,
  },
  macroIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  // AI Food Scans Card Styles
  aiScansCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#A163F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  aiScansContent: {
    padding: 16,
  },
  aiScansHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiScansTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiScansTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  aiIconContainer: {
    opacity: 0.8,
  },
  aiScansList: {
    gap: 12,
  },
  aiScanItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 20, 20, 0.4)',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  aiScanLeft: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiScanMiddle: {
    flex: 1,
    marginHorizontal: 12,
  },
  aiScanName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  aiScanServing: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  aiScanRight: {
    alignItems: 'center',
    minWidth: 50,
  },
  aiScanCalories: {
    fontSize: 16,
    fontWeight: '600',
    color: '#A163F6',
  },
  aiScanCaloriesUnit: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  scanMoreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(161, 99, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(161, 99, 246, 0.3)',
  },
  // Water Tracker Styles
  waterTrackerCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#5D9DFA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  waterTrackerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  waterTrackerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  editGoalButton: {
    padding: 8,
  },
  settingsIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterTrackerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  waterProgressContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterTextContainer: {
    alignItems: 'center',
  },
  waterAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  waterUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  waterInfoContainer: {
    flex: 1,
    paddingLeft: 16,
  },
  waterGoalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  waterRemainingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
  },
  waterButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  waterButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(93, 157, 250, 0.2)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(93, 157, 250, 0.4)',
  },
  waterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D9DFA',
    textAlign: 'center',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: width * 0.8,
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#5D9DFA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalInput: {
    flex: 1,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
  },
  modalInputUnit: {
    marginLeft: 12,
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#5D9DFA',
    marginLeft: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  addButton: {
    position: 'absolute',
    bottom: 100, // Positioned well above tab bar to avoid overlap
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 1000,
  },
});