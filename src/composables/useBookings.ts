import { ref, computed, onBeforeUnmount } from 'vue';
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
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { useUser } from './useUser';

export interface Booking {
  id: string;
  date: string;
  spot: number;
  licensePlate: string;
  name: string;
  userId: string;
  createdAt?: Timestamp;
}

export interface BookingMap {
  [date: string]: {
    [spot: number]: {
      id: string;
      licensePlate: string;
      name: string;
      userId: string;
    };
  };
}

/**
 * Composable for managing bookings with real-time Firestore subscriptions
 */
export function useBookings() {
  const { userName, userId } = useUser();
  
  const bookingMap = ref<BookingMap>({});
  const loading = ref(false);
  const error = ref<string | null>(null);
  let unSub: (() => void) | null = null;

  /**
   * Subscribe to bookings for a specific date
   */
  function subscribeToDate(date: string) {
    if (unSub) unSub();
    if (!date) return;

    loading.value = true;
    const q = query(
      collection(db, 'bookings'),
      where('date', '==', date)
    );
    
    unSub = onSnapshot(
      q,
      (snap) => {
        const map: BookingMap = {};
        const dayMap: Record<number, { id: string; licensePlate: string; name: string; userId: string }> = {};
        snap.forEach((d) => {
          const data = d.data() as any;
          dayMap[data.spot] = {
            id: d.id,
            licensePlate: data.licensePlate,
            name: data.name || '',
            userId: data.userId,
          };
        });
        map[date] = dayMap;
        bookingMap.value = map;
        loading.value = false;
        error.value = null;
      },
      (err) => {
        console.error('Error fetching bookings:', err);
        error.value = 'Kunde inte ladda bokningar';
        loading.value = false;
      }
    );
  }

  /**
   * Subscribe to bookings for a date range
   */
  function subscribeToDateRange(startDate: string, endDate: string) {
    if (unSub) unSub();
    if (!startDate || !endDate) {
      bookingMap.value = {};
      return;
    }

    loading.value = true;
    const q = query(
      collection(db, 'bookings'),
      where('date', '>=', startDate),
      where('date', '<=', endDate)
    );
    
    unSub = onSnapshot(
      q,
      (snap) => {
        const map: BookingMap = {};
        snap.forEach((d) => {
          const data = d.data() as any;
          if (!map[data.date]) {
            map[data.date] = {};
          }
          map[data.date][data.spot] = {
            id: d.id,
            licensePlate: data.licensePlate,
            name: data.name || '',
            userId: data.userId,
          };
        });
        bookingMap.value = map;
        loading.value = false;
        error.value = null;
      },
      (err) => {
        console.error('Error fetching bookings:', err);
        error.value = 'Kunde inte ladda bokningar';
        loading.value = false;
      }
    );
  }

  /**
   * Subscribe to user's future bookings
   */
  function subscribeToUserBookings() {
    if (unSub) unSub();

    loading.value = true;
    const today = new Date().toISOString().slice(0, 10);
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', userId.value),
      where('date', '>=', today)
    );
    
    unSub = onSnapshot(
      q,
      (snap) => {
        const map: BookingMap = {};
        snap.forEach((d) => {
          const data = d.data() as any;
          if (!map[data.date]) {
            map[data.date] = {};
          }
          map[data.date][data.spot] = {
            id: d.id,
            licensePlate: data.licensePlate,
            name: data.name || '',
            userId: data.userId,
          };
        });
        bookingMap.value = map;
        loading.value = false;
        error.value = null;
      },
      (err) => {
        console.error('Error fetching user bookings:', err);
        error.value = 'Kunde inte ladda bokningar';
        loading.value = false;
      }
    );
  }

  /**
   * Get bookings as a flat array (useful for BookingsView)
   */
  const bookings = computed<Booking[]>(() => {
    const results: Booking[] = [];
    Object.keys(bookingMap.value).forEach((date) => {
      Object.keys(bookingMap.value[date]).forEach((spot) => {
        const booking = bookingMap.value[date][Number(spot)];
        results.push({
          id: booking.id,
          date,
          spot: Number(spot),
          licensePlate: booking.licensePlate,
          name: booking.name,
          userId: booking.userId,
        });
      });
    });
    return results;
  });

  /**
   * Check if user has a booking on a specific date
   */
  function userHasBookingOnDate(date: string): boolean {
    const dayBookings = bookingMap.value[date] || {};
    return Object.values(dayBookings).some(booking => booking.userId === userId.value);
  }

  /**
   * Check if user can cancel a booking at a specific date and spot
   */
  function canCancel(date: string, spot: number): boolean {
    const booking = bookingMap.value[date]?.[spot];
    if (!booking) return false;
    return booking.userId === userId.value;
  }

  /**
   * Create a new booking
   */
  async function createBooking(
    date: string,
    spot: number,
    licensePlate: string
  ): Promise<void> {
    // Check if user already has a booking on this date
    const userBookingQuery = query(
      collection(db, 'bookings'),
      where('date', '==', date),
      where('userId', '==', userId.value)
    );
    const userBookingSnapshot = await getDocs(userBookingQuery);
    
    if (!userBookingSnapshot.empty) {
      throw new Error('Du har redan en bokning denna dag. Du kan bara boka en plats per dag.');
    }
    
    // Check if spot is already booked
    const existingQuery = query(
      collection(db, 'bookings'),
      where('date', '==', date),
      where('spot', '==', spot)
    );
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      throw new Error('Platsen är redan bokad. Vänligen välj en annan plats.');
    }
    
    // Create the booking
    try {
      await addDoc(collection(db, 'bookings'), {
        date,
        spot,
        name: userName.value,
        licensePlate,
        userId: userId.value,
        createdAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.error('Booking error:', err);
      if (err?.code === 'permission-denied') {
        throw new Error('Du har inte behörighet att skapa bokningen.');
      }
      throw new Error('Kunde inte spara bokningen. Försök igen.');
    }
  }

  /**
   * Cancel a booking by ID
   */
  async function cancelBooking(bookingId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'bookings', bookingId));
    } catch (err: any) {
      console.error('Error cancelling booking:', err);
      if (err?.code === 'permission-denied') {
        throw new Error('Du har inte behörighet att avboka.');
      }
      throw new Error('Kunde inte avboka. Försök igen.');
    }
  }

  /**
   * Cancel a booking by date and spot
   */
  async function cancelBookingBySpot(date: string, spot: number): Promise<void> {
    const booking = bookingMap.value[date]?.[spot];
    if (!booking) {
      throw new Error('Bokning hittades inte');
    }
    await cancelBooking(booking.id);
  }

  /**
   * Unsubscribe from real-time updates
   */
  function unsubscribe() {
    if (unSub) {
      unSub();
      unSub = null;
    }
  }

  onBeforeUnmount(() => {
    unsubscribe();
  });

  return {
    bookingMap: computed(() => bookingMap.value),
    bookings,
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    subscribeToDate,
    subscribeToDateRange,
    subscribeToUserBookings,
    userHasBookingOnDate,
    canCancel,
    createBooking,
    cancelBooking,
    cancelBookingBySpot,
    unsubscribe,
  };
}

