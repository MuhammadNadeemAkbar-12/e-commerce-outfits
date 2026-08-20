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
    <div class="relative z-10 w-full max-w-7xl mx-auto">
      <div class="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        <div class="flex flex-col lg:flex-row min-h-[700px]">
          
          <!-- Left Side - Hero Section -->
          <div class="lg:w-2/5 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 lg:p-12 flex flex-col justify-center items-center text-white relative overflow-hidden">
            <!-- Background Pattern -->
            <div class="absolute inset-0 bg-pattern opacity-10"></div>
            
            <div class="relative z-10 text-center">
              <!-- Logo Section -->
              <div class="mb-8">
                <div class="w-20 h-20 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                  </svg>
                </div>
                <h1 class="text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  StyleHub
                </h1>
                <div class="w-16 h-1 bg-gradient-to-r from-pink-300 to-blue-300 mx-auto rounded-full"></div>
              </div>

              <!-- Welcome Text -->
              <div class="mb-8">
                <h2 class="text-2xl lg:text-3xl font-semibold mb-4">Join StyleHub</h2>
                <p class="text-lg opacity-90 leading-relaxed max-w-md">
                  Create your account and become part of our fashion community. Whether you're here to shop or sell, we've got you covered.
                </p>
              </div>

              <!-- Features -->
              <div class="space-y-4 mb-8">
                <div class="flex items-center justify-center space-x-3">
                  <div class="w-2 h-2 bg-pink-300 rounded-full"></div>
                  <span class="text-sm opacity-80">Secure Account Creation</span>
                </div>
                <div class="flex items-center justify-center space-x-3">
                  <div class="w-2 h-2 bg-blue-300 rounded-full"></div>
                  <span class="text-sm opacity-80">OTP Verification for Buyers</span>
                </div>
                <div class="flex items-center justify-center space-x-3">
                  <div class="w-2 h-2 bg-green-300 rounded-full"></div>
                  <span class="text-sm opacity-80">Instant Seller Registration</span>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="space-y-3">
                <button 
                  @click="scrollToForm" 
                  class="lg:hidden bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-300 px-8 py-3 rounded-full font-semibold flex items-center mx-auto space-x-2"
                >
                  <span>Get Started</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                  </svg>
                </button>
                
                <button 
                  @click="goHome" 
                  class="bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 px-6 py-2 rounded-full font-medium flex items-center mx-auto space-x-2 text-sm border border-white/20"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                  </svg>
                  <span>Back to Home</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Right Side - Registration Form -->
          <div class="lg:w-3/5 p-6 lg:p-8 flex items-center justify-center">
            <div class="w-full max-w-2xl" ref="formRef">
              <!-- Form Header -->
              <div class="text-center mb-6">
                <h3 class="text-3xl font-bold text-gray-800 mb-2">Create Account</h3>
                <p class="text-gray-600">Choose your role to get started</p>
              </div>

              <!-- Role Switcher -->
              <div class="flex bg-gray-100 rounded-2xl p-1 mb-8 max-w-md mx-auto">
                <button
                  @click="switchRole('buyer')"
                  :class="[
                    'flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2',
                    role === 'buyer' 
                      ? 'bg-white text-indigo-600 shadow-md' 
                      : 'text-gray-600 hover:text-gray-800'
                  ]"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                  </svg>
                  <span>Buyer</span>
                </button>
                <button
                  @click="switchRole('seller')"
                  :class="[
                    'flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2',
                    role === 'seller' 
                      ? 'bg-white text-indigo-600 shadow-md' 
                      : 'text-gray-600 hover:text-gray-800'
                  ]"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                  <span>Seller</span>
                </button>
              </div>

              <!-- Buyer Registration with OTP -->
              <div v-if="role === 'buyer'" class="space-y-6">
                <!-- SUCCESS SCREEN -->
                <div v-if="buyer.success" class="text-center py-8 space-y-6">
                  <div class="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <svg class="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <div>
                    <h4 class="text-2xl font-bold text-gray-800 mb-2">Account Created!</h4>
                    <p class="text-gray-600">Welcome, <strong>{{ buyer.name }}</strong>! Your account is verified.</p>
                    <p class="text-sm text-gray-500 mt-2">Redirecting you to the homepage...</p>
                  </div>
                  <div class="flex justify-center">
                    <div class="w-8 h-8">
                      <svg class="animate-spin text-indigo-600 w-8 h-8" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                    </div>
                  </div>
                  <button @click="router.push('/')" class="text-indigo-600 font-semibold hover:underline text-sm">Go now →</button>
                </div>

                <!-- FORMS (hidden when success) -->
                <div v-if="!buyer.success">
                <!-- Progress Steps -->
                <div class="flex items-center justify-center space-x-4 mb-8">
                  <div class="flex items-center space-x-2">
                    <div :class="[
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                      buyer.step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                    ]">
                      1
                    </div>
                    <span class="text-sm font-medium text-gray-600">Details</span>
                  </div>
                  <div class="flex-1 h-0.5 bg-gray-200 mx-4">
                    <div :class="[
                      'h-full bg-indigo-600 transition-all duration-500',
                      buyer.step >= 2 ? 'w-full' : 'w-0'
                    ]"></div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <div :class="[
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                      buyer.step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                    ]">
                      2
                    </div>
                    <span class="text-sm font-medium text-gray-600">Verify</span>
                  </div>
                </div>

                <!-- Step 1: Registration Details -->
                <form v-if="buyer.step === 1" @submit.prevent="requestBuyerOtp" class="space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Name -->
                    <div class="md:col-span-2">
                      <label for="bName" class="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                      <input
                        id="bName"
                        type="text"
                        v-model.trim="buyer.name"
                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        :class="{ 'border-red-500 bg-red-50': buyer.submitted && !buyer.name }"
                        placeholder="Enter your full name"
                        required
                      />
                      <div v-if="buyer.submitted && !buyer.name" class="text-red-500 text-sm mt-1">Name is required</div>
                    </div>

                    <!-- Email -->
                    <div>
                      <label for="bEmail" class="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                      <input
                        id="bEmail"
                        type="email"
                        v-model.trim="buyer.email"
                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        :class="{ 'border-red-500 bg-red-50': buyer.submitted && !validBuyerEmail }"
                        placeholder="you@example.com"
                        required
                      />
                      <div v-if="buyer.submitted && !validBuyerEmail" class="text-red-500 text-sm mt-1">Valid email is required</div>
                    </div>

                    <!-- Profile Picture -->
                    <div>
                      <label for="bAvatar" class="block text-sm font-semibold text-gray-700 mb-2">Profile Picture (optional)</label>
                      <input
                        id="bAvatar"
                        type="file"
                        accept="image/*"
                        @change="onBuyerAvatarSelected"
                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      />
                    </div>

                    <!-- Phone -->
                    <div>
                      <label for="bPhone" class="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                      <input
                        id="bPhone"
                        type="tel"
                        v-model.trim="buyer.phone"
                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        :class="{ 'border-red-500 bg-red-50': buyer.submitted && !buyer.phone }"
                        placeholder="03xx-xxxxxxx"
                        required
                      />
                      <div v-if="buyer.submitted && !buyer.phone" class="text-red-500 text-sm mt-1">Phone is required</div>
                    </div>

                    <!-- Password -->
                    <div>
                      <label for="bPassword" class="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                      <div class="relative">
                        <input
                          id="bPassword"
                          :type="showBuyerPassword ? 'text' : 'password'"
                          v-model="buyer.password"
                          class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                          :class="{ 'border-red-500 bg-red-50': buyer.submitted && buyer.password.length < 8 }"
                          placeholder="Minimum 8 characters"
                          minlength="8"
                          required
                        />
                        <button
                          type="button"
                          @click="showBuyerPassword = !showBuyerPassword"
                          class="absolute inset-y-0 right-0 pr-4 flex items-center"
                        >
                          <svg v-if="!showBuyerPassword" class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                          <svg v-else class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
                          </svg>
                        </button>
                      </div>
                      <div v-if="buyer.submitted && buyer.password.length < 8" class="text-red-500 text-sm mt-1">Password must be at least 8 characters</div>
                    </div>

                    <!-- Confirm Password -->
                    <div>
                      <label for="bConfirm" class="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                      <input
                        id="bConfirm"
                        type="password"
                        v-model="buyer.confirm"
                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        :class="{ 'border-red-500 bg-red-50': buyer.submitted && !buyerPasswordsMatch }"
                        placeholder="Re-enter password"
                        required
                      />
                      <div v-if="buyer.submitted && !buyerPasswordsMatch" class="text-red-500 text-sm mt-1">Passwords don't match</div>
                    </div>

                    <!-- Address -->
                    <div class="md:col-span-2">
                      <label for="bAddress" class="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                      <input
                        id="bAddress"
                        type="text"
                        v-model.trim="buyer.address"
                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        :class="{ 'border-red-500 bg-red-50': buyer.submitted && !buyer.address }"
                        placeholder="Your complete address"
                        required
                      />
                      <div v-if="buyer.submitted && !buyer.address" class="text-red-500 text-sm mt-1">Address is required</div>
                    </div>

                    <!-- City -->
                    <div>
                      <label for="bCity" class="block text-sm font-semibold text-gray-700 mb-2">City</label>
                      <input
                        id="bCity"
                        type="text"
                        v-model.trim="buyer.city"
                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        :class="{ 'border-red-500 bg-red-50': buyer.submitted && !buyer.city }"
                        placeholder="Your city"
                        required
                      />
                      <div v-if="buyer.submitted && !buyer.city" class="text-red-500 text-sm mt-1">City is required</div>
                    </div>

                    <!-- State -->
                    <div>
                      <label for="bState" class="block text-sm font-semibold text-gray-700 mb-2">State</label>
                      <input
                        id="bState"
                        type="text"
                        v-model.trim="buyer.state"
                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        :class="{ 'border-red-500 bg-red-50': buyer.submitted && !buyer.state }"
                        placeholder="Your state"
                        required
                      />
                      <div v-if="buyer.submitted && !buyer.state" class="text-red-500 text-sm mt-1">State is required</div>
                    </div>

                    <!-- Postal Code -->
                    <div>
                      <label for="bPostal" class="block text-sm font-semibold text-gray-700 mb-2">Postal Code</label>
                      <input
                        id="bPostal"
                        type="text"
                        v-model.trim="buyer.postalCode"
                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        :class="{ 'border-red-500 bg-red-50': buyer.submitted && !buyer.postalCode }"
                        placeholder="e.g. 54000"
                        required
                      />
                      <div v-if="buyer.submitted && !buyer.postalCode" class="text-red-500 text-sm mt-1">Postal code is required</div>
                    </div>

                    <!-- Country -->
                    <div>
                      <label for="bCountry" class="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                      <input
                        id="bCountry"
                        type="text"
                        v-model.trim="buyer.country"
                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        :class="{ 'border-red-500 bg-red-50': buyer.submitted && !buyer.country }"
                        placeholder="Pakistan"
                        required
                      />
                      <div v-if="buyer.submitted && !buyer.country" class="text-red-500 text-sm mt-1">Country is required</div>
                    </div>
                  </div>

                  <!-- Terms Checkbox -->
                  <div class="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="bTerms"
                      v-model="buyer.acceptTerms"
                      class="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-1"
                      :class="{ 'border-red-500': buyer.submitted && !buyer.acceptTerms }"
                    />
                    <label for="bTerms" class="text-sm text-gray-600">
                      I accept the <a href="#" class="text-indigo-600 hover:text-indigo-500">Terms of Use</a> and <a href="#" class="text-indigo-600 hover:text-indigo-500">Privacy Policy</a>
                    </label>
                  </div>
                  <div v-if="buyer.submitted && !buyer.acceptTerms" class="text-red-500 text-sm">You must accept the terms and conditions</div>

                  <!-- Submit Button -->
                  <button
                    type="submit"
                    :disabled="buyer.loading"
                    class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    <div v-if="buyer.loading" class="flex items-center justify-center space-x-2">
                      <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Sending OTP...</span>
                    </div>
                    <div v-else class="flex items-center justify-center space-x-2">
                      <span>Request OTP</span>
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                      </svg>
                    </div>
                  </button>
                </form>

                <!-- Step 2: OTP Verification -->
                <div v-if="buyer.step === 2" class="text-center space-y-6">
                  <div class="mb-6">
                    <div class="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
                      <svg class="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                      </svg>
                    </div>
                    <h4 class="text-xl font-bold text-gray-800 mb-2">Verify Your Account</h4>
                    <p class="text-gray-600">We've sent a 6-digit code to {{ buyer.email }}</p>
                  </div>

                  <form @submit.prevent="verifyBuyerOtp" class="space-y-6">
                    <!-- OTP Input -->
                    <div>
                      <label for="bOtpCode" class="block text-sm font-semibold text-gray-700 mb-3">Enter OTP Code</label>
                      <input
                        id="bOtpCode"
                        type="text"
                        v-model="buyer.otpCode"
                        class="w-full max-w-xs mx-auto px-4 py-3 text-center text-lg font-mono border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white tracking-widest"
                        placeholder="000000"
                        maxlength="6"
                        required
                      />
                    </div>

                    <!-- Verify Button -->
                    <button
                      type="submit"
                      :disabled="buyer.loading"
                      class="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                      <div v-if="buyer.loading" class="flex items-center justify-center space-x-2">
                        <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Verifying...</span>
                      </div>
                      <div v-else class="flex items-center justify-center space-x-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span>Verify Account</span>
                      </div>
                    </button>

                    <!-- Resend OTP -->
                    <div class="space-y-3">
                      <button
                        type="button"
                        @click="resendBuyerOtp"
                        :disabled="buyer.loading || buyer.resendCooldown > 0"
                        class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span v-if="buyer.resendCooldown > 0">Resend OTP in {{ buyer.resendCooldown }}s</span>
                        <span v-else>Resend OTP</span>
                      </button>

                      <button
                        type="button"
                        @click="buyer.step = 1"
                        class="w-full bg-transparent text-indigo-600 hover:text-indigo-500 font-medium py-2 px-4 rounded-xl transition-colors duration-200"
                      >
                        Edit Details
                      </button>
                    </div>
                  </form>
                </div>
                </div><!-- end v-if="!buyer.success" -->
              </div>

              <!-- Seller Registration -->
              <div v-else class="space-y-6">

                <!-- SELLER SUCCESS / PENDING APPROVAL SCREEN -->
                <div v-if="seller.registered" class="text-center py-8 space-y-6">
                  <div class="w-20 h-20 mx-auto bg-amber-100 rounded-full flex items-center justify-center">
                    <svg class="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 class="text-2xl font-bold text-gray-800 mb-2">Application Submitted!</h4>
                    <p class="text-gray-700 font-medium">Your seller account is <span class="text-amber-600">pending admin approval</span>.</p>
                    <p class="text-gray-500 text-sm mt-3 max-w-sm mx-auto">Once approved by an admin, you will be able to log in and start listing your products.</p>
                  </div>
                  <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-sm mx-auto text-left space-y-2">
                    <div class="flex items-center space-x-2 text-sm text-amber-800">
                      <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>
                      <span>Registered as: <strong>{{ seller.email }}</strong></span>
                    </div>
                    <div class="flex items-center space-x-2 text-sm text-amber-800">
                      <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                      <span>You'll receive access once approved</span>
                    </div>
                  </div>
                  <router-link to="/loginuser" class="inline-block text-indigo-600 font-semibold hover:underline text-sm">Go to Login →</router-link>
                </div>

                <!-- SELLER FORM (hidden when registered) -->
                <div v-if="!seller.registered">
                <div class="text-center mb-6">
                  <div class="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                  </div>
                  <h4 class="text-xl font-bold text-gray-800 mb-2">Seller Registration</h4>
                  <p class="text-gray-600">Create your seller account to start listing products</p>
                </div>

                <form @submit.prevent="handleSellerRegister" class="space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Name -->
                    <div>
                      <label for="sName" class="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                      <input
                        id="sName"
                        type="text"
                        v-model.trim="seller.name"
                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        :class="{ 'border-red-500 bg-red-50': seller.submitted && !seller.name }"
                        placeholder="Enter your full name"
                        required
                      />
                      <div v-if="seller.submitted && !seller.name" class="text-red-500 text-sm mt-1">Name is required</div>
                    </div>

                    <!-- Email -->
                    <div>
                      <label for="sEmail" class="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                      <input
                        id="sEmail"
                        type="email"
                        v-model.trim="seller.email"
                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        :class="{ 'border-red-500 bg-red-50': seller.submitted && !validSellerEmail }"
                        placeholder="you@example.com"
                        required
                      />
                      <div v-if="seller.submitted && !validSellerEmail" class="text-red-500 text-sm mt-1">Valid email is required</div>
                    </div>

                    <!-- Profile Picture -->
                    <div>
                      <label for="sAvatar" class="block text-sm font-semibold text-gray-700 mb-2">Profile Picture (optional)</label>
                      <input
                        id="sAvatar"
                        type="file"
                        accept="image/*"
                        @change="onSellerAvatarSelected"
                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      />
                    </div>

                    <!-- Phone -->
                    <div>
                      <label for="sPhone" class="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                      <input
                        id="sPhone"
                        type="tel"
                        v-model.trim="seller.phone"
                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        :class="{ 'border-red-500 bg-red-50': seller.submitted && !seller.phone }"
                        placeholder="03xx-xxxxxxx"
                        required
                      />
                      <div v-if="seller.submitted && !seller.phone" class="text-red-500 text-sm mt-1">Phone is required</div>
                    </div>

                    <!-- Company Name -->
                    <div>
                      <label for="sCompany" class="block text-sm font-semibold text-gray-700 mb-2">Company Name</label>
                      <input
                        id="sCompany"
                        type="text"
                        v-model.trim="seller.companyName"
                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Your company (optional)"
                      />
                    </div>

                    <!-- Password -->
                    <div>
                      <label for="sPassword" class="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                      <div class="relative">
                        <input
                          id="sPassword"
                          :type="showSellerPassword ? 'text' : 'password'"
                          v-model="seller.password"
                          class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                          :class="{ 'border-red-500 bg-red-50': seller.submitted && seller.password.length < 8 }"
                          placeholder="Minimum 8 characters"
                          minlength="8"
                          required
                        />
                        <button
                          type="button"
                          @click="showSellerPassword = !showSellerPassword"
                          class="absolute inset-y-0 right-0 pr-4 flex items-center"
                        >
                          <svg v-if="!showSellerPassword" class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                          <svg v-else class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/>
                          </svg>
                        </button>
                      </div>
                      <div v-if="seller.submitted && seller.password.length < 8" class="text-red-500 text-sm mt-1">Password must be at least 8 characters</div>
                    </div>

                    <!-- Confirm Password -->
                    <div>
                      <label for="sConfirm" class="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                      <input
                        id="sConfirm"
                        type="password"
                        v-model="seller.confirm"
                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        :class="{ 'border-red-500 bg-red-50': seller.submitted && !sellerPasswordsMatch }"
                        placeholder="Re-enter password"
                        required
                      />
                      <div v-if="seller.submitted && !sellerPasswordsMatch" class="text-red-500 text-sm mt-1">Passwords don't match</div>
                    </div>

                    <!-- Address -->
                    <div class="md:col-span-2">
                      <label for="sAddress" class="block text-sm font-semibold text-gray-700 mb-2">Business Address</label>
                      <input
                        id="sAddress"
                        type="text"
                        v-model.trim="seller.address"
                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        :class="{ 'border-red-500 bg-red-50': seller.submitted && !seller.address }"
                        placeholder="Your business address"
                        required
                      />
                      <div v-if="seller.submitted && !seller.address" class="text-red-500 text-sm mt-1">Address is required</div>
                    </div>

                    <!-- City -->
                    <div>
                      <label for="sCity" class="block text-sm font-semibold text-gray-700 mb-2">City</label>
                      <input
                        id="sCity"
                        type="text"
                        v-model.trim="seller.city"
                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        :class="{ 'border-red-500 bg-red-50': seller.submitted && !seller.city }"
                        placeholder="Your city"
                        required
                      />
                      <div v-if="seller.submitted && !seller.city" class="text-red-500 text-sm mt-1">City is required</div>
                    </div>

                    <!-- State -->
                    <div>
                      <label for="sState" class="block text-sm font-semibold text-gray-700 mb-2">State</label>
                      <input
                        id="sState"
                        type="text"
                        v-model.trim="seller.state"
                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        :class="{ 'border-red-500 bg-red-50': seller.submitted && !seller.state }"
                        placeholder="Your state"
                        required
                      />
                      <div v-if="seller.submitted && !seller.state" class="text-red-500 text-sm mt-1">State is required</div>
                    </div>

                    <!-- Postal Code -->
                    <div>
                      <label for="sPostal" class="block text-sm font-semibold text-gray-700 mb-2">Postal Code</label>
                      <input
                        id="sPostal"
                        type="text"
                        v-model.trim="seller.postalCode"
                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        :class="{ 'border-red-500 bg-red-50': seller.submitted && !seller.postalCode }"
                        placeholder="e.g. 54000"
                        required
                      />
                      <div v-if="seller.submitted && !seller.postalCode" class="text-red-500 text-sm mt-1">Postal code is required</div>
                    </div>

                    <!-- Country -->
                    <div>
                      <label for="sCountry" class="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                      <input
                        id="sCountry"
                        type="text"
                        v-model.trim="seller.country"
                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        :class="{ 'border-red-500 bg-red-50': seller.submitted && !seller.country }"
                        placeholder="Pakistan"
                        required
                      />
                      <div v-if="seller.submitted && !seller.country" class="text-red-500 text-sm mt-1">Country is required</div>
                    </div>
                  </div>

                  <!-- Terms Checkbox -->
                  <div class="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="sTerms"
                      v-model="seller.acceptTerms"
                      class="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mt-1"
                      :class="{ 'border-red-500': seller.submitted && !seller.acceptTerms }"
                    />
                    <label for="sTerms" class="text-sm text-gray-600">
                      I accept the <a href="#" class="text-purple-600 hover:text-purple-500">Terms of Use</a> and <a href="#" class="text-purple-600 hover:text-purple-500">Privacy Policy</a>
                    </label>
                  </div>
                  <div v-if="seller.submitted && !seller.acceptTerms" class="text-red-500 text-sm">You must accept the terms and conditions</div>

                  <!-- Submit Button -->
                  <button
                    type="submit"
                    :disabled="seller.loading"
                    class="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    <div v-if="seller.loading" class="flex items-center justify-center space-x-2">
                      <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Creating Account...</span>
                    </div>
                    <div v-else class="flex items-center justify-center space-x-2">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                      </svg>
                      <span>Create Seller Account</span>
                    </div>
                  </button>
                </form>
                </div><!-- end v-if="!seller.registered" -->
              </div>

              <!-- Error Message -->
              <div v-if="errorMessage" class="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-2">
                <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
                <span class="text-sm">{{ errorMessage }}</span>
              </div>

              <!-- Login Link -->
              <div class="text-center mt-8">
                <span class="text-gray-600">Already have an account? </span>
                <router-link 
                  to="/loginuser" 
                  class="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
                >
                  Sign in here
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from "vue";
import { useRouter } from "vue-router";
import axios from "@/api/axios";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const formRef = ref(null);
const errorMessage = ref("");
const authStore = useAuthStore();

