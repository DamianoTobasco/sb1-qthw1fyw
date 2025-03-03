import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAudioStore } from '../contexts/AudioStore';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export const MiniPlayer = () => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { currentTrack, isPlaying, togglePlayPause, reset } = useAudioStore();
  
  // Animation for sliding in/out
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Don't show the mini player when on the player page
  const shouldShow = currentTrack && pathname !== '/player';
  
  // Handle animations when visibility changes
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: shouldShow ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [shouldShow]);
  
  // Handle navigation to the full player
  const navigateToPlayer = () => {
    if (!currentTrack) return;
    
    router.push({
      pathname: '/player',
      params: {
        id: currentTrack.id,
        title: currentTrack.title,
        description: currentTrack.description || 'A calming meditation sound',
        duration: currentTrack.duration.toString(),
        imageUrl: currentTrack.imageUrl,
        audioUrl: currentTrack.audioUrl,
        category: currentTrack.category || 'Meditation',
      }
    });
  };
  
  // Handle closing the player
  const handleClose = () => {
    // First animate out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // Then reset the audio state
      reset();
    });
  };
  
  if (!shouldShow) {
    return null;
  }
  
  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          opacity: fadeAnim,
          top: insets.top + 8,
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-20, 0]
            })
          }]
        }
      ]}
    >
      {Platform.OS === 'ios' && <BlurView intensity={30} tint="dark" style={styles.blurBackground} />}
      
      <TouchableOpacity 
        style={styles.content}
        onPress={navigateToPlayer}
        activeOpacity={0.7}
      >
        {/* Track image */}
        <Image 
          source={{ uri: currentTrack?.imageUrl }} 
          style={styles.image}
        />
        
        {/* Track title - only shown if there's enough space */}
        {width > 375 && (
          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {currentTrack?.title}
            </Text>
          </View>
        )}
        
        {/* Play/pause button */}
        <TouchableOpacity 
          style={styles.playButton}
          onPress={(e) => {
            e.stopPropagation();
            togglePlayPause();
          }}
        >
          <Ionicons 
            name={isPlaying ? 'pause' : 'play'} 
            size={14} 
            color="#ffffff" 
          />
        </TouchableOpacity>
        
        {/* Close button */}
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={(e) => {
            e.stopPropagation();
            handleClose();
          }}
        >
          <Ionicons 
            name="close" 
            size={12} 
            color="#ffffff" 
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 12,
    zIndex: 999,
    height: 30,
    maxWidth: 200,
    backgroundColor: 'rgba(20, 20, 20, 0.85)',
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  blurBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 2,
    paddingRight: 2,
  },
  image: {
    width: 26,
    height: 26,
    borderRadius: 13,
    marginRight: 4,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 2,
  },
  playButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    marginRight: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  }
});