<template>
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <label class="text-sm">Datum</label>
      <input
        type="date"
        class="p-2 border rounded"
        v-model="selectedDate"
      />
    </div>

    <div v-if="cars.length === 0" class="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
      <div class="flex items-start gap-2">
        <AlertTriangle class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p class="text-blue-800 font-medium">Kom igång med din första bokning</p>
          <p class="text-blue-700 text-sm mt-1">Lägg till din bil genom att gå till menyn och välja "Hantera bilar". När du har lagt till en bil kan du börja boka parkeringsplatser här.</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-3">
      <div v-for="spot in [1,2,3]" :key="spot" class="grid grid-cols-[auto_1fr] gap-3 items-center">
        <div class="font-semibold text-lg min-w-[80px]">Plats {{ spot }}</div>
        
        <button
          v-if="!bookingMap[spot]"
          class="w-full p-6 rounded-lg bg-success text-white text-lg hover:bg-green-600 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          @click="startBooking(spot)"
          :disabled="cars.length === 0"
        >
          Ledig
        </button>

        <div v-else class="w-full p-4 rounded-lg bg-gray-200 flex items-center justify-between">
          <div>
            <div class="text-gray-700 tracking-widest">{{ bookingMap[spot]?.licensePlate }}</div>
            <div class="text-gray-600 text-sm">{{ bookingMap[spot]?.name }}</div>
          </div>
          <button
            v-if="canCancel(spot)"
            class="px-4 py-2 rounded bg-danger text-white hover:bg-red-700 hover:shadow-lg transition-all duration-200 hover:scale-105"
            @click="showCancelConfirm(spot)"
          >
            Avboka
          </button>
        </div>
      </div>
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

    <div v-if="bookingSpot" class="fixed top-0 left-0 right-0 bottom-0 z-50 bg-black/50 flex items-center justify-center p-4 !mt-0">
      <div class="bg-paper w-full max-w-md rounded-lg p-4 space-y-4 shadow-lg">
        <div class="font-semibold text-lg">Boka plats {{ bookingSpot }}</div>
        <div>
          <label class="block text-sm text-gray-600 mb-3">Välj bil</label>
          <div class="space-y-2">
            <button
              v-for="car in cars"
              :key="car.id"
              @click="handleCarSelect(car.id)"
              :disabled="saving"
              class="w-full p-4 rounded-lg border-2 transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed"
              :class="saving 
                ? 'border-gray-200 bg-gray-100' 
                : 'border-gray-200 bg-white hover:border-blue-600 hover:bg-blue-50 active:bg-blue-100'"
            >
              <div class="font-mono text-xl tracking-widest text-gray-800">
                {{ car.licensePlate }}
              </div>
            </button>
          </div>
        </div>
        <div v-if="formError" class="bg-red-50 border-2 border-red-300 rounded-lg p-4">
          <div class="flex items-start gap-2">
            <XCircle class="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p class="text-red-800 font-medium">{{ formError }}</p>
          </div>
        </div>
        <div class="pt-2">
          <button class="w-full p-3 rounded bg-gray-200 hover:bg-gray-300 hover:shadow-md transition-all duration-200" @click="closeForm" :disabled="saving">
            Avbryt
          </button>
        </div>
      </div>
    </div>

    <div v-if="cancelSpot" class="fixed top-0 left-0 right-0 bottom-0 z-50 bg-black/50 flex items-center justify-center p-4 !mt-0">
      <div class="bg-paper w-full max-w-md rounded-lg p-4 space-y-3 shadow-lg">
        <div class="font-semibold text-lg">Bekräfta avbokning</div>
        <div class="space-y-2">
          <p class="text-gray-700">Är du säker på att du vill avboka plats {{ cancelSpot }} {{ formatDateWithWeekday(selectedDate) }}?</p>
          <div class="bg-gray-50 p-3 rounded">
            <div class="text-sm text-gray-600">Datum</div>
            <div class="font-semibold">{{ formatDateWithWeekday(selectedDate) }}</div>
            <div class="text-sm text-gray-600 mt-2">Registreringsnummer</div>
            <div class="font-semibold tracking-widest">{{ bookingMap[cancelSpot]?.licensePlate }}</div>
            <div class="text-sm text-gray-600 mt-1">Namn</div>
            <div class="font-semibold">{{ bookingMap[cancelSpot]?.name }}</div>
          </div>
        </div>
        <div class="flex gap-3">
          <button class="flex-1 p-3 rounded bg-gray-200 hover:bg-gray-300 hover:shadow-md transition-all duration-200" @click="closeCancelConfirm">Avbryt</button>
          <button class="flex-1 p-3 rounded bg-red-600 text-white disabled:opacity-50 hover:bg-red-700 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] disabled:hover:scale-100 disabled:hover:bg-red-600" :disabled="cancelling" @click="confirmCancel">
            {{ cancelling ? 'Avbokar...' : 'Ja, avboka' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue';
import { AlertTriangle, XCircle } from 'lucide-vue-next';
import { db } from '../firebase';
import {
  collection, query, where, onSnapshot,
  addDoc, serverTimestamp, deleteDoc, doc,
  getDocs
} from 'firebase/firestore';
import { useCars } from '../composables/useCars';
import type { User } from 'firebase/auth';

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


