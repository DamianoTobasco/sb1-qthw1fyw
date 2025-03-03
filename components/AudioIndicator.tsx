import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAudioStore } from '../contexts/AudioStore';
import { Ionicons } from '@expo/vector-icons';

export const AudioIndicator = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { currentTrack, isPlaying } = useAudioStore();
  
  // Navigate to player when indicator is pressed
  const handlePress = () => {
    if (currentTrack) {
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
    }
  };
  
  // Don't render if:
  // 1. No track is playing, or
  // 2. We're already on the player page
  if (!currentTrack || pathname === '/player') {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={isPlaying ? "pause" : "play"} 
          size={16} 
          color="#ffffff" 
        />
        
        <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
          {currentTrack.title}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 100,
    elevation: 5,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  text: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
    marginLeft: 8,
    maxWidth: 200,
  }
});