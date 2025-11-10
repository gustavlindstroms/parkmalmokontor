<template>
  <div v-if="spot" class="fixed top-0 left-0 right-0 bottom-0 z-50 bg-black/50 flex items-center justify-center p-4 !mt-0">
    <div class="bg-paper w-full max-w-md rounded-lg p-4 space-y-4 shadow-lg">
      <div class="font-semibold text-lg">Boka plats {{ spot }}</div>
      <div>
        <label class="block text-sm text-gray-600 mb-3">Välj bil</label>
        <div class="space-y-2">
          <button
            v-for="car in cars"
            :key="car.id"
            @click="$emit('select', car.id)"
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
      <ErrorAlert v-if="error" :message="error" />
      <div class="pt-2">
        <button 
          class="w-full p-3 rounded bg-gray-200 hover:bg-gray-300 hover:shadow-md transition-all duration-200" 
          @click="$emit('close')" 
          :disabled="saving"
        >
          Avbryt
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ErrorAlert from './ErrorAlert.vue';
import type { Car } from '../composables/useCars';

defineProps<{
  spot: number | null;
  cars: Car[];
  saving: boolean;
  error?: string;
}>();

defineEmits<{
  select: [carId: string];
  close: [];
}>();
</script>

