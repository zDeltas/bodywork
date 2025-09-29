import { useCallback, useEffect, useMemo, useState } from 'react';
import { storageService } from '../services';
import { MeasurementKey } from '@/app/components/measurements/MeasurementBodyMap';

export type Measurement = {
  date: string;
  weight: number;
  height: number;
  measurements: Record<MeasurementKey, number>;
};

const initialMeasurements: Measurement = {
  date: new Date().toISOString().split('T')[0],
  weight: 0,
  height: 0,
  measurements: {
    neck: 0,
    shoulders: 0,
    chest: 0,
    arms: 0,
    forearms: 0,
    waist: 0,
    hips: 0,
    thighs: 0,
    calves: 0
  }
};

// Fonction utilitaire pour regrouper les mesures par date
function groupMeasurementsByDate(stored: any[]): Measurement[] {
  const byDate: Record<string, Measurement> = {};
  stored.forEach((m) => {
    const date = m.date.split('T')[0];
    if (!byDate[date]) {
      byDate[date] = {
        date,
        weight: 0,
        height: 0,
        measurements: { ...initialMeasurements.measurements }
      };
    }
    if (m.type === 'weight') {
      byDate[date].weight = m.value;
    } else if (m.type === 'height') {
      byDate[date].height = m.value;
    } else if (m.type in byDate[date].measurements) {
      byDate[date].measurements[m.type as MeasurementKey] = m.value;
    }
  });
  return Object.values(byDate).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function useMeasurements() {
  const [measurements, setMeasurements] = useState<Measurement>(initialMeasurements);
  const [allMeasurements, setAllMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Chargement initial
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const stored = await storageService.getMeasurements();
        if (mounted) {
          const arr = stored && stored.length > 0 ? groupMeasurementsByDate(stored) : [];
          setAllMeasurements(arr);
          const today = new Date().toISOString().split('T')[0];
          const found = arr.find((m) => m.date === today);
          setMeasurements(found || { ...initialMeasurements, date: today });
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Erreur lors du chargement des mesures'));
          setAllMeasurements([]);
          setMeasurements({ ...initialMeasurements });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Mettre à jour une mesure corporelle
  const updateMeasurement = useCallback(async (key: MeasurementKey, value: number) => {
    setMeasurements((prev) => {
      const updated = {
        ...prev,
        measurements: { ...prev.measurements, [key]: value }
      };
      // Mise à jour locale immédiate
      setAllMeasurements((prevAll) => {
        const idx = prevAll.findIndex((m) => m.date === updated.date);
        let arr;
        if (idx >= 0) {
          arr = [...prevAll];
          arr[idx] = updated;
        } else {
          arr = [updated, ...prevAll];
        }
        return arr.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      });
      // Sauvegarde asynchrone
      storageService
        .saveMeasurement({
          id: `${updated.date}_${key}`,
          date: new Date(updated.date).toISOString(),
          type: key,
          value,
          unit: 'cm'
        })
        .then(async () => {
          const stored = await storageService.getMeasurements();
          setAllMeasurements(stored ? groupMeasurementsByDate(stored) : []);
        });
      return updated;
    });
  }, []);

  // Mettre à jour le poids
  const updateWeight = useCallback(async (value: number) => {
    setMeasurements((prev) => {
      const updated = {
        ...prev,
        weight: value
      };
      setAllMeasurements((prevAll) => {
        const idx = prevAll.findIndex((m) => m.date === updated.date);
        let arr;
        if (idx >= 0) {
          arr = [...prevAll];
          arr[idx] = updated;
        } else {
          arr = [updated, ...prevAll];
        }
        return arr.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      });
      storageService
        .saveMeasurement({
          id: `${updated.date}_weight`,
          date: new Date(updated.date).toISOString(),
          type: 'weight',
          value,
          unit: 'kg'
        })
        .then(async () => {
          const stored = await storageService.getMeasurements();
          setAllMeasurements(stored ? groupMeasurementsByDate(stored) : []);
        });
      return updated;
    });
  }, []);

  // Mettre à jour la taille
  const updateHeight = useCallback(async (value: number) => {
    setMeasurements((prev) => {
      const updated = {
        ...prev,
        height: value
      };
      setAllMeasurements((prevAll) => {
        const idx = prevAll.findIndex((m) => m.date === updated.date);
        let arr;
        if (idx >= 0) {
          arr = [...prevAll];
          arr[idx] = updated;
        } else {
          arr = [updated, ...prevAll];
        }
        return arr.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      });
      storageService
        .saveMeasurement({
          id: `${updated.date}_height`,
          date: new Date(updated.date).toISOString(),
          type: 'height',
          value,
          unit: 'cm'
        })
        .then(async () => {
          const stored = await storageService.getMeasurements();
          setAllMeasurements(stored ? groupMeasurementsByDate(stored) : []);
        });
      return updated;
    });
  }, []);

  // Changer la date sélectionnée
  const setSelectedDate = useCallback(
    (date: string) => {
      setMeasurements((prev) => {
        const found = allMeasurements.find((m) => m.date === date);
        return found ? found : { ...initialMeasurements, date };
      });
    },
    [allMeasurements]
  );

  // Exposer les valeurs mémoïsées pour éviter les re-rendus inutiles
  const contextValue = useMemo(
    () => ({
      measurements,
      allMeasurements,
      loading,
      error,
      updateMeasurement,
      updateWeight,
      updateHeight,
      setSelectedDate
    }),
    [
      measurements,
      allMeasurements,
      loading,
      error,
      updateMeasurement,
      updateWeight,
      updateHeight,
      setSelectedDate
    ]
  );

  return contextValue;
}

export default useMeasurements;
