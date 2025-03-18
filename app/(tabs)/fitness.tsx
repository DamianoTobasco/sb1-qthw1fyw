import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

type WorkoutLog = {
  id: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  notes?: string;
};

type DayLog = {
  date: string;
  workouts: WorkoutLog[];
};

const WORKOUT_PRESETS = {
  'Upper Body': [
    'Bench Press',
    'Push-ups',
    'Shoulder Press',
    'Pull-ups',
    'Tricep Extensions',
    'Bicep Curls',
    'Lateral Raises',
    'Chest Flyes',
  ],
  'Lower Body': [
    'Squats',
    'Deadlifts',
    'Lunges',
    'Leg Press',
    'Calf Raises',
    'Hip Thrusts',
    'Leg Extensions',
    'Hamstring Curls',
  ],
  'Core': [
    'Planks',
    'Crunches',
    'Russian Twists',
    'Leg Raises',
    'Dead Bug',
    'Side Planks',
    'Ab Rollouts',
    'Bird Dogs',
  ],
  'Cardio': [
    'Running',
    'Cycling',
    'Jump Rope',
    'Rowing',
    'Burpees',
    'High Knees',
    'Mountain Climbers',
    'Jumping Jacks',
  ],
};

const initialWorkoutState = {
  exercise: '',
  sets: '',
  reps: '',
  weight: '',
  notes: '',
};