// Role management
const role = ref("buyer");

// Password visibility toggles
const showBuyerPassword = ref(false);
const showSellerPassword = ref(false);

function switchRole(newRole) {
  role.value = newRole;
  errorMessage.value = "";
  if (newRole === "buyer") {
    resetSeller();
  } else {
    resetBuyer();
  }
  nextTick(() => scrollToForm());
}

function goHome() {
  router.push("/");
}

function scrollToForm() {
  if (formRef.value) {
    formRef.value.scrollIntoView({ behavior: "smooth" });
  }
}

// ******************************
// Buyer (Customer) – OTP Flow
// ******************************
const buyer = ref({
  step: 1,
  submitted: false,
  loading: false,
  success: false,
  name: "",
  email: "",
  avatarFile: null,
  phone: "",
  password: "",
  confirm: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  acceptTerms: false,
  resendCooldown: 0,
  lastPayload: null,
  otpCode: "",
});

const validBuyerEmail = computed(() => /\S+@\S+\.\S+/.test(buyer.value.email));
const buyerPasswordsMatch = computed(() => buyer.value.password === buyer.value.confirm);

function onBuyerAvatarSelected(event) {
  buyer.value.avatarFile = event?.target?.files?.[0] || null;
}

function validateBuyerDetails() {
  buyer.value.submitted = true;
  const b = buyer.value;
  if (
    !b.name ||
    !validBuyerEmail.value ||
    !b.phone ||
    b.password.length < 8 ||
    !buyerPasswordsMatch.value ||
    !b.address ||
    !b.city ||
    !b.state ||
    !b.postalCode ||
    !b.country ||
    !b.acceptTerms
  ) {
    return false;
  }
  return true;
}

