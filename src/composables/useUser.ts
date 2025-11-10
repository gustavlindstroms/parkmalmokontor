import { computed, inject } from 'vue';
import type { User } from 'firebase/auth';

export function useUser() {
  const user = inject<{ value: User | null }>('user');
  
  if (!user) {
    throw new Error('User is required. Make sure you are using this composable within a component that has access to the user context.');
  }

  const userValue = computed(() => {
    if (!user.value) {
      throw new Error('User is required');
    }
    return user.value;
  });

  const userName = computed(() => {
    return userValue.value.displayName || userValue.value.email || 'Användare';
  });

  return {
    user: computed(() => user.value),
    userValue,
    userName,
    userId: computed(() => userValue.value.uid),
  };
}

