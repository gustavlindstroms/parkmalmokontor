<template>
  <div class="relative">
    <button
      @click="toggleMenu"
      class="flex items-center gap-2 hover:opacity-80 transition-opacity"
    >
      <img
        v-if="user.photoURL"
        :src="user.photoURL"
        :alt="user.displayName || user.email || 'User'"
        class="w-8 h-8 rounded-full border-2 border-gray-300"
      />
      <div
        v-else
        class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium text-sm"
      >
        {{ userInitials }}
      </div>
      <ChevronDown
        class="w-4 h-4 text-gray-600 transition-transform"
        :class="{ 'rotate-180': menuOpen }"
      />
    </button>
    
    <div
      v-if="menuOpen"
      class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
    >
      <div class="px-4 py-3 border-b border-gray-200">
        <p class="text-sm font-medium text-gray-900">{{ user.displayName || 'Användare' }}</p>
        <p class="text-xs text-gray-500 truncate">{{ user.email }}</p>
      </div>
      <button
        @click="handleManageCars"
        class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
      >
        <Car class="w-4 h-4" />
        Hantera bilar{{ carCount > 0 ? ` (${carCount})` : '' }}
      </button>
      <button
        @click="handleLogout"
        class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
      >
        <LogOut class="w-4 h-4" />
        Logga ut
      </button>
    </div>
    <CarManagementModal v-if="showCarModal" :user="user" @close="showCarModal = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { ChevronDown, LogOut, Car } from 'lucide-vue-next';
import { signOut } from '../firebase';
import { useCars } from '../composables/useCars';
import CarManagementModal from './CarManagementModal.vue';
import type { User } from 'firebase/auth';

const props = defineProps<{
  user: User;
}>();

const menuOpen = ref(false);
const showCarModal = ref(false);
let clickOutsideHandler: ((event: MouseEvent) => void) | null = null;

const { cars } = useCars(props.user.uid);
const carCount = computed(() => cars.value.length);

const userInitials = computed(() => {
  const name = props.user.displayName || props.user.email || '';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name[0]?.toUpperCase() || '?';
});

function toggleMenu() {
  menuOpen.value = !menuOpen.value;
}

function handleManageCars() {
  menuOpen.value = false;
  showCarModal.value = true;
}

async function handleLogout() {
  try {
    await signOut();
    menuOpen.value = false;
  } catch (error) {
    console.error('Logout error:', error);
  }
}

onMounted(() => {
  // Close menu when clicking outside
  clickOutsideHandler = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      menuOpen.value = false;
    }
  };
  document.addEventListener('click', clickOutsideHandler);
});

onBeforeUnmount(() => {
  if (clickOutsideHandler) {
    document.removeEventListener('click', clickOutsideHandler);
  }
});
</script>

<style scoped>
</style>

