<template>
  <!-- Sidebar mode -->
  <div v-if="sidebarMode" class="flex flex-col h-full">
    <div class="mb-6">
      <div class="flex items-center gap-3 mb-4">
        <img
          v-if="user.photoURL"
          :src="user.photoURL"
          :alt="user.displayName || user.email || 'User'"
          class="w-12 h-12 rounded-full border-2 border-gray-300"
        />
        <div
          v-else
          class="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium"
        >
          {{ userInitials }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">{{ user.displayName || 'Användare' }}</p>
          <p class="text-xs text-gray-500 truncate">{{ user.email }}</p>
        </div>
      </div>
    </div>
    
    <nav class="flex flex-col gap-1">
      <button
        @click="handleViewHome"
        class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-3 transition-colors"
        :class="{ 'bg-gray-100': isActiveRoute('/') }"
      >
        <Home class="w-5 h-5" />
        Boka parkering
      </button>
      <button
        @click="handleViewBookings"
        class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-3 transition-colors"
        :class="{ 'bg-gray-100': isActiveRoute('/bookings') }"
      >
        <Calendar class="w-5 h-5" />
        Mina bokningar
      </button>
      <button
        @click="handleManageCars"
        class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-3 transition-colors"
        :class="{ 'bg-gray-100': isActiveRoute('/cars') }"
      >
        <Car class="w-5 h-5" />
        Hantera bilar
      </button>
      <button
        @click="handleLogout"
        class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-3 transition-colors mt-auto"
      >
        <LogOut class="w-5 h-5" />
        Logga ut
      </button>
    </nav>
  </div>

  <!-- Dropdown mode (mobile) -->
  <div v-else class="relative">
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
        @click="handleViewHome"
        class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
        :class="{ 'bg-gray-100': isActiveRoute('/') }"
      >
        <Home class="w-4 h-4" />
        Boka parkering
      </button>
      <button
        @click="handleViewBookings"
        class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
        :class="{ 'bg-gray-100': isActiveRoute('/bookings') }"
      >
        <Calendar class="w-4 h-4" />
        Mina bokningar
      </button>
      <button
        @click="handleManageCars"
        class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
        :class="{ 'bg-gray-100': isActiveRoute('/cars') }"
      >
        <Car class="w-4 h-4" />
        Hantera bilar
      </button>
      <button
        @click="handleLogout"
        class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
      >
        <LogOut class="w-4 h-4" />
        Logga ut
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { ChevronDown, LogOut, Car, Calendar, Home } from 'lucide-vue-next';
import { signOut } from '../firebase';
import type { User } from 'firebase/auth';

const props = defineProps<{
  user: User;
  sidebarMode?: boolean;
}>();

const router = useRouter();
const menuOpen = ref(false);
let clickOutsideHandler: ((event: MouseEvent) => void) | null = null;

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

function handleViewHome() {
  menuOpen.value = false;
  router.push('/');
}

function handleViewBookings() {
  menuOpen.value = false;
  router.push('/bookings');
}

function handleManageCars() {
  menuOpen.value = false;
  router.push('/cars');
}

async function handleLogout() {
  try {
    await signOut();
    menuOpen.value = false;
  } catch (error) {
    console.error('Logout error:', error);
  }
}

function isActiveRoute(path: string): boolean {
  return router.currentRoute.value.path === path;
}

onMounted(() => {
  // Close menu when clicking outside (only for dropdown mode)
  if (!props.sidebarMode) {
    clickOutsideHandler = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        menuOpen.value = false;
      }
    };
    document.addEventListener('click', clickOutsideHandler);
  }
});

onBeforeUnmount(() => {
  if (clickOutsideHandler) {
    document.removeEventListener('click', clickOutsideHandler);
  }
});
</script>

<style scoped>
</style>

