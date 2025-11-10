<template>
  <div class="flex items-center justify-center gap-2 relative">
    <button
      type="button"
      class="px-4 py-2 border rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[60px] relative z-10"
      @click="goToPrevious"
      :disabled="isTodayComputed && !weekMode"
      :title="weekMode ? 'Föregående vecka' : 'Föregående dag'"
    >
      ←
    </button>
    <!-- Mobile display: formatted date with weekday -->
    <div class="md:hidden relative">
      <div 
        class="p-2 border rounded text-center min-w-[120px] cursor-pointer pointer-events-none"
      >
        <div class="font-medium">{{ formattedDateMobile }}</div>
      </div>
      <input
        ref="mobileDateInputRef"
        type="date"
        class="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
        :value="displayDate"
        @input="handleDateInput($event)"
        @click="handleInputClick"
      />
    </div>
    <!-- Desktop: native date input -->
    <input
      type="date"
      class="hidden md:block p-2 border rounded"
      :value="displayDate"
      @input="handleDateInput($event)"
    />
    <button
      type="button"
      class="px-4 py-2 border rounded hover:bg-gray-50 transition-colors min-w-[60px] relative z-10"
      @click="goToNext"
      :title="weekMode ? 'Nästa vecka' : 'Nästa dag'"
    >
      →
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  getWeekStartString,
  isToday,
  formatDateMobile,
  addDaysToString,
  subDaysToString,
} from '../utils/dateUtils';

const props = defineProps<{
  modelValue: string;
  weekMode?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const mobileDateInputRef = ref<HTMLInputElement | null>(null);

// Display date: Monday when in week mode, otherwise the selected date
const displayDate = computed(() => {
  if (props.weekMode) {
    return getWeekStartString(props.modelValue);
  }
  return props.modelValue;
});

const isTodayComputed = computed(() => {
  return isToday(displayDate.value);
});

// Format date for mobile display: "Mån 10 nov" (without dots)
const formattedDateMobile = computed(() => {
  return formatDateMobile(displayDate.value);
});

function goToPrevious() {
  const newDate = props.weekMode 
    ? subDaysToString(displayDate.value, 7)  // Go to previous week
    : subDaysToString(displayDate.value, 1); // Go to previous day
  emit('update:modelValue', newDate);
}

function handleDateInput(event: Event) {
  const selectedDate = (event.target as HTMLInputElement).value;
  if (props.weekMode) {
    // In week mode, always use Monday of the selected week
    const monday = getWeekStartString(selectedDate);
    emit('update:modelValue', monday);
  } else {
    emit('update:modelValue', selectedDate);
  }
}

function goToNext() {
  const newDate = props.weekMode 
    ? addDaysToString(displayDate.value, 7)  // Go to next week
    : addDaysToString(displayDate.value, 1); // Go to next day
  emit('update:modelValue', newDate);
}

function handleInputClick(event: Event) {
  const input = event.target as HTMLInputElement;
  
  // On mobile, we need to ensure the input is focused and try showPicker if available
  input.focus();
  
  // Try using showPicker API if available (modern browsers)
  if ('showPicker' in HTMLInputElement.prototype && input.showPicker) {
    try {
      input.showPicker();
    } catch (err) {
      // Fallback: ensure click is handled
      setTimeout(() => {
        input.click();
      }, 0);
    }
  } else {
    // For browsers without showPicker, the click should work
    setTimeout(() => {
      input.click();
    }, 0);
  }
}
</script>

