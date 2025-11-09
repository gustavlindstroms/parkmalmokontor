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
        <ParkingSpot
          :spot="booking.spot"
          :booking="{ licensePlate: booking.licensePlate, name: booking.name }"
          :can-cancel="true"
          :disabled="false"
          @cancel="() => doCancel(booking)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useBookings, type Booking } from '../composables/useBookings';
import EmptyState from '../components/EmptyState.vue';
import ParkingSpot from '../components/ParkingSpot.vue';
import { compareDateStrings, formatDateShort } from '../utils/dateUtils';

const {
  bookings,
  loading,
  subscribeToUserBookings,
  cancelBooking,
} = useBookings();

const sortedBookings = computed(() => {
  return [...bookings.value].sort((a, b) => {
    // First sort by date
    const dateCompare = compareDateStrings(a.date, b.date);
    if (dateCompare !== 0) return dateCompare;
    // Then by spot number
    return a.spot - b.spot;
  });
});

async function doCancel(booking: Booking) {
  try {
    await cancelBooking(booking.id);
  } catch (e) {
    console.error('Error cancelling booking:', e);
    alert('Kunde inte avboka. Försök igen.');
  }
}

onMounted(() => {
  subscribeToUserBookings();
});
</script>


