<template>
  <div class="flex items-center justify-center gap-2 relative">
    <button
      type="button"
      class="px-4 py-2 border rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[60px] relative z-10"
      @click="goToPrevious"
      :disabled="isToday && !weekMode"
      :title="weekMode ? 'Föregående vecka' : 'Föregående dag'"
    >
      ←
    </button>
    <!-- Mobile display: formatted date with weekday -->
    <div class="md:hidden relative">
      <div 
        class="p-2 border rounded text-center min-w-[120px] cursor-pointer"
        @click="() => mobileDateInputRef?.click()"
      >
        <div class="font-medium">{{ formattedDateMobile }}</div>
      </div>
      <input
        ref="mobileDateInputRef"
        type="date"
        class="absolute opacity-0 pointer-events-none"
        :value="displayDate"
        @input="handleDateInput($event)"
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
import { parseISO, startOfWeek, addDays, subDays, format, isToday as isTodayFn } from 'date-fns';
import { sv } from 'date-fns/locale';

const props = defineProps<{
  modelValue: string;
  weekMode?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const mobileDateInputRef = ref<HTMLInputElement | null>(null);

// Get week start (Monday) for a given date string
// Sunday belongs to the week that started on the previous Monday
function getWeekStart(dateString: string): Date {
  const date = parseISO(dateString);
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  if (dayOfWeek === 0) {
    // If it's Sunday, go back 6 days to get to the Monday of that week
    return subDays(date, 6);
  } else {
    // Otherwise, return the Monday of the current week
    return startOfWeek(date, { weekStartsOn: 1 });
  }
}

// Display date: Monday when in week mode, otherwise the selected date
const displayDate = computed(() => {
  if (props.weekMode) {
    const monday = getWeekStart(props.modelValue);
    return format(monday, 'yyyy-MM-dd');
  }
  return props.modelValue;
});

const isToday = computed(() => {
  const date = parseISO(displayDate.value);
  return isTodayFn(date);
});

// Format date for mobile display: "Mån 10 nov" (without dots)
const formattedDateMobile = computed(() => {
  const date = parseISO(displayDate.value);
  const weekdayShort = format(date, 'EEE', { locale: sv });
  const day = date.getDate();
  const monthShort = format(date, 'MMM', { locale: sv }).replace(/\./g, '');
  return `${weekdayShort} ${day} ${monthShort}`;
});

function goToPrevious() {
  const date = parseISO(displayDate.value);
  const newDate = props.weekMode 
    ? subDays(date, 7)  // Go to previous week
    : subDays(date, 1); // Go to previous day
  emit('update:modelValue', format(newDate, 'yyyy-MM-dd'));
}

function handleDateInput(event: Event) {
  const selectedDate = (event.target as HTMLInputElement).value;
  if (props.weekMode) {
    // In week mode, always use Monday of the selected week
    const monday = getWeekStart(selectedDate);
    emit('update:modelValue', format(monday, 'yyyy-MM-dd'));
  } else {
    emit('update:modelValue', selectedDate);
  }
}

function goToNext() {
  const date = parseISO(displayDate.value);
  const newDate = props.weekMode 
    ? addDays(date, 7)  // Go to next week
    : addDays(date, 1); // Go to next day
  emit('update:modelValue', format(newDate, 'yyyy-MM-dd'));
}
</script>

