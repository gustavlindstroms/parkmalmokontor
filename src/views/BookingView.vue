<template>
  <div class="space-y-4">
    <DatePicker v-model="selectedDate" />

    <EmptyState
      v-if="cars.length === 0"
      title="Kom igång med din första bokning"
      message='Lägg till din bil genom att gå till menyn och välja "Hantera bilar". När du har lagt till en bil kan du börja boka parkeringsplatser här.'
    />

    <div class="grid grid-cols-1 gap-3">
      <ParkingSpot
        v-for="spot in [1,2,3]"
        :key="spot"
        :spot="spot"
        :booking="bookingMap[spot]"
        :can-cancel="canCancel(spot)"
        :disabled="cars.length === 0"
        @book="startBooking"
        @cancel="showCancelConfirm"
      />
    </div>

    <div class="pt-4 border-t border-gray-200 mt-6">
      <a
        href="https://kundportal.pmalmo.se/account?ReturnUrl=%2F"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center justify-center gap-2 w-full p-3 rounded-lg border-2 border-gray-300 hover:border-primary hover:bg-gray-50 transition-colors"
      >
        <img src="/src/img/p_malmo_logo.png" alt="P-Malmö" class="h-6" />
        <span class="text-sm font-medium text-gray-700">Till P-Malmös kundportal</span>
      </a>
    </div>

    <BookingModal
      :spot="bookingSpot"
      :cars="cars"
      :saving="saving"
      :error="formError"
      @select="handleCarSelect"
      @close="closeForm"
    />

    <CancelConfirmModal
      :spot="cancelSpot"
      :booking="cancelSpot ? bookingMap[cancelSpot] : null"
      :formatted-date="formatDateWithWeekday(selectedDate)"
      :cancelling="cancelling"
      @confirm="confirmCancel"
      @cancel="closeCancelConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue';
import { db } from '../firebase';
import {
  collection, query, where, onSnapshot,
  addDoc, serverTimestamp, deleteDoc, doc,
  getDocs
} from 'firebase/firestore';
import { useCars } from '../composables/useCars';
import type { User } from 'firebase/auth';
import DatePicker from '../components/DatePicker.vue';
import EmptyState from '../components/EmptyState.vue';
import ParkingSpot from '../components/ParkingSpot.vue';
import BookingModal from '../components/BookingModal.vue';
import CancelConfirmModal from '../components/CancelConfirmModal.vue';

const props = defineProps<{ user: User }>();

const selectedDate = ref<string>(new Date().toISOString().slice(0, 10));
const bookingMap = ref<Record<number, { id: string; licensePlate: string; name: string; userId: string }>>({});

let unSub: (() => void) | null = null;

// Car management
const { cars } = useCars(props.user.uid);
const selectedCarId = ref<string>('');

function bindRealtime() {
  if (unSub) unSub();
  const q = query(
    collection(db, 'bookings'),
    where('date', '==', selectedDate.value)
  );
  unSub = onSnapshot(q, (snap) => {
    const map: Record<number, { id: string; licensePlate: string; name: string; userId: string }> = {};
    snap.forEach((d) => {
      const data = d.data() as any;
      map[data.spot] = { id: d.id, licensePlate: data.licensePlate, name: data.name || '', userId: data.userId };
    });
    bookingMap.value = map;
  });
}

onMounted(bindRealtime);
onBeforeUnmount(() => { if (unSub) unSub(); });
watch(selectedDate, bindRealtime);

const bookingSpot = ref<number | null>(null);
const formError = ref('');
const saving = ref(false);

const cancelSpot = ref<number | null>(null);
const cancelling = ref(false);

const userName = computed(() => props.user.displayName || props.user.email || 'Användare');

const selectedCar = computed(() => {
  return cars.value.find(car => car.id === selectedCarId.value);
});

async function handleCarSelect(carId: string) {
  if (saving.value || !bookingSpot.value) return;
  selectedCarId.value = carId;
  await confirmBooking();
}

async function startBooking(spot: number) {
  // If only one car, book directly without showing modal
  if (cars.value.length === 1) {
    selectedCarId.value = cars.value[0].id;
    await confirmBooking(spot, true); // Pass spot and true to indicate direct booking
    return;
  }
  
  // If multiple cars, show modal for selection
  bookingSpot.value = spot;
  if (cars.value.length > 1 && !selectedCarId.value) {
    // Select first car by default if multiple cars
    selectedCarId.value = cars.value[0].id;
  }
}

function closeForm() {
  bookingSpot.value = null;
  formError.value = '';
  selectedCarId.value = '';
}

function formatDateWithWeekday(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const weekdays = ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'];
  const weekday = weekdays[date.getDay()];
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${weekday} ${year}-${month}-${day}`;
}

async function confirmBooking(spot?: number, directBooking = false) {
  formError.value = '';
  
  // Use provided spot or bookingSpot from modal
  const targetSpot = spot ?? bookingSpot.value;
  if (!targetSpot) return;
  
  if (!selectedCar.value) {
    formError.value = 'Välj en bil.';
    if (directBooking) {
      // Show modal if error occurs during direct booking
      bookingSpot.value = targetSpot;
    }
    return;
  }
  
  const plate = selectedCar.value.licensePlate;
  
  saving.value = true;
  try {
    // Sista kontroll: Verifiera att platsen fortfarande är ledig
    const existingQuery = query(
      collection(db, 'bookings'),
      where('date', '==', selectedDate.value),
      where('spot', '==', targetSpot)
    );
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      formError.value = 'Platsen är redan bokad. Vänligen välj en annan plats.';
      saving.value = false;
      // If direct booking failed, show modal so user can see the error
      if (directBooking) {
        bookingSpot.value = targetSpot;
        return;
      }
      // Behåll formuläret öppet så användaren kan se felmeddelandet och välja en annan plats
      // Formuläret stängs inte automatiskt - användaren kan klicka "Avbryt" när de vill
      return;
    }
    
    // Skapa bokningen
    await addDoc(collection(db, 'bookings'), {
      date: selectedDate.value,
      spot: targetSpot,
      name: userName.value,
      licensePlate: plate,
      userId: props.user.uid,
      createdAt: serverTimestamp(),
    });
    
    // Only close form/modal if it was open (not direct booking)
    if (!directBooking) {
      closeForm();
    } else {
      // Clear state after successful direct booking
      selectedCarId.value = '';
    }
  } catch (e: any) {
    console.error('Booking error:', e);
    if (e?.code === 'permission-denied') {
      formError.value = 'Du har inte behörighet att skapa bokningen.';
    } else {
      formError.value = 'Kunde inte spara bokningen. Försök igen.';
    }
    // If direct booking failed, show modal so user can see the error
    if (directBooking) {
      bookingSpot.value = targetSpot;
    }
  } finally {
    saving.value = false;
  }
}

function canCancel(spot: number) {
  const booking = bookingMap.value[spot];
  if (!booking) return false;
  // Users can only cancel their own bookings
  return booking.userId === props.user.uid;
}

function showCancelConfirm(spot: number) {
  cancelSpot.value = spot;
}

function closeCancelConfirm() {
  cancelSpot.value = null;
}

async function confirmCancel() {
  if (!cancelSpot.value) return;
  const booking = bookingMap.value[cancelSpot.value];
  if (!booking) return;
  
  cancelling.value = true;
  try {
    await deleteDoc(doc(db, 'bookings', booking.id));
    closeCancelConfirm();
  } catch (e) {
    // swallow; UI will remain until snapshot updates
  } finally {
    cancelling.value = false;
  }
}
</script>

<style scoped>
</style>


