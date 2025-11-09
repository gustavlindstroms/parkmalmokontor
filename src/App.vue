<template>
  <div class="h-full flex">
    <!-- Sidebar for larger viewports -->
    <aside v-if="user && !authLoading" class="hidden md:flex md:flex-col md:w-64 md:bg-paper md:border-r md:border-gray-200 md:h-full md:flex-shrink-0">
      <div class="p-4 border-b border-gray-200">
        <h1 class="font-semibold text-lg text-black">Parkeringsbokning Malmö</h1>
      </div>
      <div class="flex-1 p-4">
        <UserMenu :user="user" :sidebar-mode="true" />
      </div>
      <footer class="mt-auto text-center text-xs text-gray-500 py-4 flex flex-col items-center gap-2 border-t border-gray-200">
        <img src="/src/img/Forefront_logotype_black.png" alt="Forefront" class="h-6 rounded" />
        <span>© 2025</span>
      </footer>
    </aside>

    <!-- Main content area -->
    <main class="flex-1 mx-auto md:mt-8 h-full flex flex-col">
      <header v-if="user" class="md:hidden flex-shrink-0">
        <UserMenu :user="user" :sidebar-mode="false" />
      </header>
      <section class="flex-1 p-4 overflow-y-auto min-h-0">
        <LoginView v-if="!authLoading && !user" @logged-in="onLoggedIn" />
        <router-view v-else-if="!authLoading && user" />
      </section>
      <footer class="mt-auto text-center text-xs text-gray-500 py-4 flex flex-col items-center gap-2 md:hidden flex-shrink-0">
        <img src="/src/img/Forefront_logotype_black.png" alt="Forefront" class="h-6 rounded" />
        <span>© 2025</span>
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, provide } from 'vue';
import LoginView from './views/LoginView.vue';
import UserMenu from './components/UserMenu.vue';
import { watchAuth } from './firebase';
import type { User } from 'firebase/auth';

const user = ref<User | null>(null);
const authLoading = ref(true);
let unSub: (() => void) | null = null;

onMounted(() => {
  unSub = watchAuth((u) => {
    user.value = u;
    authLoading.value = false;
  });
});

// Provide user to child components
provide('user', user);

onBeforeUnmount(() => {
  if (unSub) unSub();
});

function onLoggedIn() {
  // no-op; auth watcher will update
}
</script>

<style scoped>
</style>


