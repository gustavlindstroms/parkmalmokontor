<template>
  <div class="flex items-center justify-center gap-2">
    <button
      type="button"
      class="px-4 py-2 border rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[60px]"
      @click="goToPreviousDay"
      :disabled="isToday"
      title="Föregående dag"
    >
      ←
    </button>
    <input
      type="date"
      class="p-2 border rounded"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <button
      type="button"
      class="px-4 py-2 border rounded hover:bg-gray-50 transition-colors min-w-[60px]"
      @click="goToNextDay"
      title="Nästa dag"
    >
      →
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const isToday = computed(() => {
  const today = new Date().toISOString().slice(0, 10);
  return props.modelValue === today;
});

function goToPreviousDay() {
  const date = new Date(props.modelValue);
  date.setDate(date.getDate() - 1);
  emit('update:modelValue', date.toISOString().slice(0, 10));
}

function goToNextDay() {
  const date = new Date(props.modelValue);
  date.setDate(date.getDate() + 1);
  emit('update:modelValue', date.toISOString().slice(0, 10));
}
</script>

