import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useAudioStore } from '../contexts/AudioStore';

interface FuturisticTabIconProps {
  name: string;
  color: string;
  focused: boolean;
}

// Modern minimalistic icon paths
const iconPaths = {
  home: {
    path: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    viewBox: '0 0 24 24'
  },
  analytics: {
    path: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    viewBox: '0 0 24 24'
  },
  lotus: {
    path: 'M12 14c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 0v7m-7-7h14',
    viewBox: '0 0 24 24'
  },
  fitness: {
    path: 'M7 16V4m0 0L3 8m4-4l4 4m0 0v12m0 0l4-4m-4 4l-4-4m11-1l-5-3 5-2V8l-5 3 5 3v-3z',
    viewBox: '0 0 24 24'
  },
  settings: {
    path: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
    viewBox: '0 0 24 24'
  },
  circle: {
    path: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    viewBox: '0 0 24 24'
  }
};

export function FuturisticTabIcon({ name, color, focused }: FuturisticTabIconProps) {
  // Use the audio store to check if audio is playing
  const { currentTrack, isPlaying } = useAudioStore();
  const isMeditationTab = name === 'lotus';
  const isAudioPlaying = currentTrack && isPlaying;
  
  // Use modern icon path from our map
  const iconPath = iconPaths[name] || iconPaths.circle;
  
  // Animation values for subtle transitions
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Simple animation for focusing/unfocusing
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1.15 : 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: focused ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();
  }, [focused]);
  
  return (
    <View style={styles.container}>
      {/* Icon with direct filter blur when focused */}
      <Animated.View style={[
        styles.iconContainer,
        {
          transform: [{ scale: scaleAnim }],
        }
      ]}>
        {/* Use individual SVG Path for better glow effect */}
        <Svg 
          width={24} 
          height={24} 
          viewBox={iconPath.viewBox}
          fill="none"
          stroke={color}
          strokeWidth={focused ? 2 : 1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={Platform.OS === 'web' && focused ? {
            filter: 'drop-shadow(0px 0px 5px #ffffff)',
          } : undefined}
        >
          <Path d={iconPath.path} />
        </Svg>
        
        {/* Audio indicator dot with modern glow for meditation tab when audio is playing */}
        {isMeditationTab && isAudioPlaying && !focused && (
          <View style={styles.audioIndicatorContainer}>
            {/* Glow effect layer */}
            <View style={styles.audioIndicatorGlow} />
            {/* Main indicator */}
            <View style={styles.audioIndicator} />
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    width: 30,
    position: 'relative',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
  },
  audioIndicatorContainer: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 9,
    height: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioIndicatorGlow: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'transparent',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 5,
  },
  audioIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  }
});