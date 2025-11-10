import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Empty string as third parameter loads all env variables regardless of prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [vue()],
    // Define environment variables without VITE_ prefix
    define: {
      'import.meta.env.FIREBASE_API_KEY': JSON.stringify(env.FIREBASE_API_KEY),
      'import.meta.env.FIREBASE_AUTH_DOMAIN': JSON.stringify(env.FIREBASE_AUTH_DOMAIN),
      'import.meta.env.FIREBASE_PROJECT_ID': JSON.stringify(env.FIREBASE_PROJECT_ID),
      'import.meta.env.FIREBASE_STORAGE_BUCKET': JSON.stringify(env.FIREBASE_STORAGE_BUCKET),
      'import.meta.env.FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.FIREBASE_MESSAGING_SENDER_ID),
      'import.meta.env.FIREBASE_APP_ID': JSON.stringify(env.FIREBASE_APP_ID),
    },
  };
});


