<template>
  <div v-if="spot && booking" class="fixed top-0 left-0 right-0 bottom-0 z-50 bg-black/50 flex items-center justify-center p-4 !mt-0">
    <div class="bg-paper w-full max-w-md rounded-lg p-4 space-y-3 shadow-lg">
      <div class="font-semibold text-lg">Bekräfta avbokning</div>
      <div class="space-y-2">
        <p class="text-gray-700">Är du säker på att du vill avboka plats {{ spot }} {{ formattedDate }}?</p>
        <div class="bg-gray-50 p-3 rounded">
          <div class="text-sm text-gray-600">Datum</div>
          <div class="font-semibold">{{ formattedDate }}</div>
          <div class="text-sm text-gray-600 mt-2">Registreringsnummer</div>
          <div class="font-semibold tracking-widest">{{ booking.licensePlate }}</div>
          <div class="text-sm text-gray-600 mt-1">Namn</div>
          <div class="font-semibold">{{ booking.name }}</div>
        </div>
      </div>
      <div class="flex gap-3">
        <button 
          class="flex-1 p-3 rounded bg-gray-200 hover:bg-gray-300 hover:shadow-md transition-all duration-200" 
          @click="$emit('cancel')"
        >
          Avbryt
        </button>
        <button 
          class="flex-1 p-3 rounded bg-red-600 text-white disabled:opacity-50 hover:bg-red-700 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] disabled:hover:scale-100 disabled:hover:bg-red-600" 
          :disabled="cancelling" 
          @click="$emit('confirm')"
        >
          {{ cancelling ? 'Avbokar...' : 'Ja, avboka' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  spot: number | null;
  booking: { licensePlate: string; name: string } | null;
  formattedDate: string;
  cancelling: boolean;
}>();

defineEmits<{
  confirm: [];
  cancel: [];
}>();
</script>

