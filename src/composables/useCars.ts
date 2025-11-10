import { ref, onMounted, onBeforeUnmount } from 'vue';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';

export interface Car {
  id: string;
  licensePlate: string;
  userId: string;
  createdAt?: any;
}

export function useCars(userId: string) {
  const cars = ref<Car[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  let unSub: (() => void) | null = null;

  function bindRealtime() {
    if (unSub) unSub();
    if (!userId) return;

    loading.value = true;
    const q = query(collection(db, 'cars'), where('userId', '==', userId));
    
    unSub = onSnapshot(
      q,
      (snapshot) => {
        const carList: Car[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          carList.push({
            id: doc.id,
            licensePlate: data.licensePlate,
            userId: data.userId,
            createdAt: data.createdAt,
          });
        });
        // Sort by creation date (newest first) or by license plate
        carList.sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return b.createdAt.toMillis() - a.createdAt.toMillis();
          }
          return a.licensePlate.localeCompare(b.licensePlate);
        });
        cars.value = carList;
        loading.value = false;
        error.value = null;
      },
      (err) => {
        console.error('Error fetching cars:', err);
        error.value = 'Kunde inte ladda bilar';
        loading.value = false;
      }
    );
  }

  async function addCar(licensePlate: string): Promise<void> {
    const plate = licensePlate.toUpperCase().trim().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    
    if (plate.length !== 6) {
      throw new Error('Registreringsnummer måste vara exakt 6 tecken');
    }

    if (!/^[A-Z0-9]{6}$/.test(plate)) {
      throw new Error('Ogiltigt registreringsnummer. Använd endast A-Z och 0-9');
    }

    // Check for duplicates
    const duplicate = cars.value.find((car) => car.licensePlate === plate);
    if (duplicate) {
      throw new Error('Denna bil finns redan i listan');
    }

    try {
      await addDoc(collection(db, 'cars'), {
        userId,
        licensePlate: plate,
        createdAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.error('Error adding car:', err);
      if (err?.code === 'permission-denied') {
        throw new Error('Du har inte behörighet att lägga till bil');
      }
      throw new Error('Kunde inte lägga till bil. Försök igen.');
    }
  }

  async function removeCar(carId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'cars', carId));
    } catch (err: any) {
      console.error('Error removing car:', err);
      if (err?.code === 'permission-denied') {
        throw new Error('Du har inte behörighet att ta bort bil');
      }
      throw new Error('Kunde inte ta bort bil. Försök igen.');
    }
  }

  onMounted(() => {
    bindRealtime();
  });

  onBeforeUnmount(() => {
    if (unSub) unSub();
  });

  return {
    cars,
    loading,
    error,
    addCar,
    removeCar,
    bindRealtime, // Expose for manual refresh if needed
  };
}

