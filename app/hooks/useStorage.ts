import { useState, useEffect, useCallback } from 'react';
import storageService, { StorageKeys } from '../services/storage';

/**
 * Hook générique pour utiliser le service de stockage
 * @param key Clé de stockage
 * @param initialValue Valeur par défaut si aucune donnée n'est trouvée
 */
export function useStorage<T>(key: StorageKeys, initialValue: T) {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Charger les données au montage du composant
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const storedData = await storageService.getItem<T>(key);
        setData(storedData !== null ? storedData : initialValue);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [key]);

  // Fonction pour mettre à jour les données
  const updateData = useCallback(
    async (newData: T) => {
      try {
        setLoading(true);
        await storageService.setItem<T>(key, newData);
        setData(newData);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Une erreur est survenue lors de la mise à jour'),
        );
      } finally {
        setLoading(false);
      }
    },
    [key],
  );

  // Fonction pour supprimer les données
  const removeData = useCallback(async () => {
    try {
      setLoading(true);
      await storageService.removeItem(key);
      setData(initialValue);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Une erreur est survenue lors de la suppression'),
      );
    } finally {
      setLoading(false);
    }
  }, [key, initialValue]);

  return { data, loading, error, updateData, removeData };
}

export default useStorage;
