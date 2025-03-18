import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Svg, { Circle, Path, G } from 'react-native-svg';
import * as Location from 'expo-location';
import { TEST_USER_ID } from '../../lib/supabase';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// Mock data for demonstration
const RECENT_ACTIVITIES = [
  {
    id: '1',
    type: 'run',
    distance: 5.2,
    duration: 28,
    pace: '5:23',
    calories: 420,
    date: '2025-02-26T08:30:00Z',
    route: {
      name: 'Morning Park Loop',
      elevation: 45,
      difficulty: 'Moderate',
    }
  },
  {
    id: '2',
    type: 'walk',
    distance: 3.1,
    duration: 45,
    pace: '14:31',
    calories: 180,
    date: '2025-02-25T17:15:00Z',
    route: {
      name: 'Evening City Walk',
      elevation: 20,
      difficulty: 'Easy',
    }
  }
];

const SUGGESTED_ROUTES = [
  {
    id: '1',
    name: 'Riverside Trail',
    distance: 4.8,
    elevation: 30,
    difficulty: 'Easy',
    rating: 4.8,
    type: 'run',
    estimatedTime: 25,
    weather: 'Sunny',
    temperature: 72,
  },
  {
    id: '2',
    name: 'Hill Challenge',
    distance: 6.2,
    elevation: 120,
    difficulty: 'Hard',
    rating: 4.6,
    type: 'run',
    estimatedTime: 40,
    weather: 'Partly Cloudy',
    temperature: 68,
  },
  {
    id: '3',
    name: 'City Heritage Walk',
    distance: 3.5,
    elevation: 15,
    difficulty: 'Easy',
    rating: 4.9,
    type: 'walk',
    estimatedTime: 50,
    weather: 'Sunny',
    temperature: 70,
  }
];

// User created routes
const USER_CREATED_ROUTES = [
  {
    id: 'user-1',
    name: 'My Neighborhood Loop',
    distance: 2.3,
    elevation: 15,
    difficulty: 'Easy',
    rating: 4.5,
    type: 'walk',
    estimatedTime: 30,
    createdAt: '2025-02-20T10:15:00Z',
    coordinates: [
      { latitude: 37.7749, longitude: -122.4194 },
      { latitude: 37.7750, longitude: -122.4180 },
      { latitude: 37.7735, longitude: -122.4170 },
      { latitude: 37.7730, longitude: -122.4190 },
      { latitude: 37.7749, longitude: -122.4194 },
    ]
  },
  {
    id: 'user-2',
    name: 'Park Trail Run',
    distance: 3.8,
    elevation: 45,
    difficulty: 'Moderate',
    rating: 4.7,
    type: 'run',
    estimatedTime: 35,
    createdAt: '2025-02-15T08:30:00Z',
    coordinates: [
      { latitude: 37.7690, longitude: -122.4830 },
      { latitude: 37.7710, longitude: -122.4850 },
      { latitude: 37.7730, longitude: -122.4830 },
      { latitude: 37.7720, longitude: -122.4810 },
      { latitude: 37.7690, longitude: -122.4830 },
    ]
  }
];

// Activity type icons
const ActivityIcon = ({ type, size = 24, color = '#ffffff' }) => {
  switch (type) {
    case 'run':
      return <Ionicons name="walk" size={size} color={color} />;
    case 'walk':
      return <Ionicons name="footsteps" size={size} color={color} />;
    default:
      return <Ionicons name="fitness" size={size} color={color} />;
  }
};

// Route preview map component
const RoutePreview = ({ route }) => {
  return (
    <View style={styles.routePreview}>
      <Svg height="100%" width="100%" viewBox="0 0 100 100">
        <G>
          {/* Simplified route visualization */}
          <Path
            d="M10,50 C30,20 70,80 90,50"
            stroke="rgba(161, 99, 246, 0.8)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          <Circle
            cx="10"
            cy="50"
            r="3"
            fill="#4ade80"
          />
          <Circle
            cx="90"
            cy="50"
            r="3"
            fill="#ef4444"
          />
        </G>
      </Svg>
    </View>
  );
};

