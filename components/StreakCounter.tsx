import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { IconRenderer } from './IconRenderer';

interface StreakCounterProps {
  streak: number;
  animate?: boolean;
}

export function StreakCounter({ streak, animate = false }: StreakCounterProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animate) {
      // Reset animations
      scaleAnim.setValue(1);
      rotateAnim.setValue(0);
      opacityAnim.setValue(0);
      glowAnim.setValue(0);

      // Create animation sequence with enhanced effects
      Animated.parallel([
        // Scale up and down with bounce
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.3,
            duration: 300,
            easing: Easing.elastic(1.2),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            easing: Easing.elastic(1),
            useNativeDriver: true,
          }),
        ]),
        
        // Rotation effect
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.elastic(1.2),
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 200,
            easing: Easing.elastic(1),
            useNativeDriver: true,
          }),
        ]),
        
        // Particle effects
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        
        // Glow effect
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: false,
          }),
        ]),
      ]).start();
    }
  }, [animate]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '25deg'],
  });
  
  const glowScale = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });
  
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.6, 0],
  });

  return (
    <View style={styles.container}>
      {/* Glow effect */}
      <Animated.View
        style={[
          styles.glowContainer,
          {
            opacity: glowOpacity,
            transform: [{ scale: glowScale }],
          }
        ]}
      >
        <View style={styles.glow} />
      </Animated.View>
      
      {/* Main streak counter */}
      <Animated.View
        style={[
          styles.streakContainer,
          {
            transform: [
              { scale: scaleAnim },
              { rotate: rotation },
            ],
          },
        ]}
      >
        <IconRenderer 
          name="flame" 
          size={24} 
          color="#ff6b6b" 
          fallbackText="🔥"
        />
        <Text style={styles.streakText}>{streak}</Text>
      </Animated.View>

      {/* Particle effects */}
      <Animated.View
        style={[
          styles.particle,
          styles.particleLeft,
          {
            opacity: opacityAnim,
            transform: [
              { translateX: opacityAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -25],
              })},
              { translateY: opacityAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -25],
              })},
              { scale: opacityAnim },
            ],
          },
        ]}
      >
        <IconRenderer 
          name="star" 
          size={12} 
          color="#FFD700" 
          fallbackText="⭐"
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.particle,
          styles.particleRight,
          {
            opacity: opacityAnim,
            transform: [
              { translateX: opacityAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 25],
              })},
              { translateY: opacityAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -25],
              })},
              { scale: opacityAnim },
            ],
          },
        ]}
      >
        <IconRenderer 
          name="star" 
          size={12} 
          color="#FFD700" 
          fallbackText="⭐"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  }, 
  streakText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  particle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
  },
  particleLeft: {
    marginLeft: -20,
    marginTop: -20,
  },
  particleRight: {
    marginLeft: 20,
    marginTop: -20,
  },
  glowContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ff6b6b',
    opacity: 0.4,
  },
});