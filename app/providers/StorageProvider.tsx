import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { storageService } from '../services';

interface StorageContextType {
  isInitialized: boolean;
  isInitializing: boolean;
  error: Error | null;
}

const StorageContext = createContext<StorageContextType>({
  isInitialized: false,
  isInitializing: true,
  error: null,
});

export const StorageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeStorage = async () => {
      try {
        setIsInitializing(true);
        await storageService.initialize();
        setIsInitialized(true);
        setError(null);
        console.log('Service de stockage initialisé avec succès');
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Erreur lors de l'initialisation du stockage"),
        );
        console.error("Erreur lors de l'initialisation du service de stockage:", err);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeStorage();
  }, []);

  return (
    <StorageContext.Provider value={{ isInitialized, isInitializing, error }}>
      {children}
    </StorageContext.Provider>
  );
};

export const useStorage = () => useContext(StorageContext);

export default StorageProvider;
