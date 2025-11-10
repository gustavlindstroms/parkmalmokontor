<template>
  <div class="bg-red-50 border-2 border-red-300 rounded-lg p-4">
    <div class="flex items-start gap-2">
      <XCircle class="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
      <p class="text-red-800 font-medium">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { XCircle } from 'lucide-vue-next';

defineProps<{
  message: string;
}>();
</script>

