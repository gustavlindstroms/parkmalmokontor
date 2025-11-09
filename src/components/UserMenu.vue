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

  <!-- Mobile mode -->
  <div v-else class="relative">
    <!-- Clickable header -->
    <button
      @click="toggleMenu"
      class="w-full p-4 bg-paper text-black flex items-center justify-between hover:bg-gray-50 transition-colors"
    >
      <div class="flex flex-col items-start">
        <h1 class="font-semibold text-xl">Parkeringsbokning Malmö</h1>
        <p class="text-sm text-gray-600 mt-0.5">{{ user.displayName || user.email || 'Användare' }}</p>
      </div>
      <Menu
        v-if="!menuOpen"
        class="w-6 h-6 text-gray-600 flex-shrink-0"
      />
      <X
        v-else
        class="w-6 h-6 text-gray-600 flex-shrink-0"
      />
    </button>
    
    <!-- Full-screen mobile menu overlay -->
    <div
      v-if="menuOpen"
      class="fixed inset-0 z-50 bg-white flex flex-col"
    >
      <!-- Header with close button -->
      <div class="p-4 border-b border-gray-200 flex items-center justify-between bg-paper">
        <div class="flex flex-col">
          <h2 class="font-semibold text-lg text-black">Meny</h2>
          <p class="text-sm text-gray-600 mt-0.5">{{ user.displayName || 'Användare' }}</p>
          <p class="text-xs text-gray-500 truncate">{{ user.email }}</p>
        </div>
        <button
          @click="toggleMenu"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X class="w-6 h-6 text-gray-600" />
        </button>
      </div>
      
      <!-- Menu items -->
      <nav class="flex-1 overflow-y-auto py-4">
        <button
          @click="handleViewHome"
          class="w-full text-left px-6 py-4 text-base text-gray-700 hover:bg-gray-100 active:bg-gray-200 flex items-center gap-4 transition-colors"
          :class="{ 'bg-gray-100': isActiveRoute('/') }"
        >
          <Home class="w-6 h-6" />
          <span class="font-medium">Boka parkering</span>
        </button>
        <button
          @click="handleViewBookings"
          class="w-full text-left px-6 py-4 text-base text-gray-700 hover:bg-gray-100 active:bg-gray-200 flex items-center gap-4 transition-colors"
          :class="{ 'bg-gray-100': isActiveRoute('/bookings') }"
        >
          <Calendar class="w-6 h-6" />
          <span class="font-medium">Mina bokningar</span>
        </button>
        <button
          @click="handleManageCars"
          class="w-full text-left px-6 py-4 text-base text-gray-700 hover:bg-gray-100 active:bg-gray-200 flex items-center gap-4 transition-colors"
          :class="{ 'bg-gray-100': isActiveRoute('/cars') }"
        >
          <Car class="w-6 h-6" />
          <span class="font-medium">Hantera bilar</span>
        </button>
      </nav>
      
      <!-- Logout button at bottom -->
      <div class="border-t border-gray-200 p-4">
        <button
          @click="handleLogout"
          class="w-full text-left px-6 py-4 text-base text-red-600 hover:bg-red-50 active:bg-red-100 flex items-center gap-4 transition-colors rounded-lg"
        >
          <LogOut class="w-6 h-6" />
          <span class="font-medium">Logga ut</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { Menu, X, LogOut, Car, Calendar, Home } from 'lucide-vue-next';
import { signOut } from '../firebase';
import type { User } from 'firebase/auth';

const props = defineProps<{
  user: User;
  sidebarMode?: boolean;
}>();

const router = useRouter();
const menuOpen = ref(false);
let cleanupHandler: (() => void) | null = null;

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
  // Close menu on escape key (for mobile full-screen menu)
  if (!props.sidebarMode) {
    const escapeHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menuOpen.value) {
        menuOpen.value = false;
      }
    };
    document.addEventListener('keydown', escapeHandler);
    
    // Store cleanup function
    cleanupHandler = () => {
      document.removeEventListener('keydown', escapeHandler);
    };
  }
});

onBeforeUnmount(() => {
  if (cleanupHandler) {
    cleanupHandler();
  }
});
</script>

<style scoped>
</style>

