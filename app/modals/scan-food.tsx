import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { logFood, TEST_USER_ID } from '../../lib/supabase';

const { width } = Dimensions.get('window');

// Make OpenAI integration conditional and more robust for mobile
const isOpenAIAvailable = () => {
  try {
    // Check if OpenAI API key is available
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) return false;
    
    // Dynamically import OpenAI
    const OpenAI = require('openai')?.OpenAI;
    if (!OpenAI) return false;
    
    return true;
  } catch (e) {
    console.log("OpenAI not available:", e);
    return false;
  }
};

// Create client only if available and on web (to avoid issues on Expo Go)
let openai = null;
if (Platform.OS === 'web' && isOpenAIAvailable()) {
  try {
    const OpenAI = require('openai').OpenAI;
    openai = new OpenAI({
      apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true, // For demo purposes only
    });
  } catch (e) {
    console.log("Error initializing OpenAI:", e);
  }
}

// GPT-4o system prompt for analyzing food images
const SYSTEM_PROMPT = `You are a nutritional analysis AI specialized in identifying food from images. 
When shown an image of food, provide:
1. A brief, one-sentence description of the food
2. Nutritional information with these macros ONLY:
   - Calories (kcal)
   - Protein (g)
   - Carbs (g)
   - Fat (g)

Format your response exactly like this JSON:
{
  "description": "Brief description of the food",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number
}

Estimate values based on standard portions if exact measurements aren't possible. 
Do not include any other text, explanations, or content outside the JSON format.`;

