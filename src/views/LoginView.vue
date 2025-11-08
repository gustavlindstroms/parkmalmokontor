<template>
  <div class="space-y-4">
    <div class="w-full flex justify-center py-6">
      <img src="/src/img/Forefront_logotype_black.png" alt="Forefront" class="h-10" />
    </div>
    <p class="text-sm text-gray-600">Logga in med Google.</p>
    <button
      :disabled="loading"
      class="w-full p-4 rounded-lg bg-white border-2 border-gray-300 hover:border-gray-400 disabled:opacity-50 flex items-center justify-center gap-3 transition-colors"
      @click="login"
    >
      <svg class="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      <span class="font-medium text-gray-700">{{ loading ? 'Loggar in...' : 'Logga in med Google' }}</span>
    </button>
    <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
    
    <div class="pt-4 border-t border-gray-200 mt-6">
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { signInWithGoogle } from '../firebase';

const emit = defineEmits<{ (e: 'logged-in'): void }>();

const loading = ref(false);
const error = ref('');

async function login() {
  error.value = '';
  loading.value = true;
  try {
    await signInWithGoogle();
    emit('logged-in');
  } catch (e: any) {
    const code = e?.code || '';
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      // User closed the popup, don't show an error
      error.value = '';
    } else if (code === 'auth/popup-blocked') {
      error.value = 'Popup blockerades. Tillåt popups för denna sida och försök igen.';
    } else if (code === 'auth/operation-not-allowed') {
      error.value = 'Google sign-in är inte aktiverad i Firebase. Aktivera i Authentication → Sign-in method → Google.';
    } else if (code === 'auth/network-request-failed') {
      error.value = 'Nätverksfel. Kontrollera internet, adblock/VPN och tillåt localhost.';
    } else if (code === 'auth/invalid-api-key') {
      error.value = 'Ogiltig API-nyckel. Verifiera firebaseConfig i src/firebase.ts.';
    } else if (code) {
      error.value = `Kunde inte logga in (${code}).`;
    } else {
      error.value = 'Kunde inte logga in.';
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
</style>


