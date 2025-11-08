<template>
  <main class="mx-auto max-w-md min-h-screen flex flex-col">
    <header class="p-4 bg-paper text-black flex items-center justify-between">
      <span class="font-semibold text-xl">Parkeringsbokning Malmö</span>
      <button
        v-if="user"
        class="px-3 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300 transition disabled:opacity-50"
        :disabled="loggingOut"
        @click="logout"
      >
        Logga ut
      </button>
    </header>
    <section class="flex-1 p-4">
      <LoginView v-if="!user" @logged-in="onLoggedIn" />
      <BookingView v-else :user-id="user.uid" />
    </section>
    <div class="pb-4 px-4">
      <a
        href="https://kundportal.pmalmo.se/account?ReturnUrl=%2F"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center justify-center gap-2 w-full p-3 rounded-lg border-2 border-gray-300 hover:border-primary hover:bg-gray-50 transition-colors"
      >
        <img src="/src/img/p_malmo_logo.png" alt="P-Malmö" class="h-6" />
        <span class="text-sm font-medium text-gray-700">Till P-Malmös kundportal</span>
      </a>
    </div>
    <footer class="mt-auto text-center text-xs text-gray-500 pt-2 pb-4 flex flex-col items-center gap-2">
      <img src="/src/img/Forefront_logotype_black.png" alt="Forefront" class="h-6 rounded" />
      <span>© 2025</span>
    </footer>
  </main>
  
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import LoginView from './views/LoginView.vue';
import BookingView from './views/BookingView.vue';
import { watchAuth, signOutUser } from './firebase';

const user = ref<{ uid: string } | null>(null);
const loggingOut = ref(false);
let unSub: (() => void) | null = null;

onMounted(() => {
  unSub = watchAuth((u) => {
    user.value = u ? { uid: u.uid } : null;
  });
});

onBeforeUnmount(() => {
  if (unSub) unSub();
});

function onLoggedIn() {
  // no-op; auth watcher will update
}

async function logout() {
  if (loggingOut.value) return;
  loggingOut.value = true;
  try {
    await signOutUser();
  } catch (e) {
    console.error('Logout failed', e);
  } finally {
    loggingOut.value = false;
  }
}
</script>

<style scoped>
</style>
