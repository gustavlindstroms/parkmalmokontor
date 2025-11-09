<template>
  <div class="flex flex-col min-h-0 space-y-4" :class="viewMode === 'day' ? 'md:max-w-2xl md:mx-auto' : ''">
    <DatePicker v-model="selectedDate" :week-mode="viewMode === 'week'" />

    <EmptyState
      v-if="!carsLoading && cars.length === 0"
      title="Kom igång med din första bokning"
      message='Lägg till din bil genom att gå till menyn och välja "Mina bilar". När du har lagt till en bil kan du börja boka parkeringsplatser här.'
    />

    <!-- Day View -->
    <div v-if="viewMode === 'day'" class="grid grid-cols-1 gap-3">
      <div
        v-for="spot in [1,2,3]"
        :key="spot"
        class="grid grid-cols-[auto_1fr] gap-3 items-center"
      >
        <div class="font-semibold text-lg min-w-[80px]">Plats {{ spot }}</div>
        <ParkingSpot
          :spot="spot"
          :booking="displayBookingMap[spot]"
          :can-cancel="canCancel(selectedDate, spot)"
          :disabled="cars.length === 0 || userHasBookingOnDate(selectedDate)"
          @book="startBooking"
          @cancel="confirmCancel"
        />
      </div>
    </div>

    <!-- Week View -->
    <div v-else class="overflow-x-auto -mx-4 md:-mx-8 px-4 md:px-8">
      <div class="min-w-[1000px]">
        <table class="w-full border-collapse table-fixed">
          <thead>
            <tr>
              <th class="p-3 text-left border-b border-gray-300 font-semibold text-sm text-gray-700 w-24"></th>
              <th 
                v-for="day in weekDates" 
                :key="day.date"
                :class="[
                  'p-3 text-center border-b border-gray-300 text-sm text-gray-700',
                  day.isToday ? 'font-bold' : 'font-semibold'
                ]"
              >
                <div class="flex flex-col">
                  <span :class="day.isToday ? 'text-primary font-bold' : 'text-xs text-gray-500'">{{ day.dayName }}</span>
                  <span :class="day.isToday ? 'text-primary font-bold' : ''">{{ day.dateLabel }}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="spot in [1,2,3]" :key="spot">
              <td class="p-3 font-semibold">Plats {{ spot }}</td>
              <td 
                v-for="day in weekDates" 
                :key="`${day.date}-${spot}`"
                class="p-3"
              >
                <ParkingSpot
                  :spot="spot"
                  :booking="weekBookingMap[day.date]?.[spot]"
                  :can-cancel="canCancel(day.date, spot)"
                  :disabled="cars.length === 0 || userHasBookingOnDate(day.date)"
                  :compact-cancel="true"
                  @book="(s) => startBookingForDate(day.date, s)"
                  @cancel="(s) => confirmCancelForDate(day.date, s)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="pt-4 border-t border-gray-200 mt-6 flex justify-center">
      <a
        href="https://kundportal.pmalmo.se/account?ReturnUrl=%2F"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-gray-300 hover:border-primary hover:bg-gray-50 transition-colors"
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

  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue';
import { useCars } from '../composables/useCars';
import { useUser } from '../composables/useUser';
import { useBookings } from '../composables/useBookings';
import DatePicker from '../components/DatePicker.vue';
import EmptyState from '../components/EmptyState.vue';
import ParkingSpot from '../components/ParkingSpot.vue';
import BookingModal from '../components/BookingModal.vue';

const { userId } = useUser();

const selectedDate = ref<string>(new Date().toISOString().slice(0, 10));
const windowWidth = ref<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);

// Use day view on mobile/tablet (< 1200px), week view on desktop (>= 1200px)
const viewMode = computed<'day' | 'week'>(() => {
  return windowWidth.value >= 1200 ? 'week' : 'day';
});

// Car management
const { cars, loading: carsLoading } = useCars(userId.value);
const selectedCarId = ref<string>('');

// Booking management
const {
  bookingMap,
  userHasBookingOnDate,
  canCancel,
  createBooking,
  cancelBookingBySpot,
  subscribeToDate,
  subscribeToDateRange,
} = useBookings();

// Get week start (Monday) for a given date
function getWeekStart(dateString: string): Date {
  const date = new Date(dateString + 'T00:00:00');
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(date.setDate(diff));
}

// Get all dates in the week starting from Monday (excluding weekends)
const weekDates = computed(() => {
  const weekStart = getWeekStart(selectedDate.value);
  const dates: Array<{ date: string; dayName: string; dateLabel: string; isToday: boolean }> = [];
  const today = new Date().toISOString().slice(0, 10);
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    const dayOfWeek = date.getDay();
    
    // Skip weekends (Saturday = 6, Sunday = 0)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      continue;
    }
    
    const dateStr = date.toISOString().slice(0, 10);
    
    const dayNames = ['Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag', 'Söndag'];
    const dayName = dayNames[dayOfWeek === 0 ? 6 : dayOfWeek - 1];
    const dateLabel = date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' }).replace(/\./g, '');
    
    dates.push({
      date: dateStr,
      dayName,
      dateLabel,
      isToday: dateStr === today
    });
  }
  
  return dates;
});

