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

    <div class="grid grid-cols-1 gap-3">
      <div v-for="spot in [1,2,3]" :key="spot" class="grid grid-cols-[auto_1fr] gap-3 items-center">
        <div class="font-semibold text-lg min-w-[80px]">Plats {{ spot }}</div>
        
        <button
          v-if="!bookingMap[spot]"
          class="w-full p-6 rounded-lg bg-success text-white text-lg"
          @click="startBooking(spot)"
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
            class="px-4 py-2 rounded bg-danger text-white"
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
      <div class="bg-paper w-full max-w-md rounded-lg p-4 space-y-3 shadow-lg">
        <div class="font-semibold">Boka plats {{ bookingSpot }}</div>
        <div>
          <label class="block text-sm text-gray-600 mb-1">Registreringsnummer</label>
          <input
            v-model="licensePlate"
            @input="formatPlate"
            maxlength="6"
            class="w-full p-3 border rounded tracking-widest uppercase"
            placeholder="ABC123"
          />
          <p class="text-sm text-gray-500">Exakt 6 tecken (A-Z, 0-9)</p>
        </div>
        <div v-if="formError" class="bg-red-50 border-2 border-red-300 rounded-lg p-4">
          <div class="flex items-start gap-2">
            <svg class="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <p class="text-red-800 font-medium">{{ formError }}</p>
          </div>
        </div>
        <div class="flex gap-3">
          <button class="flex-1 p-3 rounded bg-gray-200" @click="closeForm">Avbryt</button>
          <button class="flex-1 p-3 rounded bg-blue-600 text-white disabled:opacity-50" :disabled="saving" @click="confirmBooking">
            {{ saving ? 'Sparar...' : 'Boka' }}
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
          <button class="flex-1 p-3 rounded bg-gray-200" @click="closeCancelConfirm">Avbryt</button>
          <button class="flex-1 p-3 rounded bg-red-600 text-white disabled:opacity-50" :disabled="cancelling" @click="confirmCancel">
            {{ cancelling ? 'Avbokar...' : 'Ja, avboka' }}
          </button>
        </div>
      </div>
    </div>
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
import type { User } from 'firebase/auth';

const props = defineProps<{ user: User }>();

const selectedDate = ref<string>(new Date().toISOString().slice(0, 10));
const bookingMap = ref<Record<number, { id: string; licensePlate: string; name: string; userId: string }>>({});

let unSub: (() => void) | null = null;

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
const licensePlate = ref<string>('');
const formError = ref('');
const saving = ref(false);

const cancelSpot = ref<number | null>(null);
const cancelling = ref(false);

const userName = computed(() => props.user.displayName || props.user.email || 'Användare');

onMounted(() => {
  const lastPlate = localStorage.getItem('lastLicensePlate');
  if (lastPlate) licensePlate.value = lastPlate;
});

function startBooking(spot: number) {
  bookingSpot.value = spot;
}

function closeForm() {
  bookingSpot.value = null;
  formError.value = '';
  // Behåll värdena för enkel återanvändning
}

function formatPlate() {
  licensePlate.value = licensePlate.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

function validPlate(value: string) {
  return /^[A-Z0-9]{6}$/.test(value);
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

async function confirmBooking() {
  formError.value = '';
  const plate = licensePlate.value.toUpperCase().trim();
  
  if (!validPlate(plate)) {
    formError.value = 'Ogiltigt registreringsnummer.';
    return;
  }
  if (!bookingSpot.value) return;
  
  saving.value = true;
  try {
    // Sista kontroll: Verifiera att platsen fortfarande är ledig
    const existingQuery = query(
      collection(db, 'bookings'),
      where('date', '==', selectedDate.value),
      where('spot', '==', bookingSpot.value)
    );
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      formError.value = 'Platsen är redan bokad. Vänligen välj en annan plats.';
      saving.value = false;
      // Behåll formuläret öppet så användaren kan se felmeddelandet och välja en annan plats
      // Formuläret stängs inte automatiskt - användaren kan klicka "Avbryt" när de vill
      return;
    }
    
    // Skapa bokningen
    await addDoc(collection(db, 'bookings'), {
      date: selectedDate.value,
      spot: bookingSpot.value,
      name: userName.value,
      licensePlate: plate,
      userId: props.user.uid,
      createdAt: serverTimestamp(),
    });
    localStorage.setItem('lastLicensePlate', plate);
    closeForm();
  } catch (e: any) {
    console.error('Booking error:', e);
    if (e?.code === 'permission-denied') {
      formError.value = 'Du har inte behörighet att skapa bokningen.';
    } else {
      formError.value = 'Kunde inte spara bokningen. Försök igen.';
    }
  } finally {
    saving.value = false;
  }
}

function canCancel(spot: number) {
  const booking = bookingMap.value[spot];
  if (!booking) return false;
  // Alla inloggade användare kan avboka vilken bokning som helst
  return true;
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


