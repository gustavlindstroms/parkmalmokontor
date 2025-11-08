<template>
  <div class="grid grid-cols-[auto_1fr] gap-3 items-center">
    <div class="font-semibold text-lg min-w-[80px]">Plats {{ spot }}</div>
    
    <button
      v-if="!booking"
      class="w-full p-6 rounded-lg bg-success text-white text-lg hover:bg-green-600 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      @click="$emit('book', spot)"
      :disabled="disabled"
    >
      Ledig
    </button>

    <div v-else class="w-full p-4 rounded-lg bg-gray-200 flex items-center justify-between">
      <div>
        <div class="text-gray-700 tracking-widest">{{ booking.licensePlate }}</div>
        <div class="text-gray-600 text-sm">{{ booking.name }}</div>
      </div>
      <button
        v-if="canCancel"
        class="px-4 py-2 rounded bg-danger text-white hover:bg-red-700 hover:shadow-lg transition-all duration-200 hover:scale-105"
        @click="$emit('cancel', spot)"
      >
        Avboka
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  spot: number;
  booking?: { licensePlate: string; name: string };
  canCancel?: boolean;
  disabled?: boolean;
}>();

defineEmits<{
  book: [spot: number];
  cancel: [spot: number];
}>();
</script>