async function requestBuyerOtp() {
  errorMessage.value = "";
  if (!validateBuyerDetails()) return;
  
  buyer.value.loading = true;
  try {
    const payload = new FormData();
    payload.append("name", buyer.value.name);
    payload.append("email", buyer.value.email);
    payload.append("phone", buyer.value.phone);
    payload.append("password", buyer.value.password);
    payload.append("password_confirmation", buyer.value.confirm);
    payload.append("address", buyer.value.address);
    payload.append("city", buyer.value.city);
    payload.append("state", buyer.value.state);
    payload.append("postal_code", buyer.value.postalCode);
    payload.append("country", buyer.value.country);
    if (buyer.value.avatarFile) {
      payload.append("avatar", buyer.value.avatarFile);
    }

    buyer.value.lastPayload = payload;
    await axios.post("/customers/register/request-otp", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    
    buyer.value.step = 2;
    startBuyerResendTimer();
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || "Failed to request OTP.";
  } finally {
    buyer.value.loading = false;
  }
}

async function verifyBuyerOtp() {
  const code = buyer.value.otpCode;
  const email = buyer.value.email;
  
  if (!code || code.length !== 6) {
    errorMessage.value = "Please enter the 6-digit OTP.";
    return;
  }
  
  buyer.value.loading = true;
  try {
    const res = await axios.post("/customers/register/verify", {
      email: email,
      otp: code,
    });
    
    if (res?.data?.success) {
      errorMessage.value = "";
      // Auto-login: store token + user in auth store and localStorage
      const userData = res.data.data?.user;
      const token = res.data.data?.token;
      if (token && userData) {
        const userWithRole = { ...userData, role: "salesman" };
        authStore.user = userWithRole;
        authStore.token = token;
        authStore.isAuthenticated = true;
        try {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(userWithRole));
          localStorage.setItem("role", "salesman");
        } catch (_) {}
        // Redirect to home after short delay
        buyer.value.success = true;
        setTimeout(() => router.push("/"), 2000);
      } else {
        // No token returned — still success, go to login
        buyer.value.success = true;
        setTimeout(() => router.push("/loginuser"), 2000);
      }
    } else {
      errorMessage.value = res?.data?.message || "OTP incorrect. Please try again.";
    }
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || "OTP verification failed.";
  } finally {
    buyer.value.loading = false;
  }
}

