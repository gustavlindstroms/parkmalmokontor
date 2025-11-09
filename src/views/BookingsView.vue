<template>
  <div class="space-y-4 max-w-md md:max-w-2xl mx-auto">
    <h1 class="text-2xl font-semibold">Mina framtida bokningar</h1>

    <div v-if="loading" class="text-center py-8 text-gray-500">
      Laddar bokningar...
    </div>

    <EmptyState
      v-else-if="!loading && bookings.length === 0"
      title="Inga framtida bokningar"
      message="Du har inga kommande bokningar. Gå tillbaka för att boka en parkeringsplats."
    />

    <div v-else class="space-y-3">
      <div
        v-for="booking in sortedBookings"
        :key="booking.id"
        class="grid grid-cols-[auto_1fr] gap-3 items-center"
      >
        <div class="font-semibold text-lg min-w-[80px]">{{ formatDateShort(booking.date) }}</div>
        <div 
          class="w-full p-4 rounded-lg flex items-center justify-between booking-card"
          :class="{
            'cancelled-animation': cancellingBookings.has(booking.id)
          }"
        >
          <div>
            <div class="text-gray-700 tracking-widest">{{ booking.licensePlate }}</div>
            <div class="text-gray-600 text-sm">{{ booking.name }}</div>
          </div>
          <button
            v-if="!cancellingBookings.has(booking.id)"
            class="px-4 py-2 rounded bg-danger text-white hover:bg-red-700 hover:shadow-lg transition-all duration-200 hover:scale-105"
            @click="confirmCancel(booking)"
          >
            Avboka
          </button>
          <div v-else class="px-4 py-2 text-sm text-gray-400">
            Avbokar...
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useBookings, type Booking } from '../composables/useBookings';
import EmptyState from '../components/EmptyState.vue';

const {
  bookings,
  loading,
  subscribeToUserBookings,
  cancelBooking,
} = useBookings();

const cancellingBookings = ref<Set<string>>(new Set());

const sortedBookings = computed(() => {
  return [...bookings.value].sort((a, b) => {
    // First sort by date
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    // Then by spot number
    return a.spot - b.spot;
  });
});

function formatDateHeader(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);
  
  if (dateOnly.getTime() === today.getTime()) {
    return 'Idag';
  } else if (dateOnly.getTime() === tomorrow.getTime()) {
    return 'Imorgon';
  }
  
  const dateStr = date.toLocaleDateString('sv-SE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  // Capitalize first letter
  return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
}

function formatDateShort(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);
  
  if (dateOnly.getTime() === today.getTime()) {
    return 'Idag';
  } else if (dateOnly.getTime() === tomorrow.getTime()) {
    return 'Imorgon';
  }
  
  return date.toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'short',
  }).replace(/\./g, '');
}

function confirmCancel(booking: Booking) {
  if (!confirm(`Är du säker på att du vill avboka plats ${booking.spot} för ${formatDateHeader(booking.date)}?`)) {
    return;
  }
  doCancel(booking);
}

async function doCancel(booking: Booking) {
  cancellingBookings.value.add(booking.id);
  
  // Trigger animation
  setTimeout(() => {
    // Animation will continue even after deletion
  }, 1000);
  
  try {
    await cancelBooking(booking.id);
  } catch (e) {
    console.error('Error cancelling booking:', e);
    alert('Kunde inte avboka. Försök igen.');
    cancellingBookings.value.delete(booking.id);
  }
  // Note: We don't remove from cancellingBookings here because the booking will be removed from the list
  // when Firestore updates, so the component will unmount
}

onMounted(() => {
  subscribeToUserBookings();
});
</script>

<style scoped>
@keyframes cancelled {
  0% {
    box-shadow: 0 0 0 0 rgba(201, 29, 37, 0.7);
    outline: 2px solid transparent;
  }
  50% {
    box-shadow: 0 0 0 10px rgba(201, 29, 37, 0);
    outline: 2px solid #C91D25;
  }
  100% {
    box-shadow: 0 0 0 0 rgba(201, 29, 37, 0);
    outline: 2px solid transparent;
  }
}

.booking-card {
  background-color: #e5e7eb; /* bg-gray-200 */
  transition: background-color 0.4s ease-out;
  outline-offset: -2px;
}

.cancelled-animation {
  animation: cancelled 0.6s ease-out;
  outline: 2px solid transparent;
}
</style>

