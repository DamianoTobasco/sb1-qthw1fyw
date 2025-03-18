import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Welcome screens for onboarding
const SCREENS = [
  {
    title: "Track Your Health Journey",
    description: "Monitor calories, nutrition, water intake, and more with our comprehensive tracking tools.",
    icon: "pulse",
    image: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=2070&auto=format&fit=crop"
  },
  {
    title: "Stay Active & Fit",
    description: "Log workouts, track cardio, and see your progress over time with detailed analytics.",
    icon: "fitness",
    image: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?q=80&w=2031&auto=format&fit=crop"
  },
  {
    title: "Find Your Inner Peace",
    description: "Access guided meditations and mindfulness exercises to reduce stress and improve mental wellbeing.",
    icon: "lotus",
    image: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=2070&auto=format&fit=crop"
  },
  {
    title: "Build Healthy Habits",
    description: "Form and maintain positive habits with streak tracking and personalized insights.",
    icon: "analytics",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2070&auto=format&fit=crop"
  }
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Fade in animation when component mounts
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleNext = () => {
    if (currentIndex < SCREENS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Go to paywall
      router.push('/(onboarding)/paywall');
    }
  };

  const handleSkip = () => {
    // Go to paywall
    router.push('/(onboarding)/paywall');
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {SCREENS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { opacity: currentIndex === index ? 1 : 0.4 },
              { width: currentIndex === index ? 20 : 8 },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Background Image */}
        <Image
          source={{ uri: SCREENS[currentIndex].image }}
          style={styles.backgroundImage}
        />
        
        {/* Gradient Overlay */}
        <View style={styles.overlay} />
        
        {/* Skip Button */}
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.contentContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name={SCREENS[currentIndex].icon} size={50} color="#ffffff" />
          </View>
          
          <Text style={styles.title}>{SCREENS[currentIndex].title}</Text>
          <Text style={styles.description}>{SCREENS[currentIndex].description}</Text>
          
          {renderDots()}
          
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>
              {currentIndex < SCREENS.length - 1 ? 'Continue' : 'Get Started'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width,
    height,
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  skipButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  skipText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 50,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(161, 99, 246, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#A163F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 26,
    maxWidth: 350,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A163F6',
    marginHorizontal: 4,
  },
  button: {
    backgroundColor: '#A163F6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#A163F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});