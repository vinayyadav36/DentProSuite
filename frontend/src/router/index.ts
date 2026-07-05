import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Login from '../pages/Login.vue'
import AdminDashboard from '../pages/AdminDashboard.vue'
import ReceptionDashboard from '../pages/ReceptionDashboard.vue'
import DentistDashboard from '../pages/DentistDashboard.vue'
import PatientPortal from '../pages/PatientPortal.vue'
import PatientFormFiller from '../components/PatientFormFiller.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, roles: ['ADMIN'] }
  },
  {
    path: '/reception',
    name: 'ReceptionDashboard',
    component: ReceptionDashboard,
    meta: { requiresAuth: true, roles: ['RECEPTION'] }
  },
  {
    path: '/dentist',
    name: 'DentistDashboard',
    component: DentistDashboard,
    meta: { requiresAuth: true, roles: ['DENTIST'] }
  },
  {
    path: '/patient',
    name: 'PatientPortal',
    component: PatientPortal,
    meta: { requiresAuth: true, roles: ['PATIENT'] }
  },
  {
    path: '/forms/:id',
    name: 'PatientFormFiller',
    component: PatientFormFiller,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: import.meta.env.VITE_USE_HASH_HISTORY === 'true' ? createWebHashHistory() : createWebHistory(),
  routes
})

router.beforeEach((to, _from) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  if (to.meta.requiresAuth && !token) {
    return '/login'
  }

  if (to.meta.roles && role) {
    const allowedRoles = to.meta.roles as string[]
    if (!allowedRoles.includes(role)) {
      return '/login'
    }
  }

  if (to.path === '/login' && token) {
    if (role === 'ADMIN') return '/admin'
    if (role === 'RECEPTION') return '/reception'
    if (role === 'DENTIST') return '/dentist'
    if (role === 'PATIENT') return '/patient'
    return '/'
  }
})

export default router
