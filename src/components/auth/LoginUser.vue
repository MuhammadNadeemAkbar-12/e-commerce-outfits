<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-600 flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Animated Background Elements -->
    <div class="absolute inset-0 overflow-hidden">
      <!-- Floating Orbs -->
      <div class="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
      <div class="absolute top-1/2 right-20 w-24 h-24 bg-pink-300/20 rounded-full blur-lg animate-bounce"></div>
      <div class="absolute bottom-20 left-1/3 w-40 h-40 bg-blue-300/15 rounded-full blur-2xl animate-pulse delay-1000"></div>
      
      <!-- Grid Pattern -->
      <div class="absolute inset-0 bg-grid-pattern opacity-5"></div>
    </div>

    <!-- Main Container -->
    <div class="relative z-10 w-full max-w-6xl mx-auto">
      <div class="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        <div class="flex flex-col lg:flex-row min-h-[600px]">
          
          <!-- Left Side - Hero Section -->
          <div class="lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 lg:p-12 flex flex-col justify-center items-center text-white relative overflow-hidden">
            <!-- Background Pattern -->
            <div class="absolute inset-0 bg-pattern opacity-10"></div>
            
            <div class="relative z-10 text-center">
              <!-- Logo Section -->
              <div class="mb-8">
                <div class="w-20 h-20 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h1 class="text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  StyleHub
                </h1>
                <div class="w-16 h-1 bg-gradient-to-r from-pink-300 to-blue-300 mx-auto rounded-full"></div>
              </div>

              <!-- Welcome Text -->
              <div class="mb-8">
                <h2 class="text-2xl lg:text-3xl font-semibold mb-4">Welcome Back!</h2>
                <p class="text-lg opacity-90 leading-relaxed max-w-md">
                  Step into your style sanctuary. Manage your wardrobe, discover trends, and express your unique fashion identity.
                </p>
              </div>

              <!-- Features -->
              <div class="space-y-4 mb-8">
                <div class="flex items-center justify-center space-x-3">
                  <div class="w-2 h-2 bg-pink-300 rounded-full"></div>
                  <span class="text-sm opacity-80">Personalized Style Recommendations</span>
                </div>
                <div class="flex items-center justify-center space-x-3">
                  <div class="w-2 h-2 bg-blue-300 rounded-full"></div>
                  <span class="text-sm opacity-80">Smart Wardrobe Management</span>
                </div>
                <div class="flex items-center justify-center space-x-3">
                  <div class="w-2 h-2 bg-green-300 rounded-full"></div>
                  <span class="text-sm opacity-80">Trending Fashion Insights</span>
                </div>
              </div>

              <!-- Mobile CTA -->
              <button 
                @click="scrollToForm" 
                class="lg:hidden bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 px-8 py-3 rounded-full font-semibold flex items-center mx-auto space-x-2"
              >
                <span>Get Started</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Right Side - Login Form -->
          <div class="lg:w-1/2 p-8 lg:p-12 flex items-center justify-center">
            <div class="w-full max-w-md" ref="formRef">
              <!-- Form Header -->
              <div class="text-center mb-8">
                <h3 class="text-3xl font-bold text-gray-800 mb-2">Sign In</h3>
                <p class="text-gray-600">Welcome back! Please sign in to your account</p>
              </div>

              <!-- Login Form -->
              <form @submit.prevent="handleLogin" class="space-y-6" novalidate>
                <!-- Email Field -->
                <div class="space-y-2">
                  <label for="email" class="block text-sm font-semibold text-gray-700">
                    Email Address
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                      </svg>
                    </div>
                    <input
                      id="email"
                      type="email"
                      v-model.trim="email"
                      class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      :class="{ 'border-red-500 bg-red-50': formSubmitted && !validEmail }"
                      placeholder="Enter your email"
                      required
                      autocomplete="email"
                    />
                  </div>
                  <div v-if="formSubmitted && !validEmail" class="text-red-500 text-sm flex items-center space-x-1">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    <span>Please provide a valid email address</span>
                  </div>
                </div>

                <!-- Password Field -->
                <div class="space-y-2">
                  <label for="password" class="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                      </svg>
                    </div>
                    <input
                      id="password"
                      :type="showPassword ? 'text' : 'password'"
                      v-model="password"
                      class="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      :class="{ 'border-red-500 bg-red-50': formSubmitted && !password }"
                      placeholder="Enter your password"
                      required
                      autocomplete="current-password"
                    />
                    <button
                      type="button"
                      @click="showPassword = !showPassword"
                      class="absolute inset-y-0 right-0 pr-4 flex items-center"
                    >
                      <svg v-if="!showPassword" class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                      <svg v-else class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
                      </svg>
                    </button>
                  </div>
                  <div v-if="formSubmitted && !password" class="text-red-500 text-sm flex items-center space-x-1">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    <span>Password is required</span>
                  </div>
                </div>

                <!-- Remember Me & Forgot Password -->
                <div class="flex items-center justify-between">
                  <label class="flex items-center">
                    <input type="checkbox" v-model="rememberMe" class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
                    <span class="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  <a href="#" class="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
                    Forgot password?
                  </a>
                </div>

                <!-- Submit Button -->
                <button
                  type="submit"
                  :disabled="loading"
                  class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <div v-if="loading" class="flex items-center justify-center space-x-2">
                    <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing In...</span>
                  </div>
                  <div v-else class="flex items-center justify-center space-x-2">
                    <span>Sign In</span>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                    </svg>
                  </div>
                </button>

                <!-- Error Message -->
                <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-2">
                  <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-sm">{{ errorMessage }}</span>
                </div>

                <!-- Divider -->
                <div class="relative">
                  <div class="absolute inset-0 flex items-center">
                    <div class="w-full border-t border-gray-300"></div>
                  </div>
                  <div class="relative flex justify-center text-sm">
                    <span class="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <!-- Social Login -->
                <div class="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    :disabled="googleLoading"
                    @click="handleGoogleLogin"
                    class="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <svg v-if="!googleLoading" class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <svg v-else class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Google
                  </button>
                  <button
                    type="button"
                    class="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                  >
                    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </button>
                </div>

                <!-- Sign Up Link -->
                <div class="text-center">
                  <span class="text-gray-600">Don't have an account? </span>
                  <router-link 
                    to="/registeruser" 
                    class="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
                  >
                    Sign up here
                  </router-link>
                </div>

                <!-- Back to Home -->
                <div class="text-center pt-4">
                  <button
                    type="button"
                    @click="router.push('/')"
                    class="text-gray-500 hover:text-gray-700 font-medium transition-colors duration-200 flex items-center mx-auto space-x-1"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                    </svg>
                    <span>Back to Home</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { firebaseGoogleLogin } from "@/services/firebaseAuth";
