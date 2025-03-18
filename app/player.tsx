import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { SplineBackground } from '../components/SplineBackground';
import { useAudioStore, AudioTrack } from '../contexts/AudioStore';

const { width, height } = Dimensions.get('window');

// Constants
const FALLBACK_AUDIO_URL = 'https://svucbacxrtupvpftprjp.supabase.co/storage/v1/object/public/meditations/stress-relief.mp3';
const DEFAULT_SOUND_IMAGE = 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000';
const SPLINE_URL = 'https://prod.spline.design/GfXQw2L5S07HuSFb/scene.splinecode';

// Helper function to format time in mm:ss format
const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return '00:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Validate and sanitize audio URLs with better error handling
const validateAudioUrl = (url: string | null | undefined): string => {
  // If no URL provided or it's empty, use fallback immediately
  if (!url || url.trim() === '') {
    return FALLBACK_AUDIO_URL;
  }
  
  // Check if URL is valid and absolute
  try {
    // For React Native compatibility
    if (url.startsWith('http')) {
      return url;
    }
    return FALLBACK_AUDIO_URL;
  } catch (err) {
    return FALLBACK_AUDIO_URL;
  }
};

// Validate image URLs and provide fallback
const validateImageUrl = (url: string | null | undefined): string => {
  if (!url || !url.startsWith('http')) {
    return DEFAULT_SOUND_IMAGE;
  }
  return url;
};

