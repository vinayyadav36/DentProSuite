<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
      <h1 class="text-xl font-bold">DentProSuite</h1>
      <div v-if="auth.user" class="flex gap-4 items-center">
        <span class="text-sm">Logged in as: {{ auth.user.name }} ({{ auth.user.role }})</span>
        <button @click="logout" class="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded">Logout</button>
      </div>
    </header>
    <main class="flex-grow p-4">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from './stores/auth.js';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

const logout = () => {
  auth.logout();
  router.push('/login');
};
</script>
