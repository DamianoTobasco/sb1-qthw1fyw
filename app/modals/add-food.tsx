import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  Dimensions,
  Alert,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { searchFood, logFood, TEST_USER_ID } from '../../lib/supabase';

const { width } = Dimensions.get('window');

const PORTION_SIZES = [
  { label: '¼', value: 0.25 },
  { label: '½', value: 0.5 },
  { label: '¾', value: 0.75 },
  { label: '1', value: 1 },
  { label: '1½', value: 1.5 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
];

export default function AddFoodModal() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedPortion, setSelectedPortion] = useState(1);
  const [initialSearchDone, setInitialSearchDone] = useState(false);

  // Perform an initial search when the modal opens to show some food items
  useEffect(() => {
    if (!initialSearchDone) {
      setInitialSearchDone(true);
      // Search for common food items to populate the initial view
      handleSearch('apple');
    }
  }, [initialSearchDone]);

  // Handle search query changes with debounce
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const handleSearch = async (query) => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      console.log('Searching for:', query);
      const results = await searchFood(query);
      console.log(`Search returned ${results.length} results`);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching food:', error);
      Alert.alert('Error', 'Failed to search for food. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFood = (food) => {
    console.log('Selected food:', food);
    setSelectedFood(food);
    setSelectedPortion(1); // Reset portion size when selecting new food
  };

  const calculateNutrient = (nutrient) => {
    if (!selectedFood || nutrient === undefined) return 0;
    return Math.round(nutrient * selectedPortion);
  };

  const handleLogFood = async () => {
    if (!selectedFood) return;

    setLoading(true);
    try {
      await logFood(TEST_USER_ID, selectedFood, selectedPortion);
      Alert.alert(
        'Success',
        `Added ${selectedFood.food_name} to your food log.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error logging food:', error);
      Alert.alert(
        'Error',
        'Failed to log food. Please try again.',
        [{ text: 'OK' }]
      );
      setLoading(false);
    }
  };

  const handleScanFood = () => {
    router.push('/modals/scan-food');
  };

  const renderEmptySearchState = () => {
    if (loading) return null;
    
    if (searchQuery && searchResults.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={40} color="#cbd5e1" />
          <Text style={styles.emptyStateText}>No foods found</Text>
          <Text style={styles.emptyStateSubtext}>
            Try searching for a different food
          </Text>
        </View>
      );
    }

    if (!initialSearchDone || (!searchQuery && searchResults.length === 0)) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="restaurant-outline" size={40} color="#cbd5e1" />
          <Text style={styles.emptyStateText}>Start typing to search</Text>
          <Text style={styles.emptyStateSubtext}>
            Search for foods like "apple", "chicken", or "rice"
          </Text>
        </View>
      );
    }
    
    return null;
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={100} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Food</Text>
      </BlurView>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#64748b" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a food..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus={Platform.OS !== 'web'}
          returnKeyType="search"
          placeholderTextColor="#94a3b8"
        />
        {loading && (
          <ActivityIndicator size="small" color="#000000" style={styles.searchLoadingIndicator} />
        )}
      </View>

      {/* AI Food Scanner Button */}
      <TouchableOpacity
        style={styles.scanFoodButton}
        onPress={handleScanFood}
      >
        <Ionicons name="camera" size={20} color="#ffffff" />
        <Text style={styles.scanFoodButtonText}>Scan Food with AI</Text>
      </TouchableOpacity>

      {selectedFood ? (
        <View style={styles.foodDetailsContainer}>
          <View style={styles.selectedFoodHeader}>
            <TouchableOpacity 
              onPress={() => setSelectedFood(null)}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#000000" />
            </TouchableOpacity>
            <Text style={styles.selectedFoodTitle}>{selectedFood.food_name}</Text>
          </View>

          <View style={styles.portionContainer}>
            <Text style={styles.portionTitle}>Portion Size</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.portionButtons}
            >
              {PORTION_SIZES.map((portion) => (
                <TouchableOpacity
                  key={portion.value}
                  style={[
                    styles.portionButton,
                    selectedPortion === portion.value && styles.selectedPortionButton,
                  ]}
                  onPress={() => setSelectedPortion(portion.value)}
                >
                  <Text
                    style={[
                      styles.portionButtonText,
                      selectedPortion === portion.value && styles.selectedPortionButtonText,
                    ]}
                  >
                    {portion.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.servingInfo}>
            <Text style={styles.servingInfoText}>
              {selectedPortion} {selectedPortion === 1 ? 'serving' : 'servings'} = {selectedPortion} × {selectedFood.serving_size} {selectedFood.serving_unit}
            </Text>
          </View>

          <View style={styles.nutritionContainer}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>
                {calculateNutrient(selectedFood.calories)}
              </Text>
              <Text style={styles.nutritionLabel}>Calories</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>
                {calculateNutrient(selectedFood.protein)}g
              </Text>
              <Text style={styles.nutritionLabel}>Protein</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>
                {calculateNutrient(selectedFood.carbohydrate)}g
              </Text>
              <Text style={styles.nutritionLabel}>Carbs</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>
                {calculateNutrient(selectedFood.fat)}g
              </Text>
              <Text style={styles.nutritionLabel}>Fat</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleLogFood}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.addButtonText}>Add to Log</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.resultsContainer}>
          {renderEmptySearchState()}
          
          <FlatList
            data={searchResults}
            keyExtractor={(item, index) => `${item.id || item.food_name}-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => handleSelectFood(item)}
              >
                <View style={styles.resultContent}>
                  <Text style={styles.foodName}>{item.food_name}</Text>
                  <Text style={styles.foodDetails}>
                    {item.serving_size} {item.serving_unit} • {Math.round(item.calories)} cal
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#64748b" />
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={searchResults.length === 0 ? { flex: 1 } : null}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 35,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    paddingHorizontal: 48,
    fontSize: 16,
    color: '#000000',
  },
  searchLoadingIndicator: {
    position: 'absolute',
    right: 35,
  },
  // AI Scan Food Button
  scanFoodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#A163F6',
    padding: 14,
    borderRadius: 24,
    shadowColor: '#A163F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  scanFoodButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  resultsContainer: {
    flex: 1,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  resultContent: {
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 20,
  },
  foodName: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 4,
  },
  foodDetails: {
    fontSize: 14,
    color: '#64748b',
  },
  foodDetailsContainer: {
    flex: 1,
    padding: 20,
  },
  selectedFoodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  selectedFoodTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
  },
  portionContainer: {
    marginBottom: 16,
  },
  portionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  portionButtons: {
    paddingBottom: 8,
  },
  portionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 12,
  },
  selectedPortionButton: {
    backgroundColor: '#000000',
  },
  portionButtonText: {
    fontSize: 16,
    color: '#64748b',
  },
  selectedPortionButtonText: {
    color: '#ffffff',
  },
  servingInfo: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  servingInfoText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  nutritionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  addButton: {
    backgroundColor: '#000000',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 250,
  },
});