export default function PlayerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get global audio state from our store
  const { 
    currentTrack,
    isPlaying, 
    isLooping,
    isLoaded,
    position,
    duration,
    setTrack,
    play,
    pause,
    togglePlayPause,
    toggleLoop,
    seekTo
  } = useAudioStore();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressBarWidth = useRef(new Animated.Value(0)).current;
  const buttonGlowAnim = useRef(new Animated.Value(0.5)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  
  // Track info from params with validation
  const trackFromParams: AudioTrack = {
    id: params.id as string || 'fallback',
    title: params.title as string || 'Meditation Sound',
    description: params.description as string || 'A calming meditation sound',
    duration: parseInt(params.duration as string || '300', 10),
    imageUrl: validateImageUrl(params.imageUrl as string),
    audioUrl: validateAudioUrl(params.audioUrl as string),
    category: params.category as string || 'Meditation',
  };

  // Setup track on mount
  useEffect(() => {
    // Check if we're already playing this track
    if (currentTrack?.id !== trackFromParams.id) {
      setLoading(true);
      setTrack(trackFromParams);
    }
    
    startAnimations();
    
    return () => {
      // No cleanup needed since we keep audio playing
    };
  }, []);
  
  // Update progress bar when position changes
  useEffect(() => {
    if (duration > 0) {
      const progress = Math.min((position / duration) * 100, 100);
      progressBarWidth.setValue(progress);
    }
  }, [position, duration]);
  
  // Update loading state when track loads
  useEffect(() => {
    if (isLoaded) {
      setLoading(false);
      if (isPlaying) {
        play();
      }
    }
  }, [isLoaded]);
  
  // Start visual animations
  const startAnimations = () => {
    // Background fade in
    Animated.timing(backgroundOpacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    
    // Content fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    // Button glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonGlowAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(buttonGlowAnim, {
          toValue: 0.4,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  // Seek to a specific position in the audio
  const handleSeekTo = (position: number) => {
    seekTo(position);
  };

  // Handle progress bar press
  const handleProgressPress = (event: any) => {
    if (!duration || !isLoaded) return;
    
    // Get the press position relative to the progress bar width
    const progressBarWidth = width - 30; // Accounting for padding
    const touchX = event.nativeEvent.locationX;
    
    // Calculate the new position
    const newPosition = (touchX / progressBarWidth) * duration;
    
    // Seek to the new position
    handleSeekTo(newPosition);
  };

  // Fallback UI when there's an error
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => setTrack(trackFromParams)}
            activeOpacity={0.7}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Back to Meditation</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Background */}
      <Animated.View style={[styles.backgroundContainer, { opacity: backgroundOpacity }]}>
        <SplineBackground url={SPLINE_URL} />
      </Animated.View>
      
      <View style={styles.background}>
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButtonContainer}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Animated.View style={[
              styles.buttonGlow,
              { 
                opacity: buttonGlowAnim,
                shadowOpacity: buttonGlowAnim
              }
            ]} />
            <BlurView intensity={50} tint="dark" style={styles.glassButton}>
              <Ionicons name="chevron-down" size={22} color="#ffffff" />
            </BlurView>
          </TouchableOpacity>
          
          <View style={styles.headerTextContainer}>
            <Text style={styles.nowPlayingText}>Now Playing</Text>
          </View>
          
          {/* Removed the three-dot options button */}
        </View>
        
        {/* Album Art */}
        <View style={styles.albumContainer}>
          <View style={styles.albumFrame}>
            <View style={styles.albumContent}>
              <Image 
                source={{ uri: currentTrack?.imageUrl || trackFromParams.imageUrl }} 
                style={styles.albumImage}
                resizeMode="cover"
              />
            </View>
          </View>
        </View>
        
        {/* Track Info */}
        <Animated.View 
          style={[
            styles.trackInfoContainer,
            { opacity: fadeAnim }
          ]}
        >
          <Text style={styles.trackTitle} numberOfLines={1} ellipsizeMode="tail">
            {currentTrack?.title || trackFromParams.title}
          </Text>
          <Text style={styles.trackCategory} numberOfLines={1}>
            {currentTrack?.category || trackFromParams.category}
          </Text>
          
          {/* Progress Section */}
          <View style={styles.progressSection}>
            {/* Progress bar with Touch Area */}
            <TouchableOpacity 
              style={styles.progressBarContainer}
              onPress={handleProgressPress}
              activeOpacity={0.7}
              disabled={!isLoaded}
            >
              <View style={styles.progressBarBg}>
                <Animated.View 
                  style={[
                    styles.progressBarFill, 
                    { 
                      width: progressBarWidth.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%']
                      }) 
                    }
                  ]} 
                />
              </View>
            </TouchableOpacity>
            
            {/* Time Indicators */}
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>
        </Animated.View>
        
        {/* Controls */}
        <Animated.View 
          style={[
            styles.controlsContainer,
            { opacity: fadeAnim }
          ]}
        >
          {/* Playback Controls */}
          <View style={styles.controlsRow}>
            <TouchableOpacity 
              style={styles.controlButtonContainer}
              onPress={toggleLoop}
              activeOpacity={0.8}
              disabled={!isLoaded}
            >
              <Animated.View style={[
                styles.controlButtonGlow,
                { 
                  opacity: buttonGlowAnim.interpolate({
                    inputRange: [0.4, 1],
                    outputRange: [0.1, 0.5]
                  }),
                  shadowOpacity: buttonGlowAnim.interpolate({
                    inputRange: [0.4, 1],
                    outputRange: [0.2, 0.6]
                  })
                }
              ]} />
              <BlurView 
                intensity={60} 
                tint="dark" 
                style={[
                  styles.glassControlBtn,
                  isLooping && styles.activeGlassBtn
                ]}
              >
                <Ionicons name="repeat" size={22} color="#ffffff" />
              </BlurView>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.controlButtonContainer} 
              activeOpacity={0.8}
              disabled={!isLoaded}
            >
              <Animated.View style={[
                styles.controlButtonGlow,
                { 
                  opacity: buttonGlowAnim.interpolate({
                    inputRange: [0.4, 1],
                    outputRange: [0.1, 0.5]
                  }),
                  shadowOpacity: buttonGlowAnim.interpolate({
                    inputRange: [0.4, 1],
                    outputRange: [0.2, 0.6]
                  })
                }
              ]} />
              <BlurView intensity={60} tint="dark" style={styles.glassControlBtn}>
                <Ionicons name="play-skip-back" size={22} color="#ffffff" />
              </BlurView>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.playPauseButtonContainer}
              onPress={togglePlayPause}
              disabled={loading && !isLoaded}
              activeOpacity={0.8}
            >
              <Animated.View style={[
                styles.playButtonGlow,
                { 
                  opacity: buttonGlowAnim,
                  shadowOpacity: buttonGlowAnim.interpolate({
                    inputRange: [0.4, 1],
                    outputRange: [0.5, 0.9]
                  })
                }
              ]} />
              <BlurView intensity={60} tint="dark" style={styles.glassPlayBtn}>
                {loading && !isLoaded ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Ionicons 
                    name={isPlaying ? 'pause' : 'play'} 
                    size={30} 
                    color="#ffffff" 
                  />
                )}
              </BlurView>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.controlButtonContainer} 
              activeOpacity={0.8}
              disabled={!isLoaded}
            >
              <Animated.View style={[
                styles.controlButtonGlow,
                { 
                  opacity: buttonGlowAnim.interpolate({
                    inputRange: [0.4, 1],
                    outputRange: [0.1, 0.5]
                  }),
                  shadowOpacity: buttonGlowAnim.interpolate({
                    inputRange: [0.4, 1],
                    outputRange: [0.2, 0.6]
                  })
                }
              ]} />
              <BlurView intensity={60} tint="dark" style={styles.glassControlBtn}>
                <Ionicons name="play-skip-forward" size={22} color="#ffffff" />
              </BlurView>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.controlButtonContainer} 
              activeOpacity={0.8}
              disabled={!isLoaded}
            >
              <Animated.View style={[
                styles.controlButtonGlow,
                { 
                  opacity: buttonGlowAnim.interpolate({
                    inputRange: [0.4, 1],
                    outputRange: [0.1, 0.5]
                  }),
                  shadowOpacity: buttonGlowAnim.interpolate({
                    inputRange: [0.4, 1],
                    outputRange: [0.2, 0.6]
                  })
                }
              ]} />
              <BlurView intensity={60} tint="dark" style={styles.glassControlBtn}>
                <Ionicons name="shuffle" size={22} color="#ffffff" />
              </BlurView>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  background: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 15,
    paddingVertical: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    zIndex: 10,
  },
  backButtonContainer: {
    position: 'relative',
    width: 36,
    height: 36,
    zIndex: 10,
  },
  buttonGlow: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'transparent',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    alignSelf: 'center',
    top: -7,
    left: -7,
  },
  glassButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  nowPlayingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  
  // Album art styles without glow effect
  albumContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
    zIndex: 5,
  },
  albumFrame: {
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: width * 0.375,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(25, 25, 35, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
  albumContent: {
    width: '92%',
    height: '92%',
    borderRadius: width * 0.35,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  albumImage: {
    width: '100%',
    height: '100%',
  },
  
  // Track info styles
  trackInfoContainer: {
    alignItems: 'center',
    marginBottom: 5,
    zIndex: 5,
  },
  trackTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    maxWidth: width * 0.9,
    textAlign: 'center',
  },
  trackCategory: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
    maxWidth: width * 0.8,
  },
  
  // Progress section
  progressSection: {
    width: '100%',
    marginBottom: 10,
    zIndex: 5,
  },
  progressBarContainer: {
    width: '100%',
    height: 30,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  progressBarBg: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 1.5,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  
  // Controls section
  controlsContainer: {
    marginVertical: 10,
    paddingBottom: 20,
    zIndex: 5,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  controlButtonContainer: {
    position: 'relative',
    width: 44,
    height: 44,
    marginHorizontal: 8,
  },
  controlButtonGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'transparent',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    alignSelf: 'center',
    top: -8,
    left: -8,
  },
  glassControlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  activeGlassBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  playPauseButtonContainer: {
    position: 'relative',
    width: 64,
    height: 64,
    marginHorizontal: 14,
  },
  playButtonGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'transparent',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    alignSelf: 'center',
    top: -8,
    left: -8,
  },
  glassPlayBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 5,
  },
  
  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginTop: 16,
  },
});