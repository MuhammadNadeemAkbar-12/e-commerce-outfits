<template>
  <div class="admin-login-page">
    <!-- Left Panel: Branding -->
    <div class="login-left">
      <div class="brand-section">
        <div class="brand-logo">
          <q-icon name="admin_panel_settings" size="64px" color="indigo-500" />
        </div>
        <h1 class="brand-title">Admin Panel</h1>
        <p class="brand-subtitle">Stock, Inventory & Sales Management</p>
      </div>
      <div class="brand-features">
        <div class="feature-item">
          <q-icon name="security" size="24px" color="indigo-400" />
          <p>Secure Admin Access</p>
        </div>
        <div class="feature-item">
          <q-icon name="dashboard" size="24px" color="indigo-400" />
          <p>Comprehensive Dashboard</p>
        </div>
        <div class="feature-item">
          <q-icon name="analytics" size="24px" color="indigo-400" />
          <p>Real-time Reports</p>
        </div>
      </div>
    </div>

    <!-- Right Panel: Login Form -->
    <div class="login-right">
      <div class="login-container">
        <h2 class="login-title">Admin Login</h2>
        <p class="login-description">Access admin dashboard with your credentials</p>

        <!-- Error Message -->
        <div v-if="errorMessage" class="error-alert">
          <q-icon name="error" />
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="login-form">
          <!-- Email Field -->
          <div class="form-group">
            <label for="email" class="form-label">Email Address</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="admin@example.com"
              class="form-input"
              :disabled="isLoading"
              required
            />
          </div>

          <!-- Password Field -->
          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <div class="password-wrapper">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter your password"
                class="form-input"
                :disabled="isLoading"
                required
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="password-toggle"
                :disabled="isLoading"
              >
                <q-icon :name="showPassword ? 'visibility_off' : 'visibility'" size="20px" />
              </button>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isLoading"
            class="login-btn"
          >
            <span v-if="!isLoading">Login to Admin Panel</span>
            <span v-else class="loading-text">
              <q-spinner size="16px" color="white" />
              Signing in...
            </span>
          </button>
        </form>

        <!-- Divider -->
        <div class="divider">or</div>

        <!-- Back to General Login -->
        <router-link to="/loginuser" class="back-link">
          <q-icon name="arrow_back" size="16px" />
          Back to General Login
        </router-link>

        <!-- Support -->
        <p class="support-text">
          Having trouble? <a href="mailto:support@example.com">Contact Support</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axios from '@/api/axios'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: '',
})
const isLoading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)

const handleLogin = async () => {
  try {
    errorMessage.value = ''
    isLoading.value = true

    const response = await axios.post('/admin/login', {
      email: form.value.email,
      password: form.value.password,
    })

    const { success, message, data } = response.data

    if (success) {
      const { user, token, roles } = data

      // Attach role to user object so auth store works the same as normal login
      const userWithRole = { ...user, role: Array.isArray(roles) ? roles[0] : (roles?.toArray?.()[0] ?? roles?.[0] ?? 'admin') }

      // Persist to auth store + localStorage (same pattern as auth store login action)
      authStore.user = userWithRole
      authStore.token = token
      authStore.isAuthenticated = true

      try {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userWithRole))
        localStorage.setItem('role', userWithRole.role)
      } catch (e) {
        console.warn('Failed to persist auth data to localStorage', e)
      }

      router.push('/admin/dashboard')
    } else {
      errorMessage.value = message || 'Login failed'
    }
  } catch (error) {
    if (error.response?.status === 403) {
      errorMessage.value = error.response.data?.message || 'Access denied. Admin privileges required.'
    } else if (error.response?.status === 401) {
      errorMessage.value = 'Invalid email or password'
    } else if (error.response?.status === 422) {
      const errors = error.response.data?.errors
      errorMessage.value = errors ? Object.values(errors).flat().join(' ') : 'Validation failed'
    } else {
      errorMessage.value = error.response?.data?.message || 'Login failed. Please try again.'
    }
    console.error('Admin login error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.admin-login-page {
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

/* Left Panel */
.login-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: white;
}

.brand-section {
  text-align: center;
  margin-bottom: 3rem;
}

.brand-logo {
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
}

.brand-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0.5rem 0;
  background: linear-gradient(135deg, #6366f1, #a78bfa);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-subtitle {
  color: #cbd5e1;
  font-size: 0.95rem;
  margin: 0;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 320px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.feature-item p {
  margin: 0;
  color: #cbd5e1;
  font-size: 0.9rem;
}

/* Right Panel */
.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background: #f8fafc;
}

.login-container {
  width: 100%;
  max-width: 420px;
}

.login-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.5rem;
}

.login-description {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0 0 2rem;
}

.error-alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 0.875rem 1rem;
  color: #dc2626;
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-input:disabled {
  background: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  padding: 0.25rem;
  transition: color 0.2s;
}

.password-toggle:hover:not(:disabled) {
  color: #0f172a;
}

.password-toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-btn {
  padding: 0.875rem 1rem;
  background: linear-gradient(135deg, #6366f1, #7c3aed);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 44px;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(99, 102, 241, 0.3);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.divider {
  text-align: center;
  color: #cbd5e1;
  font-size: 0.85rem;
  margin: 1.5rem 0;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 40%;
  height: 1px;
  background: #e2e8f0;
}

.divider::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  width: 40%;
  height: 1px;
  background: #e2e8f0;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #6366f1;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.2s;
  margin-bottom: 1.5rem;
}

.back-link:hover {
  color: #7c3aed;
}

.support-text {
  text-align: center;
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
}

.support-text a {
  color: #6366f1;
  text-decoration: none;
  font-weight: 500;
}

.support-text a:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-login-page {
    flex-direction: column;
  }

  .login-left {
    padding: 2rem;
    min-height: 40vh;
  }

  .brand-features {
    max-width: 100%;
    flex-direction: row;
  }

  .login-right {
    padding: 2rem 1.5rem;
    min-height: 60vh;
  }

  .login-container {
    max-width: 100%;
  }

  .brand-title {
    font-size: 1.75rem;
  }
}
</style>