async function resendBuyerOtp() {
  if (buyer.value.resendCooldown > 0) return;
  
  buyer.value.loading = true;
  try {
    await axios.post("/customers/register/resend-otp", {
      email: buyer.value.email,
    });
    startBuyerResendTimer();
    errorMessage.value = "";
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || "Failed to resend OTP.";
  } finally {
    buyer.value.loading = false;
  }
}

function startBuyerResendTimer() {
  buyer.value.resendCooldown = 60;
  const interval = setInterval(() => {
    buyer.value.resendCooldown--;
    if (buyer.value.resendCooldown <= 0) {
      clearInterval(interval);
    }
  }, 1000);
}

function resetBuyer() {
  buyer.value = {
    step: 1,
    submitted: false,
    loading: false,
    success: false,
    name: "",
    email: "",
    avatarFile: null,
    phone: "",
    password: "",
    confirm: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    acceptTerms: false,
    resendCooldown: 0,
    lastPayload: null,
    otpCode: "",
  };
}

// ******************************
// Seller – Direct Registration
// ******************************
const seller = ref({
  submitted: false,
  loading: false,
  registered: false,
  name: "",
  email: "",
  avatarFile: null,
  phone: "",
  companyName: "",
  password: "",
  confirm: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  acceptTerms: false,
});

