<template>
  <div class="space-y-4 max-w-md md:max-w-2xl mx-auto">
    <h1 class="font-semibold text-xl">Mina bilar</h1>

    <!-- Add Car Form -->
    <div class="border-b border-gray-200 pb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">Lägg till ny bil</label>
      <div class="flex gap-2">
        <input
          v-model="newPlate"
          @input="formatPlate"
          @keyup.enter="handleAddCar"
          maxlength="6"
          class="flex-1 p-3 border rounded tracking-widest uppercase"
          placeholder="ABC123"
          :disabled="adding"
        />
        <button
          @click="handleAddCar"
          class="px-4 py-3 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          :disabled="adding || !newPlate.trim()"
        >
          {{ adding ? 'Lägger till...' : 'Lägg till' }}
        </button>
      </div>
      <div v-if="addError" class="mt-2 bg-red-50 border-2 border-red-300 rounded-lg p-3">
        <div class="flex items-start gap-2">
          <XCircle class="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p class="text-red-800 text-sm">{{ addError }}</p>
        </div>
      </div>
    </div>

    <!-- Cars List -->
    <div>
      <h3 class="text-sm font-medium text-gray-700 mb-3">
        Mina bilar
      </h3>
      <div v-if="loading" class="text-center py-8 text-gray-500">
        Laddar...
      </div>
      <div v-else-if="cars.length === 0" class="text-center py-8 text-gray-500">
        <p>Inga bilar tillagda ännu</p>
        <p class="text-xs mt-1">Lägg till en bil ovan för att komma igång</p>
      </div>
      <div v-else class="space-y-2">
        <div
          v-for="car in cars"
          :key="car.id"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
        >
          <div class="font-mono text-lg tracking-widest text-gray-800">
            {{ car.licensePlate }}
          </div>
          <button
            @click="handleRemoveCar(car.id)"
            class="px-3 py-1.5 rounded bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            :disabled="removing === car.id"
          >
            {{ removing === car.id ? 'Tar bort...' : 'Ta bort' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, computed } from 'vue';
import { XCircle } from 'lucide-vue-next';
import { useCars } from '../composables/useCars';
import type { User } from 'firebase/auth';

const user = inject<{ value: User | null }>('user');
if (!user) {
  throw new Error('User is required');
}

// Use computed to reactively access user
const userValue = computed(() => {
  if (!user.value) {
    throw new Error('User is required');
  }
  return user.value;
});

const { cars, loading, addCar, removeCar } = useCars(userValue.value.uid);

const newPlate = ref('');
const adding = ref(false);
const addError = ref('');
const removing = ref<string | null>(null);

function formatPlate() {
  newPlate.value = newPlate.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

async function handleAddCar() {
  addError.value = '';
  const plate = newPlate.value.trim();
  
  if (plate.length !== 6) {
    addError.value = 'Registreringsnummer måste vara exakt 6 tecken';
    return;
  }

  adding.value = true;
  try {
    await addCar(plate);
    newPlate.value = ''; // Clear input on success
  } catch (err: any) {
    addError.value = err.message || 'Kunde inte lägga till bil';
  } finally {
    adding.value = false;
  }
}

async function handleRemoveCar(carId: string) {
  removing.value = carId;
  try {
    await removeCar(carId);
  } catch (err: any) {
    console.error('Error removing car:', err);
    // Could show error toast here, but for now just log
  } finally {
    removing.value = null;
  }
}
</script>

<style scoped>
</style>

