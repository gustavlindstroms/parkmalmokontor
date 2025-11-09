import { createRouter, createWebHistory } from 'vue-router';
import BookingView from './views/BookingView.vue';
import BookingsView from './views/BookingsView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'booking',
      component: BookingView,
    },
    {
      path: '/bookings',
      name: 'bookings',
      component: BookingsView,
    },
  ],
});

export default router;

