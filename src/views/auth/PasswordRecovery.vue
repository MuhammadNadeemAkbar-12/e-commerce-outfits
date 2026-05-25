<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 px-4 py-10">
    <div class="mx-auto w-full max-w-3xl">
      <div class="rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div class="px-6 sm:px-10 pt-8 pb-6 border-b border-slate-800">
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight">User Password Recovery</h1>
          <p class="text-slate-400 mt-2 text-sm sm:text-base">
            Request reset link or reset your user account password using token.
          </p>
        </div>

        <div class="p-6 sm:p-10 grid gap-8 lg:grid-cols-2">
          <section class="space-y-4">
            <h2 class="text-lg font-semibold">1) Send Reset Link</h2>
            <label class="text-sm text-slate-300 block">Registered Email</label>
            <input
              v-model.trim="email"
              type="email"
              class="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="you@example.com"
            />
            <button
              type="button"
              @click="sendResetLink"
              :disabled="sending"
              class="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 py-3 font-semibold transition"
            >
              <span v-if="!sending">Send Reset Link</span>
              <span v-else>Sending...</span>
            </button>
            <p v-if="linkMessage" class="text-emerald-300 text-sm">{{ linkMessage }}</p>
          </section>

          <section class="space-y-4">
            <h2 class="text-lg font-semibold">2) Reset Password</h2>
            <label class="text-sm text-slate-300 block">Reset Token</label>
            <input
              v-model.trim="token"
              type="text"
              class="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Paste token from email"
            />
            <label class="text-sm text-slate-300 block">New Password</label>
            <input
              v-model="password"
              type="password"
              class="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Minimum 8 characters"
            />
            <label class="text-sm text-slate-300 block">Confirm Password</label>
            <input
              v-model="passwordConfirmation"
              type="password"
              class="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Retype password"
            />
            <button
              type="button"
              @click="resetPasswordNow"
              :disabled="resetting"
              class="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 py-3 font-semibold transition"
            >
              <span v-if="!resetting">Reset Password</span>
              <span v-else>Resetting...</span>
            </button>
            <p v-if="resetMessage" class="text-emerald-300 text-sm">{{ resetMessage }}</p>
          </section>
        </div>

        <div v-if="errorMessage" class="px-6 sm:px-10 pb-4 text-red-300 text-sm">
          {{ errorMessage }}
        </div>

        <div class="px-6 sm:px-10 pb-8 flex flex-wrap gap-3">
          <button
            type="button"
            class="rounded-xl border border-slate-700 hover:bg-slate-800 px-4 py-2 text-sm"
            @click="router.push('/loginuser')"
          >
            Back to User Login
          </button>
          <button
            type="button"
            class="rounded-xl border border-slate-700 hover:bg-slate-800 px-4 py-2 text-sm"
            @click="router.push('/admin/login')"
          >
            Back to Admin Login
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import authApi from '@/services/authApi'

const route = useRoute()
const router = useRouter()

const email = ref('')
const token = ref('')
const password = ref('')
const passwordConfirmation = ref('')

const sending = ref(false)
const resetting = ref(false)
const linkMessage = ref('')
const resetMessage = ref('')
const errorMessage = ref('')

const clearMessages = () => {
  linkMessage.value = ''
  resetMessage.value = ''
  errorMessage.value = ''
}

const sendResetLink = async () => {
  clearMessages()
  if (!/\S+@\S+\.\S+/.test(email.value)) {
    errorMessage.value = 'Please enter a valid email address.'
    return
  }

  sending.value = true
  try {
    const res = await authApi.forgotPassword(email.value)
    if (res.success) linkMessage.value = res.message || 'Reset link sent successfully.'
    else errorMessage.value = res.message || 'Failed to send reset link.'
  } finally {
    sending.value = false
  }
}

const resetPasswordNow = async () => {
  clearMessages()

  if (!email.value || !token.value || !password.value || !passwordConfirmation.value) {
    errorMessage.value = 'Please complete all fields before resetting password.'
    return
  }

  if (password.value !== passwordConfirmation.value) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  if (password.value.length < 8) {
    errorMessage.value = 'Password must be at least 8 characters long.'
    return
  }

  resetting.value = true
  try {
    const res = await authApi.resetPassword({
      email: email.value,
      token: token.value,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    })

    if (res.success) {
      resetMessage.value = res.message || 'Password reset successful. You can login now.'
      password.value = ''
      passwordConfirmation.value = ''
    } else {
      errorMessage.value = res.message || 'Failed to reset password.'
    }
  } finally {
    resetting.value = false
  }
}

onMounted(() => {
  const queryEmail = typeof route.query.email === 'string' ? route.query.email : ''
  const queryToken = typeof route.query.reset_token === 'string' ? route.query.reset_token : ''
  if (queryEmail) email.value = queryEmail
  if (queryToken) token.value = queryToken
})
</script>
