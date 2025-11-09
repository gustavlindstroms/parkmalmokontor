import { createRouter, createWebHistory } from 'vue-router';
import BookingView from './views/BookingView.vue';
import BookingsView from './views/BookingsView.vue';
import CarsView from './views/CarsView.vue';

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
    {
      path: '/cars',
      name: 'cars',
      component: CarsView,
    },
  ],
});

export default router;

