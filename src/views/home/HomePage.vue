<template>
	<div
		class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
		<!-- Hero Section - Enhanced -->
		<section
			class="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
			<div class="absolute inset-0 bg-black/20"></div>
			<div
				class="absolute inset-0 bg-gradient-to-b from-transparent to-black/10"></div>

			<!-- Floating Elements removed for cleaner look -->

			<div
				class="relative mx-auto max-w-7xl px-6 pt-16 pb-20 md:pt-24 md:pb-28">
				<div class="flex flex-col md:flex-row gap-12 items-center">
					<div class="flex-1 text-center md:text-left">
						<div
							class="inline-block px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white/90 text-sm font-medium mb-6 border border-white/30">
							✨ New Collections Available
						</div>
						<h1
							class="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight mb-6">
							Elevate Your
							<span
								class="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
								Style
							</span>
							<br class="hidden md:block" />
							<span class="text-4xl md:text-5xl lg:text-6xl"
								>Discover Amazing</span
							>
							<span
								class="bg-gradient-to-r from-pink-300 to-purple-400 bg-clip-text text-transparent ml-3">
								Collections
							</span>
						</h1>
						<p
							class="text-xl md:text-2xl text-white/90 max-w-2xl mb-8 leading-relaxed">
							Hand‑picked premium products with lightning-fast delivery,
							ultra-secure checkout and hassle-free returns.
						</p>
						<div class="flex flex-wrap gap-4 justify-center md:justify-start">
							<button
								class="px-8 py-4 rounded-2xl border-2 border-white/30 text-white font-semibold text-lg backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
								View Catalog
							</button>
						</div>
					</div>
					<div class="flex-1 relative">
						<div class="relative group">
							<div
								class="absolute -inset-4 bg-gradient-to-r from-pink-500 to-blue-500 rounded-3xl blur-2xl opacity-20"></div>
							<div
								class="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 backdrop-blur-sm">
								<img
									class="w-full h-[420px] object-cover transition duration-300"
									src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80"
									alt="Hero Fashion Banner"
									loading="lazy" />
								<div
									class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Categories Section - Enhanced -->
		<section class="max-w-7xl mx-auto px-6 -mt-8 relative z-10 mb-10">
			<div
				class="category-shell rounded-2xl border border-slate-200 bg-white shadow-xl p-6 md:p-7">
				<div class="flex items-start justify-between gap-4 mb-5">
					<div>
						<h2 class="text-2xl md:text-3xl font-black tracking-tight text-slate-800 mb-1">
							Browse Categories
						</h2>
						<p class="text-slate-500 text-sm md:text-base">
							Discover products across different categories
						</p>
					</div>
					<button
						v-if="categoriesError"
						@click="fetchCategoriesProducts"
						class="px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition font-medium">
						🔄 Retry
					</button>
				</div>

				<div class="category-chip-wrap">
					<button
						class="cat-chip-enhanced"
						:class="activeCategoryId === null ? 'cat-chip-enhanced--active' : ''"
						@click="selectAll">
						<span class="flex items-center gap-2">
							View All
							<span v-if="totalProductsAll" class="count-enhanced">{{ totalProductsAll }}</span>
						</span>
					</button>

					<template v-if="!loadingCategories && categories.length">
						<button
							v-for="c in categories"
							:key="c.id"
							class="cat-chip-enhanced"
							:class="activeCategoryId === c.id ? 'cat-chip-enhanced--active' : ''"
							@click="selectCategory(c)">
							<span class="flex items-center gap-2">
								{{ c.name }}
								<span v-if="typeof c.products_count === 'number'" class="count-enhanced">{{ c.products_count }}</span>
							</span>
						</button>
					</template>

					<template v-else-if="loadingCategories">
						<div
							v-for="n in 6"
							:key="'cat-skel-' + n"
							class="animate-pulse h-14 w-32 rounded-2xl bg-gradient-to-r from-slate-200 to-slate-300" />
					</template>
				</div>

				<p
					v-if="categoriesError"
					class="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-xl">
					{{ categoriesError }}
				</p>
			</div>
		</section>

		<!-- Enhanced Controls Section -->
		<section class="max-w-7xl mx-auto px-6 mb-7">
			<div class="control-shell rounded-2xl border border-slate-200 bg-white shadow-lg p-5 md:p-6">
				<div class="flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">
					<div class="flex flex-1 flex-col md:flex-row gap-3">
						<div class="relative flex-1">
							<div class="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-xs font-medium tracking-wide">
								Search
							</div>
							<input
								v-model.trim="searchQuery"
								type="text"
								placeholder="Search products, brands, categories..."
								class="w-full rounded-xl border border-slate-300 pl-20 pr-10 py-3.5 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition" />
							<button
								v-if="searchQuery"
								@click="searchQuery = ''"
								class="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition">
								×
							</button>
						</div>

						<div class="relative">
							<select
								v-model="sortKey"
								class="appearance-none rounded-xl border border-slate-300 px-4 py-3.5 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none bg-white cursor-pointer min-w-[210px]">
								<option value="featured">Featured</option>
								<option value="price-asc">Price: Low to High</option>
								<option value="price-desc">Price: High to Low</option>
								<option value="stock-desc">Stock: High to Low</option>
								<option value="name-asc">Name: A to Z</option>
							</select>
							<div class="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
								▼
							</div>
						</div>

						<button
							@click="resetFilters"
							class="px-5 py-3.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-700 text-sm font-semibold hover:bg-slate-100 transition-all">
							Reset
						</button>
					</div>

					<div class="flex items-center gap-3 flex-wrap justify-end">
						<div class="text-sm text-slate-600 bg-slate-100 border border-slate-200 px-4 py-2 rounded-lg">
							Page
							<span class="font-bold text-slate-800">{{ pagination.currentPage }}</span>
							/ <span class="font-bold">{{ pagination.lastPage || 1 }}</span>
						</div>

						<div class="flex gap-2">
							<button
								@click="goPrev"
								:disabled="pagination.currentPage <= 1 || loadingProducts"
								class="pager-btn-enhanced">
								Previous
							</button>
							<button
								@click="goNext"
								:disabled="pagination.currentPage >= pagination.lastPage || loadingProducts"
								class="pager-btn-enhanced">
								Next
							</button>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Products Grid - Enhanced -->
		<section class="max-w-7xl mx-auto px-6 pb-20">
			<div class="flex items-center justify-between gap-4 mb-7 flex-wrap">
				<div>
					<h2 class="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-1">
						{{ activeCategoryLabel }}
					</h2>
					<p class="text-slate-500">Curated picks with best value and fast shipping</p>
				</div>
				<div
					v-if="!loadingProducts && displayProducts.length"
					class="bg-blue-50 px-6 py-3 rounded-2xl border border-blue-200">
					<span class="text-sm text-blue-600">Showing </span>
					<span class="font-bold text-blue-800 text-lg">{{
						displayProducts.length
					}}</span>
					<span class="text-sm text-blue-600"> premium items</span>
				</div>
			</div>

			<!-- Enhanced Skeletons -->
			<div
				v-if="loadingProducts"
				class="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				<div
					v-for="n in 8"
					:key="'prod-skel-' + n"
					class="group rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-lg animate-pulse">
					<div class="relative">
						<div
							class="h-64 w-full bg-gradient-to-br from-slate-200 to-slate-300"></div>
						<div
							class="absolute top-4 left-4 w-16 h-6 bg-slate-300 rounded-lg"></div>
						<div
							class="absolute top-4 right-4 w-12 h-6 bg-slate-300 rounded-lg"></div>
					</div>
					<div class="p-6 space-y-4">
						<div class="h-6 w-3/4 bg-slate-200 rounded-lg"></div>
						<div class="flex gap-2">
							<div class="h-5 w-20 bg-slate-200 rounded-full"></div>
							<div class="h-5 w-16 bg-slate-200 rounded-full"></div>
						</div>
						<div class="h-4 w-full bg-slate-200 rounded"></div>
						<div class="h-4 w-4/5 bg-slate-200 rounded"></div>
						<div class="flex justify-between items-center pt-4">
							<div class="h-8 w-24 bg-slate-200 rounded-xl"></div>
							<div class="flex gap-2">
								<div class="h-8 w-16 bg-slate-200 rounded-xl"></div>
								<div class="h-8 w-20 bg-slate-200 rounded-xl"></div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Enhanced Products Grid -->
			<div
				v-else
				class="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
				<div
					v-for="(product, idx) in visibleProducts"
					:key="product.id ?? idx"
					class="group relative flex flex-col bg-white border border-slate-200 rounded-xl shadow-none hover:shadow-sm transition-shadow duration-150 overflow-hidden"
					@mouseenter="() => startAutoPlay(product)"
					@mouseleave="() => stopAutoPlay(product)">
					<div
						class="relative w-full h-64 bg-slate-100 overflow-hidden cursor-pointer"
						@click="openQuickView(product)"
						@touchstart="(e) => onTouchStart(e, product)"
						@touchend="(e) => onTouchEnd(e, product)">
						<img
							:src="
								product.gallery.length
									? product.gallery[product.currentIndex]
									: product.image
							"
							:alt="product.name"
							class="w-full h-full object-cover transition-opacity duration-300"
							loading="lazy" />

						<div
							v-if="product.gallery.length > 1"
							class="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
							<button
								v-for="(g, i) in product.gallery"
								:key="i"
								@click.stop="selectImage(product, i)"
								class="w-3 h-3 rounded-full transition-colors duration-200"
								:class="
									product.currentIndex === i
										? 'bg-white shadow-lg'
										: 'bg-white/60 hover:bg-white/80'
								" />
						</div>

						<div class="absolute top-4 left-4">
							<div
								class="px-3 py-1 rounded-full text-xs font-semibold border shadow-sm"
								:class="
									product.stock > 0
										? 'bg-emerald-500 text-white border-emerald-500'
										: 'bg-red-500 text-white border-red-500'
								">
								{{ product.stock > 0 ? "In Stock" : "Out of Stock" }}
							</div>
						</div>

						<div v-if="product.seller" class="absolute top-4 right-4">
							<div
								class="px-3 py-1 rounded-full text-xs font-semibold bg-white text-slate-700 border border-slate-200 shadow-sm">
								{{ product.seller }}
							</div>
						</div>
					</div>

					<div class="flex flex-col flex-1 p-5 bg-white">
						<h3
							class="font-semibold text-slate-900 text-lg mb-2 line-clamp-1">
							{{ product.name }}
						</h3>

						<div class="flex items-center gap-2 mb-2 flex-wrap">
							<span
								class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
								{{ product.category }}
							</span>
						</div>

						<p class="text-sm text-slate-600 line-clamp-2 mb-3 leading-relaxed">
							{{ product.description }}
						</p>

						<div class="mt-auto">
							<div class="flex items-center justify-between mb-3">
								<div class="text-2xl font-bold text-indigo-600">
									₹{{ product.priceDisplay }}
								</div>
								<div class="text-xs text-slate-400">Premium</div>
							</div>
							<div class="flex gap-2 items-center">
								<button
									class="w-24 px-3 py-2.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition"
									@click.stop="openQuickView(product)">
									View
								</button>
								<button
									:disabled="product.stock === 0"
									@click.stop="addToCart(product)"
									class="flex-1 min-w-0 px-3 py-2.5 rounded-lg text-sm font-medium transition whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 text-white hover:bg-indigo-700">
									Add to Cart
								</button>
								<button
									@click.stop="toggleWishlist(product)"
									:aria-pressed="wishlistStore.isInWishlist(product.id)"
									class="w-11 h-11 rounded-lg border border-slate-300 text-sm font-medium transition-colors hover:bg-slate-50 flex items-center justify-center"
									:title="
										wishlistStore.isInWishlist(product.id)
											? 'Remove from wishlist'
											: 'Add to wishlist'
									">
									<svg
										v-if="wishlistStore.isInWishlist(product.id)"
										class="w-5 h-5 text-red-600"
										viewBox="0 0 24 24"
										fill="currentColor"
										aria-hidden="true">
										<path
											d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 3.99 4 6.5 4 8.24 4 9.91 4.81 11 6.09 12.09 4.81 13.76 4 15.5 4 18.01 4 20 6 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
									</svg>
									<svg
										v-else
										class="w-5 h-5 text-gray-400"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="1.5"
										aria-hidden="true">
										<path
											d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3z" />
									</svg>
								</button>
							</div>
						</div>
					</div>
				</div>

				<!-- No Products Message -->
				<div
					v-if="!visibleProducts.length && !loadingProducts"
					class="col-span-full text-center py-20">
					<div class="max-w-md mx-auto">
						<div class="text-6xl mb-4">🔍</div>
						<h3 class="text-2xl font-bold text-slate-700 mb-2">
							No Products Found
						</h3>
						<p class="text-slate-500 mb-6">
							We couldn't find any products matching your criteria. Try
							adjusting your filters.
						</p>
						<button
							@click="resetFilters"
							class="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold hover:from-blue-700 hover:to-purple-700 transition-colors shadow-lg">
							🔄 Reset Filters
						</button>
					</div>
				</div>
			</div>

			<!-- Error Message -->
			<div v-if="productsError" class="mt-8 text-center">
				<div
					class="inline-block bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md">
					<div class="text-4xl mb-2">⚠️</div>
					<p class="text-sm text-red-600 mb-4">{{ productsError }}</p>
					<button
						@click="retryCurrent"
						class="px-6 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition">
						🔄 Retry
					</button>
				</div>
			</div>
		</section>

		<!-- Quick View Modal -->
		<transition name="modal-fade">
			<div
				v-if="quickView.open"
				class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
				@click.self="closeQuickView">
				<div
					class="relative w-full max-w-3xl bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
					<button
						@click="closeQuickView"
						class="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
						<span class="text-lg font-medium text-slate-600">✕</span>
					</button>
					<div class="grid md:grid-cols-2 gap-0">
						<div
							class="relative h-80 bg-slate-100">
							<img
								v-if="quickView.product.gallery.length"
								:src="quickView.product.gallery[quickView.product.currentIndex]"
								class="w-full h-full object-cover"
								:alt="quickView.product.name" />

							<div
								v-if="quickView.product.gallery.length > 1"
								class="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
								<button
									v-for="(g, i) in quickView.product.gallery"
									:key="i"
									@click="selectImage(quickView.product, i)"
									class="w-3 h-3 rounded-full transition-colors duration-200"
									:class="
										quickView.product.currentIndex === i
											? 'bg-indigo-600 shadow'
											: 'bg-white/70 hover:bg-white shadow'
									" />
							</div>

							<div class="absolute top-6 left-6">
								<div
									class="px-3 py-1.5 rounded-full text-sm font-semibold border shadow-sm"
									:class="
										quickView.product.stock > 0
											? 'bg-emerald-500 text-white border-emerald-500'
											: 'bg-red-500 text-white border-red-500'
									">
									{{
										quickView.product.stock > 0
											? "In Stock"
											: "Out of Stock"
									}}
								</div>
							</div>
						</div>

						<div class="p-6 flex flex-col bg-white">
							<h3 class="text-2xl font-semibold text-slate-900 mb-3 leading-tight">
								{{ quickView.product.name }}
							</h3>

							<div class="flex gap-2 mb-4 flex-wrap">
								<span class="badge-enhanced bg-blue-50 text-blue-700">
									{{ quickView.product.category }}
								</span>
								<span
									v-if="quickView.product.seller"
									class="badge-enhanced bg-slate-100 text-slate-700">
									{{ quickView.product.seller }}
								</span>
							</div>

							<div class="bg-slate-50 rounded-lg p-3 mb-4 border border-slate-200">
								<p class="text-sm text-slate-700 leading-6">
									{{
										quickView.product.description ||
										"No description available for this product."
									}}
								</p>
							</div>

							<div class="text-3xl font-semibold mb-6 text-indigo-600">
								₹{{ quickView.product.priceDisplay }}
							</div>

							<div class="mt-auto flex gap-2">
								<button
									class="flex-1 py-3 rounded-lg font-medium text-base transition disabled:opacity-50 bg-indigo-600 text-white hover:bg-indigo-700"
									:disabled="quickView.product.stock === 0"
									@click="addToCart(quickView.product)">
									Add to Cart
								</button>
								<button
									class="px-5 py-3 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors"
									@click="closeQuickView">
									Close
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</transition>
	</div>
