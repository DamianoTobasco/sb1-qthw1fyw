import { Platform } from 'react-native';
import Purchases, { PurchasesPackage, CustomerInfo } from 'react-native-purchases';

// Check if user has active premium entitlement
export async function checkPremiumEntitlement(): Promise<boolean> {
  if (Platform.OS === 'web') {
    // Return false on web since RevenueCat doesn't support web
    return false;
  }

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return !!customerInfo.entitlements.active['premium'];
  } catch (error) {
    console.error('Error checking premium entitlement:', error);
    return false;
  }
}

// Get current offerings
export async function getOfferings() {
  if (Platform.OS === 'web') {
    return null;
  }
  
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (error) {
    console.error('Error getting offerings:', error);
    throw error;
  }
}

// Purchase a package
export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
  if (Platform.OS === 'web') {
    throw new Error('In-app purchases are not supported on web');
  }
  
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo;
  } catch (error) {
    console.error('Error purchasing package:', error);
    throw error;
  }
}

// Restore purchases
export async function restorePurchases(): Promise<CustomerInfo> {
  if (Platform.OS === 'web') {
    throw new Error('Restore purchases is not supported on web');
  }
  
  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo;
  } catch (error) {
    console.error('Error restoring purchases:', error);
    throw error;
  }
}