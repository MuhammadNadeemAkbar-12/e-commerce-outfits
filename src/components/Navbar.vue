<template>
	<div>
		<!-- Main Navbar -->
		<header
			ref="headerRef"
			class="site-header bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50"
			:class="{ 'shadow-sm': scrolled }">
			<div class="nav-shell max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="flex items-center justify-between h-16">
					<!-- Logo -->
					<div
						class="flex items-center gap-2 cursor-pointer select-none"
						@click="router.push('/')"
						@keydown.enter="router.push('/')"
						tabindex="0"
						role="button"
						aria-label="Go to Home">
						<div class="brand-mark">S</div>
						<span class="brand-name text-lg font-semibold text-gray-900">StyleHub</span>
					</div>

					<!-- Desktop Navigation (>= 969px) -->
					<nav class="show-desktop items-center gap-1">
						<button @click="goToProducts" class="nav-btn">
							<span>Shop</span>
						</button>
						<button
							@click="toggleSearch"
							class="nav-btn">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
							<span>Search</span>
						</button>

						<button
							v-if="canUseWishlist"
							@click="toggleWishlist"
							class="nav-btn relative">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
									d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
							</svg>
							<span>Wishlist</span>
							<span v-if="wishlistStore.count > 0" class="nav-badge">{{ wishlistStore.count }}</span>
						</button>

						<button
							v-if="canShop"
							@click="toggleCart"
							class="nav-btn relative">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
									d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
							</svg>
							<span>Cart</span>
							<span v-if="cartCount > 0" class="nav-badge">{{ cartCount }}</span>
						</button>

						<button
							@click="toggleContact"
							class="nav-btn">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
									d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
							</svg>
							<span>Contact</span>
						</button>
					</nav>

					<!-- Right Side Actions -->
					<div class="show-desktop items-center gap-2">
						<template v-if="authStore.isLoggedIn">
							<UserProfile />
						</template>
						<template v-else>
							<router-link to="/loginuser" class="nav-btn">Login</router-link>
							<router-link to="/registeruser" class="nav-btn-primary">Sign Up</router-link>
						</template>
					</div>

					<!-- Mobile Menu Button (≤ 968px) -->
					<button
						@click="toggleMobileMenu"
						class="hide-desktop p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
						<svg v-if="!showMobileMenu" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
						</svg>
						<svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
			</div>

			<!-- Mobile Menu -->
				<div v-if="showMobileMenu" class="hide-desktop border-t border-gray-200 bg-white">
					<div class="px-4 py-3 space-y-1">
						<button @click="goToProducts" class="mobile-nav-btn">Shop</button>
						<button @click="toggleSearch" class="mobile-nav-btn">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
						Search
					</button>
						<button v-if="canUseWishlist" @click="toggleWishlist" class="mobile-nav-btn relative">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
						</svg>
						Wishlist
						<span v-if="wishlistStore.count > 0" class="ml-auto text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{{ wishlistStore.count }}</span>
					</button>
						<button v-if="canShop" @click="toggleCart" class="mobile-nav-btn">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
						</svg>
						Cart
						<span v-if="cartCount > 0" class="ml-auto text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{{ cartCount }}</span>
					</button>
					<button @click="toggleContact" class="mobile-nav-btn">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
						</svg>
						Contact
					</button>
				</div>

				<!-- Mobile Auth -->
				<div class="px-4 py-3 border-t border-gray-100">
					<template v-if="authStore.isLoggedIn">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								<img
									v-if="authStore.currentUser?.avatar"
									:src="authStore.currentUser?.avatar"
									alt="avatar"
									class="w-8 h-8 rounded-full object-cover" />
								<div
									v-else
									class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">
									{{
										(authStore.currentUser?.name || authStore.currentUser?.email || "U")
											.split(" ").map((s) => s[0]).slice(0, 2).join("")
									}}
								</div>
								<div>
									<div class="text-sm font-medium text-gray-900">
										{{
											authStore.currentUser?.name ||
											authStore.currentUser?.email
											}}
										</div>
										<div class="text-xs text-gray-500">
											{{ authStore.currentUser?.role || "" }}
										</div>
									</div>
								</div>
								<div class="flex gap-2">
									<button
										@click="() => { showMobileMenu = false; router.push('/customer/profile'); }"
										class="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
										Profile
									</button>
									<button
										@click="() => { showMobileMenu = false; handleLogout(); }"
										class="px-3 py-1.5 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors">
										Logout
									</button>
								</div>
							</div>
						</template>
						<template v-else>
							<div class="flex gap-2 pt-1">
								<router-link
									to="/loginuser"
									class="flex-1 text-center px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 hover:bg-gray-50 rounded-md transition-colors"
									@click="showMobileMenu = false">
									Login
								</router-link>
								<router-link
									to="/registeruser"
									class="flex-1 text-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
									@click="showMobileMenu = false">
									Sign Up
								</router-link>
							</div>
						</template>
					</div>
			</div>

			<!-- Search Overlay -->
			<div
				v-if="showSearchOverlay"
				class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
				<div
					class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-6 transform transition-all duration-300"
					@click.stop>
					<div class="flex items-center space-x-4 mb-4">
						<svg
							class="w-6 h-6 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
						</svg>
						<input
							ref="searchInput"
							v-model="searchQuery"
							type="text"
							placeholder="Search for products, brands, categories..."
							class="flex-1 text-lg border-none outline-none bg-transparent"
							@keyup.enter="submitSearch"
							@keyup.escape="closeSearch" />
						<button
							@click="closeSearch"
							class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200">
							<svg
								class="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
					<div class="border-t border-gray-200 pt-4">
						<div class="text-sm text-gray-500 mb-3">Popular searches:</div>
						<div class="flex flex-wrap gap-2">
							<span
								v-for="tag in popularSearches"
								:key="tag"
								@click="
									searchQuery = tag;
									submitSearch();
								"
								class="px-3 py-1 bg-gray-100 hover:bg-indigo-100 hover:text-indigo-600 text-gray-600 rounded-full text-sm cursor-pointer transition-colors duration-200">
								{{ tag }}
							</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Contact Modal -->
			<div v-if="showContactModal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
				<div class="bg-white rounded-xl shadow-xl w-full max-w-md" @click.stop>
					<div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
						<h3 class="text-base font-semibold text-gray-900">Contact Us</h3>
						<button @click="closeContact" class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>

					<div class="p-6 space-y-4">
						<div class="space-y-2">
							<div class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
								<svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
								</svg>
								<div>
									<div class="text-sm font-medium text-gray-800">Email</div>
									<div class="text-xs text-gray-500">stylehub@gmail.com</div>
								</div>
							</div>
							<div class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
								<svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
								</svg>
								<div>
									<div class="text-sm font-medium text-gray-800">Phone</div>
									<div class="text-xs text-gray-500">+92 300 1234567</div>
								</div>
							</div>
							<div class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
								<svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
								</svg>
								<div>
									<div class="text-sm font-medium text-gray-800">Live Chat</div>
									<div class="text-xs text-gray-500">Available 24/7</div>
								</div>
							</div>
						</div>

						<form @submit.prevent="submitContactForm" class="space-y-3 pt-2 border-t border-gray-100">
							<div>
								<label class="block text-sm font-medium text-gray-700 mb-1"
									>Quick Message</label
								>
								<textarea
									v-model="contactMessage"
									rows="3"
									placeholder="How can we help you today?"
									class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"></textarea>
							</div>
							<button
								type="submit"
								:disabled="!contactMessage.trim()"
								class="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed">
								Send Message
							</button>
						</form>

						<div class="pt-4 border-t border-gray-200 space-y-3 text-center">
							<button
								@click="showContactModal = false"
								class="w-full px-4 py-3 bg-gray-200 rounded-xl hover:bg-gray-300 transition-colors">
								Close
							</button>
						</div>
					</div>
				</div>
			</div>
		</header>

		<!-- Spacer to offset fixed navbar height -->
		<div :style="{ height: headerHeight + 'px' }"></div>

		<!-- Cart Sidebar -->
		<div v-if="showCartSidebar" class="fixed inset-0 bg-black/40 z-50 flex justify-end">
			<div class="bg-white w-full max-w-md h-full shadow-xl flex flex-col" @click.stop>
				<div class="flex items-center justify-between px-5 py-4 border-b border-gray-200">
					<div>
						<h3 class="text-base font-semibold text-gray-900">Shopping Cart</h3>
						<p class="text-xs text-gray-500">{{ cartCount }} items</p>
					</div>
					<button @click="closeCart" class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
				</div>

				<div class="flex-1 overflow-auto p-5">
					<div v-if="cartCount === 0" class="text-center py-16">
						<svg class="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
						</svg>
						<p class="text-sm text-gray-500 mb-4">Your cart is empty</p>
						<button @click="closeCart" class="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
							Continue Shopping
						</button>
					</div>
					<div v-else>
						<div class="space-y-4 max-h-[60vh] overflow-auto">
							<div
								v-for="item in cartStore.cartItems"
								:key="item.id"
								class="flex items-center justify-between p-3 border rounded-lg">
								<div class="flex items-center gap-3">
									<img
										:src="item.image || '/vite.svg'"
										alt="img"
										class="w-16 h-16 object-cover rounded" />
									<div>
										<div class="font-semibold text-gray-800">
											{{ item.title }}
										</div>
										<div class="text-sm text-gray-500">
											${{ (item.price || 0).toFixed(2) }}
										</div>
									</div>
								</div>
								<div class="flex flex-col items-end gap-2">
									<div class="flex items-center gap-2">
										<button
											@click="updateCartQuantity(item.id, item.quantity - 1)"
											class="px-2 py-1 bg-gray-100 rounded">
											-
										</button>
										<div class="px-3">{{ item.quantity }}</div>
										<button
											@click="updateCartQuantity(item.id, item.quantity + 1)"
											class="px-2 py-1 bg-gray-100 rounded">
											+
										</button>
									</div>
									<div class="text-sm text-gray-600">
										Total: ${{
											((item.price || 0) * (item.quantity || 0)).toFixed(2)
										}}
									</div>
									<button
										@click="removeCartItem(item.id)"
										class="text-red-500 text-sm mt-1">
										Remove
									</button>
								</div>
							</div>
						</div>
						<div class="pt-4 border-t">
							<div class="flex items-center justify-between mb-3">
								<div class="font-semibold">Subtotal</div>
								<div class="font-semibold text-indigo-600">
									${{ safeSubtotal }}
								</div>
							</div>
							<div class="flex gap-2">
								<button
									@click="proceedToCheckout"
									class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg">
									Checkout
								</button>
								<button
									@click="closeCart"
									class="flex-1 px-4 py-2 bg-gray-200 rounded-lg">
									Continue Shopping
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Wishlist Sidebar -->
		<div v-if="showWishlistSidebar" class="fixed inset-0 bg-black/40 z-50 flex justify-end">
			<div class="bg-white w-full max-w-md h-full shadow-xl flex flex-col" @click.stop>
				<div class="flex items-center justify-between px-5 py-4 border-b border-gray-200">
					<h3 class="text-base font-semibold text-gray-900">Wishlist</h3>
					<button @click="closeWishlist" class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<div class="flex-1 overflow-auto p-5">
					<div v-if="wishlistStore.count === 0" class="text-center py-16">
						<svg class="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
						</svg>
						<p class="text-sm text-gray-500 mb-4">Your wishlist is empty</p>
						<button @click="closeWishlist" class="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
							Start Shopping
						</button>
					</div>
					<div v-else>
						<div class="flex items-center justify-between mb-4">
							<h4 class="text-lg font-semibold">
								Your Wishlist ({{ wishlistStore.count }})
							</h4>
							<div class="flex gap-2">
								<button
									@click="
										async () => {
											await wishlistStore.clearAll();
											$q.notify({ message: 'Wishlist cleared' });
										}
									"
									class="px-3 py-1 bg-gray-100 rounded">
									Clear
								</button>
								<button
									@click="closeWishlist"
									class="px-3 py-1 bg-gray-200 rounded">
									Close
								</button>
							</div>
						</div>
						<div class="overflow-auto max-h-[60vh] pr-2">
							<ul class="space-y-4">
								<li
									v-for="it in wishlistStore.wishlistItems"
									:key="it.id"
									class="flex items-center gap-3">
									<img
										:src="it.image || '/vite.svg'"
										alt="img"
										class="w-16 h-16 object-cover rounded" />
									<div class="flex-1">
										<div class="font-semibold">
											{{ it.name ?? "Product #" + it.product_id }}
										</div>
										<div class="text-sm text-gray-500">
											₹{{ it.price ?? "-" }}
										</div>
									</div>
									<div class="flex gap-2">
										<button
											@click="
												async () => {
													await wishlistStore.remove(it.id);
													$q.notify({ message: 'Removed from wishlist' });
												}
											"
											class="px-3 py-1 bg-red-100 text-red-600 rounded">
											Remove
										</button>
									</div>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
	import { ref, nextTick, onMounted, onUnmounted, computed } from "vue";
	import { useAuthStore } from "@/stores/auth";
	import { useCartStore } from "@/stores/cart";
	import { useRouter } from "vue-router";
	import { useQuasar } from "quasar";
	import UserProfile from "./common/UserProfile.vue";
	import { useWishlistStore } from "@/stores/wishlist";

	const showMobileMenu = ref(false);
	const showSearchOverlay = ref(false);
	const showContactModal = ref(false);
	const showCartSidebar = ref(false);
	const showWishlistSidebar = ref(false);
	const searchQuery = ref("");
	const contactMessage = ref("");
	const headerRef = ref(null);
	const headerHeight = ref(0);
	const scrolled = ref(false);
	const $q = useQuasar();
	const cartStore = useCartStore();
	const authStore = useAuthStore();
	const wishlistStore = useWishlistStore();
	const canShop = computed(() => !authStore.isLoggedIn || ["customer", "buyer"].includes(authStore.role));
	const canUseWishlist = computed(() => authStore.isLoggedIn && ["customer", "buyer"].includes(authStore.role));

	// make cartCount reactive so UI updates immediately when store changes
	const cartCount = computed(() => cartStore.totalItems);

	const safeSubtotal = computed(() => {
		const p = Number(cartStore.totalPrice) || 0;
		return p.toFixed(2);
	});
	const searchInput = ref(null);

	const popularSearches = ref([
		"Summer Collection",
		"Dresses",
		"Sneakers",
		"Accessories",
		"Sale Items",
		"New Arrivals",
	]);

	// Desktop starts at 969px now
	const DESKTOP_MIN = 969;

	function handleResize() {
		if (window.innerWidth >= DESKTOP_MIN) {
			showMobileMenu.value = false;
		}
	}

	onMounted(() => {
		window.addEventListener("resize", handleResize);
		window.addEventListener("scroll", handleScroll, { passive: true });
		handleResize();
		measureHeader();
		// if logged in, fetch remote cart to sync
		if (authStore.checkAuth() && ["customer", "buyer"].includes(authStore.role)) {
			cartStore.fetchRemoteCart && cartStore.fetchRemoteCart();
		}
	});

	onUnmounted(() => {
		window.removeEventListener("resize", handleResize);
		window.removeEventListener("scroll", handleScroll);
	});

	function measureHeader() {
		if (headerRef.value) {
			headerHeight.value = headerRef.value.offsetHeight || 0;
		}
	}

	function handleScroll() {
		scrolled.value = window.scrollY > 10;
		// in case of dynamic height changes (e.g., auth state), re-measure
		measureHeader();
	}

	function toggleMobileMenu() {
		showMobileMenu.value = !showMobileMenu.value;
	}

	function toggleSearch() {
		showSearchOverlay.value = true;
		showMobileMenu.value = false;
		nextTick(() => {
			searchInput.value && searchInput.value.focus();
		});
	}

	function closeSearch() {
		showSearchOverlay.value = false;
		searchQuery.value = "";
	}

	async function submitSearch() {
		const search = searchQuery.value.trim();
		if (!search) return;

		showSearchOverlay.value = false;
		searchQuery.value = "";
		await router.push({ path: "/", query: { search } });
		nextTick(() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" }));
	}

	function toggleContact() {
		showMobileMenu.value = false;
		router.push("/contact");
	}

	async function goToProducts() {
		showMobileMenu.value = false;
		if (router.currentRoute.value.path !== "/") await router.push("/");
		nextTick(() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" }));
	}

	function closeContact() {
		showContactModal.value = false;
		contactMessage.value = "";
	}

	function submitContactForm() {
		if (contactMessage.value.trim()) {
			alert("Message sent successfully! We'll get back to you soon.");
			closeContact();
		}
	}

	function toggleCart() {
		showCartSidebar.value = true;
		showMobileMenu.value = false;
	}

	function closeCart() {
		showCartSidebar.value = false;
	}

	function toggleWishlist() {
		showWishlistSidebar.value = true;
		showMobileMenu.value = false;
	}

	function closeWishlist() {
		showWishlistSidebar.value = false;
	}

	function scrollToSection(sectionId) {
		showMobileMenu.value = false;
		const el = document.getElementById(sectionId);
		if (el) el.scrollIntoView({ behavior: "smooth" });
	}

	// auth
	const router = useRouter();

	function handleLogout() {
		// clear wishlist locally so guest sees empty wishlist after logout
		try {
			if (wishlistStore && wishlistStore.items) {
				wishlistStore.items = [];
			}
		} catch (e) {
			// ignore
		}
		authStore.logout();
		router.push("/");
	}

	function updateCartQuantity(productId, quantity) {
		if (quantity <= 0) {
			cartStore
				.syncRemove(productId)
				.then(() => {
					$q.notify({ type: "positive", message: "Item removed from cart" });
				})
				.catch(() => {
					$q.notify({ type: "negative", message: "Remove failed" });
				});
		} else {
			cartStore
				.syncUpdate(productId, quantity)
				.then(() => {
					$q.notify({ type: "positive", message: "Cart updated" });
				})
				.catch(() => {
					$q.notify({ type: "negative", message: "Update failed" });
				});
		}
	}

	function removeCartItem(productId) {
		cartStore
			.syncRemove(productId)
			.then(() => {
				$q.notify({ type: "positive", message: "Item removed from cart" });
			})
			.catch(() => {
				$q.notify({ type: "negative", message: "Remove failed" });
			});
	}

	function proceedToCheckout() {
		// quick placeholder
		router.push("/checkout");
		closeCart();
	}
</script>

<style scoped>
	/* Desktop breakpoint >= 969px */
	.show-desktop {
		display: none;
	}
	.hide-desktop {
		display: block;
	}
	@media (min-width: 969px) {
		.show-desktop {
			display: flex;
		}
		.hide-desktop {
			display: none;
		}
	}

	.nav-btn {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.625rem;
		font-size: 0.875rem;
		color: #536059;
		border-radius: 0.5rem;
		font-weight: 600;
		transition: color 0.15s, background-color 0.15s;
		position: relative;
	}
	.nav-btn:hover {
		color: #244a42;
		background-color: #edf2ef;
	}

	.nav-btn-primary {
		display: inline-flex;
		align-items: center;
		padding: 0.375rem 0.875rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: #fff;
		background-color: #315f55;
		border-radius: 0.5rem;
		transition: background-color 0.15s;
	}
	.nav-btn-primary:hover {
		background-color: #244a42;
	}

	.nav-badge {
		position: absolute;
		top: -4px;
		right: -4px;
		min-width: 18px;
		height: 18px;
		padding: 0 4px;
		font-size: 11px;
		font-weight: 600;
		color: #fff;
		background-color: #987454;
		border-radius: 9999px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.mobile-nav-btn {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		width: 100%;
		padding: 0.5rem 0.5rem;
		font-size: 0.875rem;
		color: #374151;
		border-radius: 0.375rem;
		transition: background-color 0.15s;
	}
	.mobile-nav-btn:hover {
		background-color: #edf2ef;
	}

	.site-header {
		border-color: rgba(49, 64, 56, .12);
		background: rgba(255, 253, 249, .94) !important;
		box-shadow: 0 8px 28px rgba(29, 39, 34, .055);
		backdrop-filter: blur(14px);
	}
	.nav-shell { max-width: 1180px; }
	.brand-mark {
		display: grid;
		width: 2rem;
		height: 2rem;
		place-items: center;
		border-radius: .55rem;
		background: #315f55;
		color: #fff;
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 1rem;
		font-weight: 700;
		box-shadow: inset 0 0 0 1px rgba(255,255,255,.16);
	}
	.brand-name { color: #222a26; font-family: Georgia, 'Times New Roman', serif; letter-spacing: -.02em; }

	/* Small devices tweaks */
	@media (max-width: 640px) {
		.max-w-md {
			max-width: 100vw;
		}
	}

	/* High contrast */
	@media (prefers-contrast: high) {
		.bg-white\/95 {
			background: #fff;
		}
		.text-gray-600 {
			color: #000;
		}
		.border-gray-200\/50 {
			border-color: #000;
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		* {
			animation-duration: 0.01ms !important;
			animation-iteration-count: 1 !important;
			transition-duration: 0.01ms !important;
		}
	}
</style>