</template>

<script setup>
	import {
		ref,
		reactive,
		computed,
		onMounted,
		onBeforeUnmount,
		nextTick,
	} from "vue";
	import axios from "../../api/axios";
	import { useCartStore } from "../../stores/cart";
	import { useAuthStore } from "../../stores/auth";
	import { useWishlistStore } from "../../stores/wishlist";
	import { useRouter } from "vue-router";
	import { useQuasar } from "quasar";

	const cartStore = useCartStore();
	const authStore = useAuthStore();
	const $q = useQuasar();
	const wishlistStore = useWishlistStore();
	const router = useRouter();

	/* ------------ State ------------ */
	const categories = ref([]);
	const categoriesError = ref("");
	const loadingCategories = ref(false);
	const activeCategoryId = ref(null);

	const allProductsCache = ref([]); // Only used for "All" page caching (optional)
	const displayProducts = ref([]);
	const loadingProducts = ref(false);
	const productsError = ref("");
	const searchQuery = ref("");
	const sortKey = ref("featured");

	const pagination = reactive({
		currentPage: 1,
		lastPage: 1,
		perPage: 10,
		total: 0,
		endpointType: "all", // 'all' | 'category'
	});

	const lastFetch = reactive({
		type: "all",
		categoryId: null,
	});

	const quickView = reactive({
		open: false,
		product: null,
	});

	const totalProductsAll = ref(null);

	/* ------------ Helpers ------------ */
	function safeLog(...args) {
		/* console.debug('[HomePage]', ...args); */
	}

	function priceToNumber(v) {
		if (v === null || v === undefined) return 0;
		const n = Number(v);
		return isNaN(n) ? 0 : n;
	}

	function resolveImageObject(img) {
		if (!img) return null;
		if (typeof img === "string") return img;
		if (img.url) return img.url;
		if (img.image_path) return img.image_path;
		return null;
	}

	function normalizeProduct(p, idx = 0) {
		const gallery = Array.isArray(p.images)
			? p.images.map(resolveImageObject).filter(Boolean)
			: [];
		const priceNum = priceToNumber(p.price);
		return {
			id: p.id ?? idx,
			category_id: p.category_id ?? null,
			name: p.name ?? "Product",
			description: p.description ?? "",
			price: priceNum,
			priceDisplay: priceNum.toFixed(2),
			stock: p.stock ?? 0,
			is_approved: p.is_approved,
			is_blocked: p.is_blocked,
			imagesCount: gallery.length,
			image: gallery[0] || "https://via.placeholder.com/400x400?text=No+Image",
			gallery,
			currentIndex: 0,
			category: deriveCategoryName(p.category_id),
			seller: p.seller?.company_name || null,
			raw: p,
		};
	}

	function deriveCategoryName(categoryId) {
		const found = categories.value.find((c) => c.id === categoryId);
		return found ? found.name : "Category";
	}

	function extractPaginated(res) {
		// Expect structure: { success:true, data: { current_page, data:[...] } }
		const root = res?.data;
		if (root?.data?.data && Array.isArray(root.data.data)) {
			return {
				items: root.data.data,
				meta: {
					current_page: root.data.current_page,
					last_page: root.data.last_page,
					per_page: root.data.per_page,
					total: root.data.total,
				},
			};
		}
		return {
			items: [],
			meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 },
		};
	}

	function extractArray(res) {
		const root = res?.data;
		if (Array.isArray(root?.data)) return root.data;
		return [];
	}

	/* ------------ Fetchers ------------ */
	async function fetchCategoriesProducts() {
		loadingCategories.value = true;
		categoriesError.value = "";
		try {
			const res = await axios.get("/categories-products", {
				skipAuthRedirect: true,
			});
			safeLog("categories-products", res);
			const arr = extractArray(res);
			categories.value = arr.map((c) => ({
				id: c.id,
				name: c.name,
				products_count: c.products_count ?? null,
				raw: c,
			}));
		} catch (e) {
			categoriesError.value = "Failed to load categories.";
		} finally {
			loadingCategories.value = false;
		}
	}

	async function fetchAllProducts(page = 1) {
		loadingProducts.value = true;
		productsError.value = "";
		try {
			const res = await axios.get("/products", {
				params: { page },
				skipAuthRedirect: true,
			});
			const { items, meta } = extractPaginated(res);
			const norm = items.map(normalizeProduct);
			displayProducts.value = norm;
			allProductsCache.value = page === 1 ? norm : displayProducts.value;
			pagination.currentPage = meta.current_page;
			pagination.lastPage = meta.last_page;
			pagination.perPage = meta.per_page;
			pagination.total = meta.total;
			pagination.endpointType = "all";
			totalProductsAll.value = meta.total;
			lastFetch.type = "all";
			lastFetch.categoryId = null;
			restartAutoPlay();
		} catch (e) {
			productsError.value = "Failed to load products.";
		} finally {
			loadingProducts.value = false;
		}
	}

	async function fetchCategoryProducts(categoryId, page = 1) {
		if (categoryId == null) {
			return fetchAllProducts(page);
		}
		loadingProducts.value = true;
		productsError.value = "";
		try {
			const res = await axios.get(
				`/categories-products/${categoryId}/products`,
				{
					params: { page },
					skipAuthRedirect: true,
				}
			);
			const { items, meta } = extractPaginated(res);
			const norm = items.map(normalizeProduct);
			displayProducts.value = norm;
			pagination.currentPage = meta.current_page;
			pagination.lastPage = meta.last_page;
			pagination.perPage = meta.per_page;
			pagination.total = meta.total;
			pagination.endpointType = "category";
			lastFetch.type = "category";
			lastFetch.categoryId = categoryId;
			restartAutoPlay();
		} catch (e) {
			productsError.value = "Failed to load category products.";
		} finally {
			loadingProducts.value = false;
		}
	}

	async function fetchSingleProduct(id) {
		try {
			const res = await axios.get(`/products/${id}`, {
				skipAuthRedirect: true,
			});
			const root = res?.data?.data;
			if (root) {
				return normalizeProduct(root);
			}
		} catch {
			/* silent */
		}
		return null;
	}

	/* ------------ User Actions ------------ */
	function selectCategory(cat) {
		if (activeCategoryId.value === cat.id) return;
		activeCategoryId.value = cat.id;
		pagination.currentPage = 1;
		fetchCategoryProducts(cat.id, 1);
	}

	function selectAll() {
		if (activeCategoryId.value === null) return;
		activeCategoryId.value = null;
		pagination.currentPage = 1;
		fetchAllProducts(1);
	}

	function goNext() {
		if (pagination.currentPage >= pagination.lastPage) return;
		const next = pagination.currentPage + 1;
		pagination.currentPage = next;
		if (pagination.endpointType === "all") fetchAllProducts(next);
		else fetchCategoryProducts(activeCategoryId.value, next);
	}

	function goPrev() {
		if (pagination.currentPage <= 1) return;
		const prev = pagination.currentPage - 1;
		pagination.currentPage = prev;
		if (pagination.endpointType === "all") fetchAllProducts(prev);
		else fetchCategoryProducts(activeCategoryId.value, prev);
	}

	function retryCurrent() {
		if (lastFetch.type === "category") {
			fetchCategoryProducts(lastFetch.categoryId, pagination.currentPage);
		} else {
			fetchAllProducts(pagination.currentPage);
		}
	}

	function resetFilters() {
		searchQuery.value = "";
		sortKey.value = "featured";
	}

	function addToCart(product) {
		const payload = {
			id: product.id,
			title: product.name,
			price: product.price,
			image: product.image,
			brand: product.category,
			quantity: 1,
		};
		if (authStore.checkAuth()) {
			cartStore
				.syncAdd(payload)
				.then(() => {
					$q.notify({ type: "positive", message: "Product added to cart" });
				})
				.catch(() => {
					$q.notify({ type: "negative", message: "Add to cart failed" });
				});
		} else {
			cartStore.addToCart(payload);
			$q.notify({ type: "positive", message: "Product added to cart" });
		}
	}

	// Toggle wishlist for a product (exposed to template)
	async function toggleWishlist(product) {
		try {
			const inW = wishlistStore.isInWishlist(product.id);
			if (inW) {
				await wishlistStore.remove(product.id);
				$q.notify({ type: "negative", message: "Removed from wishlist" });
			} else {
				await wishlistStore.add(product.id);
				$q.notify({ type: "positive", message: "Added to wishlist" });
			}
		} catch (e) {
			$q.notify({ type: "negative", message: "Wishlist action failed" });
		}
	}

	/* ------------ Derived ------------ */
	const activeCategoryLabel = computed(() => {
		if (activeCategoryId.value === null) return "All Products";
		const cat = categories.value.find((c) => c.id === activeCategoryId.value);
		return cat ? cat.name : "Products";
	});

	const visibleProducts = computed(() => {
		let list = displayProducts.value.slice();

		if (searchQuery.value) {
			const q = searchQuery.value.toLowerCase();
			list = list.filter(
				(p) =>
					p.name.toLowerCase().includes(q) ||
					p.description.toLowerCase().includes(q) ||
					(p.seller && p.seller.toLowerCase().includes(q))
			);
		}

		switch (sortKey.value) {
			case "price-asc":
				list.sort((a, b) => a.price - b.price);
				break;
			case "price-desc":
				list.sort((a, b) => b.price - a.price);
				break;
			case "stock-desc":
				list.sort((a, b) => b.stock - a.stock);
				break;
			case "name-asc":
				list.sort((a, b) => a.name.localeCompare(b.name));
				break;
			default:
				// featured: maybe sort by stock desc then recent (id desc)
				list.sort((a, b) => {
					if (b.stock === a.stock) return b.id - a.id;
					return b.stock - a.stock;
				});
		}
		return list;
	});

	/* ------------ Carousel / Touch ------------ */
	const touchStartX = {};
	function onTouchStart(e, product) {
		touchStartX[product.id] = e.changedTouches
			? e.changedTouches[0].clientX
			: null;
	}
	function onTouchEnd(e, product) {
		const start = touchStartX[product.id];
		if (start == null) return;
		const end = e.changedTouches ? e.changedTouches[0].clientX : null;
		if (end == null) return;
		const diff = start - end;
		const threshold = 35;
		if (diff > threshold) nextImage(product);
		else if (diff < -threshold) prevImage(product);
		delete touchStartX[product.id];
	}

	function nextImage(product) {
		stopAutoPlayForInteraction(product);
		if (!product.gallery.length) return;
		product.currentIndex = (product.currentIndex + 1) % product.gallery.length;
	}
	function prevImage(product) {
		stopAutoPlayForInteraction(product);
		if (!product.gallery.length) return;
		product.currentIndex =
			(product.currentIndex - 1 + product.gallery.length) %
			product.gallery.length;
	}
	function selectImage(product, idx) {
		stopAutoPlayForInteraction(product);
		if (!product.gallery.length) return;
		product.currentIndex = idx;
	}

	/* Autoplay */
	const timers = {};
	const AUTOPLAY_MS = 2600;
	const PAUSE_ON_INTERACTION = true;

	function startAutoPlay(product) {
		if (!product.gallery || product.gallery.length < 2) return;
		if (timers[product.id]) return;
		timers[product.id] = setInterval(() => {
			product.currentIndex =
				(product.currentIndex + 1) % product.gallery.length;
		}, AUTOPLAY_MS);
	}
	function stopAutoPlay(product) {
		const t = timers[product.id];
		if (t) {
			clearInterval(t);
			delete timers[product.id];
		}
	}
	function stopAutoPlayForInteraction(product) {
		if (PAUSE_ON_INTERACTION) stopAutoPlay(product);
	}

	function restartAutoPlay() {
		// Clear any previous timers (e.g., when page/category changes)
		Object.keys(timers).forEach((id) => {
			clearInterval(timers[id]);
			delete timers[id];
		});
		// Start autoplay for all products that have multiple images
		nextTick(() => {
			displayProducts.value.forEach((p) => startAutoPlay(p));
		});
	}

	onBeforeUnmount(() => {
		Object.values(timers).forEach((t) => clearInterval(t));
	});

	/* ------------ Quick View ------------ */
	async function openQuickView(product) {
		// get fresh full product
		const full = await fetchSingleProduct(product.id);
		quickView.product = full || product;
		quickView.open = true;
	}
	function closeQuickView() {
		quickView.open = false;
		quickView.product = null;
	}

	/* ------------ Init ------------ */
	onMounted(async () => {
		await Promise.all([fetchCategoriesProducts(), fetchAllProducts(1)]);
	});