export default function CardioScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('activities');
  const [loading, setLoading] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingTime, setTrackingTime] = useState(0);
  const [trackingDistance, setTrackingDistance] = useState(0);
  const [trackingCoordinates, setTrackingCoordinates] = useState([]);
  const [showSaveRouteModal, setShowSaveRouteModal] = useState(false);
  const [routeName, setRouteName] = useState('');
  const [routeType, setRouteType] = useState('walk');
  const [locationPermission, setLocationPermission] = useState(null);
  const [healthKitPermission, setHealthKitPermission] = useState(null);
  const [userCreatedRoutes, setUserCreatedRoutes] = useState(USER_CREATED_ROUTES);
  
  const timerRef = useRef(null);
  const locationSubscription = useRef(null);

  // Request location permissions on mount
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermission(status === 'granted');
      } else {
        // Web platform handles permissions differently
        setLocationPermission(true);
      }
      
      // Simulate Apple Health permission check
      if (Platform.OS === 'ios') {
        // In a real app, we would use the Health API to check permissions
        setTimeout(() => {
          setHealthKitPermission(true);
        }, 500);
      }
    })();
    
    return () => {
      // Clean up on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      stopLocationTracking();
    };
  }, []);

  // Safe way to stop location tracking across platforms
  const stopLocationTracking = () => {
    if (locationSubscription.current) {
      try {
        if (typeof locationSubscription.current.remove === 'function') {
          locationSubscription.current.remove();
        } else if (typeof locationSubscription.current === 'function') {
          // Some implementations might return a function to unsubscribe
          locationSubscription.current();
        }
      } catch (error) {
        console.log('Error stopping location tracking:', error);
      } finally {
        locationSubscription.current = null;
      }
    }
  };

  const startTracking = async () => {
    if (Platform.OS === 'web') {
      // Web implementation with simulated data for demo purposes
      simulateTracking();
      return;
    }
    
    if (!locationPermission) {
      Alert.alert(
        "Permission Required",
        "Location permission is needed to track your activity.",
        [{ text: "OK" }]
      );
      return;
    }
    
    try {
      setIsTracking(true);
      setTrackingTime(0);
      setTrackingDistance(0);
      setTrackingCoordinates([]);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setTrackingTime(prev => prev + 1);
      }, 1000);
      
      // Start location tracking
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 10, // Update every 10 meters
          timeInterval: 5000, // Or every 5 seconds
        },
        (location) => {
          const { latitude, longitude } = location.coords;
          
          setTrackingCoordinates(prev => {
            const newCoordinates = [...prev, { latitude, longitude }];
            
            // Calculate distance if we have at least two points
            if (newCoordinates.length >= 2) {
              const lastIndex = newCoordinates.length - 1;
              const newDistance = calculateDistance(
                newCoordinates[lastIndex - 1].latitude,
                newCoordinates[lastIndex - 1].longitude,
                newCoordinates[lastIndex].latitude,
                newCoordinates[lastIndex].longitude
              );
              
              setTrackingDistance(prev => prev + newDistance);
            }
            
            return newCoordinates;
          });
        }
      );
      
      // Simulate syncing with Apple Health
      if (Platform.OS === 'ios' && healthKitPermission) {
        console.log('Syncing with Apple Health...');
        // In a real app, we would use the Health API to sync data
      }
    } catch (error) {
      console.error('Error starting tracking:', error);
      Alert.alert("Error", "Failed to start activity tracking.");
      setIsTracking(false);
    }
  };

  // Simulate tracking for web platform
  const simulateTracking = () => {
    setIsTracking(true);
    setTrackingTime(0);
    setTrackingDistance(0);
    setTrackingCoordinates([]);
    
    // Generate some simulated coordinates
    const startLat = 37.7749;
    const startLng = -122.4194;
    
    // Create initial point
    const initialCoords = [{ latitude: startLat, longitude: startLng }];
    setTrackingCoordinates(initialCoords);
    
    // Start timer
    timerRef.current = setInterval(() => {
      setTrackingTime(prev => prev + 1);
      
      // Add simulated distance every 3 seconds
      if ((prev + 1) % 3 === 0) {
        setTrackingDistance(prevDist => {
          const increment = 0.02 + (Math.random() * 0.03); // 0.02-0.05 km
          return prevDist + increment;
        });
        
        // Add simulated coordinate
        setTrackingCoordinates(prevCoords => {
          const lastCoord = prevCoords[prevCoords.length - 1];
          const newLat = lastCoord.latitude + (Math.random() * 0.001 - 0.0005);
          const newLng = lastCoord.longitude + (Math.random() * 0.001 - 0.0005);
          return [...prevCoords, { latitude: newLat, longitude: newLng }];
        });
      }
    }, 1000);
  };

  const stopTracking = () => {
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Stop location tracking
    stopLocationTracking();
    
    // If we have coordinates, show save modal
    if (trackingCoordinates.length > 0) {
      setShowSaveRouteModal(true);
    } else {
      setIsTracking(false);
      Alert.alert("No Data", "No route data was recorded.");
    }
  };

  const saveRoute = () => {
    if (!routeName.trim()) {
      Alert.alert("Error", "Please enter a route name.");
      return;
    }
    
    // Calculate some stats
    const distance = parseFloat(trackingDistance.toFixed(1));
    const duration = trackingTime;
    const elevation = Math.floor(Math.random() * 50); // Simulated elevation gain
    
    // Create new route object
    const newRoute = {
      id: `user-${Date.now()}`,
      name: routeName,
      distance,
      elevation,
      difficulty: distance < 3 ? 'Easy' : distance < 5 ? 'Moderate' : 'Hard',
      rating: 5.0,
      type: routeType,
      estimatedTime: Math.ceil(duration / 60),
      createdAt: new Date().toISOString(),
      coordinates: trackingCoordinates
    };
    
    // Add to user created routes
    setUserCreatedRoutes(prev => [newRoute, ...prev]);
    
    // Reset tracking state
    setIsTracking(false);
    setTrackingTime(0);
    setTrackingDistance(0);
    setTrackingCoordinates([]);
    setRouteName('');
    setShowSaveRouteModal(false);
    
    // Show success message
    Alert.alert(
      "Route Saved",
      `Your route "${routeName}" has been saved successfully.`,
      [{ text: "OK" }]
    );
    
    // Switch to Created Routes tab
    setSelectedTab('created');
  };

  // Calculate distance between two coordinates in kilometers
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };

  // Format seconds to mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderActivityCard = (activity) => (
    <TouchableOpacity 
      key={activity.id}
      style={styles.activityCard}
      activeOpacity={0.8}
    >
      <View style={styles.activityHeader}>
        <View style={styles.activityType}>
          <ActivityIcon type={activity.type} />
          <Text style={styles.activityName}>
            {activity.route.name}
          </Text>
        </View>
        <Text style={styles.activityDate}>
          {new Date(activity.date).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.activityStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{activity.distance}</Text>
          <Text style={styles.statLabel}>km</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{activity.duration}</Text>
          <Text style={styles.statLabel}>min</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{activity.pace}</Text>
          <Text style={styles.statLabel}>pace</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{activity.calories}</Text>
          <Text style={styles.statLabel}>cal</Text>
        </View>
      </View>

      <View style={styles.activityDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="trending-up" size={16} color="rgba(255, 255, 255, 0.6)" />
          <Text style={styles.detailText}>{activity.route.elevation}m elevation</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="speedometer" size={16} color="rgba(255, 255, 255, 0.6)" />
          <Text style={styles.detailText}>{activity.route.difficulty}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderRouteCard = (route) => (
    <TouchableOpacity 
      key={route.id}
      style={styles.routeCard}
      activeOpacity={0.8}
    >
      <RoutePreview route={route} />
      
      <View style={styles.routeContent}>
        <View style={styles.routeHeader}>
          <Text style={styles.routeName}>{route.name}</Text>
          <View style={styles.routeRating}>
            <Ionicons name="star" size={12} color="#fbbf24" />
            <Text style={styles.ratingText}>{route.rating}</Text>
          </View>
        </View>

        <View style={styles.routeStats}>
          <View style={styles.routeStat}>
            <Ionicons name="map" size={14} color="rgba(255, 255, 255, 0.6)" />
            <Text style={styles.routeStatText}>{route.distance}km</Text>
          </View>
          <View style={styles.routeStat}>
            <Ionicons name="trending-up" size={14} color="rgba(255, 255, 255, 0.6)" />
            <Text style={styles.routeStatText}>{route.elevation}m</Text>
          </View>
          <View style={styles.routeStat}>
            <Ionicons name="time" size={14} color="rgba(255, 255, 255, 0.6)" />
            <Text style={styles.routeStatText}>{route.estimatedTime}min</Text>
          </View>
        </View>

        <View style={styles.routeFooter}>
          <View style={[styles.routeTag, { backgroundColor: route.difficulty === 'Easy' ? 'rgba(74, 222, 128, 0.2)' : route.difficulty === 'Hard' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(161, 99, 246, 0.2)' }]}>
            <Text style={[styles.routeTagText, { color: route.difficulty === 'Easy' ? '#4ade80' : route.difficulty === 'Hard' ? '#ef4444' : '#A163F6' }]}>
              {route.difficulty}
            </Text>
          </View>
          {route.weather && (
            <View style={styles.weatherInfo}>
              <Ionicons 
                name={route.weather === 'Sunny' ? 'sunny' : 'partly-sunny'} 
                size={14} 
                color="rgba(255, 255, 255, 0.6)" 
              />
              <Text style={styles.weatherText}>{route.temperature}°F</Text>
            </View>
          )}
          {route.createdAt && (
            <Text style={styles.createdAtText}>
              {new Date(route.createdAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Cardio</Text>

        {/* Activity Tracking UI */}
        {isTracking ? (
          <View style={styles.trackingContainer}>
            <View style={styles.trackingHeader}>
              <Text style={styles.trackingTitle}>Activity in Progress</Text>
              <TouchableOpacity 
                style={styles.stopButton}
                onPress={stopTracking}
              >
                <Ionicons name="stop" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.trackingStats}>
              <View style={styles.trackingStat}>
                <Text style={styles.trackingValue}>{formatTime(trackingTime)}</Text>
                <Text style={styles.trackingLabel}>Time</Text>
              </View>
              <View style={styles.trackingStatDivider} />
              <View style={styles.trackingStat}>
                <Text style={styles.trackingValue}>{trackingDistance.toFixed(2)}</Text>
                <Text style={styles.trackingLabel}>km</Text>
              </View>
              <View style={styles.trackingStatDivider} />
              <View style={styles.trackingStat}>
                <Text style={styles.trackingValue}>
                  {trackingTime > 0 ? ((trackingDistance * 1000) / trackingTime).toFixed(1) : '0.0'}
                </Text>
                <Text style={styles.trackingLabel}>m/s</Text>
              </View>
            </View>
            
            <View style={styles.syncInfo}>
              {Platform.OS === 'ios' && (
                <View style={styles.syncStatus}>
                  <Ionicons name="heart" size={16} color="#4ade80" />
                  <Text style={styles.syncText}>Syncing with Apple Health</Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          /* Quick Actions */
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity 
              style={styles.startButton}
              onPress={startTracking}
            >
              <Ionicons name="play" size={20} color="#000000" />
              <Text style={styles.startButtonText}>Start Activity</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.createRouteButton}
              onPress={() => {
                setRouteType('walk');
                startTracking();
              }}
            >
              <Ionicons name="add" size={20} color="#A163F6" />
              <Text style={styles.createRouteText}>Create Route</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'activities' && styles.activeTab]}
            onPress={() => setSelectedTab('activities')}
          >
            <Text style={[styles.tabText, selectedTab === 'activities' && styles.activeTabText]}>
              Activities
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'routes' && styles.activeTab]}
            onPress={() => setSelectedTab('routes')}
          >
            <Text style={[styles.tabText, selectedTab === 'routes' && styles.activeTabText]}>
              Routes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, selectedTab === 'created' && styles.activeTab]}
            onPress={() => setSelectedTab('created')}
          >
            <Text style={[styles.tabText, selectedTab === 'created' && styles.activeTabText]}>
              Created Routes
            </Text>
          </TouchableOpacity>
        </View>

        {selectedTab === 'activities' && (
          <View style={styles.activitiesContainer}>
            <Text style={styles.sectionTitle}>Recent Activities</Text>
            {RECENT_ACTIVITIES.map(renderActivityCard)}
          </View>
        )}
        
        {selectedTab === 'routes' && (
          <View style={styles.routesContainer}>
            <Text style={styles.sectionTitle}>AI Recommended Routes</Text>
            <Text style={styles.sectionSubtitle}>
              Based on your goals and current weather
            </Text>
            {SUGGESTED_ROUTES.map(renderRouteCard)}
          </View>
        )}
        
        {selectedTab === 'created' && (
          <View style={styles.routesContainer}>
            <Text style={styles.sectionTitle}>Your Created Routes</Text>
            {userCreatedRoutes.length > 0 ? (
              userCreatedRoutes.map(renderRouteCard)
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="map-outline" size={48} color="rgba(255, 255, 255, 0.3)" />
                <Text style={styles.emptyStateText}>No routes created yet</Text>
                <Text style={styles.emptyStateSubtext}>
                  Create your first route by tapping "Create Route"
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Save Route Modal */}
      <Modal
        visible={showSaveRouteModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <BlurView intensity={Platform.OS === 'ios' ? 60 : 100} tint="dark" style={styles.modalBlur}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Save Your Route</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => {
                    setShowSaveRouteModal(false);
                    setIsTracking(false);
                  }}
                >
                  <Ionicons name="close" size={24} color="rgba(255, 255, 255, 0.8)" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.routeStatsContainer}>
                <View style={styles.routeStatItem}>
                  <Ionicons name="map" size={20} color="#A163F6" />
                  <Text style={styles.routeStatValue}>{trackingDistance.toFixed(2)} km</Text>
                </View>
                <View style={styles.routeStatItem}>
                  <Ionicons name="time" size={20} color="#A163F6" />
                  <Text style={styles.routeStatValue}>{formatTime(trackingTime)}</Text>
                </View>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Route Name</Text>
                <TextInput
                  style={styles.input}
                  value={routeName}
                  onChangeText={setRouteName}
                  placeholder="Enter a name for your route"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                />
              </View>
              
              <View style={styles.routeTypeContainer}>
                <Text style={styles.inputLabel}>Route Type</Text>
                <View style={styles.routeTypeButtons}>
                  <TouchableOpacity
                    style={[
                      styles.routeTypeButton,
                      routeType === 'walk' && styles.routeTypeButtonActive
                    ]}
                    onPress={() => setRouteType('walk')}
                  >
                    <Ionicons 
                      name="footsteps" 
                      size={20} 
                      color={routeType === 'walk' ? '#ffffff' : 'rgba(255, 255, 255, 0.6)'} 
                    />
                    <Text style={[
                      styles.routeTypeText,
                      routeType === 'walk' && styles.routeTypeTextActive
                    ]}>Walking</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.routeTypeButton,
                      routeType === 'run' && styles.routeTypeButtonActive
                    ]}
                    onPress={() => setRouteType('run')}
                  >
                    <Ionicons 
                      name="walk" 
                      size={20} 
                      color={routeType === 'run' ? '#ffffff' : 'rgba(255, 255, 255, 0.6)'} 
                    />
                    <Text style={[
                      styles.routeTypeText,
                      routeType === 'run' && styles.routeTypeTextActive
                    ]}>Running</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={saveRoute}
              >
                <Text style={styles.saveButtonText}>Save Route</Text>
              </TouchableOpacity>
            </View>
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
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 24,
  },
  // Tracking UI
  trackingContainer: {
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#A163F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  trackingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  trackingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  stopButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  trackingStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  trackingStat: {
    alignItems: 'center',
    flex: 1,
  },
  trackingValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  trackingLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  trackingStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  syncInfo: {
    alignItems: 'center',
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  syncText: {
    fontSize: 14,
    color: '#4ade80',
    marginLeft: 6,
  },
  // Quick Actions - Updated for more compact design
  quickActionsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
    height: 48, // Reduced height
  },
  startButton: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    gap: 8,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    fontSize: 15, // Slightly smaller font
    fontWeight: '600',
    color: '#000000',
  },
  createRouteButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(161, 99, 246, 0.15)',
    borderRadius: 24,
    gap: 6, // Reduced gap
    borderWidth: 1,
    borderColor: 'rgba(161, 99, 246, 0.3)',
  },
  createRouteText: {
    fontSize: 15, // Slightly smaller font
    fontWeight: '600',
    color: '#A163F6',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 16,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  tabText: {
    fontSize: 14, // Slightly smaller for 3 tabs
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  activeTabText: {
    color: '#ffffff',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 16,
  },
  activityCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  activityDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  activityStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activityDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  routeCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  routePreview: {
    height: 120,
    backgroundColor: 'rgba(20, 20, 20, 0.8)',
  },
  routeContent: {
    padding: 16,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  routeRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  routeStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  routeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeStatText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  routeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  routeTagText: {
    fontSize: 14,
    fontWeight: '600',
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  weatherText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  createdAtText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: 'rgba(30, 30, 30, 0.4)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalBlur: {
    borderRadius: 24,
    overflow: 'hidden',
    width: width * 0.9,
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  routeStatItem: {
    alignItems: 'center',
    gap: 8,
  },
  routeStatValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  routeTypeContainer: {
    marginBottom: 24,
  },
  routeTypeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  routeTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  routeTypeButtonActive: {
    backgroundColor: '#A163F6',
    borderColor: '#A163F6',
  },
  routeTypeText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  routeTypeTextActive: {
    color: '#ffffff',
  },
  saveButton: {
    backgroundColor: '#A163F6',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#A163F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});