import axios from "@/api/axios";

const router = useRouter();
const authStore = useAuthStore();

// Form data
const email = ref("");
const password = ref("");
const rememberMe = ref(false);
const showPassword = ref(false);
const loading = ref(false);
const googleLoading = ref(false);
const formRef = ref(null);
const formSubmitted = ref(false);
const errorMessage = ref("");

// Computed properties
const validEmail = computed(() => /\S+@\S+\.\S+/.test(email.value));

// Methods
const scrollToForm = () => {
  if (formRef.value) {
    formRef.value.scrollIntoView({ behavior: "smooth" });
  }
};

const redirectByRole = (role) => {
  if (role === 'admin') router.push('/admin/dashboard');
  else if (role === 'seller' || role === 'manager') router.push('/seller/dashboard');
  else if (role === 'salesman') router.push('/customer/orders');
  else router.push('/');
};

const handleLogin = async () => {
  formSubmitted.value = true;
  errorMessage.value = "";

  if (!validEmail.value || !password.value) return;

  loading.value = true;
  try {
    const response = await authStore.login({
      email: email.value,
      password: password.value,
    });

    if (response.success) {
      redirectByRole(authStore.role);
    } else {
      errorMessage.value = response.message || "Invalid credentials. Please try again.";
    }
  } catch (error) {
    errorMessage.value = error.message || "Login failed. Please try again.";
  } finally {
    loading.value = false;
  }
};

const handleGoogleLogin = async () => {
  errorMessage.value = "";
  googleLoading.value = true;
  try {
    const firebaseUser = await firebaseGoogleLogin();
    const idToken = await firebaseUser.getIdToken();

    const response = await axios.post('/firebase/login', { idToken });
    const data = response.data;

    if (!data.success) {
      errorMessage.value = data.message || 'Google login failed';
      return;
    }

    const payload = data.data;
    const rolesRaw = payload?.roles ?? payload?.role;
    const roles = Array.isArray(rolesRaw)
      ? rolesRaw.map(r => (typeof r === 'object' ? r?.name : r))
      : rolesRaw ? [typeof rolesRaw === 'object' ? rolesRaw?.name : rolesRaw] : [];

    const userObj = { ...payload.user, role: roles[0] || null };
    authStore.user = userObj;
    authStore.token = payload.token;
    authStore.isAuthenticated = true;

    try {
      localStorage.setItem('token', payload.token);
      localStorage.setItem('user', JSON.stringify(userObj));
      if (userObj.role) localStorage.setItem('role', userObj.role);
    } catch (e) { /* ignore */ }

    redirectByRole(userObj.role);
  } catch (err) {
    const code = err?.code;
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      // user closed popup — no error shown
    } else {
      errorMessage.value = err?.response?.data?.message || err?.message || 'Google login failed';
    }
  } finally {
    googleLoading.value = false;
  }
};
</script>

<style scoped>
/* Custom Grid Pattern */
.bg-grid-pattern {
  background-image: 
    linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px);
  background-size: 50px 50px;
}

/* Custom Pattern for Hero Section */
.bg-pattern {
  background-image: 
    radial-gradient(circle at 25px 25px, rgba(255,255,255,.2) 2px, transparent 2px),
    radial-gradient(circle at 75px 75px, rgba(255,255,255,.1) 2px, transparent 2px);
  background-size: 100px 100px;
}

/* Custom animations */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

/* Smooth focus transitions */
input:focus {
  transform: translateY(-1px);
}

/* Custom scrollbar for webkit browsers */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #6a82fb, #fc5c7d);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #5a72eb, #ec4c6d);
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .min-h-screen {
    min-height: 100vh;
  }
}

@media (max-width: 768px) {
  .rounded-3xl {
    border-radius: 1.5rem;
  }
}

@media (max-width: 640px) {
  .rounded-3xl {
    border-radius: 0;
  }
  
  .min-h-screen {
    min-height: 100vh;
  }
}
</style>