export default function FitnessScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [modalVisible, setModalVisible] = useState(false);
  const [newWorkout, setNewWorkout] = useState(initialWorkoutState);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Mock data for demonstration
  const [workoutLogs, setWorkoutLogs] = useState<DayLog[]>([
    {
      date: '2025-02-24',
      workouts: [
        {
          id: '1',
          exercise: 'Bench Press',
          sets: 4,
          reps: 10,
          weight: 185,
          notes: 'Increased weight by 5lbs',
        },
        {
          id: '2',
          exercise: 'Squats',
          sets: 3,
          reps: 12,
          weight: 225,
        },
      ],
    },
  ]);

  const generateCalendarDays = () => {
    const days = [];
    const currentDate = new Date(selectedDate);
    currentDate.setDate(1);
    const firstDay = currentDate.getDay();
    const daysInMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    ).getDate();

    // Add empty days for padding
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const hasWorkout = (day: number) => {
    const date = new Date(selectedDate);
    date.setDate(day);
    const dateString = date.toISOString().split('T')[0];
    return workoutLogs.some((log) => log.date === dateString);
  };

  const addWorkout = () => {
    if (!newWorkout.exercise || !newWorkout.sets || !newWorkout.reps || !newWorkout.weight) {
      return;
    }

    const dateString = selectedDate.toISOString().split('T')[0];
    const newLog: WorkoutLog = {
      id: Math.random().toString(),
      exercise: newWorkout.exercise,
      sets: Number(newWorkout.sets),
      reps: Number(newWorkout.reps),
      weight: Number(newWorkout.weight),
      notes: newWorkout.notes,
    };

    const existingDayIndex = workoutLogs.findIndex((log) => log.date === dateString);
    if (existingDayIndex >= 0) {
      const updatedLogs = [...workoutLogs];
      updatedLogs[existingDayIndex].workouts.push(newLog);
      setWorkoutLogs(updatedLogs);
    } else {
      setWorkoutLogs([...workoutLogs, { date: dateString, workouts: [newLog] }]);
    }

    resetForm();
  };

  const handleDeleteWorkout = (workoutId: string) => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const dateString = selectedDate.toISOString().split('T')[0];
            const updatedLogs = workoutLogs.map(dayLog => {
              if (dayLog.date === dateString) {
                return {
                  ...dayLog,
                  workouts: dayLog.workouts.filter(workout => workout.id !== workoutId),
                };
              }
              return dayLog;
            }).filter(dayLog => dayLog.workouts.length > 0);
            
            setWorkoutLogs(updatedLogs);
          },
        },
      ]
    );
  };

  const handleSelectWorkout = (exercise: string) => {
    setNewWorkout({ ...newWorkout, exercise });
    setSearchQuery(exercise);
    setShowSuggestions(false);
  };

  const resetForm = () => {
    setModalVisible(false);
    setNewWorkout(initialWorkoutState);
    setSearchQuery('');
    setShowSuggestions(false);
    setSelectedCategory(null);
  };

  const filteredExercises = selectedCategory
    ? WORKOUT_PRESETS[selectedCategory].filter(exercise =>
        exercise.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : Object.values(WORKOUT_PRESETS).flat().filter(exercise =>
        exercise.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const renderWorkoutDate = () => (
    <Text style={styles.sectionTitle}>
      Workouts for{' '}
      {selectedDate.toLocaleDateString('default', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })}
    </Text>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Fitness Log</Text>

        <View style={styles.calendarContainer}>
          <View style={styles.monthSelector}>
            <TouchableOpacity
              onPress={() => {
                const newDate = new Date(selectedDate);
                newDate.setMonth(newDate.getMonth() - 1);
                setSelectedDate(newDate);
              }}>
              <Ionicons name="chevron-back" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.monthText}>
              {selectedDate.toLocaleString('default', {
                month: 'long',
                year: 'numeric',
              })}
            </Text>
            <TouchableOpacity
              onPress={() => {
                const newDate = new Date(selectedDate);
                newDate.setMonth(newDate.getMonth() + 1);
                setSelectedDate(newDate);
              }}>
              <Ionicons name="chevron-forward" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <View style={styles.calendar}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <Text key={day} style={styles.dayHeader}>{day}</Text>
            ))}
            {generateCalendarDays().map((day, index) => (
              <View key={index} style={styles.dayContainer}>
                {day ? (
                  <TouchableOpacity
                    style={[
                      styles.day,
                      hasWorkout(day) && styles.dayWithWorkout,
                      selectedDate.getDate() === day && styles.selectedDay
                    ]}
                    onPress={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setDate(day);
                      setSelectedDate(newDate);
                    }}>
                    <Text
                      style={[
                        styles.dayText,
                        hasWorkout(day) && styles.dayWithWorkoutText,
                        selectedDate.getDate() === day && styles.selectedDayText
                      ]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.emptyDay} />
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.workoutList}>
          {renderWorkoutDate()}
          {workoutLogs
            .find((log) => log.date === selectedDate.toISOString().split('T')[0])
            ?.workouts.map((workout) => (
              <View key={workout.id} style={styles.workoutCard}>
                <View style={styles.workoutHeader}>
                  <Text style={styles.exerciseName}>{workout.exercise}</Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteWorkout(workout.id)}
                    style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
                <View style={styles.workoutDetails}>
                  <Text style={styles.detail}>Sets: {workout.sets}</Text>
                  <Text style={styles.detail}>Reps: {workout.reps}</Text>
                  <Text style={styles.detail}>{workout.weight} lbs</Text>
                </View>
                {workout.notes && (
                  <Text style={styles.notes}>{workout.notes}</Text>
                )}
              </View>
            ))}
          
          {!workoutLogs.find((log) => log.date === selectedDate.toISOString().split('T')[0]) && (
            <Text style={styles.emptyText}>No workouts recorded for this day</Text>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={32} color="#000000" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={resetForm}>
        <View style={styles.modalContainer}>
          <BlurView intensity={20} tint="dark" style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Workout</Text>
              <TouchableOpacity onPress={resetForm} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="rgba(255, 255, 255, 0.8)" />
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
              {Object.keys(WORKOUT_PRESETS).map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category && styles.selectedCategoryButton,
                  ]}
                  onPress={() => setSelectedCategory(category)}>
                  <Text
                    style={[
                      styles.categoryButtonText,
                      selectedCategory === category && styles.selectedCategoryButtonText,
                    ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search or enter exercise name"
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  setNewWorkout({ ...newWorkout, exercise: text });
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
            </View>

            {showSuggestions && searchQuery.length > 0 && (
              <ScrollView style={styles.suggestionsContainer}>
                {filteredExercises.map((exercise) => (
                  <TouchableOpacity
                    key={exercise}
                    style={styles.suggestionItem}
                    onPress={() => handleSelectWorkout(exercise)}>
                    <Text style={styles.suggestionText}>{exercise}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <View style={styles.inputGrid}>
              <View style={styles.inputField}>
                <Text style={styles.inputLabel}>Sets</Text>
                <TextInput
                  style={styles.numberInput}
                  placeholder="0"
                  keyboardType="numeric"
                  value={newWorkout.sets}
                  onChangeText={(text) =>
                    setNewWorkout({ ...newWorkout, sets: text })
                  }
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                />
              </View>
              <View style={styles.inputField}>
                <Text style={styles.inputLabel}>Reps</Text>
                <TextInput
                  style={styles.numberInput}
                  placeholder="0"
                  keyboardType="numeric"
                  value={newWorkout.reps}
                  onChangeText={(text) =>
                    setNewWorkout({ ...newWorkout, reps: text })
                  }
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                />
              </View>
              <View style={styles.inputField}>
                <Text style={styles.inputLabel}>Weight (lbs)</Text>
                <TextInput
                  style={styles.numberInput}
                  placeholder="0"
                  keyboardType="numeric"
                  value={newWorkout.weight}
                  onChangeText={(text) =>
                    setNewWorkout({ ...newWorkout, weight: text })
                  }
                  placeholderTextColor="rgba(255, 255, 255, 0.3)"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.saveButton,
                (!newWorkout.exercise || !newWorkout.sets || !newWorkout.reps || !newWorkout.weight) && 
                styles.saveButtonDisabled
              ]}
              onPress={addWorkout}
              disabled={!newWorkout.exercise || !newWorkout.sets || !newWorkout.reps || !newWorkout.weight}>
              <Text style={styles.saveButtonText}>Save Workout</Text>
            </TouchableOpacity>
          </BlurView>
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
  content: {
    padding: 20,
    paddingBottom: 100, // Allow space for the add button and tab bar
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 24,
  },
  calendarContainer: {
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayHeader: {
    width: '14%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
  },
  dayContainer: {
    width: '14%',
    aspectRatio: 1,
    padding: 2,
    marginBottom: 2,
  },
  day: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emptyDay: {
    flex: 1,
  },
  dayWithWorkout: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedDay: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#ffffff',
    borderWidth: 1.5,
  },
  dayText: {
    fontSize: 16,
    color: '#ffffff',
  },
  dayWithWorkoutText: {
    color: '#000000',
    fontWeight: '600',
  },
  selectedDayText: {
    fontWeight: 'bold',
  },
  workoutList: {
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  workoutCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  deleteButton: {
    padding: 8,
  },
  workoutDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  notes: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  addButton: {
    position: 'absolute',
    bottom: 90, // Positioned above tab bar
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 1000,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    backgroundColor: 'rgba(20, 20, 20, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  closeButton: {
    padding: 8,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedCategoryButton: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  categoryButtonText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  selectedCategoryButtonText: {
    color: '#000000',
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  suggestionsContainer: {
    maxHeight: 200,
    marginBottom: 20,
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  suggestionText: {
    fontSize: 16,
    color: '#ffffff',
  },
  inputGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  inputField: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  numberInput: {
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  saveButton: {
    height: 56,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
});