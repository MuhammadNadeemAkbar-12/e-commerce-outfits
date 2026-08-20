import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authApi from '@/services/authApi'
import { firebaseLogin as doFirebaseLogin } from '@/services/firebaseAuth'
// Lightweight direct axios instance import for profile hydration after refresh
import axios from '@/api/axios'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(null)
  const isAuthenticated = ref(false)
  const loading = ref(false)
  // Control persistence behavior.
  // The app will persist ONLY the JWT token to localStorage when persistTokenOnly is true.
  // This avoids storing user profile or role in browser storage while allowing the
  // token to survive page refreshes so the session remains active.
  // Set to true to ONLY persist token; false to also persist serialized user + role.
  // We switch this to false now so that after a page refresh your avatar, name
  // and role (needed for "View All Orders") are immediately available without
  // waiting for an API call. If you later want stricter privacy, turn it back
  // to true once backend / hydration is fully reliable.
  const persistTokenOnly = false

  // Getters
  const currentUser = computed(() => user.value)
  const userRole = computed(() => user.value?.role || null)
  const role = computed(() => user.value?.role || null)
  const isLoggedIn = computed(() => isAuthenticated.value)
  const isLoading = computed(() => loading.value)

  // Actions
  const login = async (credentials) => {
    loading.value = true
    try {
      const response = await authApi.login(credentials)

      if (response.success) {
        user.value = response.user
        token.value = response.token
        isAuthenticated.value = true

        // Optionally persist ONLY the token to localStorage so refresh doesn't log out.
        try {
          localStorage.setItem('token', response.token)
          if (!persistTokenOnly) {
            localStorage.setItem('user', JSON.stringify(response.user))
            if (response.user?.role) localStorage.setItem('role', response.user.role)
          }
        } catch (e) {
          console.warn('Failed to persist auth data to localStorage', e)
        }

        return { success: true, user: response.user }
      }

      return { success: false, message: response.message }

    } catch (error) {
      return { success: false, message: error.message || 'Login failed' }
    } finally {
      loading.value = false
    }
  }

  const register = async (userData) => {
    loading.value = true
    try {
      const response = await authApi.register(userData)

      if (response.success) {
        // Auto-login after registration
        user.value = response.user
        token.value = response.token
        isAuthenticated.value = true

        // Optionally persist ONLY the token to localStorage so refresh doesn't log out.
        try {
          localStorage.setItem('token', response.token)
          if (!persistTokenOnly) {
            localStorage.setItem('user', JSON.stringify(response.user))
            if (response.user?.role) localStorage.setItem('role', response.user.role)
          }
        } catch (e) {
          console.warn('Failed to persist auth data to localStorage', e)
        }

        return { success: true, user: response.user }
      }

      return { success: false, message: response.message }

    } catch (error) {
      return { success: false, message: error.message || 'Registration failed' }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      user.value = null
      token.value = null
      isAuthenticated.value = false
      // Remove only the token (and role/user if present) on logout per requirement.
      try {
        try { localStorage.removeItem('token') } catch (e) { }
        try { localStorage.removeItem('role') } catch (e) { }
        try { localStorage.removeItem('user') } catch (e) { }
      } catch (e) {
        console.error('Failed to remove auth keys from localStorage on logout', e)
      }
    }
  }

  // Internal helper to hydrate user profile from API endpoints (customer/seller/admin)
  const hydrateUserProfile = async () => {
    if (!token.value) return { success: false, reason: 'no-token' }
    // Skip if already have a user (fresh login)
    if (user.value?.id) return { success: true, cached: true, user: user.value }
    const storedRole = localStorage.getItem('role')
    const role = user.value?.role || storedRole
    const endpoint = role === 'customer' ? '/customer/profile' : role === 'manager' ? '/seller/profile' : null
    if (!endpoint) {
      if (role) {
        user.value = { role }
        return { success: true, cached: true, user: user.value }
      }
      return { success: false, reason: 'no-profile-endpoint' }
    }

    try {
      const res = await axios.get(endpoint, { skipAuthRedirect: true })
      const payload = res?.data?.data ?? res?.data
      if (payload && typeof payload === 'object') {
        user.value = { ...payload, role }
        try {
          if (!persistTokenOnly) {
            localStorage.setItem('user', JSON.stringify(user.value))
            localStorage.setItem('role', role)
          }
        } catch (e) { /* ignore */ }
        return { success: true, user: user.value, endpoint }
      }
    } catch (e) {
      return { success: false, reason: 'profile-request-failed' }
    }
    return { success: false }
  }

  const checkAuth = () => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      token.value = storedToken
      if (!persistTokenOnly) {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          try { user.value = JSON.parse(storedUser) } catch (e) { /* ignore */ }
        }
      }
      isAuthenticated.value = true
      // Fire & forget hydration (keeps UI avatar/menu after refresh)
      hydrateUserProfile()
      return true
    }
    return false
  }

  const getDashboardRoute = (role) => {
    const routes = {
      admin: '/admin/dashboard',
      manager: '/seller/dashboard',
      salesman: '/sales/invoices',
      seller: '/seller/dashboard',
      buyer: '/'
    }
    return routes[role] || '/'
  }

  const loginWithFirebase = async (email, password) => {
    loading.value = true
    try {
      const firebaseUser = await doFirebaseLogin(email, password)
      const idToken = await firebaseUser.getIdToken()

      const response = await axios.post('/firebase/login', { idToken })
      const data = response.data

      if (!data.success) {
        return { success: false, message: data.message || 'Firebase login failed' }
      }

      const payload = data.data
      const rolesRaw = payload?.roles ?? payload?.role
      const roles = Array.isArray(rolesRaw)
        ? rolesRaw.map(r => (typeof r === 'object' ? r?.name : r))
        : rolesRaw ? [typeof rolesRaw === 'object' ? rolesRaw?.name : rolesRaw] : []

      const userObj = { ...payload.user, role: roles[0] || null }

      user.value = userObj
      token.value = payload.token
      isAuthenticated.value = true

      try {
        localStorage.setItem('token', payload.token)
        if (!persistTokenOnly) {
          localStorage.setItem('user', JSON.stringify(userObj))
          if (userObj.role) localStorage.setItem('role', userObj.role)
        }
      } catch (e) { /* ignore */ }

      return { success: true, user: userObj }
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'Firebase login failed'
      return { success: false, message: msg }
    } finally {
      loading.value = false
    }
  }

  const hasRole = (roles) => {
    if (!Array.isArray(roles)) {
      roles = [roles]
    }
    return roles.includes(user.value?.role)
  }

  const isAdmin = computed(() => user.value?.role === 'admin')
  const isManager = computed(() => user.value?.role === 'manager')
  const isSalesman = computed(() => user.value?.role === 'salesman')
  const isSeller = computed(() => user.value?.role === 'seller' || user.value?.role === 'manager')
  const isBuyer = computed(() => user.value?.role === 'buyer' || user.value?.role === 'salesman')

  return {
    user,
    token,
    isAuthenticated,
    loading,
    currentUser,
    userRole,
    role,
    isLoggedIn,
    isLoading,
    isAdmin,
    isManager,
    isSalesman,
    isSeller,
    isBuyer,
    login,
    register,
    logout,
    loginWithFirebase,
    checkAuth,
    getDashboardRoute,
    hasRole,
    hydrateUserProfile
  }
})