const validSellerEmail = computed(() => /\S+@\S+\.\S+/.test(seller.value.email));
const sellerPasswordsMatch = computed(() => seller.value.password === seller.value.confirm);

function onSellerAvatarSelected(event) {
  seller.value.avatarFile = event?.target?.files?.[0] || null;
}

function validateSeller() {
  seller.value.submitted = true;
  const s = seller.value;
  if (
    !s.name ||
    !validSellerEmail.value ||
    !s.phone ||
    s.password.length < 8 ||
    !sellerPasswordsMatch.value ||
    !s.address ||
    !s.city ||
    !s.state ||
    !s.postalCode ||
    !s.country ||
    !s.acceptTerms
  ) {
    return false;
  }
  return true;
}

async function handleSellerRegister() {
  errorMessage.value = "";
  if (!validateSeller()) return;
  
  seller.value.loading = true;
  try {
    const payload = new FormData();
    payload.append("name", seller.value.name);
    payload.append("email", seller.value.email);
    payload.append("phone", seller.value.phone);
    payload.append("password", seller.value.password);
    payload.append("password_confirmation", seller.value.confirm);
    payload.append("role", "seller");
    payload.append("company_name", seller.value.companyName || "");
    payload.append("address", seller.value.address);
    payload.append("city", seller.value.city);
    payload.append("state", seller.value.state);
    payload.append("postal_code", seller.value.postalCode);
    payload.append("country", seller.value.country);
    if (seller.value.avatarFile) {
      payload.append("avatar", seller.value.avatarFile);
    }

    const response = await axios.post("/sellers/register", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (response?.data?.success) {
      errorMessage.value = "";
      seller.value.registered = true;
    } else {
      errorMessage.value = response?.data?.message || "Registration failed. Please try again.";
    }
  } catch (error) {
    errorMessage.value = error?.response?.data?.message || "Registration failed. Please try again.";
  } finally {
    seller.value.loading = false;
  }
}

function resetSeller() {
  seller.value = {
    submitted: false,
    loading: false,
    registered: false,
    name: "",
    email: "",
    avatarFile: null,
    phone: "",
    companyName: "",
    password: "",
    confirm: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    acceptTerms: false,
  };
}
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

/* Enhanced hover effects */
button:hover {
  transform: translateY(-1px);
}

/* Progress bar animation */
.progress-bar {
  transition: width 0.5s ease-in-out;
}

/* Form animations */
.form-slide-enter-active,
.form-slide-leave-active {
  transition: all 0.3s ease;
}

.form-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.form-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
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
  
  .grid {
    grid-template-columns: 1fr !important;
  }
}

@media (max-width: 640px) {
  .rounded-3xl {
    border-radius: 0;
  }
  
  .min-h-screen {
    min-height: 100vh;
  }
  
  .p-4 {
    padding: 0;
  }
}

/* Custom input focus effects */
input:focus-within {
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

/* Success animation */
@keyframes success-bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.success-animation {
  animation: success-bounce 1s ease-in-out;
}
</style>
