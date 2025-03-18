import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import { checkPremiumEntitlement } from '../lib/purchases';

interface PurchasesContextType {
  isPremium: boolean;
  isLoading: boolean;
  checkPremiumStatus: () => Promise<void>;
}

const PurchasesContext = createContext<PurchasesContextType>({
  isPremium: false,
  isLoading: true,
  checkPremiumStatus: async () => {},
});

export const usePurchases = () => useContext(PurchasesContext);

interface PurchasesProviderProps {
  children: ReactNode;
}

export const PurchasesProvider: React.FC<PurchasesProviderProps> = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkPremiumStatus = async () => {
    try {
      setIsLoading(true);
      if (Platform.OS !== 'web') {
        const hasPremium = await checkPremiumEntitlement();
        setIsPremium(hasPremium);
      } else {
        // For web, we'll just show everything as free
        setIsPremium(false);
      }
    } catch (error) {
      console.error('Error checking premium status:', error);
      setIsPremium(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  return (
    <PurchasesContext.Provider value={{ isPremium, isLoading, checkPremiumStatus }}>
      {children}
    </PurchasesContext.Provider>
  );
};