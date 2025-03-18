import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { supabase, listMeditationSounds } from '../../lib/supabase';
import { TypewriterText } from '../../components/TypewriterText';
import { useAudioStore } from '../../contexts/AudioStore';

const { width, height } = Dimensions.get('window');

// Generate stars with different properties
const generateStars = (count) => {
  return Array(count).fill(0).map(() => ({
    id: Math.random().toString(),
    x: Math.random() * width,
    y: Math.random() * height * 0.9, // Avoid stars at the very bottom
    size: Math.random() * 2 + 1, // Between 1-3
    opacity: Math.random() * 0.5 + 0.3, // Between 0.3-0.8
    speed: Math.random() * 0.05 + 0.01, // Very slow movement
    animated: Math.random() > 0.7, // 30% of stars will animate
    color: Math.random() > 0.6 ? 'white' : '#444444', // 60% dark, 40% white
    glowIntensity: Math.random() * 0.5 + 0.2, // Glow intensity 0.2-0.7
    blinkSpeed: Math.random() * 3000 + 2000, // Blink between 2-5 seconds
    direction: Math.random() > 0.5 ? 1 : -1, // Direction of movement
  }));
};

// Star component that can twinkle/pulse
const Star = ({ star }) => {
  const opacityAnim = useRef(new Animated.Value(star.opacity)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const positionX = useRef(new Animated.Value(star.x)).current;
  
  useEffect(() => {
    // Create twinkling animation if this star is animated
    if (star.animated) {
      // Create looping animation
      Animated.loop(
        Animated.sequence([
          // Fade in and grow
          Animated.parallel([
            Animated.timing(opacityAnim, {
              toValue: Math.min(star.opacity + 0.3, 1), // Increase opacity, max 1
              duration: star.blinkSpeed,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1.5,
              duration: star.blinkSpeed,
              useNativeDriver: true,
            }),
          ]),
          // Fade out and shrink
          Animated.parallel([
            Animated.timing(opacityAnim, {
              toValue: Math.max(star.opacity - 0.2, 0.2), // Decrease opacity, min 0.2
              duration: star.blinkSpeed,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 0.8,
              duration: star.blinkSpeed,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    }
    
    // Create very slow drift animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(positionX, {
          toValue: star.x + (30 * star.direction * star.speed),
          duration: 15000 / star.speed, // Slower movement
          useNativeDriver: true,
        }),
        Animated.timing(positionX, {
          toValue: star.x,
          duration: 15000 / star.speed,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  
  return (
    <Animated.View
      style={[
        styles.star,
        {
          width: star.size,
          height: star.size,
          left: 0, // Position will be controlled by the transform
          top: star.y,
          opacity: opacityAnim,
          transform: [
            { translateX: positionX },
            { scale: scaleAnim }
          ],
          backgroundColor: star.color,
          shadowColor: star.color,
          shadowOpacity: star.glowIntensity,
          shadowRadius: star.size * 3,
          shadowOffset: { width: 0, height: 0 },
        },
      ]}
    />
  );
};

// Starfield background component
const StarfieldBackground = () => {
  const [stars] = useState(() => generateStars(120)); // Create 120 stars
  
  return (
    <View style={styles.starfieldContainer}>
      {stars.map(star => (
        <Star key={star.id} star={star} />
      ))}
    </View>
  );
};

type Sound = {
  id: string;
  title: string;
  description: string;
  duration: number;
  image_url: string;
  audio_url: string;
  category: string;
};

// Constants for fallback values
const DEFAULT_SOUND_IMAGE = 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000';

export default function MeditationScreen() {
  const router = useRouter();
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>('All');
  const [loadingTrack, setLoadingTrack] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isMountedRef = useRef(true);
  
  // Initialize component
  useEffect(() => {
    // Load sounds from Supabase
    loadSounds();
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    
    // Cleanup function
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Load sounds from Supabase
  async function loadSounds() {
    try {
      setError(null);
      setLoading(true);
      
      const soundFiles = await listMeditationSounds();
      console.log(`Successfully loaded ${soundFiles.length} meditation sounds`);
      
      if (isMountedRef.current) {
        setSounds(soundFiles);
      }
    } catch (error) {
      console.error('Error loading sounds:', error);
      if (isMountedRef.current) {
        setError('Failed to load meditation sounds. Please check your internet connection and try again.');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  // Validate image URLs and provide fallback
  const validateImageUrl = (url: string) => {
    if (!url || !url.startsWith('http')) {
      return DEFAULT_SOUND_IMAGE;
    }
    return url;
  };

  // Navigate to the player page with sound info
  const navigateToPlayer = (sound: Sound) => {
    setLoadingTrack(sound.title);
    
    // Navigate to player screen with sound info as params
    setTimeout(() => {
      router.push({
        pathname: '/player',
        params: {
          id: sound.id,
          title: sound.title,
          description: sound.description || 'A calming meditation sound',
          duration: sound.duration.toString(),
          imageUrl: validateImageUrl(sound.image_url),
          audioUrl: sound.audio_url,
          category: sound.category,
        }
      });
      
      if (isMountedRef.current) {
        setLoadingTrack(null);
      }
    }, 200);
  };

  // Define the fixed categories we want to show
  const fixedCategories = ['All', 'Sleep', 'Calm', 'Focus', 'Stress'];
  
  // Filter sounds by selected category
  const filteredSounds = selectedCategory && selectedCategory !== 'All'
    ? sounds.filter(s => s.category === selectedCategory)
    : sounds;

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Loading meditation sounds...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="cloud-offline" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadSounds}
            activeOpacity={0.7}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Starfield background */}
      <StarfieldBackground />
      
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Meditate</Text>
        <TypewriterText
          staticText="Find your inner "
          words={['peace', 'zen', 'calm', 'balance', 'spirit']}
          style={styles.subtitle}
          typingSpeed={100}
          deletingSpeed={60}
          delayAfterWord={2000}
        />

        {/* Category selector - Fixed categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {fixedCategories.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.categoryButtonTextActive
              ]}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sound cards grid */}
        <Animated.View 
          style={[
            styles.soundsGrid,
            { opacity: fadeAnim }
          ]}
        >
          {filteredSounds.length === 0 ? (
            <Text style={styles.noSoundsText}>No meditation sounds found in this category</Text>
          ) : (
            filteredSounds.map((sound) => (
              <TouchableOpacity
                key={sound.id}
                style={styles.soundCard}
                onPress={() => navigateToPlayer(sound)}
                disabled={loadingTrack === sound.title}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: validateImageUrl(sound.image_url) }}
                  style={styles.soundImage}
                  // Add error handling for images
                  onError={(e) => {
                    console.log(`Image failed to load: ${sound.image_url}`);
                  }}
                />
                <BlurView intensity={80} style={styles.soundInfo}>
                  <Text style={styles.soundName}>{sound.title}</Text>
                  <Text style={styles.soundCategory}>{sound.category}</Text>
                  <View style={styles.playButtonContainer}>
                    <View style={styles.playButtonGlow} />
                    <View style={styles.playButton}>
                      {loadingTrack === sound.title ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <Ionicons name="play" size={24} color="#ffffff" />
                      )}
                    </View>
                  </View>
                </BlurView>
              </TouchableOpacity>
            ))
          )}
        </Animated.View>

        {/* Info for empty state */}
        {sounds.length === 0 && (
          <View style={styles.emptyInfo}>
            <Ionicons name="leaf" size={60} color="#ffffff" style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No Meditation Sounds Found</Text>
            <Text style={styles.emptyText}>
              We couldn't find any meditation sounds in our database. 
              This could be due to a connection issue.
            </Text>
            <TouchableOpacity 
              style={styles.reloadButton}
              onPress={loadSounds}
              activeOpacity={0.7}
            >
              <Text style={styles.reloadButtonText}>Reload Sounds</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  starfieldContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  star: {
    position: 'absolute',
    borderRadius: 50, // Make circular
    backgroundColor: '#ffffff', // Default color
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 100, // Extra padding for tab bar
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 24,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoriesContent: {
    paddingRight: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryButton: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: 'rgba(255, 255, 255, 0.2)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
    minWidth: 75,
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#ffffff',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryButtonText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    textAlign: 'center',
  },
  categoryButtonTextActive: {
    color: '#ffffff',
  },
  soundsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  soundCard: {
    width: (width - 56) / 2,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  soundImage: {
    width: '100%',
    height: '100%',
  },
  soundInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(20, 20, 20, 0.6)',
  },
  soundName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
    maxWidth: '70%', // Make room for play button
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  soundCategory: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  playButtonContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'transparent',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  noSoundsText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontStyle: 'italic',
    width: '100%',
    marginTop: 40,
  },
  emptyInfo: {
    marginTop: 40,
    padding: 24,
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.9,
    textShadowColor: '#ffffff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  reloadButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  reloadButtonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 15,
  },
});