function bindRealtime() {
  if (viewMode.value === 'day') {
    // Day view: query single date
    subscribeToDate(selectedDate.value);
  } else {
    // Week view: query week range (Monday to Friday)
    const weekStart = weekDates.value[0]?.date;
    const weekEnd = weekDates.value[weekDates.value.length - 1]?.date;
    
    if (weekStart && weekEnd) {
      subscribeToDateRange(weekStart, weekEnd);
    }
  }
}

function handleResize() {
  windowWidth.value = window.innerWidth;
}

onMounted(() => {
  bindRealtime();
  window.addEventListener('resize', handleResize);
  handleResize(); // Set initial width
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

watch(selectedDate, bindRealtime);
watch(viewMode, bindRealtime);

const bookingSpot = ref<number | null>(null);
const bookingDate = ref<string>('');
const formError = ref('');
const saving = ref(false);

const cancelledBookingCache = ref<Record<string, Record<number, { id: string; licensePlate: string; name: string; userId: string }>>>({});

// Merge bookingMap with cancelled bookings that are still animating (for day view)
const displayBookingMap = computed(() => {
  const dayBookings = { ...bookingMap.value[selectedDate.value] || {} };
  const cancelled = cancelledBookingCache.value[selectedDate.value] || {};
  return { ...dayBookings, ...cancelled };
});

// Week booking map (for week view) - merge with cancelled bookings
const weekBookingMap = computed(() => {
  const map: Record<string, Record<number, { id: string; licensePlate: string; name: string; userId: string }>> = {};
  
  // Copy all bookings from bookingMap
  Object.keys(bookingMap.value).forEach(date => {
    map[date] = { ...bookingMap.value[date] };
  });
  
  // Merge cancelled bookings that are still animating
  Object.keys(cancelledBookingCache.value).forEach(date => {
    if (!map[date]) {
      map[date] = {};
    }
    Object.keys(cancelledBookingCache.value[date]).forEach(spot => {
      map[date][Number(spot)] = { ...cancelledBookingCache.value[date][Number(spot)] };
    });
  });
  
  return map;
});

const selectedCar = computed(() => {
  return cars.value.find(car => car.id === selectedCarId.value);
});

async function handleCarSelect(carId: string) {
  if (saving.value || !bookingSpot.value) return;
  selectedCarId.value = carId;
  await confirmBooking();
}

async function startBooking(spot: number) {
  startBookingForDate(selectedDate.value, spot);
}

async function startBookingForDate(date: string, spot: number) {
  // If only one car, book directly without showing modal
  if (cars.value.length === 1) {
    selectedCarId.value = cars.value[0].id;
    await confirmBooking(spot, true, date); // Pass spot, direct booking flag, and date
    return;
  }
  
  // If multiple cars, show modal for selection
  bookingSpot.value = spot;
  bookingDate.value = date;
  if (cars.value.length > 1 && !selectedCarId.value) {
    // Select first car by default if multiple cars
    selectedCarId.value = cars.value[0].id;
  }
}

function closeForm() {
  bookingSpot.value = null;
  bookingDate.value = '';
  formError.value = '';
  selectedCarId.value = '';
}

async function confirmBooking(spot?: number, directBooking = false, date?: string) {
  formError.value = '';
  
  // Use provided date, bookingDate from modal, or selectedDate
  const targetDate = date || bookingDate.value || selectedDate.value;
  
  // Use provided spot or bookingSpot from modal
  const targetSpot = spot ?? bookingSpot.value;
  if (!targetSpot) return;
  
  if (!selectedCar.value) {
    formError.value = 'Välj en bil.';
    if (directBooking) {
      // Show modal if error occurs during direct booking
      bookingSpot.value = targetSpot;
      bookingDate.value = targetDate;
    }
    return;
  }
  
  saving.value = true;
  try {
    await createBooking(targetDate, targetSpot, selectedCar.value.licensePlate);
    
    // Only close form/modal if it was open (not direct booking)
    if (!directBooking) {
      closeForm();
    } else {
      // Clear state after successful direct booking
      selectedCarId.value = '';
    }
  } catch (e: any) {
    console.error('Booking error:', e);
    formError.value = e.message || 'Kunde inte spara bokningen. Försök igen.';
    // If direct booking failed, show modal so user can see the error
    if (directBooking) {
      bookingSpot.value = targetSpot;
      bookingDate.value = targetDate;
    }
  } finally {
    saving.value = false;
  }
}

function confirmCancel(spot: number) {
  confirmCancelForDate(selectedDate.value, spot);
}

function confirmCancelForDate(date: string, spot: number) {
  const booking = bookingMap.value[date]?.[spot];
  if (!booking) return;
  
  // Store booking in cache so it stays visible during animation
  if (!cancelledBookingCache.value[date]) {
    cancelledBookingCache.value[date] = {};
  }
  cancelledBookingCache.value[date][spot] = { ...booking };
  
  // Do async deletion
  cancelBookingBySpot(date, spot).catch((e) => {
    console.error('Error cancelling booking:', e);
    // swallow; UI will remain until snapshot updates
  });
  
  // Clear cache after animation completes
  setTimeout(() => {
    if (cancelledBookingCache.value[date]) {
      delete cancelledBookingCache.value[date][spot];
    }
  }, 1000);
}
</script>

<style scoped>
</style>


