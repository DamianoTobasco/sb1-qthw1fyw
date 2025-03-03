import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { format, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { Habit, calculateHabitStreak } from '../lib/supabase';

const { width } = Dimensions.get('window');

interface HabitTrackerProps {
  habits: Habit[];
  onAddHabit: (habit: Partial<Habit>) => void;
  onDeleteHabit: (habitId: string) => void;
}

interface TimeUnits {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const HabitTracker: React.FC<HabitTrackerProps> = ({
  habits,
  onAddHabit,
  onDeleteHabit,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    color: '#A163F6',
    icon: 'checkmark-circle',
  });
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [timeUnits, setTimeUnits] = useState<{ [key: string]: TimeUnits }>({});
  const [activeTab, setActiveTab] = useState('days');
  
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Colors for habit cards
  const habitColors = [
    '#A163F6', // Purple
    '#ff6b6b', // Red
    '#38E8E0', // Teal
    '#5D9DFA', // Blue
    '#FFD700', // Gold
  ];
  
  // Icons for habits
  const habitIcons = [
    { name: 'checkmark-circle', label: 'Checkmark' },
    { name: 'ban', label: 'No Smoking' },
    { name: 'fitness', label: 'Fitness' },
    { name: 'water', label: 'Hydration' },
    { name: 'nutrition', label: 'Nutrition' },
    { name: 'book', label: 'Reading' },
    { name: 'bed', label: 'Sleep' },
    { name: 'lotus', label: 'Meditation' },
  ];

  // Calculate time differences for each habit
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeUnits: { [key: string]: TimeUnits } = {};
      
      habits.forEach(habit => {
        const startDate = new Date(habit.start_date);
        const now = new Date();
        
        newTimeUnits[habit.id] = {
          days: differenceInDays(now, startDate),
          hours: differenceInHours(now, startDate) % 24,
          minutes: differenceInMinutes(now, startDate) % 60,
          seconds: differenceInSeconds(now, startDate) % 60,
        };
      });
      
      setTimeUnits(newTimeUnits);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [habits]);
  
  // Animate in when component mounts
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleAddHabit = () => {
    if (!newHabit.name) return;
    
    onAddHabit({
      name: newHabit.name,
      description: newHabit.description,
      color: newHabit.color,
      icon: newHabit.icon,
      start_date: new Date().toISOString(),
    });
    
    setNewHabit({
      name: '',
      description: '',
      color: '#A163F6',
      icon: 'checkmark-circle',
    });
    
    setAddModalVisible(false);
  };

  const handleSelectHabit = (habit: Habit) => {
    setSelectedHabit(habit);
    setModalVisible(true);
  };

  const handleDeleteHabit = (habitId: string) => {
    onDeleteHabit(habitId);
    setModalVisible(false);
  };
  
  const getTimeDisplay = (habit: Habit) => {
    const units = timeUnits[habit.id];
    if (!units) return '0d 0h 0m 0s';
    
    switch (activeTab) {
      case 'days':
        return `${units.days} days`;
      case 'hours':
        return `${units.days * 24 + units.hours} hours`;
      case 'all':
        return `${units.days}d ${units.hours}h ${units.minutes}m ${units.seconds}s`;
      default:
        return `${units.days} days`;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Habit Trackers</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setAddModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>
      
      {/* Time unit tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'days' && styles.activeTab]}
          onPress={() => setActiveTab('days')}
        >
          <Text style={[styles.tabText, activeTab === 'days' && styles.activeTabText]}>Days</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'hours' && styles.activeTab]}
          onPress={() => setActiveTab('hours')}
        >
          <Text style={[styles.tabText, activeTab === 'hours' && styles.activeTabText]}>Hours</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>Detailed</Text>
        </TouchableOpacity>
      </View>
      
      {habits.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={48} color="rgba(255, 255, 255, 0.3)" />
          <Text style={styles.emptyStateText}>No habits tracked yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Add a habit to start tracking your progress
          </Text>
          <TouchableOpacity 
            style={styles.emptyStateButton}
            onPress={() => setAddModalVisible(true)}
          >
            <Text style={styles.emptyStateButtonText}>Add Habit</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          style={styles.habitList}
          showsVerticalScrollIndicator={false}
        >
          {habits.map((habit, index) => (
            <Animated.View 
              key={habit.id}
              style={[
                styles.habitCard,
                { 
                  backgroundColor: habit.color || habitColors[index % habitColors.length],
                  opacity: fadeAnim,
                  transform: [
                    { 
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }) 
                    }
                  ],
                }
              ]}
            >
              <TouchableOpacity
                style={styles.habitCardContent}
                onPress={() => handleSelectHabit(habit)}
                activeOpacity={0.8}
              >
                <View style={styles.habitIconContainer}>
                  <Ionicons 
                    name={habit.icon as any || 'checkmark-circle'} 
                    size={28} 
                    color="#ffffff" 
                  />
                </View>
                <View style={styles.habitInfo}>
                  <Text style={styles.habitName}>{habit.name}</Text>
                  <Text style={styles.habitDate}>
                    Since {format(new Date(habit.start_date), 'MMM d, yyyy')}
                  </Text>
                </View>
                <View style={styles.streakContainer}>
                  <Text style={styles.streakNumber}>
                    {getTimeDisplay(habit)}
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
      )}
      
      {/* Habit Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <BlurView intensity={Platform.OS === 'ios' ? 60 : 100} tint="dark" style={styles.modalBlur}>
            <View style={[
              styles.modalContent,
              selectedHabit && { borderColor: selectedHabit.color }
            ]}>
              {selectedHabit && (
                <>
                  <View style={styles.modalHeader}>
                    <View style={[styles.modalIconContainer, { backgroundColor: selectedHabit.color }]}>
                      <Ionicons 
                        name={selectedHabit.icon as any || 'checkmark-circle'} 
                        size={32} 
                        color="#ffffff" 
                      />
                    </View>
                    <TouchableOpacity 
                      style={styles.closeButton}
                      onPress={() => setModalVisible(false)}
                    >
                      <Ionicons name="close" size={24} color="rgba(255, 255, 255, 0.8)" />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.modalTitle}>{selectedHabit.name}</Text>
                  {selectedHabit.description && (
                    <Text style={styles.modalDescription}>{selectedHabit.description}</Text>
                  )}
                  
                  <View style={styles.streakDetailContainer}>
                    <Text style={styles.streakDetailLabel}>Current Streak</Text>
                    <View style={styles.timeUnitSelector}>
                      <TouchableOpacity 
                        style={[styles.timeUnitTab, activeTab === 'days' && styles.activeTimeUnitTab]}
                        onPress={() => setActiveTab('days')}
                      >
                        <Text style={styles.timeUnitText}>Days</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.timeUnitTab, activeTab === 'hours' && styles.activeTimeUnitTab]}
                        onPress={() => setActiveTab('hours')}
                      >
                        <Text style={styles.timeUnitText}>Hours</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.timeUnitTab, activeTab === 'all' && styles.activeTimeUnitTab]}
                        onPress={() => setActiveTab('all')}
                      >
                        <Text style={styles.timeUnitText}>All</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.timeDisplay}>
                      {timeUnits[selectedHabit.id] && (
                        <>
                          {activeTab === 'days' && (
                            <Text style={styles.timeValue}>
                              {timeUnits[selectedHabit.id].days}
                              <Text style={styles.timeUnit}> days</Text>
                            </Text>
                          )}
                          
                          {activeTab === 'hours' && (
                            <Text style={styles.timeValue}>
                              {timeUnits[selectedHabit.id].days * 24 + timeUnits[selectedHabit.id].hours}
                              <Text style={styles.timeUnit}> hours</Text>
                            </Text>
                          )}
                          
                          {activeTab === 'all' && (
                            <View style={styles.detailedTimeContainer}>
                              <View style={styles.timeBlock}>
                                <Text style={styles.timeBlockValue}>{timeUnits[selectedHabit.id].days}</Text>
                                <Text style={styles.timeBlockUnit}>Days</Text>
                              </View>
                              <View style={styles.timeBlock}>
                                <Text style={styles.timeBlockValue}>{timeUnits[selectedHabit.id].hours}</Text>
                                <Text style={styles.timeBlockUnit}>Hours</Text>
                              </View>
                              <View style={styles.timeBlock}>
                                <Text style={styles.timeBlockValue}>{timeUnits[selectedHabit.id]. minutes}</Text>
                                <Text style={styles.timeBlockUnit}>Minutes</Text>
                              </View>
                              <View style={styles.timeBlock}>
                                <Text style={styles.timeBlockValue}>{timeUnits[selectedHabit.id].seconds}</Text>
                                <Text style={styles.timeBlockUnit}>Seconds</Text>
                              </View>
                            </View>
                          )}
                        </>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.startedContainer}>
                    <Text style={styles.startedLabel}>Started on</Text>
                    <Text style={styles.startedDate}>
                      {format(new Date(selectedHabit.start_date), 'MMMM d, yyyy')}
                    </Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={[styles.deleteButton, { borderColor: selectedHabit.color }]}
                    onPress={() => handleDeleteHabit(selectedHabit.id)}
                  >
                    <Text style={styles.deleteButtonText}>Reset Counter</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </BlurView>
        </View>
      </Modal>
      
      {/* Add Habit Modal */}
      <Modal
        visible={addModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <BlurView intensity={Platform.OS === 'ios' ? 60 : 100} tint="dark" style={styles.modalBlur}>
            <View style={styles.addModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.addModalTitle}>Add New Habit</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setAddModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color="rgba(255, 255, 255, 0.8)" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Habit Name</Text>
                <TextInput
                  style={styles.input}
                  value={newHabit.name}
                  onChangeText={(text) => setNewHabit({ ...newHabit, name: text })}
                  placeholder="e.g., No Vaping, Daily Exercise"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Description (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newHabit.description}
                  onChangeText={(text) => setNewHabit({ ...newHabit, description: text })}
                  placeholder="Why are you tracking this habit?"
                  placeholderTextColor="rgba(255, 255, 255, 0.4)"
                  multiline
                  numberOfLines={3}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Icon</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.iconSelector}
                >
                  {habitIcons.map((icon) => (
                    <TouchableOpacity
                      key={icon.name}
                      style={[
                        styles.iconOption,
                        newHabit.icon === icon.name && styles.selectedIconOption,
                        { backgroundColor: newHabit.color }
                      ]}
                      onPress={() => setNewHabit({ ...newHabit, icon: icon.name })}
                    >
                      <Ionicons name={icon.name as any} size={24} color="#ffffff" />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Color</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.colorSelector}
                >
                  {habitColors.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        newHabit.color === color && styles.selectedColorOption,
                      ]}
                      onPress={() => setNewHabit({ ...newHabit, color })}
                    />
                  ))}
                </ScrollView>
              </View>
              
              <TouchableOpacity 
                style={[styles.addHabitButton, { backgroundColor: newHabit.color }]}
                onPress={handleAddHabit}
                disabled={!newHabit.name}
              >
                <Text style={styles.addHabitButtonText}>Start Tracking</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: 'rgba(20, 20, 20, 0.5)',
    borderRadius: 20,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 16,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  activeTabText: {
    color: '#ffffff',
  },
  habitList: {
    maxHeight: 300,
  },
  habitCard: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  habitCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  habitIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  habitDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  streakContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  streakNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: '#A163F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  emptyStateButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalBlur: {
    borderRadius: 24,
    overflow: 'hidden',
    width: width * 0.9,
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#A163F6',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 24,
  },
  streakDetailContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  streakDetailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
    textAlign: 'center',
  },
  timeUnitSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  timeUnitTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeTimeUnitTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  timeUnitText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  timeDisplay: {
    alignItems: 'center',
  },
  timeValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  timeUnit: {
    fontSize: 18,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  detailedTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  timeBlock: {
    alignItems: 'center',
    flex: 1,
  },
  timeBlockValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  timeBlockUnit: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  startedContainer: {
    marginBottom: 24,
  },
  startedLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  startedDate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  deleteButton: {
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  addModalContent: {
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: width * 0.9,
    maxWidth: 400,
  },
  addModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  iconSelector: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#A163F6',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedIconOption: {
    borderColor: '#ffffff',
    borderWidth: 2,
  },
  colorSelector: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedColorOption: {
    borderColor: '#ffffff',
    borderWidth: 2,
  },
  addHabitButton: {
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: '#A163F6',
    marginTop: 8,
  },
  addHabitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});