<template>
  <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
    <div class="flex items-start gap-2">
      <AlertTriangle class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
      <div>
        <p class="text-blue-800 font-medium">{{ title }}</p>
        <p class="text-blue-700 text-sm mt-1">{{ message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next';

defineProps<{
  title: string;
  message: string;
}>();
</script>

