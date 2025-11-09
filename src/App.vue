<template>
  <main class="mx-auto max-w-md min-h-screen flex flex-col">
    <header class="p-4 text-center font-semibold text-xl bg-paper text-black relative">
      Parkeringsbokning Malmö
      <div v-if="user" class="absolute top-0 right-0 h-full flex items-center pr-4">
        <UserMenu :user="user" />
      </div>
    </header>
    <section class="flex-1 p-4">
      <LoginView v-if="!authLoading && !user" @logged-in="onLoggedIn" />
      <BookingView v-else-if="!authLoading && user" :user="user" />
    </section>
    <footer class="mt-auto text-center text-xs text-gray-500 py-4 flex flex-col items-center gap-2">
      <img src="/src/img/Forefront_logotype_black.png" alt="Forefront" class="h-6 rounded" />
      <span>© 2025</span>
    </footer>
  </main>
  
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import LoginView from './views/LoginView.vue';
import BookingView from './views/BookingView.vue';
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

onBeforeUnmount(() => {
  if (unSub) unSub();
});

function onLoggedIn() {
  // no-op; auth watcher will update
}
</script>

<style scoped>
</style>


