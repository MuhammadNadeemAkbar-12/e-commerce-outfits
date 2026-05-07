<template>
  <div class="p-6 max-w-3xl mx-auto">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-900">Account Settings</h1>
      <p class="text-sm text-slate-500 mt-1">Manage your profile and security preferences</p>
    </div>

    <!-- Change Password Card -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-5">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
          <q-icon name="lock" color="indigo" size="20px" />
        </div>
        <div>
          <h2 class="text-lg font-semibold text-slate-800">Change Password</h2>
          <p class="text-sm text-slate-500">Update your account password</p>
        </div>
      </div>

      <form @submit.prevent="changePassword" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Current Password *</label>
          <input v-model="pwForm.current_password" type="password" class="input-base w-full max-w-md" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">New Password *</label>
          <input v-model="pwForm.new_password" type="password" class="input-base w-full max-w-md" required minlength="8" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Confirm New Password *</label>
          <input v-model="pwForm.new_password_confirmation" type="password" class="input-base w-full max-w-md" required />
        </div>
        <div v-if="pwError" class="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ pwError }}</div>
        <div v-if="pwSuccess" class="text-green-600 text-sm bg-green-50 border border-green-200 rounded-lg px-3 py-2">{{ pwSuccess }}</div>
        <div>
          <q-btn unelevated color="primary" type="submit" label="Update Password" :loading="pwLoading" />
        </div>
      </form>
    </div>

    <!-- Notification Preferences Card -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-5">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
          <q-icon name="notifications" color="amber-8" size="20px" />
        </div>
        <div>
          <h2 class="text-lg font-semibold text-slate-800">Notifications</h2>
          <p class="text-sm text-slate-500">Choose what you want to be notified about</p>
        </div>
      </div>

      <div class="space-y-4">
        <div v-for="item in notifications" :key="item.key" class="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
          <div>
            <div class="text-sm font-medium text-slate-700">{{ item.label }}</div>
            <div class="text-xs text-slate-400">{{ item.desc }}</div>
          </div>
          <q-toggle v-model="item.enabled" color="indigo" />
        </div>
      </div>
    </div>

    <!-- Display Preferences Card -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <q-icon name="palette" color="blue" size="20px" />
        </div>
        <div>
          <h2 class="text-lg font-semibold text-slate-800">Display</h2>
          <p class="text-sm text-slate-500">Appearance and interface preferences</p>
        </div>
      </div>

      <div class="flex items-center justify-between py-2">
        <div>
          <div class="text-sm font-medium text-slate-700">Dark Mode</div>
          <div class="text-xs text-slate-400">Toggle dark/light theme</div>
        </div>
        <q-toggle :model-value="$q.dark.isActive" @update:model-value="toggleDark" color="indigo" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'
import axios from '@/api/axios'

const $q = useQuasar()

const pwForm = reactive({ current_password: '', new_password: '', new_password_confirmation: '' })
const pwLoading = ref(false)
const pwError = ref('')
const pwSuccess = ref('')

const notifications = reactive([
  { key: 'new_order', label: 'New Order', desc: 'When a new order is placed', enabled: true },
  { key: 'low_stock', label: 'Low Stock Alert', desc: 'When a product falls below threshold', enabled: true },
  { key: 'invoice_paid', label: 'Invoice Paid', desc: 'When an invoice payment is received', enabled: true },
  { key: 'return_request', label: 'Return Requests', desc: 'When a customer submits a return', enabled: false },
])

async function changePassword() {
  pwError.value = ''
  pwSuccess.value = ''
  if (pwForm.new_password !== pwForm.new_password_confirmation) {
    pwError.value = 'New passwords do not match.'
    return
  }
  if (pwForm.new_password.length < 8) {
    pwError.value = 'Password must be at least 8 characters.'
    return
  }
  pwLoading.value = true
  try {
    await axios.patch('/seller/profile/password', {
      current_password: pwForm.current_password,
      new_password: pwForm.new_password,
      new_password_confirmation: pwForm.new_password_confirmation,
    })
    pwSuccess.value = 'Password updated successfully.'
    pwForm.current_password = ''
    pwForm.new_password = ''
    pwForm.new_password_confirmation = ''
  } catch (e) {
    pwError.value = e?.response?.data?.message || 'Failed to update password.'
  } finally {
    pwLoading.value = false
  }
}

function toggleDark(v) {
  $q.dark.set(v)
  localStorage.setItem('theme', v ? 'dark' : 'light')
}
</script>

<style scoped>
.input-base {
  @apply border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500;
}
</style>