</script>

<style scoped>
	.category-shell {
		box-shadow: 0 6px 16px rgba(15, 23, 42, 0.06);
	}

	.control-shell {
		box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
	}

	.category-chip-wrap {
		display: flex;
		gap: 0.6rem;
		flex-wrap: wrap;
	}

	/* Enhanced Category Chips */
	.cat-chip-enhanced {
		@apply relative px-5 py-3 flex items-center gap-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-400 hover:text-blue-700 overflow-hidden;
	}
	.cat-chip-enhanced--active {
		@apply bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-lg;
	}
	.cat-chip-enhanced .count-enhanced {
		@apply inline-block px-2 py-0.5 rounded-md text-xs font-bold;
	}
	.cat-chip-enhanced:not(.cat-chip-enhanced--active) .count-enhanced {
		@apply bg-slate-100 text-slate-600;
	}
	.cat-chip-enhanced--active .count-enhanced {
		@apply bg-white/20 text-white;
	}

	/* Enhanced Badges */
	.badge-enhanced {
		@apply inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg;
	}

	/* Enhanced Pager Buttons */
	.pager-btn-enhanced {
		@apply px-5 py-2.5 rounded-lg font-semibold bg-white border border-slate-300 shadow-sm hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:border-blue-300 hover:text-blue-700;
	}

	@media (max-width: 768px) {
		.category-chip-wrap {
			overflow-x: auto;
			flex-wrap: nowrap;
			padding-bottom: 6px;
		}

		.category-chip-wrap .cat-chip-enhanced {
			white-space: nowrap;
			flex-shrink: 0;
		}
	}

	/* Enhanced Modal Transitions */
	.modal-fade-enter-active,
	.modal-fade-leave-active {
		transition: opacity 0.25s ease;
	}
	.modal-fade-enter-from {
		opacity: 0;
	}
	.modal-fade-leave-to {
		opacity: 0;
	}

	/* Enhanced Line Clamps */
	.line-clamp-1 {
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* Custom Scrollbar */
	::-webkit-scrollbar {
		width: 8px;
	}
	::-webkit-scrollbar-track {
		background: #f1f5f9;
		border-radius: 10px;
	}
	::-webkit-scrollbar-thumb {
		background: linear-gradient(45deg, #3b82f6, #8b5cf6);
		border-radius: 10px;
	}
	::-webkit-scrollbar-thumb:hover {
		background: linear-gradient(45deg, #2563eb, #7c3aed);
	}

	/* Enhanced Animations */
	@keyframes float {
		0%,
		100% {
			transform: translateY(0px) rotate(0deg);
		}
		50% {
			transform: translateY(-10px) rotate(2deg);
		}
	}

	@keyframes shimmer {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}

	.animate-float {
		animation: float 6s ease-in-out infinite;
	}

	.animate-shimmer {
		background: linear-gradient(
			90deg,
			transparent,
			rgba(255, 255, 255, 0.4),
			transparent
		);
		background-size: 200% 100%;
		animation: shimmer 2s infinite;
	}

	/* Glassmorphism Effects */
	.glass {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.glass-dark {
		background: rgba(0, 0, 0, 0.1);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	/* Custom Gradient Text */
	.gradient-text {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	/* Enhanced Hover Effects */
	.hover-lift {
		transition: box-shadow 0.2s ease;
	}
	.hover-lift:hover {
		box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
	}

	/* Professional Focus States */
	input:focus,
	select:focus,
	button:focus {
		outline: none;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	/* Enhanced Card Animations */
	.product-card {
		transition: box-shadow 0.2s ease;
	}
	.product-card:hover {
		box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
	}
</style>
