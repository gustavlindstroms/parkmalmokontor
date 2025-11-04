<template>
  <div class="space-y-4">
    <div class="w-full flex justify-center py-6">
      <img src="/src/img/Forefront_logotype_black.png" alt="Forefront" class="h-10" />
    </div>
    <p class="text-sm text-gray-600">Logga in med lösenord.</p>
    <input
      v-model="password"
      type="password"
      autocomplete="current-password"
      autocapitalize="off"
      autocorrect="off"
      spellcheck="false"
      class="w-full p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Lösenord"
      @keyup.enter="login"
    />
    <button
      :disabled="loading"
      class="w-full p-4 rounded-lg bg-primary text-white disabled:opacity-50"
      @click="login"
    >
      {{ loading ? 'Loggar in...' : 'Logga in' }}
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
import { signInAnon } from '../firebase';

const emit = defineEmits<{ (e: 'logged-in'): void }>();

const password = ref('');
const loading = ref(false);
const error = ref('');

async function login() {
  error.value = '';
  if (password.value !== 'givemeinternet') {
    error.value = 'Fel lösenord.';
    return;
  }
  loading.value = true;
  try {
    await signInAnon();
    emit('logged-in');
  } catch (e: any) {
    const code = e?.code || '';
    if (code === 'auth/operation-not-allowed') {
      error.value = 'Anonymous sign-in är inte aktiverad i Firebase. Aktivera i Authentication → Sign-in method → Anonymous.';
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


