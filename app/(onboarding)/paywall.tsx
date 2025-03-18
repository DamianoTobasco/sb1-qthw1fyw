import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Purchases, { PurchasesPackage, PurchasesOffering } from 'react-native-purchases';

const { width, height } = Dimensions.get('window');

const FEATURE_ITEMS = [
  {
    title: "Unlimited AI Food Scans",
    description: "Instantly identify and log meals with our advanced AI recognition",
    icon: "scan-outline"
  },
  {
    title: "Advanced Analytics & Insights",
    description: "Detailed health metrics, trends, and personalized recommendations",
    icon: "analytics-outline"
  },
  {
    title: "Premium Meditation Library",
    description: "Access our full catalog of guided meditations and sleep sounds",
    icon: "lotus-outline"
  },
  {
    title: "Advanced Habit Insights",
    description: "Detailed tracking and analytics for your habit formation journey",
    icon: "calendar-number-outline"
  },
  {
    title: "Workout & Fitness Tracking",
    description: "Track workouts so you never forget what you trained on a certain day again",
    icon: "barbell-outline"
  },
  {
    title: "Cardio Route Optimization",
    description: "AI-optimized running & walking routes with detailed metrics",
    icon: "bicycle-outline"
  }
];

export default function PaywallScreen() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [loading, setLoading] = useState(false);
  const [loadingOfferings, setLoadingOfferings] = useState(true);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [errorModal, setErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (Platform.OS !== 'web') {
      fetchOfferings();
    } else {
      // On web, simulate offerings after a delay
      setTimeout(() => {
        setLoadingOfferings(false);
      }, 1000);
    }
  }, []);

  const fetchOfferings = async () => {
    try {
      setLoadingOfferings(true);
      const offerings = await Purchases.getOfferings();
      if (offerings.current) {
        console.log('Offerings:', offerings.current);
        setOfferings(offerings.current);
      }
    } catch (error) {
      console.error('Error fetching offerings:', error);
      setErrorMessage('Failed to load subscription options. Please try again.');
    } finally {
      setLoadingOfferings(false);
    }
  };

  const handlePurchase = async (packageToPurchase: PurchasesPackage) => {
    if (Platform.OS === 'web') {
      // Skip purchase on web and go to main app
      handleContinueToApp();
      return;
    }

    try {
      setLoading(true);
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      
      if (customerInfo.entitlements.active['premium']) {
        console.log('Purchase successful!');
        handleContinueToApp();
      }
    } catch (error: any) {
      if (!error.userCancelled) {
        console.error('Purchase error:', error);
        setErrorMessage(error.message || 'Failed to complete purchase. Please try again.');
        setErrorModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const getPackage = (identifier: 'monthly' | 'yearly') => {
    if (!offerings || !offerings.availablePackages) return null;
    return offerings.availablePackages.find(pkg => 
      pkg.identifier.toLowerCase().includes(identifier)
    );
  };

  const handleContinueToApp = () => {
    router.replace('/(tabs)');
  };

  const monthlyPackage = offerings ? getPackage('monthly') : null;
  const yearlyPackage = offerings ? getPackage('yearly') : null;

  // Fallback values for web
  const monthlyPrice = monthlyPackage?.product.priceString || '$9.99/mo';
  const yearlyPrice = yearlyPackage?.product.priceString || '$5.83/mo';
  const yearlyBilledAs = yearlyPackage?.product.priceString || '$69.99/yr';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.closeButtonContainer}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={handleContinueToApp}
        >
          <Ionicons name="close" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>Get Evolve AI Pro</Text>
          <Text style={styles.subtitle}>Unlock advanced health insights</Text>
        </View>

        <View style={styles.featuresContainer}>
          {FEATURE_ITEMS.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.checkmarkContainer}>
                <Ionicons name="checkmark-sharp" size={20} color="#ffffff" />
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {loadingOfferings ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#A163F6" />
            <Text style={styles.loadingText}>Loading subscription options...</Text>
          </View>
        ) : (
          <View style={styles.pricingSection}>
            <View style={styles.savingsPill}>
              <Text style={styles.savingsText}>19% OFF</Text>
            </View>

            {/* Subscription Options */}
            <View style={styles.subscriptionContainer}>
              {/* Yearly Plan */}
              <TouchableOpacity 
                style={[
                  styles.subscriptionOption, 
                  selectedPlan === 'yearly' && styles.selectedOption
                ]}
                onPress={() => setSelectedPlan('yearly')}
              >
                <View style={styles.planDetails}>
                  <Text style={styles.planTitle}>Yearly</Text>
                  <Text style={styles.planPrice}>{yearlyPrice}</Text>
                  <Text style={styles.billedAs}>Billed at {yearlyBilledAs}</Text>
                </View>
                <View style={[
                  styles.radioButton,
                  selectedPlan === 'yearly' && styles.radioButtonSelected
                ]}>
                  {selectedPlan === 'yearly' && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </TouchableOpacity>

              {/* Monthly Plan */}
              <TouchableOpacity 
                style={[
                  styles.subscriptionOption, 
                  selectedPlan === 'monthly' && styles.selectedOption
                ]}
                onPress={() => setSelectedPlan('monthly')}
              >
                <View style={styles.planDetails}>
                  <Text style={styles.planTitle}>Monthly</Text>
                  <Text style={styles.planPrice}>{monthlyPrice}</Text>
                  <Text style={styles.billedAs}>Billed monthly</Text>
                </View>
                <View style={[
                  styles.radioButton,
                  selectedPlan === 'monthly' && styles.radioButtonSelected
                ]}>
                  {selectedPlan === 'monthly' && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.subscribeButton}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  const packageToPurchase = selectedPlan === 'yearly' ? yearlyPackage : monthlyPackage;
                  if (packageToPurchase) {
                    handlePurchase(packageToPurchase);
                  }
                } else {
                  handleContinueToApp();
                }
              }}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.subscribeButtonText}>START FREE</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.restorePurchasesButton}
              onPress={handleContinueToApp}
            >
              <Text style={styles.restoreText}>Restore Purchases</Text>
            </TouchableOpacity>

            <View style={styles.termsContainer}>
              <TouchableOpacity>
                <Text style={styles.termsText}>Terms</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.termsText}>Privacy</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Error Modal */}
      <Modal
        visible={errorModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <BlurView intensity={70} tint="dark" style={styles.modalBlur}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Purchase Failed</Text>
              <Text style={styles.modalMessage}>{errorMessage}</Text>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => setErrorModal(false)}
              >
                <Text style={styles.modalButtonText}>Try Again</Text>
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
  closeButtonContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  featuresContainer: {
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  checkmarkContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#A163F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 20,
  },
  pricingSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  savingsPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    marginBottom: 16,
  },
  savingsText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  subscriptionContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    padding: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
  },
  subscriptionOption: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  selectedOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  planDetails: {
    flex: 1,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  billedAs: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#A163F6',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#A163F6',
  },
  subscribeButton: {
    backgroundColor: '#A163F6',
    width: '100%',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  subscribeButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  restorePurchasesButton: {
    paddingVertical: 12,
  },
  restoreText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
  },
  termsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
    marginTop: 12,
    marginBottom: 20,
  },
  termsText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 16,
    fontSize: 16,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalBlur: {
    borderRadius: 20,
    overflow: 'hidden',
    width: width * 0.8,
    maxWidth: 400,
  },
  modalContent: {
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  modalMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  modalButton: {
    backgroundColor: '#A163F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 18,
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});