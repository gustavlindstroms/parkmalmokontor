<template>
  <button
    v-if="!booking"
    class="w-full p-6 rounded-lg bg-success text-white text-lg hover:bg-green-600 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
    @click="$emit('book', spot)"
    :disabled="disabled"
  >
    Ledig
  </button>

  <div 
    v-else 
    class="w-full p-4 rounded-lg flex items-center justify-between booking-card"
    :class="{
      'booked-success-animation': justBooked,
      'cancelled-animation': justCancelled
    }"
  >
    <div class="min-w-0 flex-1 mr-2">
      <div class="text-gray-700 tracking-widest truncate">{{ booking.licensePlate }}</div>
      <div class="text-gray-600 text-sm truncate">{{ booking.name }}</div>
    </div>
    <button
      v-if="canCancel && !justCancelled"
      :class="[
        'rounded bg-danger text-white hover:bg-red-700 hover:shadow-lg transition-all duration-200 hover:scale-105 flex items-center justify-center',
        compactCancel ? 'p-1.5' : 'px-4 py-2'
      ]"
      @click="handleCancel"
      :title="compactCancel ? 'Avboka' : ''"
    >
      <X v-if="compactCancel" :size="18" />
      <span v-else>Avboka</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { X } from 'lucide-vue-next';

const props = defineProps<{
  spot: number;
  booking: { licensePlate: string; name: string } | undefined;
  canCancel: boolean;
  disabled: boolean;
  compactCancel?: boolean;
}>();

const emit = defineEmits<{
  book: [spot: number];
  cancel: [spot: number];
}>();

const justBooked = ref(false);
const justCancelled = ref(false);
const previousBooking = ref<{ licensePlate: string; name: string } | undefined>(undefined);

// Watch for new bookings
watch(() => props.booking, (newBooking, oldBooking) => {
  // If booking appears (was undefined, now defined), trigger booked animation
  if (!oldBooking && newBooking) {
    justBooked.value = true;
    setTimeout(() => {
      justBooked.value = false;
    }, 1000);
  }
  
  // Note: We don't trigger cancelled animation here because handleCancel does it immediately
  // This watch is only for detecting when bookings appear (for booked animation)
  
  previousBooking.value = newBooking;
}, { immediate: true });

// Handle cancel click - trigger animation immediately
function handleCancel() {
  justCancelled.value = true;
  setTimeout(() => {
    justCancelled.value = false;
  }, 1000);
  emit('cancel', props.spot);
}
</script>

<style scoped>
@keyframes bookedSuccess {
  0% {
    box-shadow: 0 0 0 0 rgba(115, 178, 52, 0.7);
    outline: 2px solid transparent;
  }
  50% {
    box-shadow: 0 0 0 10px rgba(115, 178, 52, 0);
    outline: 2px solid #73B234;
  }
  100% {
    box-shadow: 0 0 0 0 rgba(115, 178, 52, 0);
    outline: 2px solid transparent;
  }
}

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

.booked-success-animation {
  animation: bookedSuccess 0.6s ease-out;
  background-color: #d4edda;
}

.cancelled-animation {
  animation: cancelled 0.6s ease-out;
  outline: 2px solid transparent;
}
</style>