export default function ScanFoodModal() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    description: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingFood, setIsLoggingFood] = useState(false);
  const [openAIAvailable, setOpenAIAvailable] = useState(Platform.OS === 'web' && !!openai);
  
  // Request permissions when component mounts
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera permissions to make this work!');
        }
      }
    })();
    
    // Show appropriate error based on platform
    if (Platform.OS !== 'web') {
      setError("AI food analysis is currently only available on web. Mobile support coming soon!");
    } else if (!openai) {
      setError("OpenAI integration is not available. Please check your configuration.");
    }
  }, []);

  // Take a photo using the camera
  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Process image to optimize for API upload
        const processedImage = await processImage(result.assets[0].uri);
        setImage(processedImage);
        if (Platform.OS === 'web' && openai) {
          analyzeImage(processedImage);
        } else {
          setError("AI food analysis is currently only available on web. Mobile support coming soon!");
        }
      }
    } catch (err) {
      console.error('Error taking photo:', err);
      setError('Failed to take photo. Please try again.');
    }
  };

  // Pick an image from the gallery
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Process image to optimize for API upload
        const processedImage = await processImage(result.assets[0].uri);
        setImage(processedImage);
        if (Platform.OS === 'web' && openai) {
          analyzeImage(processedImage);
        } else {
          setError("AI food analysis is currently only available on web. Mobile support coming soon!");
        }
      }
    } catch (err) {
      console.error('Error picking image:', err);
      setError('Failed to select image. Please try again.');
    }
  };
  
  // Process image to reduce size for API upload
  const processImage = async (uri: string) => {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      return result.uri;
    } catch (err) {
      console.error('Error processing image:', err);
      throw new Error('Failed to process image');
    }
  };

  // Convert image to base64 (required for OpenAI API)
  const uriToBase64 = async (uri: string) => {
    if (Platform.OS === 'web') {
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              // Extract the base64 part
              const base64 = reader.result.split(',')[1];
              resolve(base64);
            } else {
              reject(new Error('Failed to convert to base64'));
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.error('Error converting image to base64:', err);
        throw new Error('Failed to process image for AI analysis');
      }
    } else {
      // For mobile, we're not using OpenAI currently, but keeping the code for future implementation
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              // Extract the base64 part
              const base64 = reader.result.split(',')[1];
              resolve(base64);
            } else {
              reject(new Error('Failed to convert to base64'));
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.error('Error with mobile image processing:', err);
        throw new Error('Image processing not supported on this platform');
      }
    }
  };
  
  // Analyze image using OpenAI's GPT-4o - web only
  const analyzeImage = async (imageUri: string) => {
    if (!imageUri || Platform.OS !== 'web') return;
    
    setAnalyzing(true);
    setError(null);
    setResult(null);
    
    try {
      // Check if OpenAI is available
      if (!openai) {
        throw new Error("OpenAI integration is not available. Please check your configuration.");
      }
      
      // Check if API key is available
      const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("OpenAI API key is not configured. Please check your environment variables.");
      }
      
      // Convert image to base64
      const base64Image = await uriToBase64(imageUri);
      
      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { 
            role: "user", 
            content: [
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
              { type: "text", text: "Analyze this food image and provide nutritional information." }
            ] 
          }
        ],
        max_tokens: 300,
      });
      
      // Parse the response
      if (response.choices && response.choices.length > 0) {
        const content = response.choices[0].message.content;
        if (content) {
          try {
            // Parse the JSON response
            const jsonResponse = JSON.parse(content);
            setResult({
              description: jsonResponse.description,
              calories: jsonResponse.calories,
              protein: jsonResponse.protein,
              carbs: jsonResponse.carbs,
              fat: jsonResponse.fat
            });
          } catch (jsonError) {
            console.error('Failed to parse JSON response:', jsonError);
            setError('Failed to parse AI response. Please try again.');
          }
        }
      } else {
        throw new Error('No response from AI');
      }
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError(`Failed to analyze image: ${err.message || 'Unknown error'}`);
    } finally {
      setAnalyzing(false);
    }
  };
  
  // Mock analysis for demo purposes on mobile
  const mockAnalysis = () => {
    setAnalyzing(true);
    setError(null);
    setResult(null);
    
    // Simulate network delay
    setTimeout(() => {
      setResult({
        description: "Grilled chicken salad with mixed vegetables",
        calories: 320,
        protein: 28,
        carbs: 12,
        fat: 18
      });
      setAnalyzing(false);
    }, 2000);
  };
  
  // Handle image selection with platform-specific logic
  const handleImageProcessing = (imageUri: string) => {
    setImage(imageUri);
    if (Platform.OS === 'web' && openai) {
      analyzeImage(imageUri);
    } else {
      // On mobile, use mock analysis for demo
      mockAnalysis();
    }
  };
  
  // Log the analyzed food to the database
  const handleLogFood = async () => {
    if (!result) return;
    
    setIsLoggingFood(true);
    
    try {
      await logFood(TEST_USER_ID, {
        food_name: result.description,
        serving_size: 1,
        serving_unit: 'serving',
        calories: result.calories,
        protein: result.protein,
        carbohydrate: result.carbs,
        fat: result.fat
      }, 1);
      
      Alert.alert(
        'Success',
        'Food has been added to your log!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err) {
      console.error('Error logging food:', err);
      Alert.alert('Error', 'Failed to log food. Please try again.');
    } finally {
      setIsLoggingFood(false);
    }
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={Platform.OS === 'ios' ? 70 : 100} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.title}>AI Food Recognition</Text>
      </BlurView>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {!image ? (
          // Image selection options when no image is selected
          <View style={styles.imageSelectionContainer}>
            <View style={styles.instructionContainer}>
              <Ionicons name="camera" size={60} color="rgba(255, 255, 255, 0.7)" />
              <Text style={styles.instructionText}>
                Take a photo of your food or upload an image to get instant nutrition information
                {Platform.OS !== 'web' && "\n\n(Demo mode on mobile devices)"}
              </Text>
            </View>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.optionButton} onPress={takePhoto}>
                <Ionicons name="camera" size={32} color="#ffffff" />
                <Text style={styles.optionButtonText}>Take Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.optionButton} onPress={pickImage}>
                <Ionicons name="images" size={32} color="#ffffff" />
                <Text style={styles.optionButtonText}>Choose Image</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Show the image and analysis results
          <View>
            <View style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.foodImage} />
              {analyzing && (
                <View style={styles.analyzeOverlay}>
                  <ActivityIndicator size="large" color="#A163F6" />
                  <Text style={styles.analyzeText}>Analyzing food...</Text>
                </View>
              )}
            </View>
            
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={24} color="#ff6b6b" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={() => Platform.OS === 'web' ? analyzeImage(image) : mockAnalysis()}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {result && (
              <View style={styles.resultContainer}>
                <Text style={styles.foodDescription}>{result.description}</Text>
                
                <View style={styles.macrosGrid}>
                  {/* Calories */}
                  <View style={[styles.macroCard, styles.caloriesCard]}>
                    <View style={styles.macroIconContainer}>
                      <Ionicons name="flame" size={20} color="#ffffff" />
                    </View>
                    <View style={styles.macroContent}>
                      <Text style={styles.macroLabel}>Calories</Text>
                      <Text style={styles.macroValue}>{result.calories}</Text>
                    </View>
                  </View>
                  
                  {/* Protein */}
                  <View style={[styles.macroCard, styles.proteinCard]}>
                    <View style={styles.macroIconContainer}>
                      <Ionicons name="restaurant" size={20} color="#ffffff" />
                    </View>
                    <View style={styles.macroContent}>
                      <Text style={styles.macroLabel}>Protein</Text>
                      <Text style={styles.macroValue}>{result.protein}g</Text>
                    </View>
                  </View>
                  
                  {/* Carbs */}
                  <View style={[styles.macroCard, styles.carbsCard]}>
                    <View style={styles.macroIconContainer}>
                      <Ionicons name="nutrition" size={20} color="#ffffff" />
                    </View>
                    <View style={styles.macroContent}>
                      <Text style={styles.macroLabel}>Carbs</Text>
                      <Text style={styles.macroValue}>{result.carbs}g</Text>
                    </View>
                  </View>
                  
                  {/* Fat */}
                  <View style={[styles.macroCard, styles.fatCard]}>
                    <View style={styles.macroIconContainer}>
                      <Ionicons name="water" size={20} color="#ffffff" />
                    </View>
                    <View style={styles.macroContent}>
                      <Text style={styles.macroLabel}>Fat</Text>
                      <Text style={styles.macroValue}>{result.fat}g</Text>
                    </View>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={styles.logFoodButton}
                  onPress={handleLogFood}
                  disabled={isLoggingFood}
                >
                  {isLoggingFood ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.logFoodButtonText}>Add to Food Log</Text>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.newPhotoButton}
                  onPress={() => {
                    setImage(null);
                    setResult(null);
                    setError(null);
                  }}
                >
                  <Text style={styles.newPhotoButtonText}>Take Another Photo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  imageSelectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 40,
  },
  instructionContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  instructionText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 20,
    marginHorizontal: 20,
    lineHeight: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  optionButton: {
    backgroundColor: 'rgba(161, 99, 246, 0.3)',
    borderRadius: 16,
    padding: 20,
    width: width * 0.4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(161, 99, 246, 0.5)',
    shadowColor: '#A163F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 12,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 250,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  foodImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  analyzeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.4)',
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
    marginVertical: 8,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  resultContainer: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  foodDescription: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  macrosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  macroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    height: 72,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  macroIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  macroContent: {
    marginLeft: 12,
    flex: 1,
  },
  macroLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  caloriesCard: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  proteinCard: {
    backgroundColor: 'rgba(161, 99, 246, 0.2)',
    shadowColor: '#A163F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  carbsCard: {
    backgroundColor: 'rgba(56, 232, 224, 0.2)',
    shadowColor: '#38E8E0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  fatCard: {
    backgroundColor: 'rgba(93, 157, 250, 0.2)',
    shadowColor: '#5D9DFA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  logFoodButton: {
    backgroundColor: '#A163F6',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#A163F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  logFoodButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  newPhotoButton: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  newPhotoButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});