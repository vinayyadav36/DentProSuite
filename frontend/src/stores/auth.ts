import { defineStore } from 'pinia';
import type { User } from '../../../shared/types/index.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as Omit<User, 'passwordHash'> | null,
    token: localStorage.getItem('token') || null,
  }),
  actions: {
    setAuth(user: Omit<User, 'passwordHash'>, token: string) {
      this.user = user;
      this.token = token;
      localStorage.setItem('token', token);
      localStorage.setItem('role', user.role);
    },
    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('role');
    }
  }
});
