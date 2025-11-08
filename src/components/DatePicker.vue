<template>
  <div class="flex items-center gap-3">
    <label class="text-sm">Datum</label>
    <input
      type="date"
      class="p-2 border rounded"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string;
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

